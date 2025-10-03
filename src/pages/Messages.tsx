
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import { useToast } from '@/hooks/use-toast.ts';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select.tsx';
import { weddingHalls } from '@/data/updatedHalls.ts';
import { kitchens } from '@/data/updatedKitchens.ts';

// Utility: basic KSA phone validation (9 digits after leading 0, or 9 after 5 when using +966)
const isValidSaudiPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  // Normalize to start with 05XXXXXXXX
  if (/^9665\d{8}$/.test(digits)) return true;
  if (/^05\d{8}$/.test(digits)) return true;
  if (/^5\d{8}$/.test(digits)) return true;
  return false;
};

// Normalize various inputs to the standard local format 05XXXXXXXX
const normalizeSaudiPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (/^9665\d{8}$/.test(digits)) return `0${digits.slice(2)}`; // 9665xxxxxxxx -> 05xxxxxxxx
  if (/^5\d{8}$/.test(digits)) return `0${digits}`; // 5xxxxxxxx -> 05xxxxxxxx
  if (/^05\d{8}$/.test(digits)) return digits; // 05xxxxxxxx
  return digits; // fallback: return digits-only
};

// Safe parse helper
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

const MessagesPage: React.FC = () => {
  const { toast } = useToast();
  const [search] = useSearchParams();
  const bookingId = search.get('bookingId') || '';
  const requireInfo = search.get('requireInfo') === '1';
  const selectedConvId = search.get('select') || '';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  // إدخال رسائل الدردشة للمحادثات القائمة (غير مرتبط بنموذج المعلومات الأولي)
  const [chatInput, setChatInput] = useState('');
  
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  // NEW: conversations/messages UI state
  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>({});
  const [activeConvId, setActiveConvId] = useState<string>(selectedConvId);
  const [showInfoForm, setShowInfoForm] = useState<boolean>(false);
  const navigate = useNavigate();

  // Recipient selector state and options
  const [newRecipientId, setNewRecipientId] = useState<string>('');
  const recipients = useMemo(() => {
    const hallOptions = (weddingHalls || []).map((h) => ({ id: `hall:${String(h.id)}`, name: h.name || `قاعة ${h.id}` }));
    const kitchenOptions = (kitchens || []).map((k) => ({ id: `kitchen:${String(k.id)}`, name: k.name || `مطبخ ${k.id}` }));
    return [...hallOptions, ...kitchenOptions];
  }, []);

  // Prefill from saved customer info if available
  useEffect(() => {
    const saved = safeParse<{ fullName?: string; phone?: string }>(localStorage.getItem('customerInfo'));
    if (saved) {
      if (saved.fullName) setFullName(saved.fullName);
      if (saved.phone) setPhone(saved.phone);
    }
    // إظهار نموذج المعلومات فقط إذا وصلنا من تدفق الحجز عبر requireInfo=1
    setShowInfoForm(!!requireInfo);
  }, [requireInfo]);

  useEffect(() => {
    if (requireInfo) {
      toast({ title: 'مطلوب إكمال معلوماتك', description: 'يرجى إدخال الاسم الكامل ورقم الجوال لإرسال الحجز للمكان.' });
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    }
  }, [requireInfo, toast]);

  // Load conversations and messages from localStorage and set active conversation
  useEffect(() => {
    const convs = safeParse<any[]>(localStorage.getItem('inAppConversations')) || [];
    const msgs = safeParse<Record<string, any[]>>(localStorage.getItem('inAppMessages')) || {};
    setConversations(convs);
    setMessagesMap(msgs);

    if (!activeConvId) {
      if (selectedConvId && convs.some(c => c.id === selectedConvId)) {
        setActiveConvId(selectedConvId);
      } else if (convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    }
  }, [selectedConvId]);

  // Get booking details by id from localStorage (upcoming/past lists)
  const bookingDetails = useMemo(() => {
    if (!bookingId) return null as any;
    const upcoming = safeParse<any[]>(localStorage.getItem('upcomingBookings')) || [];
    const past = safeParse<any[]>(localStorage.getItem('pastBookings')) || [];
    const newBooking = safeParse<any>(localStorage.getItem('newBooking'));
    const pool = [...upcoming, ...past];
    if (newBooking) pool.unshift(newBooking);
    const found = pool.find(b => String(b?.id) === String(bookingId));
    return found || null;
  }, [bookingId]);

  const activeMessages = useMemo(() => {
    return activeConvId ? (messagesMap[activeConvId] || []) : [];
  }, [messagesMap, activeConvId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate full name (at least two words)
    const nameOk = fullName.trim().split(/\s+/).length >= 2;
    if (!nameOk) {
      toast({ title: 'الاسم غير كافٍ', description: 'يرجى كتابة الاسم الكامل (الاسم الأول واسم العائلة).', variant: 'destructive' });
      nameRef.current?.focus();
      return;
    }
    if (!isValidSaudiPhone(phone)) {
      toast({ title: 'رقم الجوال غير صحيح', description: 'أدخل رقم جوال سعودي صحيح (مثال: 05XXXXXXXX أو +9665XXXXXXXX).', variant: 'destructive' });
      phoneRef.current?.focus();
      return;
    }

    const normalizedPhone = normalizeSaudiPhone(phone);
    const customer = { fullName: fullName.trim(), phone: normalizedPhone };
    try { localStorage.setItem('customerInfo', JSON.stringify(customer)); } catch {}

    // Helper: format Hijri date if possible, fallback to raw
    const formatHijri = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr || '';
        const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        const formatted = fmt.format(d);
        return /هـ/.test(formatted) ? formatted : `${formatted} هـ`;
      } catch {
        return dateStr || '';
      }
    };

    const bookingTitle = bookingDetails?.venue || bookingDetails?.serviceName || bookingDetails?.title || '';
    const bookingStatus = bookingDetails?.status || 'pending';
    const bookingGuests = typeof bookingDetails?.guestCount === 'number' ? String(bookingDetails.guestCount) : '';
    const bookingDateHijri = bookingDetails?.date ? formatHijri(bookingDetails.date) : '';

    // صيغة طابع زمني هجري داخل نص الرسالة (اختياري حسب الطلب)
    const formatHijriDateTime = (d: Date) => {
      try {
        const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric', month: 'numeric', year: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true,
        });
        const s = fmt.format(d);
        return /هـ/.test(s) ? s : `${s} هـ`;
      } catch {
        return new Date().toLocaleString('ar-SA');
      }
    };
    const nowHijriTs = formatHijriDateTime(new Date());

    // رسالة موحّدة: جميع التفاصيل في رسالة واحدة تتضمن بيانات العميل داخلها
    const confirmationText = (
      `حجز جديد رقم: ${bookingDetails?.id ?? bookingId}\n` +
      `اسم القاعة/المكان: ${bookingTitle}\n` +
      `التاريخ (هجري): ${bookingDateHijri}\n` +
      `الوقت: ${bookingDetails?.time || ''}\n` +
      `الموقع: ${bookingDetails?.location || ''}\n` +
      `حالة الحجز: ${bookingStatus}\n` +
      `الخدمة: ${bookingDetails?.serviceName || bookingTitle}\n` +
      `عدد الضيوف: ${bookingGuests}\n\n` +
      `أنت\n` +
      `بيانات العميل:\n` +
      `- الاسم الكامل: ${customer.fullName}\n` +
      `- رقم الجوال: ${customer.phone}\n\n` +
      (message?.trim() ? `رسالة إضافية من العميل:\n${message.trim()}\n\n` : '') +
      `تفاصيل الحجز مرفقة.\n` +
      `${nowHijriTs}`
    );

    const toSend = confirmationText;

    try {
      // يجب تحديد المستلم: محادثة نشطة/محددة أو سياق حجز
      if (!activeConvId && !selectedConvId && !bookingId) {
        toast({ title: 'حدد جهة التواصل', description: 'يرجى اختيار محادثة مع صاحب القاعة/المطبخ أو ابدأ من الحجز لتحديد المستلم.', variant: 'destructive' });
        return;
      }
      const convId = activeConvId || selectedConvId || (bookingId ? `booking-${bookingId}` : '');

      const convsRaw = localStorage.getItem('inAppConversations');
      const msgsRaw = localStorage.getItem('inAppMessages');
      const convs: any[] = convsRaw ? JSON.parse(convsRaw) : [];
      const msgs: Record<string, any[]> = msgsRaw ? JSON.parse(msgsRaw) : {};

      const participantName = bookingDetails?.venue || bookingDetails?.serviceName || 'المكان';

      const nowIso = new Date().toISOString();
      const newMsg = {
        id: String(Date.now()),
        senderId: 'customer-self',
        senderName: 'أنت',
        senderType: 'customer',
        content: toSend,
        timestamp: nowIso,
        isRead: false,
      };

      const existingIdx = convs.findIndex(c => c.id === convId);
      if (existingIdx === -1) {
        convs.push({
          id: convId,
          participantName,
          participantType: 'vendor',
          lastMessage: toSend,
          lastMessageTime: 'الآن',
          unreadCount: 0,
        });
      } else {
        convs[existingIdx] = {
          ...convs[existingIdx],
          lastMessage: toSend,
          lastMessageTime: 'الآن',
        };
      }

      msgs[convId] = [...(msgs[convId] || []), newMsg];

      localStorage.setItem('inAppConversations', JSON.stringify(convs));
      localStorage.setItem('inAppMessages', JSON.stringify(msgs));

      // update UI state
      setConversations(convs);
      setMessagesMap(msgs);
      if (!activeConvId) setActiveConvId(convId);

      toast({ title: 'تم إرسال بياناتك', description: 'تمت مشاركة بياناتك مع صاحب المكان.' });
      setShowInfoForm(false);
      // إزالة requireInfo من الرابط إذا كنا في سياق الحجز
      if (bookingId) {
        navigate(`/messages?select=${encodeURIComponent(convId)}`, { replace: true });
        try { localStorage.removeItem('newBooking'); } catch {}
      }
    } catch (err) {
      console.warn('Failed to persist message:', err);
      toast({ title: 'تعذّر الإرسال', description: 'حدث خطأ أثناء إرسال الرسالة. حاول مجدداً.', variant: 'destructive' });
      return;
    }
  };

  // بدء محادثة جديدة من محدد المستلم
  const startConversationWithRecipient = () => {
    if (!newRecipientId) return;
    try {
      const [type, rawId] = newRecipientId.split(':');
      let displayName = 'المكان';

      if (type === 'hall') {
        const found = (weddingHalls || []).find((h) => String(h.id) === rawId);
        if (found?.name) displayName = found.name;
      } else if (type === 'kitchen') {
        const found = (kitchens || []).find((k) => String(k.id) === rawId);
        if (found?.name) displayName = found.name;
      }

      const convs = safeParse<any[]>(localStorage.getItem('inAppConversations')) || [];
      const msgs = safeParse<Record<string, any[]>>(localStorage.getItem('inAppMessages')) || {};

      if (!convs.some((c) => c.id === newRecipientId)) {
        convs.push({
          id: newRecipientId,
          participantName: displayName,
          participantType: 'vendor',
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0,
        });
      }

      localStorage.setItem('inAppConversations', JSON.stringify(convs));
      localStorage.setItem('inAppMessages', JSON.stringify(msgs));

      setConversations(convs);
      setMessagesMap(msgs);
      setActiveConvId(newRecipientId);
      setNewRecipientId('');
      toast({ title: 'تم إنشاء المحادثة', description: `يمكنك الآن مراسلة: ${displayName}` });
    } catch (err) {
      console.warn('Failed to start conversation:', err);
      toast({ title: 'تعذر إنشاء المحادثة', description: 'حدث خطأ غير متوقع. حاول مرة أخرى.', variant: 'destructive' });
    }
  };

  // إرسال رسالة جديدة داخل محادثة قائمة (بعد إكمال بيانات العميل)
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!activeConvId) {
      toast({ title: 'اختر محادثة أولاً', description: 'يرجى اختيار محادثة من القائمة قبل كتابة الرسالة.' });
      return;
    }
    if (!text) return;

    const saved = safeParse<{ fullName?: string; phone?: string }>(localStorage.getItem('customerInfo'));
    if (!saved || !saved.fullName || !saved.phone) {
      toast({ title: 'مطلوب إكمال المعلومات', description: 'أكمل اسمك ورقم جوالك قبل متابعة الدردشة.' });
      setShowInfoForm(true);
      setTimeout(() => nameRef.current?.focus(), 100);
      return;
    }

    try {
      const convsRaw = localStorage.getItem('inAppConversations');
      const msgsRaw = localStorage.getItem('inAppMessages');
      const convs: any[] = convsRaw ? JSON.parse(convsRaw) : [];
      const msgs: Record<string, any[]> = msgsRaw ? JSON.parse(msgsRaw) : {};

      const nowIso = new Date().toISOString();
      const newMsg = {
        id: String(Date.now()),
        senderId: 'customer-self',
        senderName: 'أنت',
        senderType: 'customer',
        content: text,
        timestamp: nowIso,
        isRead: false,
      };

      const existingIdx = convs.findIndex(c => c.id === activeConvId);
      if (existingIdx === -1) {
        // لا تنشئ محادثة جديدة بدون مستلم محدد
        toast({ title: 'حدد جهة التواصل', description: 'يرجى اختيار محادثة موجودة أو بدء محادثة عبر الحجز لتحديد المستلم.', variant: 'destructive' });
        return;
      } else {
        convs[existingIdx] = {
          ...convs[existingIdx],
          lastMessage: text,
          lastMessageTime: 'الآن',
        };
      }

      msgs[activeConvId] = [...(msgs[activeConvId] || []), newMsg];

      localStorage.setItem('inAppConversations', JSON.stringify(convs));
      localStorage.setItem('inAppMessages', JSON.stringify(msgs));

      setConversations(convs);
      setMessagesMap(msgs);
      setChatInput('');
    } catch (err) {
      console.warn('Failed to send chat message:', err);
      toast({ title: 'تعذّر الإرسال', description: 'حدث خطأ أثناء إرسال الرسالة. حاول مجدداً.', variant: 'destructive' });
    }
  };

  return (
    <Layout title="الرسائل" showBack>
      <div className="max-w-5xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations list */}
          <aside className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20">
              <h2 className="font-semibold">المحادثات</h2>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">لا توجد محادثات بعد.</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-right px-4 py-3 border-b hover:bg-muted/30 ${activeConvId === c.id ? 'bg-muted/40' : ''}`}
                  >
                    <div className="font-medium">{c.participantName || 'المكان'}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{c.lastMessage || ''}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{c.lastMessageTime || ''}</div>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Messages + form */}
          <section className="md:col-span-2 space-y-4">
            <div className="border rounded-lg p-3 bg-gray-50 max-h-[50vh] overflow-y-auto">
              {activeConvId ? (
                activeMessages.length > 0 ? (
                  <div className="space-y-2">
                    {activeMessages.map((m) => (
                      <div key={m.id} className={`flex ${m.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap ${m.senderType === 'customer' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                          <div className="text-xs opacity-80 mb-1">{m.senderName || (m.senderType === 'customer' ? 'أنت' : 'المكان')}</div>
                          <div>{m.content}</div>
                          <div className="text-[10px] opacity-60 mt-1">{new Date(m.timestamp).toLocaleString('ar-SA')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">لا توجد رسائل بعد في هذه المحادثة.</div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">اختر محادثة من القائمة لعرض الرسائل.</div>
              )}
            </div>

            {showInfoForm && (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input ref={nameRef} id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثال: محمد أحمد" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input
                      ref={phoneRef}
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9+ ]*"
                      placeholder="05XXXXXXXX أو +9665XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">رسالتك (اختياري)</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب أي تفاصيل إضافية" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="submit">إرسال</Button>
                </div>
              </form>
            )}

            {!showInfoForm && (
              activeConvId ? (
                <form onSubmit={handleSendChat} className="space-y-2">
                  <Textarea
                    placeholder={'اكتب رسالتك هنا...'}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <Button type="button" variant="secondary" onClick={() => setShowInfoForm(true)}>
                      تعديل بياناتي
                    </Button>
                    <Button type="submit" disabled={chatInput.trim().length === 0}>إرسال</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">اختر محادثة من القائمة لبدء الكتابة أو ابدأ محادثة جديدة باختيار المستلم:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-2">
                      <Label>اختر القاعة/المطبخ</Label>
                      <Select value={newRecipientId} onValueChange={(v) => setNewRecipientId(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر المستلم" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[40vh] overflow-y-auto">
                          {recipients.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1 flex justify-end md:justify-start">
                      <Button type="button" disabled={!newRecipientId} onClick={startConversationWithRecipient}>بدء محادثة</Button>
                    </div>
                  </div>
                </div>
              )
            )}
          </section>
          </div>
        </div>
      </Layout>
   );
};

export default MessagesPage;