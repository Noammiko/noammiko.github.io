import type {components, paths} from "@/lib/songlink/v1-alpha.1";

export interface MusicProvider {
  provider: string;
  url: string;
  nativeUrl?: string;
}

export type Platform = paths["/links"]["get"]["parameters"]["query"]["platform"];
export type ResponseContent = components["schemas"]["Response"];