
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ArrowRight } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Store the current page for redirect after password reset
    const currentPage = document.referrer;
    if (currentPage.includes('/profile') || currentPage.includes('/vendor-dashboard')) {
      try {
        localStorage.setItem('passwordResetRedirect', currentPage.includes('/vendor-dashboard') ? '/vendor-dashboard' : '/profile');
      } catch (err) {
        console.warn('Failed to set passwordResetRedirect in localStorage:', err);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/verification-code');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-start mb-12">
          <Link to="/login" className="text-gray-800">
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">تغيير كلمة المرور</h1>
          <p className="text-gray-600 text-sm">
            أدخل رقم جوالك لتغيير كلمة المرور
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input 
                placeholder="رقم الجوال" 
                className="bg-gray-50 py-6 text-right" 
                type="tel"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#987654] py-6 text-lg hover:bg-[#876543]">
              إرسال رمز التحقق
            </Button>
          </div>
        </form>

        <div className="text-center mt-6 flex justify-center gap-1">
          <Link to="/login" className="text-[#987654]">
            تذكرت كلمة المرور؟ تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
