
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Calendar, MapPin, Phone, Mail, Camera, Save, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.ts';

const AccountInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: 'محمد عبدالله',
    email: 'm.abdullah@example.com',
    phone: '+966501234567',
    location: 'الرياض، المملكة العربية السعودية',
    joinDate: '15 يناير 2023',
    accountType: 'مزود خدمة',
    verification: 'موثق',
    responseTime: 'خلال ساعتين',
    businessHours: 'السبت - الخميس: 9:00 ص - 9:00 م'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save the changes (in a real app, this would be an API call)
    try {
      localStorage.setItem('vendorProfile', JSON.stringify(formData));
      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث معلومات الحساب بنجاح",
      });
    } catch (err) {
      console.warn('فشل حفظ بيانات الحساب في localStorage:', err);
      toast({
        title: "تعذر الحفظ محليًا",
        description: "لن يتم حفظ التغييرات في هذا الجهاز. سيتم المتابعة.",
        variant: "destructive",
      });
    }
    
    // Navigate back to vendor dashboard
    navigate('/vendor-dashboard');
  };

  const handleChangePassword = () => {
    // Set redirect path for password reset flow
    try {
      localStorage.setItem('passwordResetRedirect', '/vendor-dashboard');
    } catch (err) {
      console.warn('Failed to set passwordResetRedirect in localStorage:', err);
      toast({
        title: "تعذر تهيئة إعادة التعيين",
        description: "سيتم إعادتك افتراضيًا إلى الملف الشخصي بعد إعادة التعيين.",
        variant: "destructive",
      });
    }
    navigate('/forgot-password');
  };

  return (
    <Layout title="معلومات الحساب" showBack>
      <div className="space-y-6">
        {/* Profile Summary - Editable */}
        <Card className="p-4">
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-munaasib-gold overflow-hidden">
                <img 
                  src="https://source.unsplash.com/featured/?portrait,man" 
                  alt="صورة الملف الشخصي" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-munaasib-red text-white p-1 rounded-full">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-xl font-bold mb-2 border-0 p-0 h-auto bg-transparent"
              />
              <p className="text-gray-600">{formData.accountType}</p>
              <div className="flex items-center mt-1">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {formData.verification}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Key className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">كلمة المرور</p>
                <p className="text-sm text-gray-600">تغيير كلمة المرور الخاصة بك</p>
              </div>
            </div>
            <Button 
              onClick={handleChangePassword}
              variant="outline" 
              className="text-munaasib-red border-munaasib-red hover:bg-munaasib-red hover:text-white"
            >
              تغيير كلمة المرور
            </Button>
          </div>
        </Card>

        {/* Personal Information - Editable */}
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4">المعلومات الشخصية</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="phone">رقم الجوال</Label>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-5 h-5 text-gray-500" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="location">الموقع</Label>
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="w-5 h-5 text-gray-500" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">تاريخ الانضمام</p>
                <p className="text-gray-600">{formData.joinDate}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Business Information - Editable */}
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4">معلومات الأعمال</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="responseTime">وقت الاستجابة</Label>
              <Input
                id="responseTime"
                value={formData.responseTime}
                onChange={(e) => handleInputChange('responseTime', e.target.value)}
                className="text-right"
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="businessHours">ساعات العمل</Label>
              <Textarea
                id="businessHours"
                value={formData.businessHours}
                onChange={(e) => handleInputChange('businessHours', e.target.value)}
                className="text-right"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-munaasib-red hover:bg-munaasib-red/90"
        >
          <Save className="w-4 h-4 ml-2" />
          حفظ تعديل المعلومات
        </Button>
      </div>
    </Layout>
  );
};

export default AccountInfo;
