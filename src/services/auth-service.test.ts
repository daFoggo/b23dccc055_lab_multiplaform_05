import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  loginUser,
  logoutUser,
  mapAuthError,
  registerUser,
  subscribeAuth,
} from './auth-service';
import { createUserProfile } from './user-service';
import { setOffline } from './presence-service';

jest.mock('./user-service', () => ({ createUserProfile: jest.fn() }));
jest.mock('./presence-service', () => ({ setOffline: jest.fn() }));
jest.mock('./firebase', () => ({
  auth: { currentUser: { uid: 'u1' } },
  db: {},
}));

const m = (f: unknown) => f as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('mapAuthError', () => {
  it('maps known codes to Vietnamese', () => {
    expect(mapAuthError('auth/invalid-credential')).toBe(
      'Sai email hoặc mật khẩu.',
    );
    expect(mapAuthError('auth/wrong-password')).toBe(
      'Sai email hoặc mật khẩu.',
    );
    expect(mapAuthError('auth/user-not-found')).toBe(
      'Sai email hoặc mật khẩu.',
    );
    expect(mapAuthError('auth/email-already-in-use')).toBe(
      'Email đã được đăng ký.',
    );
    expect(mapAuthError('auth/weak-password')).toBe(
      'Mật khẩu phải có ít nhất 6 ký tự.',
    );
    expect(mapAuthError('auth/invalid-email')).toBe('Email không hợp lệ.');
    expect(mapAuthError('auth/network-request-failed')).toBe(
      'Không có kết nối mạng. Vui lòng thử lại.',
    );
  });

  it('maps provider-config, throttling and disabled codes', () => {
    const hint =
      'Đăng ký/đăng nhập bằng email chưa được bật trong Firebase. Hãy bật Email/Password trong Authentication.';
    expect(mapAuthError('auth/operation-not-allowed')).toBe(hint);
    expect(mapAuthError('auth/configuration-not-found')).toBe(
      'Firebase Authentication chưa được khởi tạo cho project này. Hãy bật Email/Password trong Authentication.',
    );
    expect(mapAuthError('auth/too-many-requests')).toBe(
      'Thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.',
    );
    expect(mapAuthError('auth/user-disabled')).toBe(
      'Tài khoản đã bị vô hiệu hóa.',
    );
  });

  it('returns a generic message for unknown codes', () => {
    expect(mapAuthError('auth/whatever')).toBe(
      'Đã xảy ra lỗi. Vui lòng thử lại.',
    );
  });
});

describe('loginUser', () => {
  it('normalizes email before signing in', async () => {
    m(signInWithEmailAndPassword).mockResolvedValue({});
    await loginUser('  A@B.com ', 'x');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com',
      'x',
    );
  });
});

describe('registerUser', () => {
  it('creates account, sets displayName, then creates profile', async () => {
    const user = { uid: 'u9' };
    m(createUserWithEmailAndPassword).mockResolvedValue({ user });
    m(updateProfile).mockResolvedValue(undefined);
    m(createUserProfile).mockResolvedValue(undefined);
    await registerUser(' An ', ' X@Y.com ', 'secret1');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'x@y.com',
      'secret1',
    );
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: 'An' });
    expect(createUserProfile).toHaveBeenCalledWith('u9', 'An');
    expect(m(updateProfile).mock.invocationCallOrder[0]).toBeLessThan(
      m(createUserProfile).mock.invocationCallOrder[0],
    );
  });
});

describe('registerUser failures', () => {
  it('rejects empty or too long names before creating the account', async () => {
    await expect(registerUser('   ', 'a@b.com', 'secret1')).rejects.toThrow(
      'Tên phải từ 1 đến 50 ký tự.',
    );
    await expect(
      registerUser('x'.repeat(51), 'a@b.com', 'secret1'),
    ).rejects.toThrow('Tên phải từ 1 đến 50 ký tự.');
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('deletes the new user and rethrows when createUserProfile fails', async () => {
    const user = { uid: 'u9' };
    const err = new Error('rules denied');
    m(createUserWithEmailAndPassword).mockResolvedValue({ user });
    m(updateProfile).mockResolvedValue(undefined);
    m(createUserProfile).mockRejectedValue(err);
    m(deleteUser).mockResolvedValue(undefined);
    await expect(registerUser('An', 'a@b.com', 'secret1')).rejects.toBe(err);
    expect(deleteUser).toHaveBeenCalledTimes(1);
    expect(deleteUser).toHaveBeenCalledWith(user);
  });

  it('deletes the new user and rethrows when updateProfile fails, ignoring delete errors', async () => {
    const user = { uid: 'u9' };
    const err = new Error('boom');
    m(createUserWithEmailAndPassword).mockResolvedValue({ user });
    m(updateProfile).mockRejectedValue(err);
    m(deleteUser).mockRejectedValue(new Error('delete failed'));
    await expect(registerUser('An', 'a@b.com', 'secret1')).rejects.toBe(err);
    expect(deleteUser).toHaveBeenCalledTimes(1);
    expect(createUserProfile).not.toHaveBeenCalled();
  });
});

describe('logoutUser', () => {
  it('sets offline before signOut', async () => {
    m(setOffline).mockResolvedValue(undefined);
    m(signOut).mockResolvedValue(undefined);
    await logoutUser();
    expect(setOffline).toHaveBeenCalledWith('u1');
    expect(m(setOffline).mock.invocationCallOrder[0]).toBeLessThan(
      m(signOut).mock.invocationCallOrder[0],
    );
  });

  it('still signs out when setOffline fails', async () => {
    m(setOffline).mockRejectedValue(new Error('denied'));
    m(signOut).mockResolvedValue(undefined);
    await expect(logoutUser()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalled();
  });
});

describe('logoutUser without user', () => {
  it('skips setOffline but still signs out', async () => {
    const fb = jest.requireMock('./firebase');
    const saved = fb.auth.currentUser;
    fb.auth.currentUser = null;
    m(signOut).mockResolvedValue(undefined);
    await logoutUser();
    fb.auth.currentUser = saved;
    expect(setOffline).not.toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });
});

describe('subscribeAuth', () => {
  it('maps user and returns the unsubscribe function', () => {
    const unsub = jest.fn();
    m(onAuthStateChanged).mockReturnValue(unsub);
    const cb = jest.fn();
    const result = subscribeAuth(cb);
    const handler = m(onAuthStateChanged).mock.calls[0][1];
    handler({ uid: 'a', displayName: 'Bo', email: 'bo@x.com' });
    handler({ uid: 'b', displayName: null, email: 'cat@x.com' });
    handler(null);
    expect(cb).toHaveBeenNthCalledWith(1, {
      uid: 'a',
      name: 'Bo',
      email: 'bo@x.com',
    });
    expect(cb).toHaveBeenNthCalledWith(2, {
      uid: 'b',
      name: 'cat',
      email: 'cat@x.com',
    });
    expect(cb).toHaveBeenNthCalledWith(3, null);
    result();
    expect(unsub).toHaveBeenCalled();
  });
});
