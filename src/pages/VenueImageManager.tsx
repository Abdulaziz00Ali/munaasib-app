import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { ArrowRight, Save, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.ts';
import ImageUploader from '@/components/ImageUploader.tsx';
import { getVenueById as getHallById } from '@/data/mergedTabukHalls.ts';
import { getVenueById as getKitchenById } from '@/data/mergedTabukKitchens.ts';
import { VenueData } from '@/lib/types.ts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';

const LOCAL_STORAGE_KEY = 'venueImagesOverrides';

// سياسة الصور الافتراضية لهذه الصفحة
const IMAGE_POLICY = {
  maxImages: 10,
  maxSizeMB: 3,
  minWidth: 800,
  minHeight: 600,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
};

const humanizeType = (mime: string) => {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPG';
  if (mime.includes('png')) return 'PNG';
  if (mime.includes('webp')) return 'WebP';
  return mime.split('/')[1]?.toUpperCase() || mime;
};

const VenueImageManager = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  useEffect(() => {
    if (!venueId) return;
    
    // محاولة العثور على المكان في القاعات أو المطابخ
    const hallVenue = getHallById(venueId);
    const kitchenVenue = getKitchenById(venueId);

    let baseVenue = hallVenue || kitchenVenue || null;

    // Apply overrides from localStorage if present
    if (baseVenue) {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const map: OverridesMap = JSON.parse(raw);
          const overridden = map[venueId];
          if (overridden && Array.isArray(overridden) && overridden.length > 0) {
            baseVenue = { ...baseVenue, photoUrls: overridden } as VenueData;
          }
        }
      } catch (e) {
        console.warn('Failed to read image overrides from localStorage', e);
      }
    }
    
    if (baseVenue) {
      setVenue(baseVenue);
    }
    
    setIsLoading(false);
  }, [venueId]);
  
  const handleImageUpload = (file: File) => {
    setUploadedImages(prev => [...prev, file]);
  };
  
  const handleRemoveCurrentImage = (index: number) => {
    if (!venue) return;
    
    const newPhotoUrls = [...venue.photoUrls];
    newPhotoUrls.splice(index, 1);
    
    setVenue({
      ...venue,
      photoUrls: newPhotoUrls
    });
    
    toast({
      title: "تم حذف الصورة",
      description: "تم حذف الصورة بنجاح"
    });
  };
  
  const handleRemoveUploadedImage = (index: number) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages.splice(index, 1);
    setUploadedImages(newUploadedImages);
  };

  type OverridesMap = Record<string, string[]>;
  // Convert a File to Data URL for persistence in localStorage
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Invalid file result'));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };
  
  const handleSaveChanges = async () => {
    if (!venue || !venueId) return;
    
    try {
      // Convert newly uploaded images to data URLs
      const uploadedDataUrls = await Promise.all(uploadedImages.map(fileToDataUrl));
      
      // Merge existing (possibly modified) current images with the new uploads
      const finalPhotos = [...(venue.photoUrls || []), ...uploadedDataUrls];

      // Persist as overrides for this venue
      let map: OverridesMap = {};
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) map = JSON.parse(raw);
      } catch {}
      map[venueId] = finalPhotos;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));

      toast({
        title: "تم حفظ التغييرات",
        description: `تم حفظ ${uploadedImages.length} صور جديدة وتحديث الصور الحالية`
      });
      
      // العودة إلى صفحة التفاصيل للمكان بعد الحفظ
      navigate(`/service/${venueId}`);
    } catch (e) {
      console.error('Failed to save images', e);
      toast({
        title: 'خطأ في الحفظ',
        description: 'تعذر حفظ الصور. حاول مجددًا.',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p className="text-center">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }
  
  if (!venue) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p className="text-center">لم يتم العثور على المكان</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mx-auto block mt-4"
          >
            العودة
          </Button>
        </div>
      </Layout>
    );
  }
  
  const policyText = `${IMAGE_POLICY.allowedTypes.map(humanizeType).join('/') } • حتى ${IMAGE_POLICY.maxSizeMB}MB • أبعاد ≥ ${IMAGE_POLICY.minWidth}×${IMAGE_POLICY.minHeight} • حتى ${IMAGE_POLICY.maxImages} صور`;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="ml-2"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">إدارة صور {venue.name}</h1>
        </div>
        
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">الصور الحالية والجديدة</h2>

            {/* تنبيه سياسة الصور */}
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>سياسة الصور</AlertTitle>
              <AlertDescription>
                يُسمح بالأنواع: {policyText}. يُفضّل صور أفقية واضحة بإضاءة جيدة واتساق في الأبعاد.
              </AlertDescription>
            </Alert>

            <ImageUploader
              onImageUpload={handleImageUpload}
              maxImages={IMAGE_POLICY.maxImages}
              maxSizeMB={IMAGE_POLICY.maxSizeMB}
              minWidth={IMAGE_POLICY.minWidth}
              minHeight={IMAGE_POLICY.minHeight}
              allowedTypes={IMAGE_POLICY.allowedTypes}
              currentImages={venue.photoUrls}
              onRemoveImage={handleRemoveCurrentImage}
              label="صور المكان"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary"
              onClick={() => setUploadedImages([])}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              إلغاء التحميلات الجديدة
            </Button>
            <Button 
              onClick={handleSaveChanges}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default VenueImageManager;