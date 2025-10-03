
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout.tsx';

const EventPlanner = () => {
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(50000); // Default budget
  const [guestCount, setGuestCount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ eventType, location, budget, guestCount });
    // In a real app, you would submit this to generate recommendations
  };

  const eventTypes = [
    { id: 'wedding', label: 'حفل زفاف' },
    { id: 'birthday', label: 'عيد ميلاد' },
    { id: 'corporate', label: 'مؤتمر أعمال' },
    { id: 'graduation', label: 'حفل تخرج' },
  ];

  const suggestedThemes = [
    {
      id: 'classic',
      title: 'كلاسيكي فاخر',
      description: 'بتضمن الألوان الذهبي والأبيض',
      price: 15000,
      image: 'https://source.unsplash.com/featured/?wedding,classic',
    },
    {
      id: 'modern',
      title: 'عصري أنيق',
      description: 'مزيج من الأبيض والأسود',
      price: 12000,
      image: 'https://source.unsplash.com/featured/?wedding,modern',
    },
  ];

  const suggestedVenues = [
    {
      id: 'royal',
      name: 'قاعة الملكية',
      rating: 4.8,
      location: 'الرياض حي العليا',
      price: 8000,
      image: 'https://source.unsplash.com/featured/?wedding,hall',
    },
    {
      id: 'princess',
      name: 'قاعة الأميرة',
      rating: 4.6,
      location: 'الرياض حي النرجس',
      price: 7500,
      image: 'https://source.unsplash.com/featured/?event,venue',
    }
  ];

  return (
    <Layout title="مساعد تخطيط الحفلات الذكي">
      <div className="bg-munaasib-lightGold p-4 rounded-lg mb-6">
        <p className="text-gray-700">دعنا نساعدك في تنظيم حفلك المثالي</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">أخبرنا عن حفلك</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">نوع المناسبة</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              >
                <option value="" disabled>اختر نوع المناسبة</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">المنطقة</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="الرياض"
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2">الميزانية</label>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-munaasib-red"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>5,000 ريال</span>
                <span>100,000 ريال</span>
              </div>
            </div>

            <div>
              <label className="block mb-2">عدد الضيوف</label>
              <input
                type="text"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="أدخل عدد الضيوف المتوقع"
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
            </div>
          </div>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">مقدمي الخدمات المقترحين</h2>
        <div className="space-y-4">
          {suggestedVenues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{venue.name}</h3>
                <div className="flex items-center text-sm mt-1">
                  <span className="text-yellow-500 ml-1">★</span>
                  <span>{venue.rating}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {venue.location}
                </div>
                <div className="mt-2 text-munaasib-red font-bold">
                  تواصل لمعرفة السعر
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">أفكار وثيمات مقترحة</h2>
        <div className="grid grid-cols-2 gap-4">
          {suggestedThemes.map((theme) => (
            <div key={theme.id} className="overflow-hidden rounded-lg bg-white">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={theme.image}
                  alt={theme.title}
                  className="w-full h-32 object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-base">{theme.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-tight">
                  {theme.description}
                </p>
                <p className="text-munaasib-red text-sm font-medium mt-1">
                  تواصل لمعرفة السعر
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default EventPlanner;
