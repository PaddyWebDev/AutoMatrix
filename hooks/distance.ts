import axios from "axios";

// Function to calculate distance between two coordinates using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_KM = 6371;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export async function calclateLongitudeLatitudeofStation(
  cityName: string
): Promise<{
  lat: string;
  lon: string;
} | null> {
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${cityName}&format=json&limit=1`
  );
  if (!response.data) {
    return null;
  }
  return {
    lat: response.data[0].lat,
    lon: response.data[0].lon,
  };
}
