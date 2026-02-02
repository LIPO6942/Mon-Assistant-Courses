
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Camera, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Image from 'next/image';

interface ImagePickerProps {
  photoDataUri: string | undefined;
  setPhotoDataUri: (uri: string | undefined) => void;
}

export default function ImagePicker({ photoDataUri, setPhotoDataUri }: ImagePickerProps) {
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  const cleanupStream = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  React.useEffect(() => {
    if (isCameraOpen) {
      handleOpenCamera();
    } else {
      cleanupStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOpen]);

  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleOpenCamera = async () => {
    setIsLoading(true);
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
    } catch (error) {
      console.error("Error accessing environment camera, trying default: ", error);
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
      } catch (finalError) {
        console.error("Error accessing any camera: ", finalError);
        alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
        setIsCameraOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Use the actual video stream dimensions to avoid distortion
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const maxWidth = 1200;
      const maxHeight = 1200;
      let targetWidth = videoWidth;
      let targetHeight = videoHeight;

      if (targetWidth > targetHeight) {
        if (targetWidth > maxWidth) {
          targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
          targetWidth = maxWidth;
        }
      } else {
        if (targetHeight > maxHeight) {
          targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
          targetHeight = maxHeight;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUri = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoDataUri(dataUri);
      }
      setIsCameraOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const maxWidth = 1200;
            const maxHeight = 1200;
            let { width, height } = img;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const dataUri = canvas.toDataURL('image/jpeg', 0.8);
            setPhotoDataUri(dataUri);
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          alert("Erreur lors du chargement de l'image.");
          setIsLoading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier.");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEnhance = () => {
    if (!photoDataUri) return;
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        // Apply filters via context
        ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.1)';
        ctx.drawImage(img, 0, 0);
        setPhotoDataUri(canvas.toDataURL('image/jpeg', 0.8));
      }
    };
    img.src = photoDataUri;
  };

  const handleSquareCrop = () => {
    if (!photoDataUri) return;
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        setPhotoDataUri(canvas.toDataURL('image/jpeg', 0.8));
      }
    };
    img.src = photoDataUri;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-2">
        <div
          className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center overflow-hidden relative group cursor-pointer border-2 border-dashed border-border/50 hover:border-primary/50 transition-all"
        >
          {photoDataUri ? (
            <>
              <Image
                src={photoDataUri}
                alt="Aperçu de la recette"
                layout="fill"
                objectFit="cover"
                onClick={() => setIsPreviewOpen(true)}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap justify-around p-1 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); handleSquareCrop(); }}
                  title="Recadrer en carré"
                >
                  <div className="h-3 w-3 border-2 border-white"></div>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); applyEnhance(); }}
                  title="Améliorer la clarté"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoDataUri(undefined);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-8 w-8" />
              <span className="text-[10px] font-medium">Ajouter</span>
            </div>
          )}
        </div>
        {photoDataUri && (
          <span className="text-[10px] text-center text-muted-foreground font-medium animate-pulse">Photo prête !</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => setIsCameraOpen(true)}
          disabled={isLoading}
          className="rounded-full shadow-sm"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
          Appareil photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full shadow-sm"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Galerie
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 bg-background border-b">
            <DialogTitle>Prendre une photo</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20"></div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter className="p-4 bg-background flex-row justify-between items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setIsCameraOpen(false)}>Annuler</Button>
            <Button onClick={handleCapture} className="h-16 w-16 rounded-full p-0 flex items-center justify-center border-4 border-primary/20 bg-primary hover:bg-primary/90 shadow-xl">
              <div className="h-12 w-12 rounded-full border-2 border-white/50"></div>
            </Button>
            <div className="w-12"></div> {/* Spacer for alignment */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative w-full aspect-square bg-muted/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            {photoDataUri && (
              <Image
                src={photoDataUri}
                alt="Aperçu haute résolution"
                layout="fill"
                objectFit="contain"
                className="animate-in fade-in zoom-in duration-300"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
