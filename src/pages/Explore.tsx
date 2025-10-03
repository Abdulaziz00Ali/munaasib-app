import React, { useState, useEffect } from 'react';
// Removed: import Layout from '@/components/layout/Layout';
import ServiceCard from '@/components/ui/ServiceCard.tsx';
import { useUserType } from '@/hooks/useUserType.ts';
import { ChefHat, Star, Building2, Package, Search, Filter, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import VenueDetailsModal from '@/components/VenueDetailsModal.tsx';
import { Input } from '@/components/ui/input.tsx';
import { toast } from '@/components/ui/sonner.tsx';
import { weddingHalls } from '@/data/mergedTabukHalls.ts';
import { kitchens } from '@/data/mergedTabukKitchens.ts';
import { VenueData } from '@/lib/types.ts';
import { useDebounce } from '@/hooks/useDebounce.ts';
import { applyImageOverridesToVenue } from '@/lib/utils.ts';


const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters with defaults
  const getParamWithDefault = (param: string, defaultValue: string) => {
    return searchParams.get(param) || defaultValue;
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>(getParamWithDefault('category', 'all'));
  const [searchQuery, setSearchQuery] = useState<string>(getParamWithDefault('q', ''));
  const [sortBy, setSortBy] = useState<'rating' | 'reviewCount'>(getParamWithDefault('sort', 'rating') as 'rating' | 'reviewCount');
  const [minRating, setMinRating] = useState<number>(Number(getParamWithDefault('rating', '0')));
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(Number(getParamWithDefault('page', '1')));
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const { userType } = useUserType();
  
  // Debounce search query to avoid too many URL updates
  const debouncedSearchQuery = useDebounce((value: string) => {
    updateUrlParams('q', value);
  }, 500);

  // Update URL parameters when filters change
  const updateUrlParams = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === '' || value === 'all' || value === 0) {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    setUserLocation({ lat: 28.3998, lng: 36.5662 });
  }, []);
  
  // Update URL when filters change
  useEffect(() => {
    updateUrlParams('category', selectedCategory);
    updateUrlParams('sort', sortBy);
    updateUrlParams('rating', minRating.toString());
    updateUrlParams('page', currentPage.toString());
  }, [selectedCategory, sortBy, minRating, currentPage]);
  
  const categories = [
    { id: 'kitchens', name: 'المطابخ', icon: <ChefHat className="w-6 h-6 text-red-500" /> },
    { id: 'hall', name: 'القاعات', icon: <Building2 className="w-6 h-6 text-red-500" /> },
  ];

  // Combine enriched data
  const allVenues: VenueData[] = [...weddingHalls, ...kitchens].map(v => applyImageOverridesToVenue(v));
  console.log('Total enriched venues loaded:', allVenues.length);

  // Convert enriched venues to a displayable service format
  const allServices = allVenues.map(venue => ({
    ...venue,
    id: venue.id, // Use dataset stable ID
    location: venue.location || 'العنوان غير متوفر',
    image: venue.photoUrls && venue.photoUrls.length > 0
      ? (venue.photoUrls[0].includes('halls and kitchens images')
          ? venue.photoUrls[0]
              .replace('halls and kitchens images', 'optimized-images')
              .replace(/\.(jpg|jpeg|png)$/i, '.webp')
          : venue.photoUrls[0])
      : '/placeholder.svg',
    priceUnit: 'ر.س', // Assuming a default unit
    position: { lat: venue.lat, lng: venue.lng },
  }));
  console.log('Total services mapped:', allServices.length);

  // Filter services based on selected category and search query
  const filteredServices = allServices
    .filter(service => {
      const categoryMatch = selectedCategory === 'all' || (service.category && service.category === selectedCategory);
      const searchMatch = !searchQuery ||
        (service.name && service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.location && service.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const ratingMatch = (service.rating || 0) >= minRating;
      return categoryMatch && searchMatch && ratingMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviewCount':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  console.log('Filtered services:', filteredServices.length);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    updateUrlParams('page', pageNumber.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    updateUrlParams('page', '1');
  }, [selectedCategory, searchQuery, sortBy, minRating]);

  // Show toast when no results are found
  useEffect(() => {
    if (filteredServices.length === 0 && (searchQuery || minRating > 0)) {
      toast('لا توجد نتائج مطابقة لبحثك');
    }
  }, [filteredServices.length, searchQuery, minRating]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearchQuery(value);
  };
  
  // Map markers functionality removed

  const handleServiceCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = allServices.find(s => s.id === serviceId);
    if (service) {
      setSelectedVenue(service);
      toast(`تم تحديد ${service.name}`);
    }
  };

  return (
    <>
      {/* Search Section */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="ابحث عن خدمات قريبة..."
            className="pr-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Search className="w-5 h-5 absolute top-2.5 right-3 text-gray-400" />
        </div>
        <div className="relative">
          <select
            className="h-10 border border-input rounded-md bg-background px-3 py-2 appearance-none pr-8 cursor-pointer"
            value={sortBy}
            onChange={(e) => {
              const value = e.target.value as 'rating' | 'reviewCount';
              setSortBy(value);
              updateUrlParams('sort', value);
            }}
          >
            <option value="rating">التقييم</option>
            <option value="reviewCount">عدد التقييمات</option>
          </select>
          <Filter className="w-4 h-4 absolute top-3 left-2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="h-10 border border-input rounded-md bg-background px-3 py-2 appearance-none pr-8 cursor-pointer"
            value={minRating}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMinRating(value);
              updateUrlParams('rating', value.toString());
            }}
          >
            <option value="0">الكل</option>
            <option value="4">4 نجوم وأكثر</option>
            <option value="4.5">4.5 نجوم وأكثر</option>
          </select>
          <Star className="w-4 h-4 absolute top-3 left-2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Map component removed */}

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentServices.map(service => (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={service.name}
            location={service.location}
            image={service.image}
            rating={service.rating}
            price={service.price}
            priceUnit={service.priceUnit as any}
            subtitle={service.subtitle}
            category={service.category as any}
            additionalInfo={(service as any).additionalInfo}
            onClick={() => handleServiceCardClick(service.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            السابق
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => (
              <button
                key={`${page}-${idx}`}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? 'bg-munaasib-red text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {/* Venue details modal */}
      <VenueDetailsModal
        isOpen={!!selectedVenue}
        venue={selectedVenue || undefined}
        onClose={() => setSelectedVenue(null)}
        onBook={() => {
          if (selectedVenue) {
            navigate(`/booking/${selectedVenue.id}`);
          }
        }}
      />
    </>
  );
};

export default Explore;
