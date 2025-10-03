import React from 'react';
import PaginatedVenueList from '@/components/PaginatedVenueList';
import { VenueData } from '@/lib/types';

const Coffee = () => {
  const coffeeVenues: VenueData[] = []; // Placeholder for coffee venues data

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">القهوجية</h1>
      {coffeeVenues.length > 0 ? (
        <PaginatedVenueList venues={coffeeVenues} />
      ) : (
        <p className="text-center text-gray-500">لا توجد بيانات متاحة حالياً.</p>
      )}
    </div>
  );
};

export default Coffee;
