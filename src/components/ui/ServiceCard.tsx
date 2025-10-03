
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Truck, Utensils } from 'lucide-react';

// Removed demo mode WhatsApp behavior to always navigate to BookingForm
// const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

type ServiceCardProps = {
  id: string;
  name: string;
  location?: string;
  image?: string;
  rating?: number;
  price?: number;
  priceUnit?: string;
  subtitle?: string;
  onClick?: () => void;
  // New optional props to generalize kitchen info rendering
  category?: string;
  additionalInfo?: any;
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  location,
  image,
  rating,
  price,
  priceUnit = 'ريال',
  subtitle,
  onClick,
  category,
  additionalInfo,
}) => {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  // Removed unused toast hook after removing WhatsApp behavior
  // const { toast } = useToast();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
    const targetPath = category === 'kitchens' ? `/booking/${id}` : `/service/${id}`;
    navigate(targetPath);
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always navigate to the proper page depending on category
    const targetPath = category === 'kitchens' ? `/booking/${id}` : `/service/${id}`;
    navigate(targetPath);
  };

  const toKebabCase = (str: string) =>
    str
      .trim()
      .toLowerCase()
      // Keep Arabic letters and numbers, replace others with dashes
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$|\.+$/g, '');

  const imageCandidates = useMemo(() => {
    const kebab = toKebabCase(name);
    const primary = [
      `/images/places/${kebab}-1.jpg`,
      `/images/places/${kebab}-1.jpeg`,
      `/images/places/${kebab}-1.png`,
      `/images/places/${kebab}-1.webp`,
    ];

    const fromProp: string[] = [];
    if (image) {
      fromProp.push(image);
      // If pointing to original images folder, prefer optimized webp variant as well
      const maybeOptimized = image
        .replace('halls and kitchens images', 'optimized-images')
        .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (maybeOptimized !== image) {
        fromProp.unshift(maybeOptimized);
      }
    }

    // Ensure uniqueness while preserving order
    const seen = new Set<string>();
    return [...primary, ...fromProp].filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [name, image]);

  const currentSrc = imageCandidates[imgIndex] || null;

  const handleImageError = () => {
    setImgIndex((prev) => prev + 1);
  };

  return (
    <div 
      className="service-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={name}
            className="object-cover w-full h-full"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="text-gray-500">لا تتوفر الصور</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{name}</h3>
          {rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 ml-1" fill="currentColor" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {location && (
          <div className="text-sm text-gray-500 mb-2 flex items-center">
            <MapPin className="w-4 h-4 ml-1" />
            <span>{location}</span>
          </div>
        )}
        {subtitle && (
          <div className="text-sm text-gray-500 mb-2">
            {subtitle}
          </div>
        )}
        {/* Kitchen-specific badges: dishes and delivery status */}
        {category === 'kitchens' && additionalInfo && (
          <div className="mt-2 mb-1 flex flex-wrap gap-2">
            {Array.isArray(additionalInfo.dishes) && additionalInfo.dishes.slice(0, 3).map((dish: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                <Utensils className="w-3 h-3" />
                {dish}
              </span>
            ))}
            {typeof additionalInfo.delivery === 'boolean' && (
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${additionalInfo.delivery ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
              >
                <Truck className="w-3 h-3" />
                {additionalInfo.delivery ? 'التوصيل متاح' : 'بدون توصيل'}
              </span>
            )}
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            تواصل للتفاصيل
          </div>
          <button 
            className="bg-munaasib-red hover:bg-munaasib-darkRed text-white rounded-lg px-4 py-2 text-sm transition-colors"
            onClick={handleBookNowClick}
          >
            احجز الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
