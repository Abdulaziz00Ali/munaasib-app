import React from 'react';
import PaginatedVenueList from '@/components/PaginatedVenueList';
import { VenueData } from '@/lib/types';

const Extras = () => {
  const extrasVenues: VenueData[] = []; // Placeholder for extras venues data

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">الكماليات</h1>
      {extrasVenues.length > 0 ? (
        <PaginatedVenueList venues={extrasVenues} />
      ) : (
        <p className="text-center text-gray-500">لا توجد بيانات متاحة حالياً.</p>
      )}
    </div>
  );
};

export default Extras;
