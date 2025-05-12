import { storable } from "@/lib/storable.svelte.ts";
export const studioNavigated = storable<boolean>("studioNavigated", false, sessionStorage);
