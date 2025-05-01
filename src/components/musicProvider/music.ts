import brands from "@/lib/icons";
import type { components } from "@/lib/songlink/v1-alpha.1";
import type { MusicProvider } from "./types";

import { storable } from "../../lib/storable.svelte";
import type { Platform } from "./types";
import { get } from "svelte/store";

export const provider = storable<Platform>("musicProvider", "spotify");

export function handleOpenLink(link: string, nativeAppUri?: string) {
  if (!nativeAppUri) { 
    window.open(link, "_blank");
    return;
  }
  
  throw new Error("Function not implemented.");
}

export function getSelectedProvider(
  items: MusicProvider[],
  selected?: Platform,
): MusicProvider | undefined {
  if (selected === undefined) {
    selected = get(provider);
  }
  return items.find((item) => item.provider === selected);
}

export function lookupBrand(brand: string) {
  return brands[brand];
}

export function getEntity(
  data: components["schemas"]["Response"],
): components["schemas"]["Entity"] {
  let mainPlatform: components["schemas"]["PlatformLink"];
  if ("spotify" in data.linksByPlatform) {
    mainPlatform = data.linksByPlatform["spotify"];
  } else if ("appleMusic" in data.linksByPlatform) {
    mainPlatform = data.linksByPlatform["appleMusic"];
  } else {
    mainPlatform = data.linksByPlatform[Object.keys(data.linksByPlatform)[0]];
  }
  if (!mainPlatform) {
    throw new Error("No main platform found");
  }

  return data.entitiesByUniqueId[mainPlatform.entityUniqueId];
}

export function getMusicProviders(
  data: components["schemas"]["Response"],
  preferedOrder: string[] = [
    "spotify",
    "appleMusic",
    "youtubeMusic",
    "deezer",
    "amazonMusic",
  ],
): MusicProvider[] {
  return Object.entries(data.linksByPlatform)
    .map(([key, value]) => ({
      provider: key as Platform, // TODO: add a warning to verify this is correct
      url: value.url,
      nativeUrl:
        value.nativeAppUriDesktop ?? value.nativeAppUriMobile ?? undefined,
    }))
    .sort((a, b) => {
      const aIndex = preferedOrder.indexOf(a.provider);
      const bIndex = preferedOrder.indexOf(b.provider);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
}

export function getYoutubeEmbedId(
  data: components["schemas"]["Response"],
): string {
  const youtubePlatform =
    data.linksByPlatform["youtubeMusic"] ?? data.linksByPlatform["youtube"];
  if (!youtubePlatform) throw new Error("No youtube platform found");
  const entity = data.entitiesByUniqueId[youtubePlatform.entityUniqueId];
  if (!entity.id) throw new Error("No youtube entity id found");
  return entity.id;
}
