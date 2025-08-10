
'use client';

import * as React from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Camera, CameraOff, Loader2, ScanLine, Refrigerator, Upload } from 'lucide-react';
import { identifyIngredientsFromImage } from '@/ai/flows/identify-ingredients-flow';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FridgeScannerSheetProps {
  onIngredientsIdentified: (ingredients: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FridgeScannerSheet({ onIngredientsIdentified, open, onOpenChange }: FridgeScannerSheetProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = React.useState('');

  const cleanupAndReset = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setHasCameraPermission(null);
    setIsLoading(false);
    setError(null);
    setLoadingMessage('');
  }, [stream]);

  React.useEffect(() => {
    if (!open) {
      cleanupAndReset();
    }
  }, [open, cleanupAndReset]);

  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getCameraPermission = async () => {
    setIsLoading(true);
    setLoadingMessage('Activation de la caméra...');
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream);
      setHasCameraPermission(true);
    } catch (err) {
      console.error('Error accessing environment camera:', err);
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(newStream);
        setHasCameraPermission(true);
      } catch (finalErr) {
        console.error('Error accessing any camera:', finalErr);
        setHasCameraPermission(false);
        setError("L'accès à la caméra est nécessaire. Veuillez l'autoriser dans les paramètres de votre navigateur.");
      }
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleImageAnalysis = async (photoDataUri: string) => {
    setIsLoading(true);
    setLoadingMessage('Analyse de l\'image...');
    setError(null);
    try {
      const result = await identifyIngredientsFromImage({ photoDataUri });
      
      onOpenChange(false); // Close the sheet on success

      if (result.ingredients && result.ingredients.length > 0) {
        onIngredientsIdentified(result.ingredients);
      } else {
        // We can choose to either show an alert here or just pass an empty array.
        // For now, let's inform the user via console and let the next screen show "no ingredients".
        console.log("Aucun ingrédient n'a pu être identifié. Essayez une photo plus claire.");
        onIngredientsIdentified([]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue est survenue lors de l'analyse.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUri = canvas.toDataURL('image/jpeg');
      await handleImageAnalysis(photoDataUri);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          handleImageAnalysis(dataUri);
        } else {
          setError("Impossible de lire le fichier image.");
        }
      };
      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SheetContent className="flex flex-col">
      <SheetHeader>
        <SheetTitle className='flex items-center gap-2'>
            <Refrigerator />
            Scanner mon frigo
        </SheetTitle>
        <SheetDescription>
            Utilisez votre caméra ou importez une photo pour que l'IA identifie vos ingrédients.
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-grow my-4 flex flex-col items-center justify-center bg-secondary rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{loadingMessage}</p>
          </div>
        )}
        
        {hasCameraPermission === null && !isLoading && (
            <div className='flex flex-col items-center gap-4 p-4 text-center'>
                <Camera className='h-16 w-16 text-muted-foreground' />
                <p className='text-muted-foreground'>Activez votre caméra ou importez une image.</p>
                <div className='flex flex-col sm:flex-row gap-2'>
                    <Button onClick={getCameraPermission}>
                        <Camera className='mr-2 h-4 w-4'/> 
                        Activer la caméra
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className='mr-2 h-4 w-4' />
                        Importer une image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                </div>
            </div>
        )}

        {hasCameraPermission === false && (
            <Alert variant="destructive" className='m-4'>
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Accès à la caméra refusé</AlertTitle>
              <AlertDescription>
                {error || "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur. Vous pouvez toujours importer une photo."}
              </AlertDescription>
            </Alert>
        )}

        {stream && <video ref={videoRef} className={cn("w-full h-full object-cover", !stream && "hidden")} autoPlay muted playsInline />}
        <canvas ref={canvasRef} className="hidden" />
      </div>

       {error && hasCameraPermission !== false && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SheetFooter className='pt-4 border-t w-full'>
        {stream ? (
          <Button onClick={handleScan} className="w-full" size="lg" disabled={isLoading}>
            <ScanLine className="mr-2 h-5 w-5" />
            Scanner les ingrédients
          </Button>
        ) : (
            <SheetClose asChild>
                <Button variant="outline" className='w-full'>Fermer</Button>
            </SheetClose>
        )}
      </SheetFooter>
    </SheetContent>
  );
}
