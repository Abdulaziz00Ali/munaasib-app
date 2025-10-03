import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import BookingCard from '@/components/ui/BookingCard.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast.ts';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Booking } from '@/types';


const DEFAULT_UPCOMING_BOOKINGS: Booking[] = [
  {
    id: '1',
    title: 'حفل زفاف تقليدي',
    venue: 'قصر الأفراح',
    date: '25 رمضان',
    time: '7:00 مساءً',
    location: 'الرياض، حي النرجس',
    image: 'https://source.unsplash.com/featured/?wedding,hall',
    status: 'confirmed',
  },
  {
    id: '2',
    title: 'حفل عيد ميلاد',
    venue: 'دار المناسبات',
    date: '1 شوال',
    time: '5:30 مساءً',
    location: 'الرياض، حي الملقا',
    image: 'https://source.unsplash.com/featured/?birthday,party',
    status: 'pending',
  },
  {
    id: '3',
    title: 'مؤتمر أعمال',
    venue: 'فندق الأصالة',
    date: '3 شوال',
    time: '9:00 صباحاً',
    location: 'الرياض، حي العليا',
    image: 'https://source.unsplash.com/featured/?conference,business',
    status: 'confirmed',
  },
];

const DEFAULT_PAST_BOOKINGS: Booking[] = [
  {
    id: '4',
    title: 'اجتماع عمل',
    venue: 'مركز الأعمال',
    date: '15 شعبان',
    time: '10:00 صباحاً',
    location: 'الرياض، حي الورود',
    image: 'https://source.unsplash.com/featured/?meeting,business',
    status: 'confirmed',
  },
  {
    id: '5',
    title: 'حفل تخرج',
    venue: 'قاعة الجامعة',
    date: '10 شعبان',
    time: '4:00 مساءً',
    location: 'الرياض، حي الجامعة',
    image: 'https://source.unsplash.com/featured/?graduation,ceremony',
    status: 'confirmed',
  },
];

// --- Hardening helpers: sanitize and dedupe bookings ---
const VALID_STATUSES = new Set(['confirmed', 'pending', 'cancelled']);

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function sanitizeBooking(data: any): Booking {
  const image = typeof data?.image === 'string' && data.image.trim() ? data.image : '/placeholder.svg';
  const status = VALID_STATUSES.has(data?.status) ? (data.status as Booking['status']) : 'pending';
  const booking: Booking = {
    id: String(data?.id || Date.now()),
    title: String(data?.title || 'حجز جديد'),
    venue: String(data?.venue || data?.serviceName || ''),
    date: String(data?.date || ''),
    time: String(data?.time || ''),
    location: String(data?.location || ''),
    image,
    status,
  };
  // Optional fields
  if (data?.notes) booking.notes = String(data.notes);
  if (data?.serviceId) booking.serviceId = String(data.serviceId);
  if (data?.serviceName) booking.serviceName = String(data.serviceName);
  if (typeof data?.basePrice === 'number') booking.basePrice = data.basePrice;
  if (typeof data?.taxAmount === 'number') booking.taxAmount = data.taxAmount;
  if (typeof data?.totalAmount === 'number') booking.totalAmount = data.totalAmount;
  if (typeof data?.guestCount === 'number') {
    booking.guestCount = data.guestCount;
  } else if (typeof data?.guestCount === 'string') {
    const parsed = parseInt(data.guestCount, 10);
    if (!Number.isNaN(parsed)) booking.guestCount = parsed;
  }
  return booking;
}

function sanitizeBookingsArray(input: any): Booking[] {
  if (!Array.isArray(input)) return [];
  return input.map(sanitizeBooking);
}

function dedupeById(primary: Booking[], secondary: Booking[]): { primary: Booking[]; secondary: Booking[] } {
  const seen = new Set<string>();
  const dedupPrimary: Booking[] = [];
  for (const b of primary) {
    if (!seen.has(b.id)) {
      dedupPrimary.push(b);
      seen.add(b.id);
    }
  }
  const dedupSecondary: Booking[] = [];
  for (const b of secondary) {
    if (!seen.has(b.id)) {
      dedupSecondary.push(b);
      seen.add(b.id);
    }
  }
  return { primary: dedupPrimary, secondary: dedupSecondary };
}

