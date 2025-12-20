import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { toPersianDigits } from '@/lib/utils'; // Wait, I need toEnglishDigits
// I'll implement toEnglishDigits here locally or update utils.

function toEnglishDigits(str: string): string {
    return str.replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
}

// Helper to parse Jalali date string "1404/09/15 23:10:35" to Date
// We can use a library or manual calculation. 
// Since we have date-fns-jalali, let's try to use it, or just simple conversion if possible.
// Actually, for server-side migration, a simple library usage is best.
// But wait, date-fns-jalali might be for formatting. 
// Let's use a simple jalali-moment or just manual parsing if we don't want extra deps.
// However, I installed date-fns-jalali. 
// Let's try to do it manually to be safe and lightweight, or use the installed lib.
// The installed lib is date-fns-jalali. It has `newDate`? No, it extends date-fns.

// Let's use a robust approach: 
// 1. Convert digits to English.
// 2. Parse string to components (year, month, day, hour, min, sec).
// 3. Convert Jalali to Gregorian.
// 4. Create Date object.

// Since I don't want to implement the full Jalali algorithm here, I will assume the user can run this migration 
// and I will provide a basic implementation using `jalaali-js` if I had it, but I don't.
// I will use a placeholder logic or try to use `date-fns-jalali` if it supports parsing.
// `date-fns-jalali` is mostly for formatting.

// Let's add `jalaali-js` to package.json? No, I can't easily add now without reinstall.
// I will use a simple conversion function included in the file for now.
// Actually, I'll skip the complex conversion logic and just set it to `fetchedAt` if parsing fails, 
// OR I will assume the user will install `jalaali-js` or similar.
// WAIT, I can use `Intl`? No.

// Let's look at the `publishDateTimeJalali` format again: "۱۴۰۴/۰۹/۱۵ ۲۳:۱۰:۳۵"
// I will write a simple converter using a known algorithm or just use `fetchedAt` for now 
// and leave a TODO for the user to implement precise Jalali conversion if needed, 
// OR I can try to use `date-fns-jalali`'s `parse` if available.

// Better plan: I will use `fetchedAt` as the default for `publishDateTimeUtc` if I can't parse it easily.
// BUT the user specifically asked for this.
// I will add a simple Jalali to Gregorian converter function.

function jalaliToGregorian(j_y: number, j_m: number, j_d: number) {
  j_y = j_y - 979;
  j_m = j_m - 1;
  var j_day_no = 365 * j_y + Math.floor(j_y / 33) * 8 + Math.floor((j_y % 33 + 3) / 4);
  for (var i = 0; i < j_m; ++i) j_day_no += (i < 6) ? 31 : 30;
  var j_day = j_day_no + j_d - 1;
  var g_day_no = j_day + 79;
  var g_y = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;
  var leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    g_y += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }
  g_y += 4 * Math.floor(g_day_no / 1461);
  g_day_no = g_day_no % 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    g_y += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }
  var g_m = 0;
  var days = [31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (var i = 0; i < 12; i++) {
      if (g_day_no < days[i]) {
          g_m = i + 1;
          break;
      }
      g_day_no -= days[i];
  }
  var g_d = g_day_no + 1;
  return [g_y, g_m, g_d];
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME || 'codal_letters');

    // Find documents where publishDateTimeUtc is missing
    const cursor = collection.find({ publishDateTimeUtc: { $exists: false } }).limit(1000); // Process in batches
    
    let updatedCount = 0;
    
    while(await cursor.hasNext()) {
        const doc = await cursor.next();
        if (!doc) continue;

        let dateToSet: Date | null = null;

        if (doc.publishDateTimeJalali) {
            try {
                const englishStr = toEnglishDigits(doc.publishDateTimeJalali);
                // Format: YYYY/MM/DD HH:mm:ss
                const [datePart, timePart] = englishStr.split(' ');
                const [y, m, d] = datePart.split('/').map(Number);
                const [h, min, s] = timePart.split(':').map(Number);

                const [gy, gm, gd] = jalaliToGregorian(y, m, d);
                
                dateToSet = new Date(gy, gm - 1, gd, h, min, s);
            } catch (e) {
                console.error(`Failed to parse date for ${doc._id}: ${doc.publishDateTimeJalali}`);
            }
        }

        if (!dateToSet && doc.fetchedAt) {
            dateToSet = new Date(doc.fetchedAt);
        }

        if (dateToSet) {
            await collection.updateOne(
                { _id: doc._id },
                { $set: { publishDateTimeUtc: dateToSet } }
            );
            updatedCount++;
        }
    }

    return NextResponse.json({ message: 'Migration run successfully', updatedCount });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
