import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Truck, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { VenueData } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { applyImageOverridesToVenue } from '@/lib/utils.ts';

interface PaginatedVenueListProps {
  venues: VenueData[];
  itemsPerPageDesktop?: number;
  itemsPerPageMobile?: number;
}

const toKebabCase = (str: string) =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|\.+$/g, '');

const ImageWithFallback: React.FC<{ name: string; src?: string; alt: string; className?: string }> = ({ name, src, alt, className }) => {
  const [idx, setIdx] = useState(0);
  const candidates = useMemo(() => {
    const kebab = toKebabCase(name);
    const primary = [
      `/images/places/${kebab}-1.jpg`,
      `/images/places/${kebab}-1.jpeg`,
      `/images/places/${kebab}-1.png`,
      `/images/places/${kebab}-1.webp`,
    ];

    const fromProp: string[] = [];
    if (src) {
      const optimized = src
        .replace('halls and kitchens images', 'optimized-images')
        .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (optimized !== src) fromProp.push(optimized);
      fromProp.push(src);
    }

    const seen = new Set<string>();
    return [...primary, ...fromProp].filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [name, src]);

  const onError = () => setIdx((i) => i + 1);
  const current = candidates[idx];

  if (!current) {
    return <img src="/placeholder.svg" alt={alt} className={className} />;
  }

  return (
    <img src={current} alt={alt} className={className} onError={onError} loading="lazy" />
  );
};

const PaginatedVenueList: React.FC<PaginatedVenueListProps> = ({ 
  venues, 
  itemsPerPageDesktop = 8, 
  itemsPerPageMobile = 5 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? itemsPerPageMobile : itemsPerPageDesktop;

  const normalizedVenues = useMemo(() => venues.map(v => applyImageOverridesToVenue(v)), [venues]);

  const totalPages = Math.max(1, Math.ceil(normalizedVenues.length / itemsPerPage));
  const filteredVenues = normalizedVenues;
  const paginatedVenues = filteredVenues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedVenues.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            <img src="/placeholder.svg" alt="No venues" className="mx-auto mb-4 w-32 h-32 opacity-60" />
            <p>لا توجد قاعات أو مطابخ متاحة حالياً بهذه المواصفات.</p>
          </div>
        ) : paginatedVenues.map((venue) => (
          <Link to={`/booking/${venue.id}`} key={venue.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
              <CardHeader className="p-0">
                <ImageWithFallback 
                  name={venue.name}
                  src={venue.photoUrls && venue.photoUrls.length > 0 ? venue.photoUrls[0] : undefined}
                  alt={venue.name}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2 truncate">{venue.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 ml-1" />
                  {venue.location || <span className="text-red-400">غير محدد</span>}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 ml-1" />
                    <span className="font-bold">{venue.rating || '-'}</span>
                  </div>
                  <Badge variant="outline">{venue.category}</Badge>
                </div>
                {Array.isArray((venue as any).additionalInfo?.dishes) && (venue as any).additionalInfo.dishes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="inline-flex items-center text-xs text-gray-600 ml-1">
                      <Utensils className="w-3 h-3 ml-1" /> الأطباق:
                    </span>
                    {((venue as any).additionalInfo.dishes as string[]).slice(0, 3).map((dish: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] py-0.5">{dish}</Badge>
                    ))}
                    {((venue as any).additionalInfo.dishes as string[]).length > 3 && (
                      <Badge variant="outline" className="text-[10px] py-0.5">+{((venue as any).additionalInfo.dishes as string[]).length - 3} المزيد</Badge>
                    )}
                  </div>
                )}
                {typeof (venue as any).additionalInfo?.delivery === 'boolean' && (
                  <div className="flex items-center text-xs mb-2">
                    <Truck className="w-4 h-4 ml-1 text-gray-600" />
                    <span className={(venue as any).additionalInfo.delivery ? 'text-green-600' : 'text-red-500'}>
                      خدمة التوصيل: {(venue as any).additionalInfo.delivery ? 'متاحة' : 'غير متاحة'}
                    </span>
                  </div>
                )}
                {!venue.photoUrls || venue.photoUrls.length === 0 ? (
                  <div className="text-xs text-gray-400 mt-2">صورة قادمة قريباً</div>
                ) : null}
                {(!venue.price || venue.price <= 0) ? (
                  <div className="text-xs text-red-400 mt-2">يرجى التواصل لمعرفة السعر</div>
                ) : null}
                {(!venue.location || venue.location.trim().length === 0) ? (
                  <div className="text-xs text-red-400 mt-2">الموقع غير متوفر</div>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
         </div>
         {paginatedVenues.length > 0 && (
           <div className="flex justify-center items-center space-x-2 mt-8">
             <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
               السابق
             </Button>
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
               <Button 
                 key={page} 
                 onClick={() => handlePageChange(page)}
                 variant={currentPage === page ? 'default' : 'outline'}
               >
                 {page}
               </Button>
             ))}
             <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
               التالي
             </Button>
           </div>
         )}
       </div>
     );
   };
   
   export default PaginatedVenueList;
