import {validateLogin, validateRegister} from './validation';

const valid = {
  name: 'An',
  email: 'a@b.com',
  password: '123456',
  confirm: '123456',
};

describe('validateRegister', () => {
  it('flags empty name', () => {
    expect(validateRegister({...valid, name: '   '}).name).toBeDefined();
  });
  it('flags invalid email', () => {
    expect(validateRegister({...valid, email: 'abc'}).email).toBeDefined();
  });
  it('flags short password', () => {
    expect(validateRegister({...valid, password: '12345', confirm: '12345'}).password).toBe(
      'Mật khẩu tối thiểu 6 ký tự.',
    );
  });
  it('flags mismatched confirm', () => {
    expect(validateRegister({...valid, confirm: 'x'}).confirm).toBeDefined();
  });
  it('returns {} when valid', () => {
    expect(validateRegister(valid)).toEqual({});
  });
  it('accepts email with surrounding spaces', () => {
    expect(validateRegister({...valid, email: ' A@B.com '})).toEqual({});
  });
});

describe('validateLogin', () => {
  it('flags bad email and short password', () => {
    const e = validateLogin({email: 'x', password: '1'});
    expect(e.email).toBeDefined();
    expect(e.password).toBeDefined();
  });
  it('returns {} when valid', () => {
    expect(validateLogin({email: ' A@B.com ', password: '123456'})).toEqual({});
  });
});
