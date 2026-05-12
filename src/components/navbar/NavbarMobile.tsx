"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavigationBarProps {
  menuItems: Array<{ href: string; label: string; active: boolean }>;
}

export function NavigationBar({ menuItems }: NavigationBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden flex items-center justify-between w-full">
      {/* Mobile: Book Session on left, hamburger on right */}
      <a
        href="#book-session"
        onClick={() => setOpen(false)}
        className="border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#080808]
                   px-4 py-2 text-[0.6rem] tracking-[0.25em] uppercase transition-all duration-300
                   font-['Josefin_Sans'] whitespace-nowrap"
      >
        Book a Session
      </a>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#F5F0E8] hover:text-[#C9A96E] hover:bg-transparent"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="bg-[#080808] border-l border-[rgba(201,169,110,0.15)] text-[#F5F0E8] z-[150] min-h-screen h-auto overflow-y-auto w-80"
        >
          <SheetTitle className="text-[#C9A96E] font-['Cinzel'] text-sm tracking-[0.3em] uppercase font-normal mt-2">
            Menu
          </SheetTitle>
          <SheetDescription className="text-[rgba(245,240,232,0.4)] text-xs tracking-widest uppercase font-['Josefin_Sans'] mb-6">
            Miko Recording Studio
          </SheetDescription>

          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.3)] to-transparent mb-8" />

          {/* Mobile nav items */}
          <nav className="flex flex-col gap-0">
            {menuItems.map((item, index) => (
              <a
                key={index}
                onClick={() => setOpen(false)}
                href={item.href}
                className={`py-4 text-sm tracking-[0.2em] uppercase border-b border-[rgba(201,169,110,0.1)]
                            transition-colors duration-200 font-['Josefin_Sans']
                            ${item.active ? "text-[#C9A96E]" : "text-[rgba(245,240,232,0.7)] hover:text-[#F5F0E8]"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8">
            <a
              href="#book-session"
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-[#8B1A1A] hover:bg-[#B22222] text-[#F5F0E8]
                         py-3.5 text-[0.65rem] tracking-[0.3em] uppercase transition-colors duration-300
                         font-['Josefin_Sans']"
            >
              Book a Session
            </a>
          </div>

          {/* Social links */}
          <div className="mt-8">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#C9A96E] font-['Cinzel'] mb-4">
              Follow
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "TikTok", href: "https://www.tiktok.com/@mikorecordingstudio" },
                { label: "YouTube", href: "https://youtube.com/@mikorecordingstudio" },
                { label: "Spotify", href: "https://open.spotify.com/artist/mikorecordingstudio" },
                { label: "Instagram", href: "https://www.instagram.com/mikorecordingstudio" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase text-[rgba(245,240,232,0.5)] hover:text-[#C9A96E] transition-colors font-['Josefin_Sans']"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
