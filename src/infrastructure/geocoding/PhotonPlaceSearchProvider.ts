import { PlaceSearchProvider, PlaceSuggestion } from "../../domain/routing/PlaceSearchProvider";

interface PhotonFeature {
  properties: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // GeoJSON order: [longitude, latitude]
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

/**
 * Photon (komoot, OSM data) — chosen over raw Nominatim specifically
 * because Photon is built for type-ahead search; Nominatim's usage policy
 * asks callers not to hit it on every keystroke. No API key, no billing
 * setup, which matters for "just try this on your phone right now."
 * Swap this file for a Google Places / Mapbox adapter later and nothing
 * else changes — see PlaceSearchProvider.ts.
 */
export class PhotonPlaceSearchProvider implements PlaceSearchProvider {
  constructor(
    private readonly baseUrl: string = "https://photon.komoot.io/api/",
    private readonly language: string = "de"
  ) {}

  async search(query: string): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return [];
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set("q", trimmed);
    url.searchParams.set("limit", "5");
    url.searchParams.set("lang", this.language);

    const response = await fetch(url, {
      headers: { "User-Agent": "IrsanAI-Live-Share/0.1 (dev/test instance)" },
    });

    if (!response.ok) {
      throw new Error(`Place search failed: ${response.status}`);
    }

    const body = (await response.json()) as PhotonResponse;
    return body.features.map(toSuggestion).filter((s): s is PlaceSuggestion => s !== null);
  }
}

function toSuggestion(feature: PhotonFeature): PlaceSuggestion | null {
  const [longitude, latitude] = feature.geometry.coordinates;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }
  return { label: buildLabel(feature.properties), latitude, longitude };
}

function buildLabel(props: PhotonFeature["properties"]): string {
  const parts = [props.name, props.street, props.city, props.state, props.country].filter(
    (part): part is string => Boolean(part)
  );
  return parts.length > 0 ? Array.from(new Set(parts)).join(", ") : "Unbenannter Ort";
}
