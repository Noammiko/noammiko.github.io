import type { ComponentProps } from "astro/types";
import { getDefaultImage } from "../images"
import { getImage as getOptimizedImage } from "astro:assets";
import type { GetImageResult, ImageMetadata, ImageTransform } from "astro";

const root = "/src/assets/galary/";
const getImagePath = (image: string) => new URL(image, "file://" + root).pathname;

const imagesPaths: { image: string | ImageMetadata, alt: string }[] = [
	{
		image: "./1.jpeg",
		alt: "Computer and recording booth",
	},
	{
		image: "./2.jpeg",
		alt: "",
	},
	{
		image: "./3.jpeg",
		alt: "",
	},
	{
		image: "./4.jpeg",
		alt: "",
	},
	{
		image: "./5.jpeg",
		alt: "",
	},
	{
		image: "./6.jpeg",
		alt: "",
	},
	{
		image: "./7.jpeg",
		alt: "",
	},
];

type getImagesProp = {
	imageTransform: Omit<ImageTransform, "src" | "alt">,
} | {
	densities: number[],
	imageTransform: Omit<ImageTransform, "src" | "alt" | "width" | "widths" | "densities">,
}

export async function getImages(props: getImagesProp) {
	return Promise.all(imagesPaths.map(async ({ image, alt }) => {
		if (typeof image === "string") {
			image = getImagePath(image);
			image = await getDefaultImage(image);
		}
		let img: Promise<GetImageResult>;
		if ("densities" in props) {
			img = getOptimizedImage({ src: image, alt, ...props.imageTransform, densities: props.densities, width: image.width / props.densities[props.densities.length - 1] });
		} else {
			img = getOptimizedImage({ src: image, alt, ...props.imageTransform });
		}
		return img
	}));
}
