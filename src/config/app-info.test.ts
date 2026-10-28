import { APP_VERSION } from './app-info';

it('APP_VERSION matches package.json version', () => {
  expect(APP_VERSION).toBe(require('../../package.json').version);
});
