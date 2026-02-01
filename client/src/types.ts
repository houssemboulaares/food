export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Restaurant {
  id: string | number;
  name: string;
  cuisine: string;
  price: string;
  lat: number;
  lon: number;
  rating: string;
  reviews: number;
  score?: number;
  debug?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Session {
  code: string;
  participants: Participant[];
  status: "waiting" | "deciding" | "result";
  restaurant: Restaurant | null;
  location: Location | null;
  preferences: Record<string, unknown>;
  filters: { radius: number };
  createdAt: number;
  hostId: string;
}
