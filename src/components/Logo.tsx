import React from 'react';
import logo from '/logo.svg';

const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={logo} alt="Munaasibatak Logo" className="w-10 h-10" />
      {showText && <span className="font-bold text-2xl ml-2 text-munaasib-primary">مناسبتك</span>}
    </div>
  );
};

export default Logo;
