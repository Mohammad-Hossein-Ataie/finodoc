#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Cleanup Codal letters collection.

Goal:
- Keep the application-facing collection small/fast: `codal_letters` should contain ONLY letterCode == "ن-۱۰".
- Preserve *all* existing documents by copying/upserting them into a separate archive collection first.

Default behavior is DRY-RUN (no writes). Use --execute to apply changes.

Requirements:
  pip install pymongo

Env vars:
  - MONGODB_URI  (required)
  - DB_NAME      (required unless provided via --db)

Example:
  python scripts/cleanup_codal_letters.py --db finodoc --execute
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from typing import Any, Dict, Iterable, Optional

from pymongo import MongoClient, ReplaceOne


def _env(name: str) -> Optional[str]:
    value = os.environ.get(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


def _now_iso() -> str:
    # lightweight ISO-ish timestamp; good enough for logs
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())


def _choose_upsert_filter(doc: Dict[str, Any]) -> Dict[str, Any]:
    # Prefer _id if present (keeps identity stable), otherwise fallback to tracingNo.
    if "_id" in doc and doc.get("_id") is not None:
        return {"_id": doc["_id"]}
    if "tracingNo" in doc and doc.get("tracingNo") is not None:
        return {"tracingNo": doc["tracingNo"]}
    # Worst-case: use full document hash would be expensive; instead let Mongo assign.
    # But we still need a deterministic filter for ReplaceOne; fallback to a synthetic key.
    return {"__missing_key__": True}


def archive_all(
    *,
    source_col,
    archive_col,
    batch_size: int,
    execute: bool,
) -> int:
    """Copy/upsert all docs from source into archive."""

    total = source_col.estimated_document_count()
    print(f"[{_now_iso()}] Archiving from {source_col.full_name} -> {archive_col.full_name} (estimated total={total})")

    cursor = source_col.find({}, no_cursor_timeout=True)
    ops = []
    archived = 0

    try:
        for doc in cursor:
            flt = _choose_upsert_filter(doc)
            # Keep doc as-is; do not mutate fields.
            ops.append(ReplaceOne(flt, doc, upsert=True))

            if len(ops) >= batch_size:
                if execute:
                    archive_col.bulk_write(ops, ordered=False)
                archived += len(ops)
                print(f"[{_now_iso()}] Archived {archived}/{total if total else '?'}")
                ops = []

        if ops:
            if execute:
                archive_col.bulk_write(ops, ordered=False)
            archived += len(ops)

    finally:
        cursor.close()

    print(f"[{_now_iso()}] Archive done. archived={archived} execute={execute}")
    return archived


def cleanup_source(
    *,
    source_col,
    keep_letter_code: str,
    execute: bool,
) -> int:
    """Delete all docs from source where letterCode != keep_letter_code."""

    delete_filter = {"letterCode": {"$ne": keep_letter_code}}
    to_delete = source_col.count_documents(delete_filter)

    print(
        f"[{_now_iso()}] Cleanup {source_col.full_name}: will delete {to_delete} docs where letterCode != {keep_letter_code!r} (execute={execute})"
    )

    if not execute:
        return to_delete

    result = source_col.delete_many(delete_filter)
    print(f"[{_now_iso()}] Deleted {result.deleted_count} docs")
    return int(result.deleted_count)


def main(argv: Iterable[str]) -> int:
    parser = argparse.ArgumentParser(description="Archive codal_letters then keep only letterCode=ن-۱۰ in codal_letters")
    parser.add_argument("--db", dest="db_name", default=_env("DB_NAME"), help="MongoDB database name (or env DB_NAME)")
    parser.add_argument("--uri", dest="mongo_uri", default=_env("MONGODB_URI"), help="MongoDB URI (or env MONGODB_URI)")
    parser.add_argument("--source", default="codal_letters", help="Source collection (default: codal_letters)")
    parser.add_argument("--archive", default="codal_letters_all", help="Archive collection (default: codal_letters_all)")
    parser.add_argument("--keep-letter-code", default="ن-۱۰", help='Letter code to keep in source (default: "ن-۱۰")')
    parser.add_argument("--batch-size", type=int, default=1000, help="Bulk upsert batch size (default: 1000)")
    parser.add_argument(
        "--mode",
        choices=["archive-only", "cleanup-only", "archive-and-cleanup"],
        default="archive-and-cleanup",
        help="What to do (default: archive-and-cleanup)",
    )
    parser.add_argument("--execute", action="store_true", help="Apply changes. Without this flag it's a dry-run.")

    args = parser.parse_args(list(argv))

    if not args.mongo_uri:
        print('ERROR: Missing MONGODB_URI (set env var or pass --uri).', file=sys.stderr)
        return 2
    if not args.db_name:
        print('ERROR: Missing DB_NAME (set env var or pass --db).', file=sys.stderr)
        return 2

    execute = bool(args.execute)

    client = MongoClient(args.mongo_uri)
    db = client[args.db_name]

    source_col = db[args.source]
    archive_col = db[args.archive]

    if args.mode in ("archive-only", "archive-and-cleanup"):
        archive_all(source_col=source_col, archive_col=archive_col, batch_size=args.batch_size, execute=execute)

    deleted = 0
    if args.mode in ("cleanup-only", "archive-and-cleanup"):
        deleted = cleanup_source(source_col=source_col, keep_letter_code=args.keep_letter_code, execute=execute)

    if not execute:
        print(f"[{_now_iso()}] DRY-RUN complete. Nothing was written.")
        if args.mode in ("cleanup-only", "archive-and-cleanup"):
            print(f"[{_now_iso()}] Would delete: {deleted} docs")
    else:
        print(f"[{_now_iso()}] DONE.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
