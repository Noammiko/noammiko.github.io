const images = import.meta.glob<{ default: ImageMetadata }>(
	"/src/assets/**/*.{jpeg,jpg,png,gif}",
);

export async function getImage(imagePath: string) {
	if (!images[imagePath]) {
		throw new Error(
			`"${imagePath}" does not exist in glob: "src/assets/**/*.{jpeg,jpg,png,gif}"`,
		);
	}
	return images[imagePath]();
}

export async function getDefaultImage(imagePath: string) {
	const image = await getImage(imagePath);
	return image.default;
}
