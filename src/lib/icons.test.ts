import { icons } from '../theme/icons';

const glyphMap: Record<
  string,
  number
> = require('react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');

describe('icons', () => {
  it.each(Object.entries(icons))(
    '%s -> %s exists in MCI glyphmap',
    (_k, name) => {
      expect(glyphMap[name]).toBeDefined();
    },
  );
});
