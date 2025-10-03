import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users, Coffee, Utensils, Building2, Package, Filter, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout.tsx';
import { Badge } from "@/components/ui/badge.tsx";
import ServiceCard from "@/components/ui/ServiceCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { toast } from '@/components/ui/sonner.tsx';
import { weddingHalls as halls } from '@/data/mergedTabukHalls.ts';
import { kitchens } from '@/data/mergedTabukKitchens.ts';
import { VenueData } from '@/lib/types.ts';
import VenueDetailsModal from '@/components/VenueDetailsModal.tsx';
import { applyImageOverridesToVenue } from '@/lib/utils.ts';


const CategoryDetails = () => {
  const { category } = useParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'reviewCount'>('rating');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    setUserLocation({ lat: 28.3998, lng: 36.5662 });
  }, []);

  const allVenues: VenueData[] = [...halls, ...kitchens].map(v => applyImageOverridesToVenue(v));

  const categoryData = {
    kitchens: {
      title: 'المطابخ',
      description: 'خدمات التموين والضيافة المميزة',
      providers: allVenues.filter(v => v.category === 'kitchens'),
    },
    halls: {
      title: 'القاعات',
      description: `قاعات احتفالات فاخرة من تبوك لجميع المناسبات (${halls.length} قاعة متاحة)`,
      providers: allVenues.filter(v => v.category === 'halls'),
    },
    coffee: {
      title: 'القهوجية',
      description: 'خدمات القهوة العربية التقليدية الفاخرة',
      providers: [],
    },
    addons: {
      title: 'الكماليات والإضافات',
      description: 'إضافات مميزة لجعل مناسبتك استثنائية',
      providers: [],
    },
  };

  // Map category param to the right key
  const categoryKey = category as keyof typeof categoryData;
  const data = categoryData[categoryKey] || categoryData.kitchens;

  // Get category icon
  const getCategoryIcon = () => {
    switch (categoryKey) {
      case 'coffee':
        return <Coffee className="w-5 h-5" />;
      case 'kitchens':
        return <Utensils className="w-5 h-5" />;
      case 'halls':
        return <Building2 className="w-5 h-5" />;
      case 'addons':
        return <Package className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  // Filter and sort data based on selected filter, search and sort
  const filteredProviders = data.providers
    .filter((provider: VenueData) => {
      // Filter by category filter option
      const filterMatch = selectedFilter === 'all' || 
                         (provider.subtitle && provider.subtitle.includes(selectedFilter));
      
      // Filter by search query
      const locationText = (provider.location || '').toLowerCase();
      const subtitleText = (provider.subtitle || '').toLowerCase();
      const searchMatch = !searchQuery || 
                         provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         locationText.includes(searchQuery.toLowerCase()) ||
                         subtitleText.includes(searchQuery.toLowerCase());
      
      return filterMatch && searchMatch;
    })
    .sort((a: VenueData, b: VenueData) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviewCount':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  // Removed map markers preparation as Google Maps integration has been removed
  // const mapMarkers = filteredProviders.map((provider: VenueData) => ({
  //   position: provider.position,
  //   title: provider.name,
  //   id: provider.id,
  //   category: provider.category
  // }));

  // Removed: handleMarkerClick since map is no longer used
  // const handleMarkerClick = (markerId: string) => {
  //   setSelectedServiceId(markerId);
  //   const serviceElement = document.getElementById(`service-${markerId}`);
  //   if (serviceElement) {
  //     serviceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   }
  //   const venue = allVenues.find((v) => v.id === markerId);
  //   if (venue) {
  //     setSelectedVenue(venue);
  //     toast(`تم تحديد ${venue.name} على الخريطة`);
  //   }
  // };

  const handleServiceCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = allVenues.find((s: VenueData) => s.id === serviceId);
    if (service) {
      setSelectedVenue(service);
      toast(`تم تحديد ${service.name}`);
    }
  };
  
  // Render coffee service additional info
  const renderCoffeeServiceInfo = (service: VenueData) => {
    if (categoryKey !== 'coffee' || !service.additionalInfo) return null;
    
    return (
      <div className="flex gap-4 text-sm text-gray-600 mt-2">
        <div className="flex items-center">
          <Clock className="w-4 h-4 ml-1" />
          <span>{service.additionalInfo.duration}</span>
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 ml-1" />
          <span>{service.additionalInfo.providers} مقدمين</span>
        </div>
      </div>
    );
  };
  
  return (
    <Layout title={data.title} showBack={true}>
      <div className="pb-20">
        <div className="bg-munaasib-lightGold p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <h2 className="text-xl font-bold">{data.title}</h2>
          </div>
          <p className="text-gray-700 mt-1">{data.description}</p>
        </div>
        
        {/* Search and Sort */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="ابحث..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-5 h-5 absolute top-2.5 right-3 text-gray-400" />
          </div>
          <div className="relative">
            <select
              className="h-10 border border-input rounded-md bg-background px-3 py-2 appearance-none pr-8 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviewCount')}
            >
              <option value="rating">التقييم</option>
              <option value="reviewCount">عدد التقييمات</option>
            </select>
            <Filter className="w-4 h-4 absolute top-3 left-2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Map section removed */}
        
        {/* Filter options */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {/* Filter options can be re-added here if needed */}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            لا توجد نتائج مطابقة لبحثك
          </div>
        )}
        
        {categoryKey === 'coffee' && filteredProviders.length > 0 ? (
          // Special layout for coffee services with additional info
          <div className="space-y-4">
            {filteredProviders.map((provider: VenueData) => (
              <div 
                key={provider.id} 
                id={`service-${provider.id}`}
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                  selectedServiceId === provider.id ? 'ring-2 ring-munaasib-red' : ''
                }`}
                onClick={() => handleServiceCardClick(provider.id)}
              >
                <div className="relative">
                  {/* Image with fallback: try local scraped images, optimized webp, then original */}
                  {(() => {
                    const kebab = (str?: string) => (str || '')
                      .toString()
                      .trim()
                      .toLowerCase()
                      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
                      .replace(/\s+/g, '-');
                    const nameKebab = kebab(provider.name);
                    const bases = nameKebab ? [`/images/places/${nameKebab}-1`, `/images/places/${nameKebab}-2`, `/images/places/${nameKebab}-3`] : [];
                    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                    const localCandidates = bases.flatMap((b) => exts.map((e) => `${b}${e}`));
                    const optimized = provider.image && provider.image.includes('halls and kitchens images')
                      ? provider.image.replace('halls and kitchens images', 'optimized-images').replace(/\.(jpg|jpeg|png)$/i, '.webp')
                      : undefined;
                    const candidates = [
                      ...localCandidates,
                      ...(optimized ? [optimized] : []),
                      ...(provider.image ? [provider.image] : []),
                    ].filter(Boolean) as string[];

                    const ImgWithFallback: React.FC = () => {
                      const [idx, setIdx] = React.useState(0);
                      const src = candidates[idx];
                      if (!src) {
                        return <img src="/placeholder.svg" alt="Placeholder" className="w-full h-48 object-cover" />;
                      }
                      return (
                        <img
                          src={src}
                          alt={provider.name}
                          className="w-full h-48 object-cover"
                          onError={() => setIdx((i) => i + 1)}
                          loading="lazy"
                        />
                      );
                    };
                    return <ImgWithFallback />;
                  })()}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{provider.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {provider.rating || 'جديد'} ★
                    </Badge>
                  </div>

                  {/* Coffee additional info */}
                  {renderCoffeeServiceInfo(provider)}

                  <div className="mt-3">
                    <Link to={`/booking/${provider.id}`} className="inline-flex items-center justify-center rounded-md bg-munaasib-red px-4 py-2 text-white text-sm hover:bg-red-600">
                      احجز الآن
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Default grid for halls and kitchens
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider: VenueData) => (
              <ServiceCard
                key={provider.id}
                id={provider.id}
                name={provider.name}
                location={provider.location}
                image={provider.image || (provider.photoUrls && provider.photoUrls.length > 0
                  ? (provider.photoUrls[0].includes('halls and kitchens images')
                      ? provider.photoUrls[0]
                          .replace('halls and kitchens images', 'optimized-images')
                          .replace(/\.(jpg|jpeg|png)$/i, '.webp')
                      : provider.photoUrls[0])
                  : undefined)}
                rating={provider.rating}
                price={provider.price}
                priceUnit={provider.priceUnit as any}
                subtitle={provider.subtitle}
                category={provider.category as any}
                additionalInfo={(provider as any).additionalInfo}
                onClick={() => handleServiceCardClick(provider.id)}
              />
            ))}
          </div>
        )}

        {/* Venue details modal */}
        <VenueDetailsModal
          venue={selectedVenue}
          isOpen={!!selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onBook={() => selectedVenue && (window.location.href = `/booking/${selectedVenue.id}`)}
        />
      </div>
    </Layout>
  );
};

export default CategoryDetails;
