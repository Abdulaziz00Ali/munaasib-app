import React from 'react';
import PaginatedVenueList from '@/components/PaginatedVenueList';
import { kitchens } from '@/data/mergedTabukKitchens.ts';

const Kitchens = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">المطابخ</h1>
      <PaginatedVenueList venues={kitchens} />
    </div>
  );
};

export default Kitchens;
