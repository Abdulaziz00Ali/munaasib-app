import { useState, useMemo } from 'react';
import { VenueData } from '../lib/types';

export const useVenueSearch = (venues: VenueData[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [rating, setRating] = useState<number>(0);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const filteredVenues = useMemo(() => {
    return venues.filter(venue => {
      const matchesSearchTerm =
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());

      const priceAsNumber = venue.price || 0;
      const matchesPrice =
        (!priceAsNumber || (priceAsNumber >= priceRange[0] && priceAsNumber <= priceRange[1]));

      const matchesRating = !rating || (venue.rating && venue.rating >= rating);

      const matchesVerified = !isVerified || venue.isVerified;

      return matchesSearchTerm && matchesPrice && matchesRating && matchesVerified;
    });
  }, [venues, searchTerm, priceRange, rating, isVerified]);

  return {
    searchTerm,
    setSearchTerm,
    priceRange,
    setPriceRange,
    rating,
    setRating,
    isVerified,
    setIsVerified,
    filteredVenues,
  };
};
