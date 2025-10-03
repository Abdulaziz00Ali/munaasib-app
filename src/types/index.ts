// Central types file for the application

// Booking related types
export interface Booking {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  serviceId?: string;
  serviceName?: string;
  basePrice?: number;
  taxAmount?: number;
  totalAmount?: number;
  guestCount?: number;
}

// Service related types
export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  capacity: string;
  classification: string;
  features: ServiceFeature[];
  packages: ServicePackage[];
  gallery: string[];
  reviews: ServiceReview[];
  fullServiceDetails: string;
}

export interface ServiceFeature {
  name: string;
  icon: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ServiceReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

// User related types
export type UserType = 'client' | 'vendor' | null;

// Message related types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'vendor';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantType: 'customer' | 'vendor';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Venue related types
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
}

export interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

// Date related types
export interface HijriDate {
  day: number;
  month: string;
  year: number;
}