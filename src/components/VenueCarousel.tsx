import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { VenueData } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface VenueCarouselProps {
  title: string;
  venues: VenueData[];
  viewAllLink?: string;
  onVisibleVenuesChange?: (visible: VenueData[]) => void;
  className?: string;
  showViewAll?: boolean;
  viewAllPath?: string;
}

const VenueCarousel: React.FC<VenueCarouselProps> = ({ 
  title, 
  venues, 
  viewAllLink, 
  onVisibleVenuesChange,
  className,
  showViewAll = true,
  viewAllPath = '/venues'
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const debouncedOnVisibleVenuesChange = useDebounce(onVisibleVenuesChange, 300);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };
  
  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, Math.max(0, venues.length - 5)));
  };
  
  const handleViewAll = () => {
    navigate(viewAllPath);
  };

  useEffect(() => {
    if (!debouncedOnVisibleVenuesChange) return;
    
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
  }, [venues, visibleIndices, onVisibleVenuesChange, debouncedOnVisibleVenuesChange]);

  useEffect(() => {
    if (!debouncedOnVisibleVenuesChange) return;
    
    const visibleVenues = Array.from(visibleIndices).map(index => venues[index]).filter(Boolean);
    if (visibleVenues.length > 0) {
      debouncedOnVisibleVenuesChange(visibleVenues);
    }
  }, [visibleIndices, venues, debouncedOnVisibleVenuesChange]);

  // Simulate loading state and then set to false
  useEffect(() => {
    // Start with loading state
    setIsLoading(true);
    
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [venues]);
  
  // Handle image load tracking
  const handleImageLoaded = useCallback((venueId: string) => {
    setLoadedImages(prev => new Set(prev).add(venueId));
  }, []);


  useEffect(() => {
    const venuesWithoutImages = venues.filter(venue => !venue.photoUrls || venue.photoUrls.length === 0);
    if (venuesWithoutImages.length > 0) {
      console.log("Venues that need images:", venuesWithoutImages.map(v => v.name));
    }
  }, [venues]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="flex items-center">
          {showViewAll && viewAllLink && (
            <Button variant="link" className="text-munaasib-primary" onClick={() => navigate(viewAllLink)}>
              عرض الكل
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll('left')}
            className="h-10 w-10 rounded-full border-2 border-munaasib-primary/20 hover:bg-munaasib-primary/10 hover:border-munaasib-primary transition-all mr-1"
            aria-label="Previous items"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll('right')}
            className="h-10 w-10 rounded-full border-2 border-munaasib-primary/20 hover:bg-munaasib-primary/10 hover:border-munaasib-primary transition-all"
            aria-label="Next items"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto space-x-4 p-2 -m-2 scroll-snap-x-mandatory" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence>
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 5 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-shrink-0 w-72 scroll-snap-align-start min-w-[calc(20%-16px)]"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-0 relative">
                    <Skeleton className="w-full h-40" />
                  </CardHeader>
                  <CardContent className="p-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            // Actual venue cards
            venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                data-index={index}
                data-venue-id={venue.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex-shrink-0 w-72 scroll-snap-align-start min-w-[calc(20%-16px)]"
                onClick={() => navigate(venue.category === 'kitchens' ? `/booking/${venue.id}` : `/service/${venue.id}`)}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full hover:scale-[1.02]">
                  <CardHeader className="p-0 relative">
                    {!loadedImages.has(venue.id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                        <Skeleton className="w-full h-40 absolute" />
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {(() => {
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
                      const slugCandidates = Array.from(new Set([
                        kebabStrict(venue.name),
                        kebabLegacy(venue.name),
                      ].filter(Boolean)));
                      const bases = slugCandidates.flatMap((nameKebab) => [
                        `/images/places/${nameKebab}-1`,
                        `/images/places/${nameKebab}-2`,
                        `/images/places/${nameKebab}-3`,
                      ]);
                      const exts = ['.jpg', '.jpeg', '.png', '.webp'];
                      const localCandidates = bases.flatMap((b) => exts.map((e) => `${b}${e}`));
                      const original = !venue.photoUrls || venue.photoUrls.length === 0 || venue.photoUrls[0] === 'صورة قادمة قريباً' ? undefined : venue.photoUrls[0];
                      const optimized = original && original.includes('halls and kitchens images')
                        ? original.replace('halls and kitchens images', 'optimized-images').replace(/\.(jpg|jpeg|png)$/i, '.webp')
                        : undefined;
                      const candidates = [
                        ...localCandidates,
                        ...(optimized ? [optimized] : []),
                        ...(original ? [original] : []),
                      ].filter(Boolean) as string[];

                      const ImgWithFallback: React.FC = () => {
                        const [idx, setIdx] = useState(0);
                        const src = candidates[idx];
                        if (!src) {
                          return <img src="/placeholder.svg" alt={venue.name || 'Venue image'} className={cn(
                            "w-full h-40 object-cover transition-all duration-300",
                            !loadedImages.has(venue.id) && "opacity-0"
                          )} onLoad={() => handleImageLoaded(venue.id)} />;
                        }
                        return (
                          <img
                            src={src}
                            alt={venue.name || 'Venue image'}
                            className={cn(
                              "w-full h-40 object-cover transition-all duration-300",
                              !loadedImages.has(venue.id) && "opacity-0"
                            )}
                            onLoad={() => handleImageLoaded(venue.id)}
                            onError={() => setIdx((i) => i + 1)}
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        );
                      };

                      return <ImgWithFallback />;
                    })()}

                    {/* image rendered via ImgWithFallback above */}
                    {(venue.hasOffer || venue.isFeatured) && (
                      <Badge variant="special" className="absolute top-2 right-2 z-10">
                        {venue.hasOffer ? "عرض خاص" : "مميز"}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-3">
                    <CardTitle className="text-lg mb-1 truncate line-clamp-1" title={venue.name}>{venue.name}</CardTitle>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <Badge variant="outline">{venue.category || venue.location}</Badge>
                      {venue.rating ? (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 ml-1" />
                          <span>{venue.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">لا تقييم</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VenueCarousel;
