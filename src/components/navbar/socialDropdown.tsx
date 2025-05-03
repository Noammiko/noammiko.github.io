"use client"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SocialPlatform } from "./socials";

export function SocialDropdown() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="hover:text-red-300 transition flex items-center gap-1">
        Socials and Links
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-red-950 text-white border-red-900">
        <DropdownMenuItem className="hover:bg-red-900 focus:bg-red-900 cursor-pointer">
          <SocialPlatform platform="tiktok" className="w-full" />
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-red-900 focus:bg-red-900 cursor-pointer">
          <SocialPlatform platform="youtube" className="w-full" />
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-red-900 focus:bg-red-900 cursor-pointer">
          <SocialPlatform platform="spotify" className="w-full" />
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-red-900 focus:bg-red-900 cursor-pointer">
          <SocialPlatform platform="instagram" className="w-full" />
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-red-900 focus:bg-red-900 cursor-pointer">
          <SocialPlatform platform="location" className="w-full" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
