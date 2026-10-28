import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mapAuthError, registerUser } from '../../../services/auth-service';
import { icons } from '../../../theme/icons';
import { spacing } from '../../../theme/metrics';
import type { RootStackParamList } from '../../../navigation/types';
import { validateRegister } from '../validation';

type TextInputRef = React.ComponentRef<typeof RNTextInput>;
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Field = 'name' | 'email' | 'password' | 'confirm';

export function RegisterScreen({ navigation }: Props) {
  const theme = useTheme();
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
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Avatar.Icon
              size={64}
              icon={icons.account}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Đăng ký
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Tạo tài khoản ChatApp mới
            </Text>
          </View>

          <TextInput
            mode="outlined"
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
            left={<TextInput.Icon icon={icons.account} />}
            style={styles.input}
          />
          <HelperText type="error" visible={show('name')}>
            {errors.name}
          </HelperText>

          <TextInput
            mode="outlined"
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
            left={<TextInput.Icon icon={icons.email} />}
            style={styles.input}
          />
          <HelperText type="error" visible={show('email')}>
            {errors.email}
          </HelperText>

          <TextInput
            mode="outlined"
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
            left={<TextInput.Icon icon={icons.lock} />}
            right={
              <TextInput.Icon
                icon={showPassword ? icons.eyeOff : icons.eye}
                accessibilityLabel={
                  showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                }
                onPress={() => setShowPassword(s => !s)}
              />
            }
            style={styles.input}
          />
          <HelperText type="error" visible={show('password')}>
            {errors.password}
          </HelperText>

          <TextInput
            mode="outlined"
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
            left={<TextInput.Icon icon={icons.lockCheck} />}
            style={styles.input}
          />
          <HelperText type="error" visible={show('confirm')}>
            {errors.confirm}
          </HelperText>

          <HelperText type="error" visible={!!formError} style={styles.formError}>
            {formError}
          </HelperText>

          <Button
            mode="contained"
            icon={icons.check}
            onPress={submit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.xs,
  },
  formError: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
