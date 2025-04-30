import OptimizedImage from "@/components/OptimizedImage";
import Autoplay from "embla-carousel-autoplay"


import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { GetImageResult } from "astro";

interface CarouselItemProps {
  images: Array<GetImageResult>;
  className?: string;
  buttons?: boolean;
}

export default function CarouselComponent({ images, className, buttons = true }: CarouselItemProps) {
  if (images === undefined || images.length === 0) return (<></>);

  return (
    <Carousel className={`w-full max-w-xs ${className}`}
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <OptimizedImage OptimizedImage={image} className="rounded-lg" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {buttons && <>
        <CarouselPrevious />
        <CarouselNext />
      </>}
    </Carousel>
  )
}
