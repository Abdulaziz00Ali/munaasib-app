
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Shield, Lock, Eye, Bell, MessageCircle, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.ts';

const PrivacySecurity = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showContactInfo: true,
    allowMessages: true,
    showOnlineStatus: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    loginAlerts: true
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "تم تحديث الإعدادات",
      description: "تم حفظ تفضيلاتك بنجاح",
    });
  };

  return (
    <Layout title="الخصوصية والأمان" showBack>
      <div className="space-y-6">
        {/* Privacy Settings */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Eye className="w-5 h-5 text-munaasib-red" />
            <h3 className="text-lg font-bold">إعدادات الخصوصية</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إظهار الملف الشخصي</p>
                <p className="text-sm text-gray-600">السماح للآخرين برؤية ملفك الشخصي</p>
              </div>
              <Switch
                checked={settings.profileVisibility}
                onCheckedChange={(value) => handleSettingChange('profileVisibility', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">عرض معلومات الاتصال</p>
                <p className="text-sm text-gray-600">إظهار رقم الجوال والبريد الإلكتروني</p>
              </div>
              <Switch
                checked={settings.showContactInfo}
                onCheckedChange={(value) => handleSettingChange('showContactInfo', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">السماح بالرسائل</p>
                <p className="text-sm text-gray-600">استقبال رسائل من المستخدمين الآخرين</p>
              </div>
              <Switch
                checked={settings.allowMessages}
                onCheckedChange={(value) => handleSettingChange('allowMessages', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إظهار حالة الاتصال</p>
                <p className="text-sm text-gray-600">عرض ما إذا كنت متصلاً أم لا</p>
              </div>
              <Switch
                checked={settings.showOnlineStatus}
                onCheckedChange={(value) => handleSettingChange('showOnlineStatus', value)}
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Bell className="w-5 h-5 text-munaasib-red" />
            <h3 className="text-lg font-bold">إعدادات الإشعارات</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات البريد الإلكتروني</p>
                <p className="text-sm text-gray-600">تلقي إشعارات الحجوزات والرسائل</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إشعارات الرسائل النصية</p>
                <p className="text-sm text-gray-600">تلقي رسائل نصية للحجوزات المهمة</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الإشعارات الفورية</p>
                <p className="text-sm text-gray-600">تلقي إشعارات فورية في التطبيق</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">رسائل تسويقية</p>
                <p className="text-sm text-gray-600">تلقي عروض وأخبار المنصة</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(value) => handleSettingChange('marketingEmails', value)}
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Shield className="w-5 h-5 text-munaasib-red" />
            <h3 className="text-lg font-bold">إعدادات الأمان</h3>
          </div>
          
          <div className="space-y-4">
            <Link to="/forgot-password" className="block">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Key className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">تغيير كلمة المرور</p>
                    <p className="text-sm text-gray-600">آخر تغيير منذ 3 أشهر</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 flip-rtl">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </div>
            </Link>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">المصادقة الثنائية</p>
                <p className="text-sm text-gray-600">حماية إضافية لحسابك</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(value) => handleSettingChange('twoFactorAuth', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تنبيهات تسجيل الدخول</p>
                <p className="text-sm text-gray-600">إشعار عند دخول من جهاز جديد</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(value) => handleSettingChange('loginAlerts', value)}
              />
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4 text-red-600">إجراءات الحساب</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full text-gray-700 border-gray-300">
              تصدير بياناتي
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              إلغاء تفعيل الحساب
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
              حذف الحساب نهائياً
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacySecurity;
