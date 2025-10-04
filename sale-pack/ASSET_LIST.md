# قائمة الأصول المنقولة في الصفقة

## الكود والتهيئة
- المستودع الكامل للتطبيق.
- إعدادات Typescript وVite: `tsconfig*.json`, `vite.config.*`.
- إعداد Tailwind/PostCSS: `tailwind.config.ts`, `postcss.config.js`.

## النشر والبنية التحتية
- إعدادات النشر: `vercel.json`.
- ملفات البناء: `dist/` (للعرض فقط، يُعاد البناء عند النقل).

## الصفحات والمكونات
- الصفحات في `src/pages/`: Home, Explore, Halls, Kitchens, ServiceDetails, VendorDashboard, Bookings, Help, PrivacySecurity, وغيرها.
- المكونات في `src/components/` بما فيها: `PaginatedVenueList`, `VenueDetailsModal`, `VenueCarousel`, `ErrorBoundary`.

## البيانات والصور
- بيانات القاعات/المطابخ: `src/data/*` (مثل `mergedTabukHalls.ts`, `updatedKitchens.ts`, `tabuk_halls_complete.csv`).
- صور محسّنة: `public/optimized-images/` و`public/halls and kitchens images/`.
- صور أماكن عامة: `public/images/places/`.

## السكربتات والأتمتة
- سكربت إدارة الصور: `scripts/automated-photos-pipeline.cjs`.
- سكربتات مساعدة: `scripts/download-images.cjs`, `scripts/enhanced-image-pipeline.cjs`.

## التوثيق
- `README.md`، `DEMO_README.md`، `VALIDATION_REPORT.md`.
- ملفات جديدة في `sale-pack/`: `SALE_MEMO.md`, `ASSET_LIST.md`, `OPERATIONS_GUIDE.md`, `DEMO_PITCH.md`, `SCREENSHOT_SHOTLIST.md`.

## الضبط والبيئة
- أمثلة البيئة: `.env.example` (مع وضع الديمو).
- تجاهل البيئة: `.gitignore`.

## حسابات خارجية (اختياري)
- الدومين (إن وُجد)، حسابات Vercel للنقل، أي حسابات سوشيال مرتبطة (يُحدد عند التفاوض).