
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement real login logic
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-8">
              <div className="text-[#987654] text-xl font-bold">مناسب</div>
            </div>
          </div>
          <p className="text-lg text-gray-600">خطط لزفافك بسهولة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              placeholder="رقم الجوال" 
              className="bg-gray-50 py-6 text-right" 
              type="tel"
            />
          </div>
          <div className="relative">
            <Input 
              placeholder="كلمة المرور" 
              className="bg-gray-50 py-6 text-right"
              type={showPassword ? "text" : "password"}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 flex items-center pl-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full bg-[#987654] py-6 text-lg hover:bg-[#876543]">
            تسجيل الدخول
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-sm text-[#987654]">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <div className="text-center mt-6 flex justify-center gap-1">
          <Link to="/signin" className="text-[#987654] font-bold">
            إنشاء حساب
          </Link>
          <span className="text-gray-600">ليس لديك حساب؟</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
