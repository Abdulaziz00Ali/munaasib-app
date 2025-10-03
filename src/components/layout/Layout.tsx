
import React, { ReactNode } from 'react';
import Navbar from './Navbar.tsx';
import BottomNav from './BottomNav.tsx';
import { Badge } from '@/components/ui/badge';

import { Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';


type LayoutProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
  showNavbar?: boolean;
  showNotification?: boolean;
  showSearch?: boolean;
};

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBack = false,
  showBottomNav = true,
  showNavbar = true,
  showNotification = true,
  showSearch = true,
}) => {
  // الرقم من البيئة بصيغة دولية (أرقام فقط)
  const rawWhatsApp = (import.meta as any).env?.VITE_WHATSAPP_NUMBER as string | undefined;
  const whatsappNumber = (rawWhatsApp || '').replace(/\D/g, '');
  const hasWhatsApp = whatsappNumber.length >= 10; // حد أدنى معقول لطول الرقم الدولي
  const defaultWaMsg = encodeURIComponent('مرحباً، أرغب بالاستفسار عن الخدمات.');
  const waLink = `https://wa.me/${whatsappNumber}?text=${defaultWaMsg}`;
  const telLink = `tel:${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {showNavbar && (
        <Navbar 
          title={title} 
          showBack={showBack} 
          showNotification={showNotification}
          showSearch={showSearch}
        />
      )}
      
      <main className="container mx-auto px-4 py-4">
        {children}
      </main>

      <footer className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
        <Link to="/terms" className="hover:underline">الشروط والأحكام</Link>
        <span className="mx-2">•</span>
        <Link to="/privacy" className="hover:underline">سياسة الخصوصية</Link>
      </footer>

      {/* زرّان عائمان للتواصل: واتساب واتصال هاتفي */}
      {hasWhatsApp && (
        <div className="fixed bottom-24 right-4 z-[110] flex flex-col gap-3 md:bottom-8">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            className="rounded-full bg-green-500 text-white shadow-lg p-4 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
          <a
            href={telLink}
            aria-label="اتصال هاتفي"
            className="rounded-full bg-blue-500 text-white shadow-lg p-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Phone className="w-6 h-6" />
          </a>
        </div>
      )}
      
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
