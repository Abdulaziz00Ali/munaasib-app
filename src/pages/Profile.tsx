
import React from 'react';
import Layout from '@/components/layout/Layout.tsx';
import { Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Languages, 
  HelpCircle,
  Lock,
  LogOut,
  MessageSquare,
  Calendar
} from 'lucide-react';

const Profile = () => {
  return (
    <Layout title="الملف الشخصي">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full border-4 border-munaasib-gold overflow-hidden mb-4">
          <img 
            src="https://source.unsplash.com/featured/?portrait,man" 
            alt="صورة الملف الشخصي" 
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-2xl font-bold">محمد عبدالله</h2>
        <p className="text-gray-600">m.abdullah@example.com</p>

        <Link to="/edit-profile">
          <button className="mt-4 bg-munaasib-red text-white py-2 px-8 rounded-lg hover:bg-munaasib-darkRed transition-colors duration-200">
            تعديل الملف الشخصي
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
        <Link to="/account-info" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <User className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">معلومات الحساب</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <Link to="/notifications" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">الإشعارات</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <Link to="/messages" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">الرسائل</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <Link to="/event-planner" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">منظم المناسبات</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <Link to="/privacy-security" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Lock className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">الخصوصية والأمان</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Languages className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">اللغة</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 ml-2">العربية</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
        </div>

        <Link to="/help" className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 ml-4 text-gray-600" />
            <span className="font-medium">المساعدة والدعم</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
      </div>

      <button className="w-full mt-8 py-4 bg-munaasib-gold text-white text-center rounded-lg font-bold hover:bg-munaasib-darkGold transition-colors duration-200">
        تسجيل الخروج
      </button>

      <p className="text-center text-gray-500 mt-6">النسخة 1.2.3</p>
    </Layout>
  );
};

export default Profile;
