import React from 'react';
import Layout from '@/components/layout/Layout.tsx';

const Terms: React.FC = () => {
  return (
    <Layout title="الشروط والأحكام" showBack>
      <section className="prose max-w-3xl mx-auto rtl text-right">
        <h2 className="text-2xl font-bold mb-3">مقدمة</h2>
        <p>
          باستخدامك هذا التطبيق، فإنك توافق على هذه الشروط والأحكام. إن لم توافق
          على أي بند، يرجى عدم استخدام التطبيق.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">الاستخدام المقبول</h3>
        <p>
          تلتزم بعدم إساءة استخدام الخدمات أو محاولة تعطيلها، وعدم نشر محتوى مخالف
          للأنظمة أو منتهك لحقوق الآخرين.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">الملكية الفكرية</h3>
        <p>
          جميع الأكواد والمحتوى والتصاميم ضمن التطبيق محمية بحقوق الملكية
          الفكرية. لا يجوز نسخها أو إعادة استخدامها إلا بإذن مكتوب من المالك.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">تحديد المسؤولية</h3>
        <p>
          يُقدَّم التطبيق كما هو، دون أي ضمانات صريحة أو ضمنية. لا نتحمّل مسؤولية
          أي أضرار مباشرة أو غير مباشرة ناتجة عن الاستخدام.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">التعديلات على الخدمة</h3>
        <p>
          قد نقوم بتحديث أو تعديل محتوى التطبيق أو ميزاته من وقت لآخر دون إشعار
          مسبق.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">القانون الواجب</h3>
        <p>
          تُفسَّر هذه الشروط وفق قوانين المملكة العربية السعودية. في حال وجود نزاع،
          يتم حله وديًا قدر الإمكان أو وفق الإجراءات النظامية المختصة.
        </p>
      </section>
    </Layout>
  );
};

export default Terms;