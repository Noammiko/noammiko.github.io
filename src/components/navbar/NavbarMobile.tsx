"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from 'react';
import { SocialPlatform } from "./socials";

interface NavigationBarProps {
  menuItems: Array<{ href: string, label: string, active: boolean }>
}

export function NavigationBar({ menuItems }: NavigationBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent title="Menu"  aria-description="Mobile navigation menu" side="right" className="bg-red-950 text-white border-red-900 z-[150] min-h-screen h-auto overflow-y-auto">
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription>Miko Recording Studio</SheetDescription>
        <div className="grid gap-6 py-6">
          {/* Mobile Menu Items - Same as Desktop */}
          {menuItems.map((item, index) => (
            <a
              onClick={() => {
                setOpen(false);
              }}
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
              <SocialPlatform platform="tiktok" className="w-full" />
              <SocialPlatform platform="youtube" className="w-full" />
              <SocialPlatform platform="spotify" className="w-full" />
              <SocialPlatform platform="instagram" className="w-full" />
              <SocialPlatform platform="location" className="w-full" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}