
'use client';

import * as React from 'react';
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Camera, CameraOff, Loader2, ScanLine, Refrigerator } from 'lucide-react';
import { identifyIngredientsFromImage } from '@/ai/flows/identify-ingredients-flow';
import { cn } from '@/lib/utils';

interface FridgeScannerSheetProps {
  onIngredientsIdentified: (ingredients: string[]) => void;
}

export default function FridgeScannerSheet({ onIngredientsIdentified }: FridgeScannerSheetProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Attach stream to video element when stream is ready
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Cleanup: stop the camera stream when the component unmounts or stream changes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getCameraPermission = async () => {
    setIsLoading(true);
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
    }
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUri = canvas.toDataURL('image/jpeg');

      try {
        const result = await identifyIngredientsFromImage({ photoDataUri });
        
        // Find the close button and click it to hide the sheet BEFORE calling the parent callback
        const closeButton = document.querySelector('button[aria-label="Close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }

        if (result.ingredients && result.ingredients.length > 0) {
          onIngredientsIdentified(result.ingredients);
        } else {
          // This error will likely not be seen as the sheet closes, but it's good practice.
          // A toast notification would be a better UX for this case.
          console.log("Aucun ingrédient n'a pu être identifié. Essayez une photo plus claire.");
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue est survenue lors de l'analyse.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
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
            Pointez la caméra vers vos ingrédients et laissez l'IA identifier ce que vous avez.
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-grow my-4 flex flex-col items-center justify-center bg-secondary rounded-lg overflow-hidden">
        {hasCameraPermission === null && (
            <div className='flex flex-col items-center gap-4 p-4 text-center'>
                <Camera className='h-16 w-16 text-muted-foreground' />
                <p className='text-muted-foreground'>Veuillez autoriser l'accès à la caméra pour commencer.</p>
                <Button onClick={getCameraPermission} disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Camera className='mr-2 h-4 w-4'/>} 
                    Activer la caméra
                </Button>
            </div>
        )}
        {hasCameraPermission === false && (
            <Alert variant="destructive" className='m-4'>
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Accès à la caméra refusé</AlertTitle>
              <AlertDescription>
                {error || "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur pour utiliser cette fonctionnalité."}
              </AlertDescription>
            </Alert>
        )}
        <div className="relative w-full h-full">
            <video ref={videoRef} className={cn("w-full h-full object-cover", !stream && "hidden")} autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
        </div>
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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
               <>
                <ScanLine className="mr-2 h-5 w-5" />
                Scanner les ingrédients
               </>
            )}
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
