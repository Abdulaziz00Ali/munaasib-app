import React from 'react';
import Layout from '@/components/layout/Layout.tsx';

const Privacy: React.FC = () => {
  return (
    <Layout title="سياسة الخصوصية" showBack>
      <section className="prose max-w-3xl mx-auto rtl text-right">
        <h2 className="text-2xl font-bold mb-3">مقدمة</h2>
        <p>
          نحرص على حماية خصوصيتك. توضّح هذه السياسة نوعية البيانات التي قد نجمعها
          وكيفية استخدامها وحفظها.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">البيانات التي نجمعها</h3>
        <p>
          قد نجمع بيانات بسيطة مثل الاسم ووسيلة التواصل (رقم واتساب) عند تواصلك
          معنا. لا نجمع بيانات حساسة دون حاجة واضحة.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">الغرض من المعالجة</h3>
        <p>
          نستخدم البيانات للتواصل وتقديم الخدمة وتحسين تجربة المستخدم.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">التخزين والمشاركة</h3>
        <p>
          تُحفَظ البيانات بشكل آمن ولا تُشارك مع أطراف ثالثة إلا للامتثال للأنظمة
          أو بموافقتك.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">حقوقك</h3>
        <p>
          لك الحق في الاطلاع على بياناتك وطلب تصحيحها أو حذفها. تواصل معنا عبر زر
          واتساب الظاهر للتنسيق.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">التغييرات على السياسة</h3>
        <p>
          قد نقوم بتحديث هذه السياسة من وقت لآخر. يُنصح بمراجعتها دوريًا.
        </p>
      </section>
    </Layout>
  );
};

export default Privacy;