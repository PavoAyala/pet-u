/**
 * Utility to manage Google Maps JS API integration in Astro/Vanilla JS.
 * This can be used as a "hook" by importing and calling it in client-side scripts.
 */

interface GoogleMapsNamespace {
  maps?: {
    importLibrary?: (lib: string, ...args: unknown[]) => Promise<unknown>;
    [key: string]: unknown;
  };
}

declare global {
  interface Window {
    google: GoogleMapsNamespace;
  }
}

const API_NAME = "The Google Maps JavaScript API";
const GLOBAL_NAME = "google";
const LIB_METHOD = "importLibrary";
const CALLBACK = "__ib__";

/**
 * Loads the Google Maps JS API using the modern bootstrap loader.
 */
export function loadGoogleMaps(apiKey: string): void {
  const g = globalThis as unknown as Record<string, GoogleMapsNamespace | undefined>;
  
  // Check if library loader is already initialized
  if (g[GLOBAL_NAME]?.maps?.importLibrary) return;

  const libraries = new Set<string>();
  const params = new URLSearchParams();
  let loaderPromise: Promise<void> | undefined;

  const options: Record<string, string> = {
    key: apiKey,
    v: "weekly",
    language: "es"
  };

  const loadScript = (): Promise<void> => {
    if (loaderPromise !== undefined) return loaderPromise;
    
    loaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      params.set("libraries", [...libraries].join(","));
      
      for (const [key, value] of Object.entries(options)) {
        params.set(key.replaceAll(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), value);
      }
      
      params.set("callback", `${GLOBAL_NAME}.maps.${CALLBACK}`);
      script.src = `https://maps.${GLOBAL_NAME}apis.com/maps/api/js?${params}`;
      
      const googleObj = (g[GLOBAL_NAME] || (g[GLOBAL_NAME] = {})) as Record<string, Record<string, unknown>>;
      const mapsObj = (googleObj.maps || (googleObj.maps = {})) as Record<string, unknown>;
      
      mapsObj[CALLBACK] = resolve;
      script.onerror = () => reject(new Error(`${API_NAME} could not load.`));
      script.nonce = (document.querySelector("script[nonce]") as HTMLScriptElement)?.nonce || "";
      document.head.append(script);
    });
    return loaderPromise;
  };

  const googleObj = (g[GLOBAL_NAME] || (g[GLOBAL_NAME] = {})) as Record<string, Record<string, unknown>>;
  const mapsObj = (googleObj.maps || (googleObj.maps = {})) as Record<string, unknown>;

  if (mapsObj[LIB_METHOD]) {
    console.warn(`${API_NAME} only loads once.`);
  } else {
    mapsObj[LIB_METHOD] = (lib: string, ...args: unknown[]) => {
      libraries.add(lib);
      const loader = mapsObj[LIB_METHOD] as (lib: string, ...args: unknown[]) => Promise<unknown>;
      return loadScript().then(() => loader(lib, ...args));
    };
  }
}

interface AutocompleteOptions {
  containerId: string;
  colorScheme?: 'LIGHT' | 'DARK' | 'FOLLOW_SYSTEM';
  includedRegionCodes?: string[];
  onSelect?: (location: { lat: number; lng: number }, address: string) => void;
}

interface PlaceResult {
  location?: { 
    lat: () => number; 
    lng: () => number; 
  };
  formattedAddress?: string;
  fetchFields(options: { fields: string[] }): Promise<void>;
}

interface PlacePrediction {
  toPlace(): Promise<PlaceResult>;
}

/**
 * Initializes the Place Autocomplete component (Web Component).
 */
export async function initPlaceAutocomplete(options: AutocompleteOptions): Promise<HTMLElement | undefined> {
  const { containerId, colorScheme = 'LIGHT', includedRegionCodes = ['mx'], onSelect } = options;
  const container = document.getElementById(containerId) as (HTMLElement & { _autocompleteInit?: boolean }) | null;

  if (!container || container._autocompleteInit) return;

  try {
    const g = globalThis as unknown as Record<string, GoogleMapsNamespace | undefined>;
    // Ensure the maps library is available
    if (!g.google?.maps?.importLibrary) {
      throw new Error("Google Maps API not loaded");
    }

    // Ensure the places library is loaded
    await g.google.maps.importLibrary("places");

    // Create the Web Component element
    const placeAutocomplete = document.createElement('gmp-place-autocomplete') as HTMLElement & {
      colorScheme: string;
      includedRegionCodes: string[];
    };
    
    placeAutocomplete.colorScheme = colorScheme;
    placeAutocomplete.includedRegionCodes = includedRegionCodes;

    // Handle selection
    placeAutocomplete.addEventListener('gmp-select', (async (event: Event) => {
      const selectEvent = event as unknown as { placePrediction: PlacePrediction };
      const place = await selectEvent.placePrediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress'] });

      if (place.location && onSelect) {
        onSelect(
          { lat: place.location.lat(), lng: place.location.lng() },
          place.formattedAddress || ''
        );
      }
    }) as EventListener);

    // Mount to container
    container.innerHTML = '';
    container.appendChild(placeAutocomplete);
    container._autocompleteInit = true;

    return placeAutocomplete;
  } catch (error) {
    console.error("Error initializing Google Maps Place Autocomplete:", error);
    return;
  }
}



