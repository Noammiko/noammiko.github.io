import brands, { type AvailableIcons, type Icon } from "@/lib/icons";
import type { components } from "@/lib/songlink/v1-alpha.1";
import type { BrowserInfo, MusicProvider } from "./types";

import { storable } from "../../lib/storable.svelte";
import type { Platform } from "./types";
import { get } from "svelte/store";

export const provider = storable<Platform>("musicProvider", "spotify");

interface handleOpenLinkParams {
  track: MusicProvider;
  preferredPlatform?: "web" | "native" | "auto";
  browser?: BrowserInfo;
  timeout?: number;
}
export function handleOpenLink({
  track,
  preferredPlatform = "auto",
  browser = undefined,
  timeout = 500,
}: handleOpenLinkParams) {
  if (!browser) {
    browser = detectPlatform();
  }

  const { isChrome, isSafari, isIOS } = browser;

  const nativeUrl =
    (browser.isMobile ? track.nativeUrlMobile : track.nativeUrlDesktop) ??
    track.nativeUrlDesktop ??
    track.nativeUrlMobile;

  if (!nativeUrl || preferredPlatform === "web") {
    window.open(track.url, "_blank");
    return;
  }

  // Special handling for iOS devices
  const isAppleMusic =
    track.provider === "appleMusic" || track.provider === "itunes";

  // For iTunes/Apple Music on iOS Safari, direct assignment works best
  if (track.nativeUrlMobile && isAppleMusic && isIOS && isSafari) {
    window.location.assign(track.nativeUrlMobile);
    return;
  }

  // For Chrome on iOS with Apple Music, direct assignment is needed
  if (track.nativeUrlMobile && isAppleMusic && isIOS && isChrome) {
    window.location.assign(track.nativeUrlMobile);
    return;
  }

  const { isWindowBlurred, controller } = windowBlurDetector(false);

  // Create hidden iframe to launch app
  const iframe = document.createElement("iframe");
  iframe.style.border = "none";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.display = "none";
  iframe.src = nativeUrl;

  document.body.appendChild(iframe);

  // Fallback to web if app doesn't launch within timeout
  setTimeout(() => {
    // Remove the iframe
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    // If window wasn't blurred (app didn't open), go to web version
    if (!isWindowBlurred()) {
      //} && preferredPlatform === "auto") {
      window.open(track.url, "_blank");
    }
    controller.abort();
  }, timeout);
}

function windowBlurDetector(catchRest = true) {
  let windowWasBlurred = false;
  const controller = new AbortController();
  window.addEventListener(
    "blur",
    () => {
      windowWasBlurred = true;
    },
    { signal: controller.signal },
  );
  if (catchRest) {
    window.addEventListener(
      "focus",
      () => {
        windowWasBlurred = true;
      },
      { signal: controller.signal },
    );
  }

  return {
    isWindowBlurred: () => windowWasBlurred,
    controller,
  };
}

function detectPlatform(): BrowserInfo {
  const browserInfo = {
    isChrome: false,
    isSafari: false,
    isIOS: false,
    isMobile: false,
  };

  // @ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Mobile detection
  const mobileRegex =
    /android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i;
  browserInfo.isMobile = mobileRegex.test(userAgent);

  // Browser & OS detection
  // @ts-ignore
  browserInfo.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  browserInfo.isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  browserInfo.isChrome = /CriOS/i.test(userAgent) || /Chrome/i.test(userAgent);

  return browserInfo;
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

export function lookupBrand(brand: AvailableIcons | string): Icon {
  if (brand in brands) {
    return brands[brand];
  }

  return {
    icon: undefined,
    label: brand,
  };
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
    .map(
      ([key, value]) =>
        ({
          provider: key as Platform, // TODO: add a warning to verify this is correct
          url: value.url,
          nativeUrlDesktop: value.nativeAppUriDesktop,
          nativeUrlMobile: value.nativeAppUriMobile,
        }) as MusicProvider,
    )
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
