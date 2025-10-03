import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image overrides helpers (persisted in localStorage by VenueImageManager)
const IMAGE_OVERRIDES_KEY = 'venueImagesOverrides';

export function getVenueImageOverrides(venueId: string): string[] | null {
  try {
    const raw = localStorage.getItem(IMAGE_OVERRIDES_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, unknown>;
    const arr = map?.[venueId];
    return Array.isArray(arr) ? (arr as string[]) : null;
  } catch {
    return null;
  }
}

// Apply overrides to a venue-like object without mutating the original
export function applyImageOverridesToVenue<T extends { id?: string; photoUrls?: string[]; image?: string; gallery?: string[] }>(
  venue: T,
): T {
  if (!venue?.id) return venue;
  const overrides = getVenueImageOverrides(String(venue.id));
  if (overrides && overrides.length > 0) {
    const first = overrides[0] || venue.image;
    return {
      ...venue,
      photoUrls: overrides,
      gallery: overrides,
      image: first,
    } as T;
  }
  // If no explicit overrides, ensure gallery falls back to photoUrls when available
  if ((!venue.gallery || venue.gallery.length === 0) && Array.isArray(venue.photoUrls)) {
    return { ...venue, gallery: venue.photoUrls } as T;
  }
  return venue;
}

// --- WhatsApp helpers ---
export function buildWhatsAppLink(message?: string) {
  const rawWhatsApp = (import.meta as any).env?.VITE_WHATSAPP_NUMBER as string | undefined;
  const whatsappNumber = (rawWhatsApp || '').replace(/\D/g, '');
  if (!whatsappNumber || whatsappNumber.length < 10) return null;
  const text = encodeURIComponent(message || 'مرحباً، أرغب بالاستفسار عن الخدمات.');
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}
