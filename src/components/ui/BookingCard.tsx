
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface BookingCardProps {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  guestCount?: number;
  serviceId?: string;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
  onRestore?: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  id,
  title,
  venue,
  date,
  time,
  location,
  image,
  status,
  guestCount,
  serviceId,
  onEdit,
  onCancel,
  onRestore,
}) => {
  const navigate = useNavigate();
  
  const statusText = {
    confirmed: 'مؤكد',
    pending: 'قيد المعالجة',
    cancelled: 'ملغي',
  };

  const statusClass = {
    confirmed: 'bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-sm font-medium',
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full text-sm font-medium',
    cancelled: 'bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full text-sm font-medium',
  } as const;
  
  const statusIcon = {
    confirmed: '✓',
    pending: '⏱',
    cancelled: '✕',
  } as const;
  
  const handleEdit = () => {
    onEdit(id);
    // Prefer navigating with serviceId (venue id). Fallback to booking id if missing.
    const targetId = serviceId || id;
    navigate(`/booking/${targetId}`);
  };
  
  const handleCancel = () => {
    onCancel(id);
  };
  
  const handleRestore = () => {
    if (onRestore) {
      onRestore(id);
    }
  };

  return (
    <div className="event-card">
      <div className="flex">
        <img
          src={image || '/placeholder.svg'}
          alt={title || 'صورة الحجز'}
          className="w-20 h-20 rounded-lg object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.endsWith('/placeholder.svg')) {
              target.src = '/placeholder.svg';
            }
          }}
        />
        <div className="mr-3 flex-1">
          <div className="flex justify-between">
            <h3 className="font-bold">{title}</h3>
            <span className={`${statusClass[status]} flex items-center gap-1`}>
              <span>{statusIcon[status]}</span>
              <span>{statusText[status]}</span>
            </span>
          </div>
          <h4 className="text-gray-700">{venue}</h4>
          
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {date} {time}
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {location}
          </div>
          {typeof guestCount === 'number' && (
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              عدد الضيوف: {guestCount}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        {status === 'pending' && (
          <>
            <button 
              onClick={handleEdit} 
              className="bg-munaasib-gold text-white py-2 px-6 rounded-lg hover:bg-munaasib-darkGold transition-colors duration-200"
            >
              تعديل الحجز
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  إلغاء الحجز
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-right">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من إلغاء هذا الحجز؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم إلغاء الحجز، ويمكنك استعادته لاحقًا من خلال زر الاستعادة.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse space-x-reverse space-x-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-500 hover:bg-red-600">نعم، إلغاء الحجز</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {status === 'confirmed' && (
          <div className="w-full flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100 mt-2">
            <span className="text-gray-600 text-sm">لا يمكن تعديل الحجز بعد التأكيد</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  إلغاء الحجز
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-right">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من إلغاء هذا الحجز؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم إلغاء الحجز، ويمكنك استعادته لاحقًا من خلال زر الاستعادة.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse space-x-reverse space-x-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-500 hover:bg-red-600">نعم، إلغاء الحجز</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {status === 'cancelled' && (
          <div className="w-full flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-100 mt-2">
            <div className="text-gray-600 flex items-center gap-2">
              <span className="text-red-500 text-lg">✕</span>
              تم إلغاء هذا الحجز
            </div>
            {onRestore && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button 
                    className="flex items-center gap-1 text-munaasib-red py-1.5 px-3 rounded-lg border border-munaasib-red hover:bg-red-100 transition-colors duration-200 text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    استعادة
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>استعادة الحجز</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من رغبتك في استعادة هذا الحجز؟ سيتم تغيير حالة الحجز إلى "قيد المعالجة".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRestore} className="bg-munaasib-red hover:bg-red-700">
                      استعادة الحجز
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
