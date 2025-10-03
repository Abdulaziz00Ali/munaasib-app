import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import { Share, Calendar, Star, MapPin, StarHalf, StarOff, Image, Phone, MessageCircle, Truck } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table.tsx';
import {
  Card,
  CardContent
} from '@/components/ui/card.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.tsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion.tsx';
import { Calendar as CalendarComponent } from '@/components/ui/calendar.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
// import { ar } from 'date-fns/locale'; // unused
import { useToast } from '@/hooks/use-toast.ts';
import { useUserType } from '@/hooks/useUserType.ts';
import { getVenueById as getHallById } from '@/data/mergedTabukHalls.ts';
import { getVenueById as getKitchenById } from '@/data/mergedTabukKitchens.ts';
// Removed WhatsApp integration from booking action
// import { openWhatsApp } from '@/lib/utils.ts';
import { applyImageOverridesToVenue } from '@/lib/utils.ts';

// const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userType } = useUserType();
  const isVendor = userType === 'vendor';
  
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHijriDay, setSelectedHijriDay] = useState<string | null>(null);
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState([
    { day: 14, month: 'ذو القعدة', year: 1446 },
    { day: 15, month: 'ذو القعدة', year: 1446 },
    { day: 18, month: 'ذو القعدة', year: 1446 },
    { day: 20, month: 'ذو القعدة', year: 1446 },
  ]);
  
  // تلميح أول مرة على شريط الإجراءات السفلي
  const [showCtaHint, setShowCtaHint] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem('seenCtaHint');
      if (!seen) setShowCtaHint(true);
    } catch {}
  }, []);
  
  // Get real venue data from both halls and kitchens
  const getVenueById = (id: string) => {
    return getHallById(id) || getKitchenById(id);
  };
  
  const baseVenue = getVenueById(id || '');
  const realVenue = baseVenue ? applyImageOverridesToVenue(baseVenue) : baseVenue;

  // If this is a kitchen, redirect to booking page and avoid rendering service page
  const isKitchen = !!realVenue && (realVenue as any).category === 'kitchens';
  React.useEffect(() => {
    if (isKitchen && realVenue?.id) {
      navigate(`/booking/${realVenue.id}`, { replace: true });
    }
  }, [isKitchen, realVenue?.id, navigate]);

  if (isKitchen) {
    return null;
  }

  // Load any saved date information and package selection on component mount
  useEffect(() => {
    // Load saved date information
    try {
      const savedDateStr = localStorage.getItem('selectedBookingDate');
      const savedHijriDay = localStorage.getItem('selectedHijriDay');
      const savedHijriMonth = localStorage.getItem('selectedHijriMonth');
      
      if (savedDateStr && savedHijriDay && savedHijriMonth) {
        try {
          const savedDate = new Date(savedDateStr);
          if (isNaN(savedDate.getTime())) {
            console.error('Invalid date loaded from localStorage');
            clearStoredDateData();
            return;
          }
          setSelectedDate(savedDate);
          setSelectedHijriDay(savedHijriDay);
          setSelectedHijriMonth(savedHijriMonth);
        } catch (error) {
          console.error('Error loading saved date:', error);
          // Clear invalid data
          clearStoredDateData();
        }
      }
    } catch (err) {
      console.warn('Failed to access localStorage for saved date information:', err);
    }
    
    // Load saved package selection
    try {
      const savedPackageId = localStorage.getItem('selectedPackageId');
      if (savedPackageId) {
        // Verify the package exists in this service
        const packageExists = service.packages && 
          service.packages.some(pkg => pkg.id === savedPackageId);
        
        if (packageExists) {
          setSelectedPackage(savedPackageId);
        } else {
          // If package doesn't exist in this service, clear saved selection
          try {
            localStorage.removeItem('selectedPackageId');
            localStorage.removeItem('selectedPackageName');
          } catch (err) {
            console.warn('Failed to clear selected package from localStorage:', err);
            toast({
              title: 'خطأ في التخزين المحلي',
              description: 'تعذّر تحديث بيانات الباقة في المتصفح.',
              variant: 'destructive',
            });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to access localStorage for saved package information:', err);
    }
  }, []);

  if (!realVenue) {
    return (
      <Layout showBack showNavbar={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">لم يتم العثور على الخدمة</h2>
            <p className="text-gray-600">عذراً، لا يمكن العثور على تفاصيل هذه الخدمة</p>
            <Link to="/explore" className="text-munaasib-red mt-4 inline-block">
              العودة للاستكشاف
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Always show venue details regardless of missing fields
  // Set default values for missing fields
  if (!realVenue.address) realVenue.address = "تبوك، المملكة العربية السعودية";
  if (!realVenue.image) realVenue.image = "/placeholder.svg";
  if (!realVenue.price) realVenue.price = 1500; // Default price
  if (!realVenue.features) realVenue.features = [];
  if (!realVenue.reviews) realVenue.reviews = [];
  if (!realVenue.packages) realVenue.packages = [];
  if (!realVenue.gallery) realVenue.gallery = [];
  if (typeof realVenue.rating !== 'number') realVenue.rating = 4.5; // Default rating

  const service = {
    id: realVenue.id,
    name: realVenue.name,
    location: realVenue.address,
    image: realVenue.image,
    rating: realVenue.rating as number,
    reviewCount: realVenue.reviews.length,
    description: realVenue.description,
    classification: 'قاعات أفراح',
    capacity: realVenue.name.includes('ليلتي') ? '400-600 ضيف (نساء) | 100-250 ضيف (رجال)' : '300 ضيف',
    basePrice: realVenue.price,
    features: realVenue.features,
    providesFullService: true,
    fullServiceDetails: 'القاعة متكفلة بتوفير خدمات القهوجية والمطبخ بشكل كامل، مع إمكانية إضافة خدمات إضافية حسب الطلب.',
    packages: realVenue.packages,
    reviews: realVenue.reviews,
    gallery: realVenue.gallery
  };

  // Ensure we always have a valid selectedPackage (default to first available package if needed)
  useEffect(() => {
    const pkgs = service.packages || [];
    if (pkgs.length > 0 && !pkgs.some(p => p.id === selectedPackage)) {
      setSelectedPackage(pkgs[0].id);
      try {
        localStorage.setItem('selectedPackageId', pkgs[0].id);
        localStorage.setItem('selectedPackageName', pkgs[0].name);
      } catch (err) {
        console.warn('Failed to persist default selected package');
      }
    }
  }, [service.id]);

  // Function to clear stored date data
  const clearStoredDateData = () => {
    try {
      localStorage.removeItem('selectedBookingDate');
      localStorage.removeItem('selectedHijriDay');
      localStorage.removeItem('selectedHijriMonth');
    } catch (err) {
      console.warn('Failed to clear stored date data:', err);
    } finally {
      setSelectedDate(undefined);
      setSelectedHijriDay(null);
      setSelectedHijriMonth(null);
    }
  };
  
  // Parse a Hijri date string into its components
  const parseHijriDate = (hijriDateStr: string) => {
    if (!hijriDateStr) return { day: null, month: null };
    
    const parts = hijriDateStr.split(' ');
    const day = parts[0];
    const month = parts.length > 1 ? parts.slice(1).join(' ') : null;
    
    return { day, month };
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      clearStoredDateData();
      
      toast({
        title: "تم إلغاء اختيار التاريخ",
        description: "تم إلغاء تاريخ الحجز بنجاح",
      });
      
      setCalendarOpen(false);
      return;
    }
    
    // Format the Gregorian date to Hijri with fallbacks
    let day = '';
    let month = '';
    try {
      const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
      }).format(date);
      const parts = hijriDate.split(' ');
      day = parts[0];
      month = parts.length > 1 ? parts.slice(1).join(' ') : '';
    } catch (e) {
      try {
        day = date.toLocaleDateString('ar-SA', { day: 'numeric' });
        month = date.toLocaleDateString('ar-SA', { month: 'long' });
      } catch {
        day = String(date.getDate());
        month = date.toLocaleString('en-US', { month: 'long' });
      }
    }

    if (day && month) {
      // Set the selected Hijri day and month
      setSelectedHijriDay(day);
      setSelectedHijriMonth(month);
      
      // Set the selected date
      setSelectedDate(date);
      
      // Store the selected date in localStorage
      try {
        localStorage.setItem('selectedBookingDate', date.toISOString());
        localStorage.setItem('selectedHijriDay', day);
        localStorage.setItem('selectedHijriMonth', month);
      } catch (error) {
        console.error('Error saving selected date to localStorage:', error);
        toast({
          title: "خطأ في حفظ البيانات",
          description: "تعذر حفظ التاريخ المحدد محليًا",
          variant: "destructive",
        });
      }
      
      toast({
        title: "تم اختيار التاريخ",
        description: `تم اختيار ${day} ${month} كتاريخ للحجز`,
      });
    } else {
      toast({
        title: "خطأ في تنسيق التاريخ",
        description: "تعذر تحليل التاريخ الهجري بشكل صحيح",
        variant: "destructive",
      });
    }
    
    setCalendarOpen(false);
  };

  // Format date in Hijri
  const formatHijriDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      try {
        return date.toLocaleDateString('ar-SA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch {
        return date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
  };
  
  // Check if a date is the currently selected date
  const isDateSelected = (day: number, month: string) => {
    const dayStr = day.toString();
    return selectedHijriDay === dayStr && selectedHijriMonth === month;
  };

  // Handle click on an available date
  const handleDateClick = (day: number, month: string) => {
    // Convert to strings for consistency
    const dayStr = day.toString();
    
    // If this date is already selected, deselect it
    if (isDateSelected(day, month)) {
      clearStoredDateData();
      
      toast({
        title: "تم إلغاء اختيار التاريخ",
        description: "تم إلغاء تاريخ الحجز بنجاح",
      });
      return;
    }
    
    // Otherwise select it
    setSelectedHijriDay(dayStr);
    setSelectedHijriMonth(month);
    
    // Store in localStorage
    try {
      localStorage.setItem('selectedHijriDay', dayStr);
      localStorage.setItem('selectedHijriMonth', month);
      
      // Since we don't have an exact Gregorian date for the Hijri date,
      // we'll use the current date as a placeholder
      const today = new Date();
      localStorage.setItem('selectedBookingDate', today.toISOString());
      setSelectedDate(today);
    } catch (err) {
      console.warn('Failed to save selected Hijri date to localStorage:', err);
      toast({
        title: 'خطأ في حفظ البيانات',
        description: 'تعذّر حفظ التاريخ المحدد محليًا.',
        variant: 'destructive',
      });
    }
    
    toast({
      title: "تم اختيار التاريخ",
      description: `تم اختيار ${dayStr} ${month} كتاريخ للحجز`,
    });
  };
  
  // Add a new available date (for vendor only)
  const handleAddDate = () => {
    if (!isVendor) return;
    
    // In a real app, this would be connected to a date picker
    // For now, just add a hardcoded new date for demo purposes
    const newDate = {
      day: 25,
      month: 'ذو القعدة',
      year: 1446
    };
    
    setAvailableDates(prev => [...prev, newDate]);
    
    toast({
      title: "تم إضافة تاريخ جديد",
      description: `تم إضافة ${newDate.day} ${newDate.month} إلى المواعيد المتاحة`,
    });
  };
  
  // Remove an available date (for vendor only)
  const handleRemoveDate = (index: number) => {
    if (!isVendor) return;
    
    const dateToRemove = availableDates[index];
    setAvailableDates(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "تم حذف التاريخ",
      description: `تم حذف ${dateToRemove.day} ${dateToRemove.month} من المواعيد المتاحة`,
    });
  };

  const renderRatingStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && isFinite(rating) ? rating : 0;
    const stars = [] as JSX.Element[];
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && halfStar) {
        stars.push(<StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<StarOff key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    
    return stars;
  };
  
  const handleBookNow = () => {
    if (!service) return;
    navigate(`/booking/${service.id}`, { state: selectedPackage ? { selectedPackageId: selectedPackage } : undefined });
  };

  // Contact and opening hours (if available)
  let contact = (realVenue as any).contact as { phone?: string; whatsapp?: string } | undefined;
  let openingHours = (realVenue as any).additionalInfo?.openingHours as Array<{ day: string; hours: string }> | undefined;
  const googleMapsUrl = (realVenue as any).googleMapsUrl as string | undefined;
  const isHall = typeof (realVenue as any).category === 'string'
    ? (realVenue as any).category.includes('قاعة')
    : (realVenue.name?.includes('قاعة') ?? false);
  
  // تطبيق تعديلات البائع (إن وُجدت) من التخزين المحلي
  try {
    const vo = JSON.parse(localStorage.getItem('vendorOverrides') || 'null');
    if (vo) {
      if (vo.contact) contact = vo.contact;
      if (vo.openingHours) openingHours = vo.openingHours;
      if (vo.packages && Array.isArray(vo.packages)) {
        // استبدال باقات المنصة بباقات البائع
        service.packages = vo.packages;
      }
    }
  } catch (e) {
    // تجاهل أي أخطاء parsing
  }
  
  const normalizePhone = (p?: string) => {
    if (!p) return '';
    const digits = p.replace(/[^0-9+]/g, '');
    if (digits.startsWith('+')) return digits;
    if (digits.startsWith('966')) return `+${digits}`;
    if (digits.startsWith('05')) return `+966${digits.slice(1)}`;
    if (digits.startsWith('5')) return `+966${digits}`;
    return digits.startsWith('0') ? `+966${digits.slice(1)}` : `+${digits}`;
  };

  return (
    <Layout showBack showNavbar={false}>
      <div className="relative -mt-4 -mx-4">
        {(() => {
          const kebab = (str?: string) => (str || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^\u0600-\u06FF\w\s-]/g, '')
            .replace(/\s+/g, '-');
          const nameKebab = kebab(service.name);
          const bases = nameKebab ? [`/images/places/${nameKebab}-1`, `/images/places/${nameKebab}-2`, `/images/places/${nameKebab}-3`] : [];
          const exts = ['.jpg', '.jpeg', '.png', '.webp'];
          const localCandidates = bases.flatMap((b) => exts.map((e) => `${b}${e}`));
          const optimized = service.image && service.image.includes('halls and kitchens images')
            ? service.image.replace('halls and kitchens images', 'optimized-images').replace(/\.(jpg|jpeg|png)$/i, '.webp')
            : undefined;
          const candidates = [
            ...localCandidates,
            ...(optimized ? [optimized] : []),
            ...(service.image ? [service.image] : []),
          ].filter(Boolean) as string[];
          const ImgWithFallback: React.FC = () => {
            const [idx, setIdx] = React.useState(0);
            const src = candidates[idx];
            if (!src) {
              return <img src="/placeholder.svg" alt="Placeholder" className="w-full h-64 object-cover" loading="lazy" decoding="async" />;
            }
            return (
              <img
                src={src}
                alt={service.name}
                className="w-full h-64 object-cover"
                onError={() => setIdx((i) => i + 1)}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
              />
            );
          };
          return <ImgWithFallback />;
        })()}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link to="/explore" className="bg-white p-2 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700 flip-rtl">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <button className="bg-white p-2 rounded-full shadow-lg">
            <Share className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="px-4">
        {/* Service Header with Rating */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{service.name}</h1>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              <Link to={`/reviews/${id}`} className="flex items-center">
                <div className="flex items-center">
                  {renderRatingStars(service.rating)}
                  <span className="font-semibold mr-1">{service.rating}</span>
                  <span className="text-gray-500">({service.reviewCount} تقييم)</span>
                </div>
              </Link>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 ml-1" />
                {service.location}
              </div>
            </div>
            
            <div className="bg-green-500 text-white px-3 py-1 rounded-lg">
              <span className="text-sm font-medium">متاح حالياً</span>
            </div>
          </div>
        </div>
        
        {/* Service Details Table */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">تفاصيل المكان</h2>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold w-1/3">التصنيف</TableCell>
                <TableCell>{service.classification}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">السعة</TableCell>
                <TableCell>{service.capacity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">الأسعار</TableCell>
                <TableCell className="text-gray-700 font-medium">تواصل مع {isHall ? 'القاعة' : 'المطبخ'} لمزيد من المعلومات</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Service Features */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">الميزات</h2>
          <div className="grid grid-cols-2 gap-4">
            {service.features.map((feature, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="flex flex-col items-center p-4">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-center font-medium">{feature.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 bg-munaasib-lightGold border border-munaasib-gold p-4 rounded-lg">
            <h3 className="font-bold mb-1">تنظيم متكامل</h3>
            <p className="text-gray-700">{service.fullServiceDetails}</p>
          </div>
        </div>
        
        {/* أقسام خاصة بالمطابخ */}
        {!isHall && (
          <>
            {Array.isArray((service as any).additionalInfo?.dishes) && (service as any).additionalInfo.dishes.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-3">الأطباق المتوفرة</h2>
                <div className="flex flex-wrap gap-2">
                  {(service as any).additionalInfo.dishes.map((dish: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-gray-100 border text-gray-800 text-sm"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {typeof (service as any).additionalInfo?.delivery === 'boolean' && (
              <div className="mt-4">
                <h2 className="text-lg font-bold mb-3">خدمة التوصيل</h2>
                <Card className="border-gray-200">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Truck className="w-5 h-5 text-gray-700" />
                    <span
                      className={`font-medium ${ (service as any).additionalInfo.delivery ? 'text-green-600' : 'text-red-600'}`}
                    >
                      { (service as any).additionalInfo.delivery ? 'متاحة' : 'غير متاحة' }
                    </span>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
        
        {/* Packages and Pricing */}
        {/* تم إخفاء الباقات والأسعار بناءً على سياسة المنصة */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">الباقات والخدمات</h2>
          <div className="bg-gray-50 border rounded-lg p-4 text-gray-700">
            <p>نحن نركز على توفير قنوات اتصال مباشرة بين العملاء وأصحاب المنشآت.</p>
            <p className="mt-1">تواصل مع {isHall ? 'القاعة' : 'المطبخ'} لمزيد من المعلومات حول الباقات والتفاصيل.</p>
          </div>
        </div>
        {service.packages && service.packages.length > 0 ? (
          <div className="space-y-4">
            {service.packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === pkg.id 
                    ? 'border-munaasib-gold bg-munaasib-lightGold' 
                    : 'border-gray-200'
                }`}
                onClick={() => {
                  setSelectedPackage(pkg.id);
                  toast({
                    title: "تم اختيار الباقة",
                    description: `تم اختيار ${pkg.name}`,
                  });
                  
                  // Store selected package in localStorage for persistence
                  try {
                    localStorage.setItem('selectedPackageId', pkg.id);
                    localStorage.setItem('selectedPackageName', pkg.name);
                  } catch (err) {
                    console.warn('Failed to save selected package to localStorage:', err);
                    toast({
                      title: 'خطأ في حفظ البيانات',
                      description: 'تعذّر حفظ الباقة المحددة محليًا.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">{pkg.name}</h3>
                  <span className="font-bold text-gray-700">تواصل لمعرفة السعر</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{pkg.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between">
              <h3 className="font-bold">الباقة الأساسية</h3>
              <span className="font-bold text-gray-700">تواصل لمعرفة السعر</span>
            </div>
            <p className="text-gray-600 mt-1 text-sm">الباقة الأساسية تشمل الخدمات الرئيسية</p>
          </div>
        )}
        
        {/* Photo Gallery with improved Google Maps image handling */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">معرض الصور</h2>
            <Link to={`/gallery/${id}`} className="text-munaasib-red text-sm">عرض الكل</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {service.gallery.map((image, index) => (
              <div key={index} className="min-w-[150px] h-[100px]">
                {(() => {
                  const kebab = (str?: string) => (str || '')
                    .toString()
                    .trim()
                    .toLowerCase()
                    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                  const nameKebab = kebab(service.name);
                  const bases = nameKebab ? [`/images/places/${nameKebab}-1`, `/images/places/${nameKebab}-2`, `/images/places/${nameKebab}-3`] : [];
                  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                  const localCandidates = bases.flatMap((b) => exts.map((e) => `${b}${e}`));
                  const optimized = image && image.includes('halls and kitchens images')
                    ? image.replace('halls and kitchens images', 'optimized-images').replace(/\.(jpg|jpeg|png)$/i, '.webp')
                    : undefined;
                  const candidates = [
                    ...localCandidates,
                    ...(optimized ? [optimized] : []),
                    ...(image ? [image] : []),
                  ].filter(Boolean) as string[];
                  const ImgWithFallback: React.FC = () => {
                    const [idx, setIdx] = React.useState(0);
                    const src = candidates[idx];
                    if (!src) {
                      return <img src="/placeholder.svg" alt="Placeholder" className="w-full h-64 object-cover" loading="lazy" decoding="async" />;
                    }
                    return (
                      <img
                        src={src}
                        alt={service.name}
                        className="w-full h-64 object-cover"
                        onError={() => setIdx((i) => i + 1)}
                        loading="lazy"
                        decoding="async"
                        crossOrigin="anonymous"
                      />
                    );
                  };
                  return <ImgWithFallback />;
                })()}
              </div>
            ))}
          </div>
        </div>
        
        {/* Available Dates - Only visible to vendors */}
        {isVendor && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">إدارة المواعيد المتاحة</h2>
              <button 
                onClick={handleAddDate}
                className="text-white bg-green-600 rounded-lg px-3 py-1 text-sm"
              >
                إضافة موعد
              </button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2">
              {availableDates.map((date, index) => (
                <div 
                  key={`${date.day}-${date.month}-${index}`}
                  className="relative border rounded-lg p-4 flex flex-col items-center min-w-[80px] bg-white border-gray-200"
                >
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() => handleRemoveDate(index)}
                  >
                    ×
                  </button>
                  <span className="text-lg font-bold">{date.day}</span>
                  <span className="text-gray-500" dir="rtl">
                    {date.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews section removed */}
        
        {/* Service Description */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <h2 className="text-lg font-bold mb-2">عن المكان</h2>
          <p className="text-gray-700 leading-relaxed">
            {service.description}
          </p>
        </div>
        
        <div className="sticky bottom-20 left-0 right-0 bg-white pt-4 pb-4 mt-8">
          {showCtaHint && (
            <div className="mb-2 px-3 py-2 rounded-md bg-munaasib-lightGold border border-munaasib-gold text-sm text-gray-800">
              يمكنك الحجز أو التواصل مباشرةً من هنا. اختر الخيار الأنسب لك.
            </div>
          )}
          {isVendor ? (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/venue-images/${realVenue.id}`)}
                className="block w-1/2 text-white text-center py-3 rounded-lg font-bold transition-colors bg-blue-600 hover:bg-blue-700"
              >
                <Image className="inline-block ml-2 h-5 w-5" />
                إدارة الصور
              </button>
              <button
                onClick={handleBookNow}
                className="block w-1/2 text-white text-center py-3 rounded-lg font-bold transition-colors bg-green-600 hover:bg-green-700"
              >
                {isKitchen ? 'اطلب عرض سعر' : 'احجز الآن'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <a
                href={contact?.phone ? `tel:${normalizePhone(contact.phone)}` : undefined}
                onClick={() => {
                  try { localStorage.setItem('seenCtaHint', '1'); } catch {}
                  setShowCtaHint(false);
                }}
                className={`text-center py-3 rounded-lg font-bold border transition-colors ${contact?.phone ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                aria-disabled={!contact?.phone}
              >
                <Phone className="inline-block ml-2 h-5 w-5" />
                اتصال
              </a>
              <a
                href={(contact?.whatsapp || contact?.phone) ? (() => {
                  const num = normalizePhone(contact?.whatsapp || contact?.phone);
                  const msg = `مرحباً، أود الاستفسار عن ${service.name}`;
                  return `https://wa.me/${num.replace('+','')}?text=${encodeURIComponent(msg)}`;
                })() : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try { localStorage.setItem('seenCtaHint', '1'); } catch {}
                  setShowCtaHint(false);
                }}
                className={`text-center py-3 rounded-lg font-bold border transition-colors ${ (contact?.whatsapp || contact?.phone) ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                aria-disabled={!(contact?.whatsapp || contact?.phone)}
              >
                <MessageCircle className="inline-block ml-2 h-5 w-5" />
                واتساب
              </a>
              <button
                onClick={() => {
                  handleBookNow();
                  try { localStorage.setItem('seenCtaHint', '1'); } catch {}
                  setShowCtaHint(false);
                }}
                className="text-white text-center py-3 rounded-lg font-bold transition-colors bg-green-600 hover:bg-green-700"
              >
                {isKitchen ? 'اطلب عرض سعر' : 'احجز الآن'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServiceDetails;
