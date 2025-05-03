"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import brands, { type AvailableIcons, type Icon as BrandIcon } from "@/lib/icons";
// import { TiktokIcon, YoutubeIcon, SpotifyIcon, InstagramIcon } from "./social-icons"

interface NavigationBarProps {
  menuItems: Array<{href: string, label: string, active: boolean}>
}

function lookupBrand(brand: AvailableIcons | string): BrandIcon {
  if (brand in brands) {
    return brands[brand];
  }

  return {
    icon: undefined,
    label: brand,
  };
}

function Platform({ platform, className }: { platform: AvailableIcons, className?: string }) {
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



export function NavigationBar({  menuItems }: NavigationBarProps) {
  return (
    <>
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden text-white border-white/30">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-red-950 text-white border-red-900 z-[150]">
          <div className="grid gap-6 py-6">
            <h2 className="text-xl font-bold border-b border-red-800 pb-2">Menu</h2>

            {/* Mobile Menu Items - Same as Desktop */}
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full items-center py-2 text-lg font-semibold hover:text-red-300 transition"
              >
                {item.label}
              </a>
            ))}

            {/* Book Session Button for Mobile */}
            <a
              href="/prices-and-bundles#book-session"
              className="flex w-full items-center py-2 text-lg font-semibold hover:text-red-300 transition text-red-300"
            >
              Book a Session
            </a>

            {/* Social Links Section */}
            <div className="py-2">
              <h3 className="text-lg font-semibold mb-2 border-b border-red-800/50 pb-2">Socials and Links</h3>
              <div className="grid gap-2 pl-4">
                <a href="#" className="hover:text-red-300 transition">
                  <Platform platform="tiktok"/>
                </a>
                <a href="#" className="hover:text-red-300 transition">
                  <Platform platform="youtube" />
                </a>
                <a href="#" className="hover:text-red-300 transition">
                  <Platform platform="spotify" />
                </a>
                <a href="#" className="hover:text-red-300 transition">
                  <Platform platform="instagram" />
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}