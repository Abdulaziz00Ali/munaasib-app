import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Pencil, Trash2, Clock, Calendar as CalendarIcon, Plus, X, CalendarPlus, CalendarX } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar.tsx';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useToast } from '@/hooks/use-toast.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader.tsx';

const VendorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceImages, setNewServiceImages] = useState<File[]>([]);
  // Sample data for vendor dashboard
  const vendorInfo = {
    name: 'مطبخ الضيافة السعودي',
    rating: 4.8,
    bookings: 245,
    status: 'متاح حالياً',
    statusColor: 'text-green-500',
  };
  
  const [availableDates, setAvailableDates] = useState([
    { day: 14, month: 'ذو القعدة', year: 1446 },
    { day: 15, month: 'ذو القعدة', year: 1446 },
    { day: 18, month: 'ذو القعدة', year: 1446 },
    { day: 20, month: 'ذو القعدة', year: 1446 },
  ]);
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
  // Helper function to convert Arabic-Indic numerals to regular numbers
  const convertArabicNumerals = (arabicNumber: string): number => {
    const arabicToEnglish: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    
    let englishNumber = arabicNumber;
    for (const [arabic, english] of Object.entries(arabicToEnglish)) {
      englishNumber = englishNumber.replace(new RegExp(arabic, 'g'), english);
    }
    
    const result = parseInt(englishNumber, 10);
    console.log(`Converting "${arabicNumber}" to ${result}`);
    return result;
  };
  
  // Helper function to convert Gregorian date to Hijri
  const convertToHijri = (gregorianDate: Date) => {
    try {
      // Create a proper Hijri date using Intl.DateTimeFormat
      const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const hijriParts = hijriFormatter.formatToParts(gregorianDate);
      
      console.log('Hijri parts:', hijriParts);
      
      const dayPart = hijriParts.find(part => part.type === 'day')?.value || '1';
      const monthPart = hijriParts.find(part => part.type === 'month')?.value || 'ذو القعدة';
      const yearPart = hijriParts.find(part => part.type === 'year')?.value || '1446';
      
      // Convert Arabic numerals to regular numbers
      const day = convertArabicNumerals(dayPart);
      const year = convertArabicNumerals(yearPart);
      const month = monthPart;
      
      console.log('Converted Hijri date:', { day, month, year });
      
      // Validate the conversion
      if (isNaN(day) || isNaN(year)) {
        throw new Error('Failed to convert Arabic numerals');
      }
      
      return { day, month, year };
    } catch (error) {
      console.error('Error converting to Hijri:', error);
      // Fallback to a simple approximation
      return {
        day: gregorianDate.getDate(),
        month: 'ذو القعدة',
        year: 1446
      };
    }
  };

  const services = [
    {
      id: 1,
      name: 'بوفيه عشاء كامل',
      price: 350,
      currency: 'ريال',
      image: 'https://source.unsplash.com/featured/?buffet,dinner',
    },
    {
      id: 2,
      name: 'بوفيه عشاء كامل',
      price: 350,
      currency: 'ريال',
      image: 'https://source.unsplash.com/featured/?catering,food',
    },
    {
      id: 3,
      name: 'بوفيه عشاء كامل',
      price: 350,
      currency: 'ريال',
      image: 'https://source.unsplash.com/featured/?buffet,food',
    },
    {
      id: 4,
      name: 'بوفيه عشاء كامل',
      price: 350,
      currency: 'ريال',
      image: 'https://source.unsplash.com/featured/?dinner,catering',
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      client: 'محمد عبدالله',
      date: '٢٥ رمضان',
      time: '٧:٣٠ مساءً',
      status: 'مؤكد',
      statusColor: 'text-green-500',
    },
    {
      id: 2,
      client: 'أحمد خالد',
      date: '٢٥ رمضان',
      time: '٨:٠٠ مساءً',
      status: 'معلق',
      statusColor: 'text-amber-500',
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'أحمد محمد',
      message: 'بخصوص حجز يوم الخميس...',
      unread: true,
    },
    {
      id: 2,
      sender: 'سارة علي',
      message: 'شكراً لكم على الخدمة الممتازة',
      unread: false,
    },
  ];
  
  // Handle adding a new available date
  const handleDateSelect = (date: Date | undefined) => {
    console.log('handleDateSelect called with:', date);
    
    if (!date) {
      console.log('No date selected, returning');
      return;
    }
    
    try {
      // Convert the selected Gregorian date to Hijri
      const hijriDate = convertToHijri(date);
      
      console.log('Selected Gregorian date:', date);
      console.log('Converted to Hijri:', hijriDate);
      
      // Check if this exact date already exists
      const dateExists = availableDates.some(
        existingDate => existingDate.day === hijriDate.day && 
                       existingDate.month === hijriDate.month && 
                       existingDate.year === hijriDate.year
      );
      
      console.log('Date exists?', dateExists);
      
      if (!dateExists) {
        const updatedDates = [...availableDates, hijriDate];
        
        console.log('Adding new Hijri date:', hijriDate);
        console.log('Updated dates array:', updatedDates);
        
        setAvailableDates(updatedDates);
        
        toast({
          title: "تمت إضافة التاريخ بنجاح",
          description: `تم إضافة ${hijriDate.day} ${hijriDate.month} ${hijriDate.year} إلى المواعيد المتاحة`,
        });
      } else {
        console.log('Date already exists, showing error toast');
        toast({
          title: "التاريخ موجود بالفعل",
          description: `${hijriDate.day} ${hijriDate.month} ${hijriDate.year} مضاف مسبقاً في المواعيد المتاحة`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleDateSelect:', error);
      toast({
        title: "خطأ في إضافة التاريخ",
        description: "حدث خطأ أثناء إضافة التاريخ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
    
    // Always close the popover and reset selection
    setCalendarOpen(false);
    setSelectedDate(undefined);
  };
  
  // Bulk add dates to available dates
  const handleAddMultipleDates = () => {
    toast({
      title: "إضافة مواعيد متعددة",
      description: "هذه الميزة ستكون متاحة قريباً",
    });
  };
  
  // Clear all available dates
  const handleClearAllDates = () => {
    if (availableDates.length === 0) {
      toast({
        title: "لا توجد مواعيد",
        description: "لا توجد مواعيد متاحة للحذف",
        variant: "destructive",
      });
      return;
    }
    
    setAvailableDates([]);
    toast({
      title: "تم حذف جميع المواعيد",
      description: "تم حذف جميع المواعيد المتاحة بنجاح",
    });
  };
  
  // Remove a date from available dates
  const removeDate = (day: number, month: string) => {
    const updatedDates = availableDates.filter(
      d => !(d.day === day && d.month === month)
    );
    
    setAvailableDates(updatedDates);
    
    toast({
      title: "تم حذف التاريخ",
      description: `تم حذف ${day} ${month} من المواعيد المتاحة`,
    });
  };

  return (
    <Layout title="لوحة التحكم" showSearch={false} showNotification={false} showBottomNav={false}>
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="text-xl font-bold mb-1">مرحباً، {vendorInfo.name}</h2>
          <p className="text-gray-700">مرحباً بك في لوحة التحكم</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-amber-500 text-2xl font-bold">{vendorInfo.rating}</div>
            <div className="text-sm text-gray-600">من ٥</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-munaasib-red text-2xl font-bold">{vendorInfo.bookings}</div>
            <div className="text-sm text-gray-600">حجز</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className={`text-2xl font-bold ${vendorInfo.statusColor}`}>{vendorInfo.status}</div>
            <div className="text-sm text-gray-600">حالة الخدمة</div>
          </div>
        </div>
      </div>

      {/* Available Dates Management Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">إدارة المواعيد المتاحة</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>أضف أو احذف التواريخ المتاحة لخدماتك من هنا.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  className="bg-munaasib-red hover:bg-munaasib-red/90"
                  onClick={() => {
                    console.log('Add date button clicked');
                    setCalendarOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 ml-2" /> إضافة موعد
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    console.log('Calendar onSelect called with:', date);
                    setSelectedDate(date);
                    handleDateSelect(date);
                  }}
                  locale={ar}
                  className="p-3"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleAddMultipleDates} variant="outline" title="إضافة مواعيد متعددة">
              <CalendarPlus className="h-4 w-4" />
            </Button>
            
            <Button onClick={handleClearAllDates} variant="outline" className="text-red-500" title="حذف جميع المواعيد">
              <CalendarX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          {availableDates.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((date, index) => (
                <div 
                  key={`${date.day}-${date.month}-${index}`}
                  className="border rounded-lg p-3 flex flex-col items-center relative"
                >
                  <button 
                    className="absolute top-1 left-1 text-gray-400 hover:text-red-500"
                    onClick={() => removeDate(date.day, date.month)}
                    title="حذف هذا التاريخ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold">{date.day}</span>
                  <span className="text-gray-500 text-sm" dir="rtl">
                    {date.month}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد مواعيد متاحة. أضف مواعيد جديدة باستخدام زر "إضافة موعد"
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">قائمة خدماتي</h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-munaasib-red">
                <Plus className="h-4 w-4 mr-2" /> إضافة خدمة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة خدمة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service-name">اسم الخدمة</Label>
                  <Input id="service-name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="service-price">السعر</Label>
                  <Input id="service-price" type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} />
                </div>
                <div>
                  <ImageUploader 
                    onImageUpload={(file) => {
                      setNewServiceImages(prev => [...prev, file]);
                    }}
                    maxImages={5}
                    currentImages={[]}
                    onRemoveImage={(index) => {
                      setNewServiceImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    label="صور الخدمة"
                  />
                </div>
                <Button onClick={() => setIsModalOpen(false)} className="w-full">إضافة</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-36 bg-gray-200 relative">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 left-0 flex justify-between p-2 bg-black bg-opacity-30">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white bg-opacity-90 rounded-full p-1">
                    <Pencil className="h-4 w-4 text-gray-700" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white bg-opacity-90 rounded-full p-1">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-munaasib-red">{service.price} {service.currency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">الحجوزات القادمة</h2>
        {upcomingBookings.map((booking) => (
          <div key={booking.id} className="mb-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{booking.client}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 ml-1" />
                  <span>{booking.date}، {booking.time}</span>
                </div>
              </div>
              <div>
                <span className={`${booking.statusColor} text-sm font-medium`}>{booking.status}</span>
                <div className="mt-2">
                  <Link to={`/bookings/${booking.id}`} className="text-amber-500 text-sm">
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/messages" className="block mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">الرسائل</h2>
            <span className="text-munaasib-red text-sm hover:underline">
              عرض جميع الرسائل
            </span>
          </div>
          {messages.map((message) => (
            <div key={message.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{message.sender}</h3>
                  <p className="text-gray-600 text-sm">{message.message}</p>
                </div>
                {message.unread && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    جديد
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Link>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">إعدادات الحساب</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/account-info" className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="font-medium">الملف الشخصي</span>
          </Link>
          <Link to="/help" className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <span>الدعم الفني</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
