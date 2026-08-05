/**
 * Map Philosophy, extended: "Maps are replaceable renderers... changing
 * map provider must not require domain changes." The same is true for
 * *finding* a place, not just rendering one. This port is what the host
 * page's address search talks to — today backed by Photon/OSM, swappable
 * for Google Places or Mapbox later without touching anything that calls
 * it, because the shape it returns (a label plus coordinates) doesn't
 * change with the provider.
 */
export interface PlaceSuggestion {
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface PlaceSearchProvider {
  search(query: string): Promise<PlaceSuggestion[]>;
}
