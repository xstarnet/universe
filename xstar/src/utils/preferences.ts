import { Preferences } from "@capacitor/preferences";

// In-memory cache for synchronous access
const cache = new Map<string, string | null>();

// Flag to track if cache has been initialized
let cacheInitialized = false;

// Initialize cache from preferences
async function initializeCache(): Promise<void> {
  if (cacheInitialized) return;

  try {
    const keys = await Preferences.keys();
    for (const key of keys.keys) {
      const result = await Preferences.get({ key });
      cache.set(key, result.value);
    }
  } catch (error) {
    console.error("Error initializing cache:", error);
  } finally {
    cacheInitialized = true;
  }
}

// Ensure cache is initialized on import
void initializeCache();

export const preferences = {
  // Synchronous get (uses cache)
  get(key: string): string | null {
    return cache.get(key) ?? null;
  },

  // Asynchronous get (updates cache)
  async getAsync(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      cache.set(key, result.value);
      return result.value;
    } catch (error) {
      console.error("Error getting preference:", error);
      return null;
    }
  },

  // Asynchronous set (updates cache)
  async set(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
      cache.set(key, value);
    } catch (error) {
      console.error("Error setting preference:", error);
    }
  },

  // Asynchronous remove (updates cache)
  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
      cache.delete(key);
    } catch (error) {
      console.error("Error removing preference:", error);
    }
  },

  // Asynchronous clear (clears cache)
  async clear(): Promise<void> {
    try {
      await Preferences.clear();
      cache.clear();
    } catch (error) {
      console.error("Error clearing preferences:", error);
    }
  },

  // Synchronous keys (uses cache)
  keys(): string[] {
    return Array.from(cache.keys());
  },

  // Asynchronous keys (updates cache)
  async keysAsync(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      // Update cache with all keys
      for (const key of result.keys) {
        if (!cache.has(key)) {
          const valueResult = await Preferences.get({ key });
          cache.set(key, valueResult.value);
        }
      }
      // Remove keys from cache that are no longer in preferences
      for (const cachedKey of cache.keys()) {
        if (!result.keys.includes(cachedKey)) {
          cache.delete(cachedKey);
        }
      }
      return result.keys;
    } catch (error) {
      console.error("Error getting preference keys:", error);
      return [];
    }
  },
};

export default preferences;
