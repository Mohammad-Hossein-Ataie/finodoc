import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildCodalUrl(url: string | undefined | null): string {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `https://codal.ir${url}`;
  return `https://codal.ir/${url}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}

export function toPersianDigits(str: string | number): string {
  if (str === undefined || str === null) return "";
  const s = str.toString();
  return s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}
