
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import Image from 'next/image';

interface ImagePickerProps {
  photoDataUri: string | undefined;
  setPhotoDataUri: (uri: string | undefined) => void;
}

export default function ImagePicker({ photoDataUri, setPhotoDataUri }: ImagePickerProps) {
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
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
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Create a new canvas to resize the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          const maxWidth = 800;
          const maxHeight = 800;
          let { width, height } = video;

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
          
          tempCanvas.width = width;
          tempCanvas.height = height;
          tempCtx.drawImage(video, 0, 0, width, height);
          
          const dataUri = tempCanvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG with 80% quality
          setPhotoDataUri(dataUri);
        }
      }
      setIsCameraOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
             const maxWidth = 800;
             const maxHeight = 800;
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

             const dataUri = canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG with 80% quality
             setPhotoDataUri(dataUri);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center overflow-hidden relative group">
        {photoDataUri ? (
          <>
            <Image src={photoDataUri} alt="Aperçu de la recette" layout="fill" objectFit="cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setPhotoDataUri(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="button" onClick={() => setIsCameraOpen(true)} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
          Prendre une photo
        </Button>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Importer
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Prendre une photo</DialogTitle></DialogHeader>
          <div className="bg-secondary rounded-lg overflow-hidden my-4">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCameraOpen(false); }}>Annuler</Button>
            <Button onClick={handleCapture}>Capturer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
