import createClient from "openapi-fetch";
import type { paths } from "@/lib/songlink/v1-alpha.1";

const client = createClient<paths>({
  baseUrl: "https://api.song.link/v1-alpha.1/",
});

type SongDataParamsIdentifier =
  | {
      id: string;
      type: paths["/links"]["get"]["parameters"]["query"]["type"];
      platforms: paths["/links"]["get"]["parameters"]["query"]["platform"];
    }
  | { url: string };

type SongDataCommonFields = {
  userCountry?: string;
  songIfSingle?: boolean;
};

export type SongDataParams = SongDataCommonFields & SongDataParamsIdentifier;

export async function getSongData(params: SongDataParams) {
  const res = await client.GET("/links", {
    params: {
      query: {
        ...params,
      },
    },
    responseType: "json",
  });

  if (res.error) throw new Error(`Error getting data ${res.error}`)
  return res.data;
}
