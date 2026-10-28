import { buildMapsUrl } from './maps';

it('builds a google maps search url', () => {
  const url = buildMapsUrl(21.0285, 105.8542);
  expect(url).toBe(
    'https://www.google.com/maps/search/?api=1&query=21.0285,105.8542',
  );
});

it.each([
  [NaN, 0],
  [0, Infinity],
  [91, 0],
  [0, -181],
])('throws on invalid coords %p,%p', (lat, lng) => {
  expect(() => buildMapsUrl(lat, lng)).toThrow('Vị trí không hợp lệ');
});
