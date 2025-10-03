export interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

export interface VenueData {
  id: string;
  name: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  reviews: Review[];
  price: number;
  capacity: {
    min: number;
    max: number;
  };
  location: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  photoUrls: string[];
  googleMapsUrl?: string;
  place_id: string;
  category: string;
  isVerified?: boolean;
  hasOffer?: boolean;
  isFeatured?: boolean;
  subtitle?: string;
  position?: { lat: number; lng: number };
  additionalInfo?: any;
  image?: string;
  priceUnit?: string;
  // New optional fields for richer venue details
  features?: { name: string; icon?: string }[];
  packages?: { id: string; name: string; price: number; description?: string }[];
  gallery?: string[];
  contact?: { phone?: string; whatsapp?: string; instagram?: string };
  address?: string;
}
