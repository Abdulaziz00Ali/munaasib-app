import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import { Link } from 'react-router-dom';
import { Box, CupSoda, Drumstick, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VenueDetailsModal from '@/components/VenueDetailsModal';
import VenueCarousel from '@/components/VenueCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weddingHalls as mergedTabukHalls } from '@/data/mergedTabukHalls.ts';
import { kitchens as mergedTabukKitchens } from '@/data/mergedTabukKitchens.ts';
import { VenueData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryCard = ({ icon, title, path }: { icon: React.ReactNode, title: string, path: string }) => (
    <Link to={path}>
        <motion.div whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)' }} className="h-full">
            <Card className="text-center transition-shadow h-full bg-munaasib-primary/10 hover:bg-munaasib-primary/20">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <div className="text-munaasib-primary mb-2">{icon}</div>
                    <p className="mt-2 font-semibold text-munaasib-primary">{title}</p>
                </CardContent>
            </Card>
        </motion.div>
    </Link>
);

interface EventsProps {
  noLayout?: boolean;
}

const Events: React.FC<EventsProps> = ({ noLayout = false }) => {
  const [activeTab, setActiveTab] = useState('halls');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const topRatedHalls = useMemo(() =>
    [...mergedTabukHalls]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 15),
    []
  );

  const topRatedKitchens = useMemo(() =>
    [...mergedTabukKitchens]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 15),
    []
  );

  const [visibleHalls, setVisibleHalls] = useState<VenueData[]>([]);
  const [visibleKitchens, setVisibleKitchens] = useState<VenueData[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const categories = [
    { icon: <FileText className="w-8 h-8" />, title: 'القاعات', path: '/halls' },
    { icon: <Drumstick className="w-8 h-8" />, title: 'المطابخ', path: '/kitchens' },
    { icon: <CupSoda className="w-8 h-8" />, title: 'القهوجية', path: '/coffee' },
    { icon: <Box className="w-8 h-8" />, title: 'الكماليات', path: '/extras' },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const content = (
      <div className="p-4 space-y-8">
        {selectedVenue && (
          <VenueDetailsModal
            venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <Card className="bg-gradient-to-r from-[#00AEEF] to-[#0077B6] text-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-10 h-10 text-white ml-4" />
              <div>
                <h3 className="font-bold text-lg text-white">مساعد الأفكار الذكي</h3>
                <p className="text-sm text-white/90">دعنا نساعدك في اختيار المكان المثالي لمناسبتك</p>
              </div>
            </div>
            <Link to="/event-planner">
              <Button className="bg-white text-[#00AEEF] hover:bg-gray-100">
                جرب مساعدنا الذكي
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <h3 className="text-2xl font-bold mb-4">خدماتنا</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.path} icon={cat.icon} title={cat.title} path={cat.path} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <Tabs defaultValue="halls" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="halls">القاعات الأعلى تقييماً</TabsTrigger>
            <TabsTrigger value="kitchens">المطابخ الأعلى تقييماً</TabsTrigger>
          </TabsList>
          <TabsContent value="halls">
            {isLoading ? <Skeleton className="h-48 w-full" /> : <VenueCarousel title="" venues={topRatedHalls} onVisibleVenuesChange={setVisibleHalls} viewAllLink="/halls" />}
          </TabsContent>
          <TabsContent value="kitchens">
            {isLoading ? <Skeleton className="h-48 w-full" /> : <VenueCarousel title="" venues={topRatedKitchens} onVisibleVenuesChange={setVisibleKitchens} viewAllLink="/kitchens" />}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );

  return noLayout ? content : (
    <Layout>
      {content}
    </Layout>
  );
};

export default Events;
