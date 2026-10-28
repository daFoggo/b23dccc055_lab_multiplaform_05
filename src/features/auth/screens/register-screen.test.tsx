import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';

import { RegisterScreen } from './register-screen';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/auth-service', () => ({
  registerUser: jest.fn(),
  mapAuthError: jest.requireActual('../../../services/auth-service')
    .mapAuthError,
}));

const navigation = { navigate: jest.fn() } as never;
const route = { key: 'Register', name: 'Register' } as never;

async function setup() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider>
        <RegisterScreen navigation={navigation} route={route} />
      </PaperProvider>,
    );
  });
  const email = () => r.root.findByProps({ label: 'Email' });
  const submit = () => r.root.findByProps({ mode: 'contained' });
  return { r, email, submit };
}

describe('RegisterScreen touched hardening', () => {
  it('blur without typing shows no error', async () => {
    const { email } = await setup();
    await act(async () => {
      email().props.onBlur();
    });
    expect(email().props.error).toBe(false);
  });

  it('typing invalid then blur shows error', async () => {
    const { email } = await setup();
    await act(async () => {
      email().props.onChangeText('abc');
    });
    await act(async () => {
      email().props.onBlur();
    });
    expect(email().props.error).toBe(true);
  });

  it('submit shows all errors', async () => {
    const { email, submit } = await setup();
    await act(async () => {
      submit().props.onPress();
    });
    expect(email().props.error).toBe(true);
  });
});
