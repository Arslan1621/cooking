import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onPhotoCapture: (file: File) => void;
  onPhotoAnalyze?: (file: File) => Promise<any>;
  isAnalyzing?: boolean;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function PhotoUpload({
  onPhotoCapture,
  onPhotoAnalyze,
  isAnalyzing = false,
  acceptedTypes = "image/*",
  maxSizeMB = 10,
  className = ""
}: PhotoUploadProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Call the callback
    onPhotoCapture(file);

    // Auto-analyze if function provided
    if (onPhotoAnalyze) {
      onPhotoAnalyze(file);
    }
  }, [onPhotoCapture, onPhotoAnalyze]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={acceptedTypes}
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {!preview ? (
        <Card 
          className={`photo-upload-area cursor-pointer ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-chef-orange/10 rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-chef-orange" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Take a Photo or Upload Image
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCamera();
                    }}
                    className="bg-chef-orange hover:bg-chef-orange/90"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Max file size: {maxSizeMB}MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Preview Area */
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Uploaded food"
                className="w-full h-64 object-cover rounded-lg"
              />
              
              {/* Loading overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analyzing food...</p>
                  </div>
                </div>
              )}
              
              {/* Remove button */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearPhoto}
                disabled={isAnalyzing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                onClick={openCamera}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Another
              </Button>
              <Button
                variant="outline"
                onClick={openFileDialog}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Different
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
