
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast.ts";

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validations
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ في التحقق",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "كلمة المرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    // Get the redirect path
    let redirectPath = '/profile';
    try {
      const storedPath = localStorage.getItem('passwordResetRedirect');
      if (storedPath) redirectPath = storedPath;
    } catch (err) {
      console.warn('Failed reading passwordResetRedirect from localStorage:', err);
    }
    try {
      localStorage.removeItem('passwordResetRedirect');
    } catch (err) {
      console.warn('Failed removing passwordResetRedirect from localStorage:', err);
    }
    
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم تغيير كلمة المرور بنجاح",
    });
    
    // Redirect to the appropriate page
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-start mb-12">
          <Link to="/verification-code" className="text-gray-800">
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-600 text-sm">
            أدخل كلمة مرور جديدة
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Input 
                placeholder="كلمة المرور الجديدة" 
                className="bg-gray-50 py-6 text-right"
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="relative">
              <Input 
                placeholder="تأكيد كلمة المرور" 
                className="bg-gray-50 py-6 text-right"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <Button type="submit" className="w-full bg-[#987654] py-6 text-lg hover:bg-[#876543]">
              تأكيد
            </Button>
          </div>
        </form>

        <div className="text-center mt-6 flex justify-center gap-1">
          <Link to="/login" className="text-[#987654] mr-1">
            تسجيل الدخول
          </Link>
          <span className="text-gray-600">هل لديك حساب؟</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
