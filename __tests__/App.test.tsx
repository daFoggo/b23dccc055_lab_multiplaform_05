/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    r = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    r.unmount();
  });
});
