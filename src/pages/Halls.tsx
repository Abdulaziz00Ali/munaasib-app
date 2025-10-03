import React from 'react';
import PaginatedVenueList from '@/components/PaginatedVenueList';
import { weddingHalls } from '@/data/mergedTabukHalls.ts';

const Halls = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">القاعات</h1>
      <PaginatedVenueList venues={weddingHalls} />
    </div>
  );
};

export default Halls;
