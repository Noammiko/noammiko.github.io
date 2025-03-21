import type { GetImageResult } from 'astro';
import React from 'react';

export interface OptimizedImageProps {
	OptimizedImage: GetImageResult;
	className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ OptimizedImage, className }) => {
	console.log(OptimizedImage);
	return (
		<img
			className={className}
			src={OptimizedImage.src}
			{...OptimizedImage.attributes}
			srcSet={OptimizedImage.srcSet.attribute}
		/>
	);
};

export default OptimizedImage;
