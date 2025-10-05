# دليل التشغيل السريع (ديمو، بناء، نشر)

## المتطلبات
- Node.js 18+.
- حساب نشر (Vercel).

## تشغيل محلي (ديمو)
1. تثبيت الاعتمادات:
   - `npm install`
2. تشغيل الديف:
   - `npm run dev`
3. إعداد الديمو (اختياري):
   - انسخ `.env.example` إلى `.env` واضبط قيم الديمو (انظر `DEMO_README.md`).

## بناء إنتاج
- `npm run build`
- ناتج البناء في `dist/`.

## معاينة الإنتاج محليًا
- `npm run preview`

## النشر
### Vercel
- اربط المستودع بحساب Vercel.
- يقرأ إعداد SPA من `vercel.json` تلقائيًا.

## المتغيرات البيئية المهمة
- راجع `DEMO_README.md` و`.env.example` لضبط رقم واتساب ووضع الديمو.

## اختبار سريع قبل التسليم
- تصفح الصفحات الأساسية: Explore, Halls/Kitchens, ServiceDetails, VendorDashboard, Bookings, Help.
- تحقق من عرض الصور والبيانات، وأن الروابط تعمل.