# Finodoc - سامانه نامه‌های کدال

یک پروژه Next.js برای نمایش، جستجو و فیلتر نامه‌های کدال ذخیره شده در MongoDB.

## ویژگی‌ها

- **لیست نامه‌ها**: نمایش نامه‌ها با قابلیت صفحه‌بندی (Pagination).
- **جستجو**: جستجو در نماد، نام شرکت، عنوان و کد نامه.
- **فیلترها**: فیلتر بر اساس نوع فایل (PDF, Excel, ...)، وضعیت نظارت، و کدهای نامه.
- **مرتب‌سازی**: مرتب‌سازی بر اساس تاریخ انتشار، نماد و ...
- **جزئیات نامه**: مشاهده جزئیات کامل هر نامه و لینک دانلود فایل‌ها.
- **طراحی**: رابط کاربری کاملاً فارسی (RTL) و واکنش‌گرا (Responsive) با استفاده از TailwindCSS و shadcn/ui.
- **حالت تاریک**: پشتیبانی از Dark Mode (بر اساس تنظیمات سیستم/مرورگر).

## پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- MongoDB (نسخه 4.4 یا بالاتر)

## نصب و راه اندازی

1. **کلون کردن مخزن**:
   ```bash
   git clone <repository-url>
   cd finodoc
   ```

2. **نصب وابستگی‌ها**:
   ```bash
   npm install
   ```

3. **تنظیم متغیرهای محیطی**:
   فایل `.env.example` را به `.env.local` کپی کنید و مقادیر آن را تنظیم کنید:
   ```bash
   cp .env.example .env.local
   ```

   نکته: مقدارهای واقعی (پسورد/کلیدها) را داخل ریپو قرار ندهید.

4. **اجرای پروژه**:
   ```bash
   npm run dev
   ```
   پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

## مایگریشن (Migration)

برای مرتب‌سازی صحیح بر اساس تاریخ، فیلد `publishDateTimeUtc` باید به داکیومنت‌ها اضافه شود.
یک اسکریپت مایگریشن آماده شده است که می‌توانید با ارسال درخواست POST به آدرس زیر آن را اجرا کنید:

```
POST http://localhost:3000/api/migration
```

این اسکریپت فیلد `publishDateTimeJalali` را خوانده و معادل میلادی آن را در `publishDateTimeUtc` ذخیره می‌کند.

## ایندکس‌های MongoDB

برای عملکرد بهتر، ایندکس‌های زیر را در کالکشن `codal_letters` ایجاد کنید:

```javascript
db.codal_letters.createIndex({ tracingNo: 1 }, { unique: true });
db.codal_letters.createIndex({ fetchedAt: -1 });
db.codal_letters.createIndex({ publishDateTimeUtc: -1 });
db.codal_letters.createIndex({ symbol: 1 });
db.codal_letters.createIndex({ companyName: 1 });
db.codal_letters.createIndex({ letterCode: 1 });
// برای جستجوی متنی (اختیاری، اگر از regex استفاده نمی‌کنید)
db.codal_letters.createIndex({ title: "text", companyName: "text", symbol: "text" });
```

## تکنولوژی‌های استفاده شده

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Custom implementation)
- **State Management**: React Query (TanStack Query)
- **Table**: TanStack Table
- **Database**: MongoDB
- **Icons**: Lucide React

## متغیرهای محیطی

حداقل موارد لازم (در `.env.local`):

```env
# MongoDB
MONGODB_URI=mongodb://<user>:<pass>@<host>:<port>/<db>?authSource=admin
DB_NAME=my-app
COLLECTION_NAME=codal_letters

# Auth
JWT_SECRET=change_me_to_a_long_random_string

# SMS (OTP)
PAYAMAK_USER=
PAYAMAK_PASS=
PAYAMAK_FROM=

# S3 Compatible (Liara)
LIARA_ENDPOINT=https://storage.c2.liara.space
LIARA_BUCKET_NAME=
LIARA_ACCESS_KEY=
LIARA_SECRET_KEY=
NEXT_PUBLIC_LIARA_BASE_URL=https://storage.c2.liara.space/<bucket>
```