// Display helper: convert ISO date (YYYY-MM-DD) to Arabic Hijri string for UI only
function toHijriDisplay(iso: string): string {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const d = new Date(`${iso}T00:00:00`);
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).format(d);
    } catch {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).format(d);
    }
  } catch {
    return iso;
  }
}

// Normalize time display to HH:00 (24h) regardless of input like "5:30 مساءً"
function toHourOnly(time: string): string {
  if (!time) return '';
  try {
    // Extract hour digits
    const hourMatch = time.match(/(\d{1,2})/);
    if (!hourMatch) return time;
    let h = parseInt(hourMatch[1], 10);
    // Detect AM/PM in Arabic or English
    const lower = time.toLowerCase();
    const isPM = /(مساء|م\b|pm|p\.m\.)/.test(lower);
    const isAM = /(صباح|ص\b|am|a\.m\.)/.test(lower);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    if (!isAM && !isPM && h === 12 && /(noon|midday|ظهر|زوال)/.test(lower)) {
      // Optional handling for noon words
      h = 12;
    }
    if (Number.isNaN(h)) return time;
    return `${String(h).padStart(2, '0')}:00`;
  } catch {
    return time;
  }
}

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcomingBookingsList, setUpcomingBookingsList] = useState<Booking[]>([]);
  const [pastBookingsList, setPastBookingsList] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'confirmed', 'pending', 'cancelled'
  
  // Helper function to clean up old localStorage data
  const cleanupLocalStorage = () => {
    try {
      // Remove any temporary booking data that might be leftover
      const keysToCheck = ['newBooking', 'editedBooking'];
      
      keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          // Check if the data is older than 24 hours
          try {
            const data = JSON.parse(value);
            if (data.timestamp) {
              const now = new Date().getTime();
              const dataTime = new Date(data.timestamp).getTime();
              
              // If data is older than 24 hours (86400000 ms), remove it
              if (now - dataTime > 86400000) {
                localStorage.removeItem(key);
                console.log(`Removed old ${key} data`);
              }
            }
          } catch (e) {
            // If data is invalid JSON, remove it
            localStorage.removeItem(key);
            console.log(`Removed invalid ${key} data`);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  };

  // Load bookings from localStorage on component mount
  useEffect(() => {
    // Clean up old localStorage data
    cleanupLocalStorage();
    
    try {
      const storedUpcoming = safeJsonParse<any>(localStorage.getItem('upcomingBookings'));
      const storedPast = safeJsonParse<any>(localStorage.getItem('pastBookings'));

      let upcoming = sanitizeBookingsArray(storedUpcoming);
      let past = sanitizeBookingsArray(storedPast);

      if (upcoming.length === 0) upcoming = DEFAULT_UPCOMING_BOOKINGS.map(sanitizeBooking);
      if (past.length === 0) past = DEFAULT_PAST_BOOKINGS.map(sanitizeBooking);

      // Remove duplicates across lists, keep first occurrence (prefer upcoming list order)
      const deduped = dedupeById(upcoming, past);

      // Ensure Hijri date display and time hour-only for any item
      const mappedUpcoming = deduped.primary.map(b => ({
        ...b,
        date: /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? toHijriDisplay(b.date) : b.date,
        time: toHourOnly(b.time),
      }));
      const mappedPast = deduped.secondary.map(b => ({
        ...b,
        date: /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? toHijriDisplay(b.date) : b.date,
        time: toHourOnly(b.time),
      }));

      setUpcomingBookingsList(mappedUpcoming);
      setPastBookingsList(mappedPast);

      try {
        localStorage.setItem('upcomingBookings', JSON.stringify(mappedUpcoming));
        localStorage.setItem('pastBookings', JSON.stringify(mappedPast));
      } catch (e) {
        console.warn('Failed to persist sanitized bookings to localStorage:', e);
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحميل الحجوزات الخاصة بك",
        variant: "destructive"
      });
      // Fallback to default data
      setUpcomingBookingsList(DEFAULT_UPCOMING_BOOKINGS.map(b => ({ ...b, time: toHourOnly(b.time) })));
      setPastBookingsList(DEFAULT_PAST_BOOKINGS.map(b => ({ ...b, time: toHourOnly(b.time) })));
    }
  }, [toast]);
  
  // Handle new bookings from localStorage
  useEffect(() => {
    try {
      const newBookingRaw = localStorage.getItem('newBooking');
      if (!newBookingRaw) return;

      const parsed = safeJsonParse<any>(newBookingRaw);
      if (!parsed) {
        try { localStorage.removeItem('newBooking'); } catch {}
        return;
      }

      const booking = sanitizeBooking(parsed);
      // Ensure date is shown in Hijri if stored as ISO in payload
      const bookingForDisplay: Booking = {
        ...booking,
        date: toHijriDisplay(booking.date),
        time: toHourOnly(booking.time),
      };

      // Deduplicate across both lists: ensure only one copy exists (prefer upcoming)
      setPastBookingsList(prev => {
        const filtered = prev.filter(b => b.id !== bookingForDisplay.id);
        if (filtered.length !== prev.length) {
          try { localStorage.setItem('pastBookings', JSON.stringify(filtered)); } catch {}
        }
        return filtered;
      });

      setUpcomingBookingsList(prev => {
        const filtered = prev.filter(b => b.id !== bookingForDisplay.id);
        const updatedList = [...filtered, bookingForDisplay];
        try { localStorage.setItem('upcomingBookings', JSON.stringify(updatedList)); } catch {}
        return updatedList;
      });

      // إبقاء newBooking في التخزين المحلي حتى تُرسل الرسالة الموحدة من صفحة الرسائل

      // Navigate to Messages to complete customer info; do not auto-send a message here
      try {
        const convId = `booking-${bookingForDisplay.id}`;
        navigate(`/messages?select=${encodeURIComponent(convId)}&requireInfo=1&bookingId=${encodeURIComponent(bookingForDisplay.id)}`);
      } catch (e) {
        console.warn('Failed to navigate to messages for booking:', e);
      }

      toast({
        title: "تم إضافة حجز جديد",
        description: "تمت إضافة الحجز بنجاح إلى قائمة الحجوزات",
      });
    } catch (error) {
      console.error('Error processing new booking:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة الحجز الجديد",
        variant: "destructive"
      });
      // Clean up potentially corrupted data
      try { localStorage.removeItem('newBooking'); } catch {}
    }
  }, [toast, navigate]);
  
  // Handle edited bookings from localStorage
  useEffect(() => {
    try {
      const editedBookingRaw = localStorage.getItem('editedBooking');
      if (!editedBookingRaw) return;
      const parsed = safeJsonParse<any>(editedBookingRaw);
      if (!parsed || !parsed.id) {
        // Invalid edit payload
        try { localStorage.removeItem('editedBooking'); } catch {}
        return;
      }

      const bookingData = sanitizeBooking(parsed);

      // Try updating in upcoming; if not found there, try past; if in neither, add to upcoming
      let updatedSomewhere = false;

      setUpcomingBookingsList(prev => {
        const index = prev.findIndex(b => b.id === bookingData.id);
        if (index >= 0) {
          const updated = prev.map(b => {
            if (b.id !== bookingData.id) return b;
            const merged = { ...b, ...bookingData } as Booking;
            if (bookingData.date && /^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)) {
              merged.date = toHijriDisplay(bookingData.date);
            }
            if (bookingData.time) {
              merged.time = toHourOnly(bookingData.time);
            }
            return merged;
          });
          try { localStorage.setItem('upcomingBookings', JSON.stringify(updated)); } catch {}
          updatedSomewhere = true;
          return updated;
        }
        return prev;
      });

      setPastBookingsList(prev => {
        const index = prev.findIndex(b => b.id === bookingData.id);
        if (index >= 0) {
          const updated = prev.map(b => {
            if (b.id !== bookingData.id) return b;
            const merged = { ...b, ...bookingData } as Booking;
            if (bookingData.date && /^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)) {
              merged.date = toHijriDisplay(bookingData.date);
            }
            if (bookingData.time) {
              merged.time = toHourOnly(bookingData.time);
            }
            return merged;
          });
          try { localStorage.setItem('pastBookings', JSON.stringify(updated)); } catch {}
          updatedSomewhere = true;
          return updated;
        }
        return prev;
      });

      if (!updatedSomewhere) {
        // If not found in either list, add to upcoming and ensure dedupe across past
        setPastBookingsList(prev => {
          const filtered = prev.filter(b => b.id !== bookingData.id);
          if (filtered.length !== prev.length) {
            try { localStorage.setItem('pastBookings', JSON.stringify(filtered)); } catch {}
          }
          return filtered;
        });

        setUpcomingBookingsList(prev => {
          const filtered = prev.filter(b => b.id !== bookingData.id);
          const toAdd: Booking = {
            ...bookingData,
            date: bookingData.date && /^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)
              ? toHijriDisplay(bookingData.date)
              : bookingData.date,
            time: bookingData.time ? toHourOnly(bookingData.time) : bookingData.time,
          } as Booking;
          const updated = [...filtered, toAdd];
          try { localStorage.setItem('upcomingBookings', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      // Clear the editedBooking and currentEditBooking from localStorage
      try { localStorage.removeItem('editedBooking'); } catch {}
      try { localStorage.removeItem('currentEditBooking'); } catch {}
      
      toast({
        title: "تم تحديث الحجز",
        description: "تم تحديث تفاصيل الحجز بنجاح",
      });
    } catch (error) {
      console.error('Error processing edited booking:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث الحجز",
        variant: "destructive"
      });
      // Clean up potentially corrupted data
      try { localStorage.removeItem('editedBooking'); } catch {}
    }
  }, [toast]);
  
  const handleEditBooking = (id: string) => {
    try {
      // Find the booking in either list
      const bookingToEdit = [...upcomingBookingsList, ...pastBookingsList].find(
        booking => booking.id === id
      );
      
      if (!bookingToEdit) {
        throw new Error(`Booking with ID ${id} not found`);
      }
      
      // Store the booking to edit in localStorage
      try {
        localStorage.setItem('currentEditBooking', JSON.stringify(bookingToEdit));
      } catch (err) {
        console.warn('Failed to persist currentEditBooking in localStorage:', err);
        toast({
          title: 'خطأ في التخزين المحلي',
          description: 'تعذّر بدء تعديل الحجز بسبب عدم القدرة على حفظ البيانات محلياً.',
          variant: 'destructive',
        });
      };
    } catch (error) {
      console.error('Error preparing booking for edit:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحضير الحجز للتعديل",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelBooking = (id: string) => {
    try {
      if (!id) {
        throw new Error('Invalid booking ID for cancellation');
      }
      
      // Add timestamp for data management
      const timestamp = new Date().toISOString();
      
      // Find the booking in either list
      let bookingToCancel;
      let isUpcoming = false;
      
      // Check upcoming bookings first
      const upcomingBookingIndex = upcomingBookingsList.findIndex(booking => booking.id === id);
      if (upcomingBookingIndex !== -1) {
        bookingToCancel = upcomingBookingsList[upcomingBookingIndex];
        isUpcoming = true;
      } else {
        // Check past bookings if not found in upcoming
        const pastBookingIndex = pastBookingsList.findIndex(booking => booking.id === id);
        if (pastBookingIndex !== -1) {
          bookingToCancel = pastBookingsList[pastBookingIndex];
        } else {
          throw new Error(`Booking with ID ${id} not found in any booking list`);
        }
      }
      
      if (isUpcoming) {
        // Update the booking status to cancelled instead of removing it
        setUpcomingBookingsList(prev => {
          const updatedList = prev.map(booking => 
            booking.id === id ? { 
              ...booking, 
              status: 'cancelled' as Booking['status'],
              // keep existing optional fields if present
            } : booking
          );
          try {
            localStorage.setItem('upcomingBookings', JSON.stringify(updatedList));
          } catch (err) {
            console.warn('Failed to persist upcomingBookings after cancellation:', err);
          }
          return updatedList;
        });
      } else {
        // Update the booking status to cancelled instead of removing it
        setPastBookingsList(prev => {
          const updatedList = prev.map(booking => 
            booking.id === id ? { 
              ...booking, 
              status: 'cancelled' as Booking['status'],
              // keep existing optional fields if present
            } : booking
          );
          try {
            localStorage.setItem('pastBookings', JSON.stringify(updatedList));
          } catch (err) {
            console.warn('Failed to persist pastBookings after cancellation:', err);
          }
          return updatedList;
        });
      }
      
      // Also clear any related localStorage items for this booking
      try {
        const currentEditBooking = localStorage.getItem('currentEditBooking');
        if (currentEditBooking) {
          try {
            const parsedBooking = JSON.parse(currentEditBooking);
            if (parsedBooking && parsedBooking.id === id) {
              try {
                localStorage.removeItem('currentEditBooking');
              } catch (e) {
                console.warn('Failed to remove currentEditBooking from localStorage:', e);
              }
            }
          } catch (e) {
            console.warn('Failed to parse currentEditBooking from localStorage:', e);
          }
        }
      } catch (e) {
        console.warn('Failed to access currentEditBooking in localStorage:', e);
      }
      
      // Log the cancellation action for potential analytics
      console.log(`Booking ${id} cancelled at ${timestamp}`);
      
      toast({
        title: "تم إلغاء الحجز",
        description: "تم تحديث حالة الحجز إلى ملغي",
      });
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إلغاء الحجز",
        variant: "destructive"
      });
    }
  };

  const handleRestoreBooking = (id: string) => {
    try {
      if (!id) {
        throw new Error('Invalid booking ID for restoration');
      }
      
      // Add timestamp for data management
      const timestamp = new Date().toISOString();
      
      // Find the booking in either list
      let bookingToRestore;
      let isUpcoming = false;
      
      // Check upcoming bookings first
      const upcomingBookingIndex = upcomingBookingsList.findIndex(booking => booking.id === id);
      if (upcomingBookingIndex !== -1) {
        bookingToRestore = upcomingBookingsList[upcomingBookingIndex];
        isUpcoming = true;
      } else {
        // Check past bookings if not found in upcoming
        const pastBookingIndex = pastBookingsList.findIndex(booking => booking.id === id);
        if (pastBookingIndex !== -1) {
          bookingToRestore = pastBookingsList[pastBookingIndex];
        } else {
          throw new Error(`Booking with ID ${id} not found in any booking list`);
        }
      }
      
      if (isUpcoming) {
        // Update the booking status to pending
        setUpcomingBookingsList(prev => {
          const updatedList = prev.map(booking => 
            booking.id === id ? { 
              ...booking, 
              status: 'pending' as Booking['status'],
            } : booking
          );
          try {
            localStorage.setItem('upcomingBookings', JSON.stringify(updatedList));
          } catch (err) {
            console.warn('Failed to persist upcomingBookings after restoration:', err);
          }
          return updatedList;
        });
      } else {
        // Update the booking status to pending
        setPastBookingsList(prev => {
          const updatedList = prev.map(booking => 
            booking.id === id ? { 
              ...booking, 
              status: 'pending' as Booking['status'],
            } : booking
          );
          try {
            localStorage.setItem('pastBookings', JSON.stringify(updatedList));
          } catch (err) {
            console.warn('Failed to persist pastBookings after restoration:', err);
          }
          return updatedList;
        });
      }
      
      // Log the restoration action for potential analytics
      console.log(`Booking ${id} restored at ${timestamp}`);
      
      toast({
        title: "تم استعادة الحجز",
        description: "تم تحديث حالة الحجز إلى قيد المعالجة",
      });
    } catch (error) {
      console.error('Error restoring booking:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من استعادة الحجز",
        variant: "destructive"
      });
    }
  };

  const handleTabChange = (tab: 'upcoming' | 'past') => {
    setActiveTab(tab);
    
    toast({
      title: tab === 'upcoming' ? "الحجوزات القادمة" : "الحجوزات السابقة",
      description: tab === 'upcoming' ? "عرض الحجوزات القادمة" : "عرض الحجوزات السابقة",
    });
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    const allowed = ['all', 'confirmed', 'pending', 'cancelled'];
    setStatusFilter(allowed.includes(status) ? status : 'all');
    
    // Show toast message for filter change
    let statusText = "جميع الحجوزات";
    if (status === 'confirmed') statusText = "الحجوزات المؤكدة";
    if (status === 'pending') statusText = "الحجوزات قيد الانتظار";
    if (status === 'cancelled') statusText = "الحجوزات الملغية";
    
    toast({
      title: `تم تطبيق الفلتر: ${statusText}`,
      description: `تم تصفية القائمة لعرض ${statusText} فقط`,
    });
  };
  
  // Filter bookings based on status
  const getFilteredBookings = (bookings: Booking[]) => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === statusFilter);
  };

  return (
    <Layout title="حجوزاتي">
      {/* Messages Section - Make entire section clickable */}
      <Link to="/messages" className="block">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">الرسائل</h3>
            <span className="text-munaasib-red text-sm">عرض الكل</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-munaasib-red rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">مطبخ الأصالة</h4>
                <p className="text-xs text-gray-600">بخصوص حجز الخميس...</p>
              </div>
              <span className="text-xs text-gray-500">منذ 30 دقيقة</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-col items-center mb-6 space-y-4">
        <div className="flex border-b border-gray-200 w-full justify-center">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'upcoming'
                ? 'text-munaasib-red border-b-2 border-munaasib-red'
                : 'text-gray-500'
            }`}
            onClick={() => handleTabChange('upcoming')}
          >
            الحجوزات القادمة
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'past'
                ? 'text-munaasib-red border-b-2 border-munaasib-red'
                : 'text-gray-500'
            }`}
            onClick={() => handleTabChange('past')}
          >
            الحجوزات السابقة
          </button>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap justify-center gap-2 w-full max-w-md">
          <button
            className={`px-3 py-1 text-sm rounded-full border ${statusFilter === 'all' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}
            onClick={() => handleStatusFilterChange('all')}
          >
            الكل
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${statusFilter === 'confirmed' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-300'}`}
            onClick={() => handleStatusFilterChange('confirmed')}
          >
            مؤكد
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${statusFilter === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-gray-300'}`}
            onClick={() => handleStatusFilterChange('pending')}
          >
            قيد الانتظار
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full border ${statusFilter === 'cancelled' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-300'}`}
            onClick={() => handleStatusFilterChange('cancelled')}
          >
            ملغي
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'upcoming' ? (
          getFilteredBookings(upcomingBookingsList).length > 0 ? (
            getFilteredBookings(upcomingBookingsList).map((booking) => (
              <BookingCard
                key={booking.id}
                {...booking}
                onEdit={handleEditBooking}
                onCancel={handleCancelBooking}
                onRestore={handleRestoreBooking}
              />
            ))
          ) : (
            <div className="text-center py-10">
              {statusFilter !== 'all' ? (
                <p className="text-gray-500">
                  لا توجد حجوزات قادمة بحالة {' '}
                  {statusFilter === 'confirmed' && "مؤكد"}
                  {statusFilter === 'pending' && "قيد الانتظار"}
                  {statusFilter === 'cancelled' && "ملغي"}
                </p>
              ) : (
                <p className="text-gray-500">لا توجد حجوزات قادمة</p>
              )}
              <Link to="/venues" className="text-munaasib-red hover:underline block mt-2">
                استكشف القاعات المتاحة
              </Link>
            </div>
          )
        ) : getFilteredBookings(pastBookingsList).length > 0 ? (
          getFilteredBookings(pastBookingsList).map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onEdit={handleEditBooking}
              onCancel={handleCancelBooking}
              onRestore={handleRestoreBooking}
            />
          ))
        ) : (
          <div className="text-center py-10">
            {statusFilter !== 'all' ? (
              <p className="text-gray-500">
                لا توجد حجوزات سابقة بحالة {' '}
                {statusFilter === 'confirmed' && "مؤكد"}
                {statusFilter === 'pending' && "قيد الانتظار"}
                {statusFilter === 'cancelled' && "ملغي"}
              </p>
            ) : (
              <p className="text-gray-500">لا توجد حجوزات سابقة</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;
