import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  maxImages?: number;
  currentImages?: string[];
  onRemoveImage?: (index: number) => void;
  label?: string;
  // Optional policy overrides
  maxSizeMB?: number; // default 3MB
  minWidth?: number;  // default 800px
  minHeight?: number; // default 600px
  allowedTypes?: string[]; // default ['image/jpeg','image/png','image/webp']
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  maxImages = 5,
  currentImages = [],
  onRemoveImage,
  label = 'صور المكان',
  maxSizeMB = 3,
  minWidth = 800,
  minHeight = 600,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const { toast } = useToast();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const totalCount = currentImages.length + previewImages.length;

  const humanizeType = (mime: string) => {
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPG';
    if (mime.includes('png')) return 'PNG';
    if (mime.includes('webp')) return 'WebP';
    return mime.split('/')[1]?.toUpperCase() || mime;
  };

  const getPolicyText = () => `${allowedTypes.map(humanizeType).join('/')} • حتى ${maxSizeMB}MB • أبعاد ≥ ${minWidth}×${minHeight}`;

  const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || (img as any).width;
        const height = img.naturalHeight || (img as any).height;
        URL.revokeObjectURL(url);
        resolve({ width, height });
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('image_load_error'));
      };
      img.src = url;
    });
  };

  const validateFile = async (file: File): Promise<string | null> => {
    if (!file) return 'لم يتم اختيار أي ملف.';

    if (totalCount >= maxImages) {
      return `يمكنك تحميل ${maxImages} صور كحد أقصى`;
    }

    if (!allowedTypes.includes(file.type)) {
      return 'نوع الصورة غير مدعوم. الصيغ المسموحة: JPG, PNG, WebP';
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `حجم الصورة أكبر من المسموح (${maxSizeMB}MB كحد أقصى)`;
    }

    try {
      const { width, height } = await loadImageDimensions(file);
      if (width < minWidth || height < minHeight) {
        return `أبعاد الصورة (${width}×${height}) أقل من الحد الأدنى (${minWidth}×${minHeight})`;
      }
    } catch (e) {
      return 'تعذر قراءة أبعاد الصورة. حاول صورة أخرى.';
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate policy first
    const validationError = await validateFile(file);
    if (validationError) {
      toast({
        title: 'لم يتم قبول الصورة',
        description: validationError,
        variant: 'destructive',
      });
      // Reset the input value so the same file can be reselected if needed
      e.currentTarget.value = '';
      return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImages((prev) => [...prev, reader.result as string]);
        setUploadedFiles((prev) => [...prev, file]);
        onImageUpload(file);
        toast({
          title: 'تم إضافة الصورة',
          description: 'تمت إضافة الصورة بنجاح وستخزن بعد الحفظ',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePreview = (index: number) => {
    const newPreviews = [...previewImages];
    const newFiles = [...uploadedFiles];
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    setPreviewImages(newPreviews);
    setUploadedFiles(newFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="image-upload" className="text-lg font-medium">{label}</Label>
        <div className="text-sm text-gray-500">
          {totalCount}/{maxImages} صور
        </div>
      </div>

      {/* Policy hint */}
      <div className="text-xs text-gray-500 -mt-2">سياسة الصور: {getPolicyText()}</div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Current Images */}
        {currentImages.map((image, index) => (
          <div key={`current-${index}`} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
            <img 
              src={image} 
              alt={`صورة ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {onRemoveImage && (
              <button 
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                type="button"
              >
                <X size={16} className="text-red-500" />
              </button>
            )}
          </div>
        ))}

        {/* Preview Images */}
        {previewImages.map((preview, index) => (
          <div key={`preview-${index}`} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
            <img 
              src={preview} 
              alt={`معاينة ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => handleRemovePreview(index)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
              type="button"
            >
              <X size={16} className="text-red-500" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {totalCount < maxImages && (
          <div className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:bg-gray-50 transition-colors">
            <div className="mb-2">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center mb-2">اضغط لتحميل صورة</p>
            <Input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label htmlFor="image-upload" className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm cursor-pointer hover:bg-gray-50">
              اختر صورة
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;