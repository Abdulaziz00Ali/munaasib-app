import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import { useToast } from '@/hooks/use-toast.ts';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { getVenueById as getHallById } from '@/data/mergedTabukHalls.ts';
import { getVenueById as getKitchenById } from '@/data/mergedTabukKitchens.ts';
import { getVenueById as getTabukVenueById } from '@/data/tabukVenues';
// New UI imports for better date/time UX
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

// Minimal, reliable booking form that creates a "newBooking" payload in localStorage
// Bookings.tsx listens for this key and will add the booking, create a conversation,
// then redirect the user to /messages?requireInfo=1&bookingId=...

function pickVenueById(id: string) {
  return (
    getHallById?.(id) ||
    getKitchenById?.(id) ||
    getTabukVenueById?.(id) ||
    null
  );
}

// Helpers
const formatHijriDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  } catch {
    try { return date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch { return date.toLocaleDateString(); }
  }
};

const formatISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const BookingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const venue = useMemo(() => (id ? pickVenueById(id) : null), [id]);

  // New UX state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>('');

  const [guestCount, setGuestCount] = useState<number>(50);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Best-effort prefill from venue when available
    if (!venue) return;
    // no-op for now; kept for future enhancements
  }, [venue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !venue) {
      toast({ title: 'لا يمكن المتابعة', description: 'المكان غير معروف', variant: 'destructive' });
      return;
    }
    if (!selectedDate || !selectedHour) {
      toast({ title: 'البيانات ناقصة', description: 'الرجاء اختيار التاريخ الهجري والساعة', variant: 'destructive' });
      return;
    }

    const bookingId = String(Date.now());
    const locationText = venue.address || venue.location || '';
    const image = Array.isArray(venue.images) && venue.images.length > 0 ? venue.images[0] : '/placeholder.svg';

    // Persist in Gregorian ISO for data consistency, show Hijri in UI only
    const date = formatISODate(selectedDate);
    const time = `${selectedHour.padStart(2, '0')}:00`;

    const payload = {
      id: bookingId,
      title: venue.name || 'حجز جديد',
      venue: venue.name || '',
      date,
      time,
      location: locationText,
      image,
      status: 'pending',
      serviceId: id,
      serviceName: venue.name || undefined,
      guestCount,
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem('newBooking', JSON.stringify(payload));
    } catch {}

    toast({ title: 'جارٍ تأكيد الحجز', description: 'سيتم توجيهك لإتمام التفاصيل.' });
    navigate('/bookings');
  };

  // Hours list (0-23)
  const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

  return (
    <Layout title={venue?.name ? `إتمام الحجز - ${venue.name}` : 'إتمام الحجز'} showBack>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">تفاصيل الحجز</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ (هجري)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between">
                    <span>{selectedDate ? formatHijriDate(selectedDate) : 'اختر التاريخ (هجري)'}</span>
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(d) => setSelectedDate(d ?? null)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">الوقت (بالساعات فقط)</Label>
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger id="time" className="w-full justify-between">
                  <SelectValue placeholder="اختر الساعة" />
                  <Clock className="h-4 w-4 opacity-70" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>{h}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="guests">عدد الضيوف (تقديري)</Label>
              <Input id="guests" type="number" min={1} value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value || '0', 10) || 1)} />
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل تود إضافتها" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
              <Button type="submit">تأكيد الحجز</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default BookingForm;
