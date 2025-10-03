import React from 'react';
import Layout from '@/components/layout/Layout.tsx';
import { LineChart } from 'lucide-react';

const Investors: React.FC = () => {
  return (
    <Layout title="للمستثمرين" showBack={false} showBottomNav={false}>
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-munaasib-red mb-3">
          <LineChart className="w-5 h-5" />
          <span className="font-bold">عرض للمستثمرين</span>
        </div>
        <h1 className="text-2xl font-extrabold mb-4">منصّة مناسِب</h1>
        <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
          منصّة تربط العملاء مباشرةً بأصحاب القاعات والمطابخ ومزوّدي الخدمات لتجربة حجز سريعة وموثوقة، بواجهة عربية متوافقة مع الجوال.
        </p>
        <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mt-2">
          نوفّر اكتشافًا ذكيًا، تواصلًا فوريًا، وحجوزات مبسطة تدعم النمو والتحويل لمزوّدي الخدمات وتمنح العملاء راحة وشفافية.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="font-bold mb-2">لماذا الآن؟</h3>
          <p className="text-sm text-gray-600">ارتفاع الطلب على حلول الحجز المحلية الموثوقة وتجربة جوّال أولاً.</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="font-bold mb-2">النمو</h3>
          <p className="text-sm text-gray-600">بنية جاهزة للتوسع عبر فئات جديدة وتعزيز التحويل.</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="font-bold mb-2">التواصل</h3>
          <p className="text-sm text-gray-600">قنوات اتصال مباشرة (واتساب/اتصال) وتجربة حجز مبسطة.</p>
        </div>
      </section>

      <section className="mt-10 text-center">
        <p className="text-gray-700">للاطلاع على العرض الكامل أو التجربة الحية، الرجاء التواصل معنا.</p>
        <div className="mt-3 text-sm text-gray-600">يمكنك استخدام زر واتساب العائم أو مراسلتنا عبر البريد: <a className="text-munaasib-red underline" href="mailto:invest@munaasib.app">invest@munaasib.app</a></div>
      </section>
    </Layout>
  );
};

export default Investors;