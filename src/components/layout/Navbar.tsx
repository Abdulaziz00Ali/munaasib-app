
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronRight } from 'lucide-react';
import Logo from '../Logo';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showSearch?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  showBack = false,
  showNotification = true,
  showSearch = true,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between h-16">
        <div className="w-1/3 flex justify-start">
          {showBack ? (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ChevronRight className="w-6 h-6" />
            </Button>
          ) : (
            showNotification && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications" aria-label="Notifications">
                  <Bell className="w-6 h-6" />
                </Link>
              </Button>
            )
          )}
        </div>

        <div className="w-1/3 flex justify-center">
          {title ? (
            <h1 className="text-xl font-bold truncate">{title}</h1>
          ) : (
            <Link to="/" aria-label="Go to homepage">
              <Logo />
            </Link>
          )}
        </div>

        <div className="w-1/3 flex justify-end items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/explore" aria-label="استكشف">
                <Search className="w-6 h-6" />
              </Link>
            </Button>
          )}
          <Link to="/privacy" className="text-xs text-muted-foreground hidden md:inline">
            الخصوصية
          </Link>
          <span className="text-xs text-muted-foreground hidden md:inline">•</span>
          <Link to="/terms" className="text-xs text-muted-foreground hidden md:inline">
            الشروط
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
