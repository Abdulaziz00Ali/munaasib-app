
import React from 'react';
import Layout from '@/components/layout/Layout.tsx';
import NotificationItem from '@/components/ui/NotificationItem.tsx';

const Notifications = () => {
  const todayNotifications = [
    {
      id: 't1',
      type: 'confirmation' as const,
      title: 'تم تأكيد حجزك مع منسق الحفلات أحمد',
      time: 'ص 10:30',
    },
    {
      id: 't2',
      type: 'reminder' as const,
      title: 'تذكير: موعدك غداً مع مصور عبدالله',
      time: 'ص 9:15',
    },
    {
      id: 't3',
      type: 'promotion' as const,
      title: 'عرض خاص: خصم 15% على خدمات التصوير',
      time: 'ص 8:00',
    },
  ];

  const lastWeekNotifications = [
    {
      id: 'lw1',
      type: 'confirmation' as const,
      title: 'تم تأكيد الدفع لخدمة تنسيق الحفلات',
      date: 'الأحد',
      time: 'ص 11:30',
    },
    {
      id: 'lw2',
      type: 'reminder' as const,
      title: 'تذكير: مراجعة تفاصيل الحجز مع المصور',
      date: 'السبت',
      time: 'م 3:45',
    },
  ];

  return (
    <Layout title="الإشعارات" showBack>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-4">اليوم</h2>
          <div className="space-y-3">
            {todayNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                type={notification.type}
                title={notification.title}
                time={notification.time}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-4 mt-8">الأسبوع الماضي</h2>
          <div className="space-y-3">
            {lastWeekNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                type={notification.type}
                title={notification.title}
                time={notification.time}
                date={notification.date}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
