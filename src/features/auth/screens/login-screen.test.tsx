import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {PaperProvider} from 'react-native-paper';

import {LoginScreen} from './login-screen';
import {loginUser} from '../../../services/auth-service';

jest.mock('../../../services/firebase', () => ({auth: {}, db: {}}));
jest.mock('../../../services/auth-service', () => ({
  loginUser: jest.fn(),
  mapAuthError: jest.requireActual('../../../services/auth-service')
    .mapAuthError,
}));

const navigation = {navigate: jest.fn()} as never;
const route = {key: 'Login', name: 'Login'} as never;

const texts = (r: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(r.toJSON());

describe('LoginScreen', () => {
  it('renders fields and shows mapped error when login rejects', async () => {
    (loginUser as jest.Mock).mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    let r!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      r = ReactTestRenderer.create(
        
          <PaperProvider>
            <LoginScreen navigation={navigation} route={route} />
          </PaperProvider>
        ,
      );
    });
    expect(texts(r)).toContain('Email');
    expect(texts(r)).toContain('Mật khẩu');

    const email = r.root.findByProps({testID: 'login-email', label: 'Email'});
    const pass = r.root.findByProps({
      testID: 'login-password',
      label: 'Mật khẩu',
    });
    await act(async () => {
      email.props.onChangeText('a@b.com');
      pass.props.onChangeText('123456');
    });
    const submit = r.root.findByProps({testID: 'login-submit', mode: 'contained'});
    await act(async () => {
      submit.props.onPress();
    });
    expect(loginUser).toHaveBeenCalledWith('a@b.com', '123456');
    expect(texts(r)).toContain('Sai email hoặc mật khẩu.');
  });
});
