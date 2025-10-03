import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { halls } from '@/data/mergedTabukHalls';
import { kitchens } from '@/data/mergedTabukKitchens';
import { VenueData } from '@/lib/types';

const ImageManagement: React.FC = () => {
  const router = useRouter();
  const { id, category } = router.query;
  
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('halls');
  const [images, setImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Combine halls and kitchens data
  const venues = [...halls, ...kitchens];
  
  // Filter venues by category
  const filteredVenues = venues.filter(venue => venue.category === selectedCategory);

  useEffect(() => {
    // If id and category are provided in URL, set them
    if (id && category) {
      setSelectedVenueId(id as string);
      setSelectedCategory(category as string);
    }
  }, [id, category]);

  useEffect(() => {
    // Find the selected venue
    if (selectedVenueId) {
      const foundVenue = venues.find(v => v.id === selectedVenueId);
      if (foundVenue) {
        setVenue(foundVenue);
        setImages(foundVenue.photoUrls || []);
      }
    }
  }, [selectedVenueId, venues]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedVenueId('');
    setVenue(null);
    setImages([]);
    setUploadedFiles([]);
  };

  const handleVenueChange = (value: string) => {
    setSelectedVenueId(value);
  };

  const handleImageUpload = (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
    
    // Create a preview URL for the uploaded file
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages(prev => [...prev, reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveImages = () => {
    if (!venue) {
      toast.error('الرجاء اختيار مكان أولاً');
      return;
    }

    // In a real application, you would upload the files to a server here
    // For this demo, we'll just show a success message
    toast.success(`تم حفظ ${uploadedFiles.length} صور لـ ${venue.name}`);
    
    // In a real application, you would update the venue data with the new image URLs
    // For now, we'll just simulate that by updating the local state
    if (venue) {
      // This is just for demonstration - in a real app you would save to a database
      toast.success('تم تحديث صور المكان بنجاح');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">إدارة صور الأماكن</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>اختيار المكان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="category">نوع المكان</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر نوع المكان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="halls">قاعات</SelectItem>
                  <SelectItem value="kitchens">مطابخ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="venue">المكان</Label>
              <Select 
                value={selectedVenueId} 
                onValueChange={handleVenueChange}
                disabled={!selectedCategory}
              >
                <SelectTrigger id="venue">
                  <SelectValue placeholder="اختر المكان" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVenues.map(venue => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {venue && (
        <Card>
          <CardHeader>
            <CardTitle>صور {venue.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              maxImages={10}
              currentImages={images}
              onRemoveImage={handleRemoveImage}
              label="صور المكان"
            />
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveImages} disabled={uploadedFiles.length === 0}>
                حفظ الصور
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageManagement;