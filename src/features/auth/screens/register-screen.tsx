import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mapAuthError, registerUser } from '../../../services/auth-service';
import { flatInputProps, flatStyles } from '../../../theme/component-styles';
import { icons } from '../../../theme/icons';
import type { RootStackParamList } from '../../../navigation/types';
import { validateRegister } from '../validation';

type TextInputRef = React.ComponentRef<typeof RNTextInput>;
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Field = 'name' | 'email' | 'password' | 'confirm';

export function RegisterScreen({ navigation }: Props) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [dirty, setDirty] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<TextInputRef>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const passwordRef = useRef<TextInputRef>(null);
  const confirmRef = useRef<TextInputRef>(null);

  const errors = validateRegister(values);
  const show = (f: Field) => (touched[f] || submitted) && !!errors[f];
  const set = (f: Field) => (text: string) => {
    setValues(v => ({ ...v, [f]: text }));
    setDirty(d => ({ ...d, [f]: true }));
    setFormError(null);
  };
  // Chi danh dau touched khi nguoi dung da go; bo qua blur tu he thong luc khoi dong.
  const blur = (f: Field) => () => {
    if (dirty[f]) {
      setTouched(t => ({ ...t, [f]: true }));
    }
  };

  const submit = async () => {
    if (submitting) {
      return;
    }
    setSubmitted(true);
    setFormError(null);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      await registerUser(values.name, values.email, values.password);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (mounted.current) {
        setFormError(code ? mapAuthError(code) : (e as Error).message);
      }
    } finally {
      if (mounted.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          Đăng ký
        </Text>
        <TextInput
          {...flatInputProps}
          label="Tên hiển thị"
          autoComplete="name"
          textContentType="name"
          value={values.name}
          onChangeText={set('name')}
          onBlur={blur('name')}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={show('name')}
          disabled={submitting}
        />
        <HelperText type="error" visible={show('name')}>
          {errors.name}
        </HelperText>
        <TextInput
          {...flatInputProps}
          ref={emailRef}
          label="Email"
          value={values.email}
          onChangeText={set('email')}
          onBlur={blur('email')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={show('email')}
          disabled={submitting}
        />
        <HelperText type="error" visible={show('email')}>
          {errors.email}
        </HelperText>
        <TextInput
          {...flatInputProps}
          ref={passwordRef}
          label="Mật khẩu"
          autoComplete="password-new"
          textContentType="newPassword"
          value={values.password}
          onChangeText={set('password')}
          onBlur={blur('password')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          error={show('password')}
          disabled={submitting}
          right={
            <TextInput.Icon
              icon={showPassword ? icons.eyeOff : icons.eye}
              accessibilityLabel={
                showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
              }
              onPress={() => setShowPassword(s => !s)}
            />
          }
        />
        <HelperText type="error" visible={show('password')}>
          {errors.password}
        </HelperText>
        <TextInput
          {...flatInputProps}
          ref={confirmRef}
          label="Nhập lại mật khẩu"
          autoComplete="password-new"
          textContentType="newPassword"
          value={values.confirm}
          onChangeText={set('confirm')}
          onBlur={blur('confirm')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={show('confirm')}
          disabled={submitting}
        />
        <HelperText type="error" visible={show('confirm')}>
          {errors.confirm}
        </HelperText>
        <HelperText type="error" visible={!!formError} style={styles.formError}>
          {formError}
        </HelperText>
        <Button
          mode="contained"
          onPress={submit}
          loading={submitting}
          disabled={submitting}
          style={flatStyles.buttonShape}
          contentStyle={flatStyles.buttonContent}
        >
          Đăng ký
        </Button>
        <View style={styles.link}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            disabled={submitting}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { marginBottom: 24 },
  formError: { marginBottom: 8 },
  link: { alignItems: 'center', marginTop: 16 },
});
