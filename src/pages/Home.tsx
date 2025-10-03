import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Calendar, Search, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { weddingHalls as mergedTabukHalls } from '@/data/mergedTabukHalls.ts';
import { kitchens as mergedTabukKitchens } from '@/data/mergedTabukKitchens.ts';
import { VenueData } from '@/lib/types';
import { translateCategory } from '@/lib/localization';

const VenueCardSkeleton = () => (
  <div className="flex-shrink-0 w-72">
    <Card className="overflow-hidden h-full">
      <CardHeader className="p-0 relative">
        <Skeleton className="w-full h-40" />
      </CardHeader>
      <CardContent className="p-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  </div>
);

const VenueCarousel = ({ title, venues, viewAllLink, onVisibleVenuesChange, isLoading }: { title: string, venues: VenueData[], viewAllLink?: string, onVisibleVenuesChange?: (visible: VenueData[]) => void, isLoading?: boolean }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!onVisibleVenuesChange) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const updatedVisibleIndices = new Set(visibleIndices);
        entries.forEach(entry => {
          const index = parseInt(entry.target.getAttribute('data-index')!, 10);
          if (entry.isIntersecting) {
            updatedVisibleIndices.add(index);
          } else {
            updatedVisibleIndices.delete(index);
          }
        });
        setVisibleIndices(updatedVisibleIndices);
      },
      {
        root: scrollRef.current,
        threshold: 0.5,
      }
    );

    const currentRef = scrollRef.current;
    if (currentRef) {
      Array.from(currentRef.children).forEach(child => observer.observe(child));
    }

    return () => {
      if (currentRef) {
        Array.from(currentRef.children).forEach(child => observer.unobserve(child));
      }
    };
  }, [venues, visibleIndices, onVisibleVenuesChange]);

  React.useEffect(() => {
    if (!onVisibleVenuesChange) return;
    
    const visibleVenues = Array.from(visibleIndices).map(index => venues[index]).filter(Boolean);
    if (visibleVenues.length > 0) {
      onVisibleVenuesChange(visibleVenues);
    }
  }, [visibleIndices, venues, onVisibleVenuesChange]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const ImageForVenue: React.FC<{ venue: VenueData }> = ({ venue }) => {
    const kebabStrict = (str?: string) => (str || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$|\.+$/g, '');
    const kebabLegacy = (str?: string) => (str || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-');
    const slugs = Array.from(new Set([
      kebabStrict(venue.name),
      kebabLegacy(venue.name),
    ].filter(Boolean)));
    const bases = slugs.flatMap((nameKebab) => [
      `/images/places/${nameKebab}-1`,
      `/images/places/${nameKebab}-2`,
      `/images/places/${nameKebab}-3`,
    ]);
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
    const localCandidates = bases.flatMap((b) => exts.map((e) => `${b}${e}`));
    const original = venue.photoUrls?.[0];
    const optimized = original && original.includes('halls and kitchens images')
      ? original.replace('halls and kitchens images', 'optimized-images').replace(/\.(jpg|jpeg|png)$/i, '.webp')
      : undefined;
    const candidates = [
      ...localCandidates,
      ...(optimized ? [optimized] : []),
      ...(original ? [original] : []),
    ].filter(Boolean) as string[];
    const [idx, setIdx] = React.useState(0);
    const src = candidates[idx];
    if (!src) {
      return <img src="/placeholder.svg" alt={venue.name} className="w-full h-40 object-cover" />;
    }
    return (
      <img
        src={src}
        alt={venue.name}
        className="w-full h-40 object-cover"
        onError={() => setIdx((i) => i + 1)}
        loading="lazy"
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="flex items-center">
          {viewAllLink && (
            <Link to={viewAllLink}>
              <Button variant="link" className="text-munaasib-primary">
                عرض الكل
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => scroll('left')}>
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scroll('right')}>
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto space-x-6 p-2 -m-2 scroll-snap-x-mandatory" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <VenueCardSkeleton key={index} />)
        ) : (
          venues.map((venue, index) => (
            <motion.div
              key={venue.id}
              data-index={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-72 scroll-snap-align-start"
              whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' }}
            >
              <Link to={`/booking/${venue.id}`}>
                <Card className="overflow-hidden transition-shadow h-full">
                  <CardHeader className="p-0 relative">
                      <ImageForVenue venue={venue} />
                      {venue.hasOffer && (
                        <Badge variant="special" className="absolute top-2 right-2">
                          عرض خاص
                        </Badge>
                      )}
                  </CardHeader>
                <CardContent className="p-3">
                  <CardTitle className="text-lg mb-1 truncate">{venue.name}</CardTitle>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <Badge variant="outline">{translateCategory(venue.category)}</Badge>
                    {venue.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 ml-1" />
                        <span>{venue.rating}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
              </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const allVenues: VenueData[] = useMemo(() =>
    [...mergedTabukHalls, ...mergedTabukKitchens].map(venue => ({
      ...venue,
      hasOffer: venue.hasOffer ?? false,
    })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="p-4 space-y-8">
      {/* Hero Section */}
      <motion.div 
        className="relative h-60 bg-cover bg-center rounded-2xl p-6 text-center text-white flex flex-col justify-center items-center overflow-hidden" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop')" }}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl"></div>
        <div className="relative z-10">
          <motion.h2 
            className="text-4xl font-bold mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            اجعل مناسبتك استثنائية
          </motion.h2>
          <motion.p 
            className="mb-5 text-lg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            اكتشف أفضل القاعات والخدمات لمناسبتك
          </motion.p>
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن قاعة أو مطبخ..."
                className="w-full bg-white text-gray-900 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-munaasib-primary"
              />
            </div>
            <Link to="/bookings">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="mt-4">
                <Button size="lg" className="bg-munaasib-primary hover:bg-munaasib-primary-dark text-white rounded-full px-8 py-3 text-lg w-full">
                  احجز الآن
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Reviews/Testimonials Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-4">آراء العملاء</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial Card 1 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="w-10 h-10 rounded-full bg-gray-200 p-2 mr-4" />
                <div>
                  <p className="font-bold">أحمد</p>
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"تجربة رائعة! حجزت قاعة لحفل زفافي وكان كل شيء مثالياً."</p>
            </CardContent>
          </Card>
          {/* Testimonial Card 2 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="w-10 h-10 rounded-full bg-gray-200 p-2 mr-4" />
                <div>
                  <p className="font-bold">فاطمة</p>
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"خدمة ممتازة وسهولة في الحجز. أنصح به بشدة."</p>
            </CardContent>
          </Card>
          {/* Testimonial Card 3 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="w-10 h-10 rounded-full bg-gray-200 p-2 mr-4" />
                <div>
                  <p className="font-bold">محمد</p>
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"أفضل تطبيق لحجز مستلزمات المناسبات في تبوك."</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
