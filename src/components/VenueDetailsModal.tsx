import React, { useState } from 'react';
import { VenueData } from '@/lib/types';
import { X, Star, MapPin, CameraOff } from 'lucide-react';

interface VenueDetailsModalProps {
  venue?: VenueData | null;
  isOpen?: boolean;
  onClose: () => void;
  onBook?: () => void;
}

const VenueDetailsModal: React.FC<VenueDetailsModalProps> = ({ venue, onClose, isOpen = true }) => {
  // Track which fallback candidate is in use per photo index
  const [imgCandidateIndex, setImgCandidateIndex] = useState<Record<number, number>>({});
  
  if (!isOpen || !venue) return null;

  const kebab = (str?: string) => (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .replace(/\s+/g, '-');

  // Build candidate list for a given original photo url
  const buildCandidates = (originalUrl?: string) => {
    const candidates: string[] = [];
    const nameKebab = kebab(venue?.name);

    // Prefer locally scraped images if available (try first three variants and common extensions)
    if (nameKebab) {
      const bases = [`/images/places/${nameKebab}-1`, `/images/places/${nameKebab}-2`, `/images/places/${nameKebab}-3`];
      const exts = ['.jpg', '.jpeg', '.png', '.webp'];
      for (const base of bases) {
        for (const ext of exts) {
          candidates.push(`${base}${ext}`);
        }
      }
    }

    // Optimized .webp variant if original was from local halls/kitchens store
    if (originalUrl && originalUrl.includes('halls and kitchens images')) {
      candidates.push(
        originalUrl
          .replace('halls and kitchens images', 'optimized-images')
          .replace(/\.(jpg|jpeg|png)$/i, '.webp')
      );
    }

    // Finally, the original URL if present and not our placeholder token
    if (originalUrl && originalUrl !== 'صورة قادمة قريباً') {
      candidates.push(originalUrl);
    }

    // Deduplicate while preserving order
    const seen = new Set<string>();
    return candidates.filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
  };

  const photos = venue.photoUrls?.slice(0, 5) || [];
  const reviews = venue.reviews?.slice(0, 5) || [];

  const handleImageError = (index: number, totalCandidates: number) => {
    setImgCandidateIndex((prev) => {
      const currentIdx = prev[index] || 0;
      const nextIdx = currentIdx + 1;
      return { ...prev, [index]: nextIdx };
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">{venue.name || 'تفاصيل المكان'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-6 flex-grow">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Images */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">الصور</h3>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((originalUrl, index) => {
                    const candidates = buildCandidates(originalUrl);
                    const activeIdx = imgCandidateIndex[index] || 0;
                    const src = candidates[activeIdx];

                    return (
                      <div key={`photo-${originalUrl}-${index}`} className="relative aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                        {!src ? (
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <img src="/placeholder.svg" alt="Placeholder" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <img 
                            src={src}
                            alt={`${venue.name} photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => handleImageError(index, candidates.length)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-40 bg-gray-50 rounded-lg">
                  <CameraOff size={40} />
                  <p className="mt-2">لا توجد صور متاحة</p>
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">التفاصيل</h3>
              <div className="flex items-center text-lg">
                {venue.rating ? (
                  <>
                    <Star className="text-yellow-400 fill-current" size={22} />
                    <span className="ml-2 font-bold text-gray-800">{venue.rating.toFixed(1)}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-600 text-sm">({venue.reviewCount || 0} تقييم)</span>
                  </>
                ) : (
                  <span className="text-gray-500">لا يوجد تقييم</span>
                )}
              </div>
              {venue.description && <p className="text-gray-700">{venue.description}</p>}
              {venue.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-2" />
                  <span>{venue.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">التقييمات</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={`review-${review.author_name}-${review.time || index}`} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      <p className="font-bold text-gray-800">{review.author_name}</p>
                      <div className="flex items-center ml-auto text-yellow-500">
                        <span className="font-bold mr-1">{review.rating}</span>
                        <Star className="fill-current" size={18} />
                      </div>
                    </div>
                    {review.relative_time_description && (
                      <p className="text-gray-500 text-xs mb-2">{review.relative_time_description}</p>
                    )}
                    {review.text && <p className="text-gray-700 text-sm">{review.text}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد تقييمات متاحة.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailsModal;
