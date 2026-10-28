import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';

import { LoginScreen } from './login-screen';
import { loginUser } from '../../../services/auth-service';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/auth-service', () => ({
  loginUser: jest.fn(),
  mapAuthError: jest.requireActual('../../../services/auth-service')
    .mapAuthError,
}));

const navigation = { navigate: jest.fn() } as never;
const route = { key: 'Login', name: 'Login' } as never;

const texts = (r: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(r.toJSON());

async function setup() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider>
        <LoginScreen navigation={navigation} route={route} />
      </PaperProvider>,
    );
  });
  const email = () =>
    r.root.findByProps({ testID: 'login-email', label: 'Email' });
  const pass = () =>
    r.root.findByProps({ testID: 'login-password', label: 'Mật khẩu' });
  const submit = () =>
    r.root.findByProps({ testID: 'login-submit', mode: 'contained' });
  await act(async () => {
    email().props.onChangeText('a@b.com');
    pass().props.onChangeText('123456');
  });
  return { r, email, submit };
}

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders fields and shows mapped error when login rejects', async () => {
    (loginUser as jest.Mock).mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    const { r, submit } = await setup();
    expect(texts(r)).toContain('Email');
    expect(texts(r)).toContain('Mật khẩu');
    await act(async () => {
      submit().props.onPress();
    });
    expect(loginUser).toHaveBeenCalledWith('a@b.com', '123456');
    expect(texts(r)).toContain('Sai email hoặc mật khẩu.');
  });

  it('clears the form error when the user edits a field', async () => {
    (loginUser as jest.Mock).mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    const { r, email, submit } = await setup();
    await act(async () => {
      submit().props.onPress();
    });
    expect(texts(r)).toContain('Sai email hoặc mật khẩu.');
    await act(async () => {
      email().props.onChangeText('a@b.co');
    });
    expect(texts(r)).not.toContain('Sai email hoặc mật khẩu.');
  });

  it('re-enables the button after a successful submit without unmount', async () => {
    (loginUser as jest.Mock).mockResolvedValue(undefined);
    const { submit } = await setup();
    await act(async () => {
      submit().props.onPress();
    });
    expect(submit().props.disabled).toBeFalsy();
  });
});
