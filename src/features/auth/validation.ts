export type RegisterValues = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};
export type LoginValues = {email: string; password: string};

export type RegisterErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirm', string>
>;
export type LoginErrors = Partial<Record<'email' | 'password', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const emailError = (email: string): string | undefined =>
  EMAIL_RE.test(email.trim()) ? undefined : 'Email không hợp lệ.';

const passwordError = (password: string): string | undefined =>
  password.length >= MIN_PASSWORD ? undefined : 'Mật khẩu tối thiểu 6 ký tự.';

export function validateRegister(v: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const name = v.name.trim();
  if (name.length < 1) {
    errors.name = 'Vui lòng nhập tên.';
  } else if (name.length > 50) {
    errors.name = 'Tên tối đa 50 ký tự.';
  }
  const email = emailError(v.email);
  if (email) {
    errors.email = email;
  }
  const password = passwordError(v.password);
  if (password) {
    errors.password = password;
  }
  if (v.confirm !== v.password) {
    errors.confirm = 'Mật khẩu nhập lại không khớp.';
  }
  return errors;
}

export function validateLogin(v: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = emailError(v.email);
  if (email) {
    errors.email = email;
  }
  const password = passwordError(v.password);
  if (password) {
    errors.password = password;
  }
  return errors;
}
