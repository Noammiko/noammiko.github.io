import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import brands, { type AvailableIcons, type Icon as BrandIcon } from "@/lib/icons";
import platforms from "@/lib/platforms";

function lookupBrand(brand: AvailableIcons | string): BrandIcon {
  if (brand in brands) {
    return brands[brand];
  }

  return {
    icon: undefined,
    label: brand,
  };
}

export function Platform({ platform, className }: { platform: AvailableIcons, className?: string }) {
  const provider = lookupBrand(platform);

  return (
    <div className={cn("text-base flex items-center gap-2", className)}>
      <Icon
        icon={provider.icon}
        className="w-5 h-5"
      />
      <span>{provider.label}</span>
    </div>
  )
}

export function SocialPlatform({ platform: platformName, className }: { platform: AvailableIcons, className?: string }) {
  const platform: { href: string } = platforms[platformName];
  return (
    <a href={platform.href} target="_blank" className={cn("hover:text-red-300 transition", className)}>
      <Platform platform={platformName} />
    </a>
  )
}