
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, User, BookOpen, Compass } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

const BottomNav: React.FC = () => {
  
  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية', path: '/' },
    { id: 'events', icon: CalendarDays, label: 'المناسبات', path: '/events' },
    { id: 'explore', icon: Compass, label: 'استكشف', path: '/explore' },
    { id: 'bookings', icon: BookOpen, label: 'حجوزاتي', path: '/bookings' },
    { id: 'profile', icon: User, label: 'حسابي', path: '/profile' }
  ];
  
  return (
    <nav className="bg-white fixed bottom-0 left-0 right-0 border-t border-gray-200 z-[100] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-20">
        {navItems.map((item) => {
          const Icon = item.icon as React.ComponentType<{ className?: string }>;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center transition-colors duration-200 hover:text-munaasib-primary dark:hover:text-munaasib-primary",
                  isActive ? "text-munaasib-primary dark:text-munaasib-primary" : "text-gray-500 dark:text-gray-400"
                )
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
