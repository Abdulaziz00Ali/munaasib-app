
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Eye, EyeOff } from "lucide-react";
import { useUserType } from "@/hooks/useUserType.ts";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"client" | "vendor">("client");
  const { updateUserType } = useUserType();
  const navigate = useNavigate();
  
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the user type in the hook/localStorage
    updateUserType(userType);
    
    // Navigate to the appropriate page based on user type
    if (userType === 'vendor') {
      navigate('/vendor-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#987654] mb-4">مناسب</h1>
          <p className="text-lg text-gray-600">خطط لزفافك بسهولة</p>
        </div>

        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setUserType("client")}
            className={`flex-1 py-6 rounded-full ${
              userType === "client" 
                ? "bg-[#987654] text-white" 
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            عريس
          </Button>
          <Button
            onClick={() => setUserType("vendor")}
            className={`flex-1 py-6 rounded-full ${
              userType === "vendor" 
                ? "bg-[#987654] text-white" 
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            مزود خدمة
          </Button>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Input 
              placeholder="الاسم الكامل" 
              className="bg-gray-50 py-6 text-right" 
              required
            />
          </div>
          <div>
            <Input 
              placeholder="رقم الجوال" 
              className="bg-gray-50 py-6 text-right" 
              type="tel"
              required
            />
          </div>
          <div className="relative">
            <Input 
              placeholder="كلمة المرور" 
              className="bg-gray-50 py-6 text-right"
              type={showPassword ? "text" : "password"}
              required
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

          <div className="flex items-center gap-2">
            <Checkbox id="terms" className="border-[#6366f1]" required />
            <label htmlFor="terms" className="text-sm text-right flex-1">
              <span className="text-blue-500">موافقتك على هذه الشروط والأحكام</span>
            </label>
          </div>

          <Button type="submit" className="w-full bg-[#987654] py-6 text-lg hover:bg-[#876543]">
            إنشاء حساب
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-[#987654]">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
