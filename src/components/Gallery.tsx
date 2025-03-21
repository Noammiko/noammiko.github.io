import OptimizedImage from "@/components/OptimizedImage";

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
}

export default function CarouselComponent({ images, className }: CarouselItemProps) {
	if (images === undefined || images.length === 0) return (<></>);

	return (
		<Carousel className={`w-full max-w-xs ${className}`}>
			<CarouselContent>
				{images.map((image, index) => (
					<CarouselItem key={index}>
						<div className="p-1">
							<OptimizedImage OptimizedImage={image} className="rounded-lg" />
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	)
}
