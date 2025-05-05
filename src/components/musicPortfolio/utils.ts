import { writable, type Writable } from "svelte/store";
import type { Song } from "./types";

const playing: Writable<Song|null> = writable(null);

export { playing };
