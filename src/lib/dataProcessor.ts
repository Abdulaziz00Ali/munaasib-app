import { v4 as uuidv4 } from 'uuid';

export interface VenueData {
  id: string;
  name: string;
  category: "hall" | "kitchen";
  neighborhood: string;
  lat: number;
  lng: number;
  price?: number;
  rating?: number;
  reviewCount?: number;
  photoUrls: string[];
  googleMapsUrl?: string;
  place_id?: string;
  reviews?: {
    author: string;
    text: string;
    relativeTimeDescription: string;
    rating?: number;
  }[];
}

interface RawVenueData {
  [key: string]: any;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

const areSimilar = (venue1: VenueData, venue2: VenueData) => {
  if (venue1.place_id && venue2.place_id) {
    return venue1.place_id === venue2.place_id;
  }
  const distance = haversineDistance(venue1.lat, venue1.lng, venue2.lat, venue2.lng);
  const nameSimilarity = venue1.name && venue2.name && (venue1.name.includes(venue2.name) || venue2.name.includes(venue1.name));
  return distance < 100 && nameSimilarity;
}

export const processVenueData = (
  hallsCsv: RawVenueData[],
  hallsJson1: RawVenueData[],
  hallsJson2: RawVenueData[],
  kitchensJson1: RawVenueData[],
  kitchensJson2: RawVenueData[],
  kitchensJson3: RawVenueData[],
): { weddingHalls: VenueData[], kitchens: VenueData[] } => {

  const normalize = (item: RawVenueData, category: 'hall' | 'kitchen'): VenueData => {
    const photoUrls = item.photos_sample ? item.photos_sample.map((p: RawVenueData) => p.photo_url || p.thumbnail_url).filter(Boolean) : (item.photos || []).map((p: RawVenueData) => p.photo_url).filter(Boolean);
    if (photoUrls.length === 0) {
        photoUrls.push('/placeholder.svg');
    }

    const reviews = item.reviews ? item.reviews.map((r: RawVenueData) => ({
        author: r.author_title,
        text: r.review_text,
        relativeTimeDescription: r.review_datetime_utc,
        rating: r.review_rating,
    })) : [];

    return {
      id: uuidv4(),
      name: item.title || item.name || '',
      category,
      neighborhood: item.neighborhood || 'Unknown',
      lat: item.latitude || item.lat,
      lng: item.longitude || item.lng,
      price: item.price ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : undefined,
      rating: item.rating,
      reviewCount: item.reviews_count,
      photoUrls,
      googleMapsUrl: item.google_maps_url,
      place_id: item.place_id,
      reviews,
    };
  };

  const allHalls: VenueData[] = [
    ...hallsCsv.map(item => normalize(item, 'hall')),
    ...hallsJson1.map(item => normalize(item, 'hall')),
    ...hallsJson2.map(item => normalize(item, 'hall')),
  ];

  const allKitchens: VenueData[] = [
    ...kitchensJson1.map(item => normalize(item, 'kitchen')),
    ...kitchensJson2.map(item => normalize(item, 'kitchen')),
    ...kitchensJson3.map(item => normalize(item, 'kitchen')),
  ];

  const deduplicate = (venues: VenueData[]): VenueData[] => {
    const uniqueVenues: VenueData[] = [];
    venues.forEach(venue => {
      if (!uniqueVenues.some(existingVenue => areSimilar(existingVenue, venue))) {
        uniqueVenues.push(venue);
      }
    });
    return uniqueVenues;
  };

  const weddingHalls = deduplicate(allHalls);
  const kitchens = deduplicate(allKitchens);

  // Fallback logic
  weddingHalls.forEach(v => {
      if(v.photoUrls.length === 1 && v.photoUrls[0] === '/placeholder.svg') {
          console.log("الصورة غير متوفرة حاليًا");
      }
      if(!v.reviews || v.reviews.length === 0) {
          console.log("لا توجد تقييمات حالياً");
      }
      if(v.photoUrls.length <= 1) {
          console.log("لا يوجد معرض صور لهذا المكان");
      }
  });

  kitchens.forEach(v => {
      if(v.photoUrls.length === 1 && v.photoUrls[0] === '/placeholder.svg') {
          console.log("الصورة غير متوفرة حاليًا");
      }
      if(!v.reviews || v.reviews.length === 0) {
          console.log("لا توجد تقييمات حالياً");
      }
      if(v.photoUrls.length <= 1) {
          console.log("لا يوجد معرض صور لهذا المكان");
      }
  });


  return { weddingHalls, kitchens };
};

processedData.forEach(venue => {
  if (!venue.id || !venue.name || !venue.location) {
    console.warn('Skipping incomplete venue data:', venue);
    return;
  }
  if (!venue.photoUrls) {
    venue.photoUrls = [];
  }
  if (!venue.reviews) {
    venue.reviews = [];
  }
  if (venue.rating === undefined) {
    venue.rating = 0;
  }
});
