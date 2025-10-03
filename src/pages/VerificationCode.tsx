
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp.tsx";
import { ArrowRight } from "lucide-react";

const VerificationCode = () => {
  const [timer, setTimer] = useState(120);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    setTimer(120);
    // Logic to resend code would go here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-start mb-12">
          <Link to="/forgot-password" className="text-gray-800">
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-50 p-8">
              <div className="text-[#987654] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 8L17 12H19C19 15.866 15.866 19 12 19C10.5992 19 9.27532 18.5578 8.17572 17.8073L6.69335 19.2896C8.19434 20.3752 10.0242 21 12 21C16.9706 21 21 16.9706 21 12H23L21 8Z" fill="#987654"/>
                  <path d="M5 12C5 8.13401 8.13401 5 12 5C13.4008 5 14.7247 5.44221 15.8243 6.19266L17.3067 4.71035C15.8057 3.62476 13.9758 3 12 3C7.02944 3 3 7.02944 3 12H1L3 16L7 12H5Z" fill="#987654"/>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">رمز التحقق</h1>
          <p className="text-gray-600 text-sm">
            أدخل الرمز المرسل إلى رقم جوالك
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            dir="ltr"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="border border-gray-300 rounded w-12 h-12" />
              <InputOTPSlot index={1} className="border border-gray-300 rounded w-12 h-12" />
              <InputOTPSlot index={2} className="border border-gray-300 rounded w-12 h-12" />
              <InputOTPSlot index={3} className="border border-gray-300 rounded w-12 h-12" />
              <InputOTPSlot index={4} className="border border-gray-300 rounded w-12 h-12" />
              <InputOTPSlot index={5} className="border border-gray-300 rounded w-12 h-12" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600">{formatTime()}</p>
        </div>

        <Button className="w-full bg-[#987654] py-6 text-lg hover:bg-[#876543]">
          تأكيد
        </Button>

        <div className="text-center mt-6">
          <button 
            onClick={handleResend}
            disabled={timer > 0}
            className={`text-[#987654] ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            إعادة الإرسال لم يصلك الرمز؟
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;
