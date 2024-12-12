import { get, writable, type Writable } from "svelte/store";

interface Storable<T> {
  value: T;
}

export function storable<T extends any>(
  key: string | number,
  value: T,
  storage: Storage = null,
): Writable<T> {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && !storage) {
    storage = window.localStorage;
  }

  if (isBrowser && key in storage) {
    const existing = JSON.parse(storage[key]) as Storable<T>;
    value = existing.value;
  }

  const { set, subscribe } = writable(value);
  const setFn = (newValue: T) => {
    set(newValue);
    if (isBrowser) {
      storage[key] = JSON.stringify({ value: newValue } as Storable<T>);
    }
  };

  return {
    subscribe,
    set: setFn,
    update: (updater: (value: T) => T) => {
      setFn(updater(get({ subscribe })));
    },
  };
}
