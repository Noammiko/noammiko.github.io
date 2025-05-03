import createClient from "openapi-fetch";
import type { paths } from "@/lib/songlink/v1-alpha.1";
import { mkdir, readFile, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { join } from 'path';

const client = createClient<paths>({
  baseUrl: "https://api.song.link/v1-alpha.1/",
});

type SongDataParamsIdentifier =
  | {
      id: string;
      type: paths["/links"]["get"]["parameters"]["query"]["type"];
      platform: paths["/links"]["get"]["parameters"]["query"]["platform"];
    }
  | { url: string };

type SongDataCommonFields = {
  userCountry?: string;
  songIfSingle?: boolean;
};

export type SongDataParams = SongDataCommonFields & SongDataParamsIdentifier;

const CACHE_DIR = join(process.cwd(), '.cache', 'songlink');
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure cache directory exists
mkdir(CACHE_DIR, { recursive: true }).catch(console.error);

function createCacheKey(params: SongDataParams): string {
  return createHash('md5').update(JSON.stringify(params)).digest('hex');
}

async function readCache(key: string) {
  try {
    const data = JSON.parse(await readFile(join(CACHE_DIR, `${key}.json`), 'utf-8'));
    if (Date.now() - data.timestamp > CACHE_EXPIRY) {
      return null;
    }
    return data.value;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: any) {
  try {
    const data = { timestamp: Date.now(), value };
    await writeFile(join(CACHE_DIR, `${key}.json`), JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function getSongData(params: SongDataParams) {
  const cacheKey = createCacheKey(params);
  
  // Check cache first
  const cached = await readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await client.GET("/links", {
    params: {
      query: {
        ...params,
      },
    },
    responseType: "json",
  });

  if (res.error) throw new Error(`Error getting data ${res.error}`);
  
  // Store in cache before returning
  await writeCache(cacheKey, res.data);
  return res.data;
}
