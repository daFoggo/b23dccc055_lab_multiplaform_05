export function isValidCoords(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildMapsUrl(lat: number, lng: number): string {
  if (!isValidCoords(lat, lng)) {
    throw new Error('Vị trí không hợp lệ');
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
