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
import { loginUser, mapAuthError } from '../../../services/auth-service';
import { icons } from '../../../theme/icons';
import { spacing } from '../../../theme/metrics';
import type { RootStackParamList } from '../../../navigation/types';
import { validateLogin } from '../validation';

type TextInputRef = React.ComponentRef<typeof RNTextInput>;
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [dirty, setDirty] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInputRef>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const errors = validateLogin({ email, password });
  const showEmailError = (touched.email || submitted) && !!errors.email;
  const showPasswordError =
    (touched.password || submitted) && !!errors.password;

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
      await loginUser(email, password);
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
              icon={icons.chat}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Đăng nhập
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Chào mừng bạn đến với ChatApp
            </Text>
          </View>

          <TextInput
            mode="outlined"
            testID="login-email"
            label="Email"
            value={email}
            onChangeText={t => {
              setEmail(t);
              setDirty(d => ({ ...d, email: true }));
              setFormError(null);
            }}
            onBlur={() => dirty.email && setTouched(t => ({ ...t, email: true }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={showEmailError}
            disabled={submitting}
            left={<TextInput.Icon icon={icons.email} />}
            style={styles.input}
          />
          <HelperText type="error" visible={showEmailError}>
            {errors.email}
          </HelperText>

          <TextInput
            mode="outlined"
            testID="login-password"
            ref={passwordRef}
            label="Mật khẩu"
            value={password}
            onChangeText={t => {
              setPassword(t);
              setDirty(d => ({ ...d, password: true }));
              setFormError(null);
            }}
            onBlur={() =>
              dirty.password && setTouched(t => ({ ...t, password: true }))
            }
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={showPasswordError}
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
          <HelperText type="error" visible={showPasswordError}>
            {errors.password}
          </HelperText>

          <HelperText type="error" visible={!!formError} style={styles.formError}>
            {formError}
          </HelperText>

          <Button
            testID="login-submit"
            mode="contained"
            icon={icons.login}
            onPress={submit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
          >
            Đăng nhập
          </Button>

          <View style={styles.link}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={submitting}
            >
              Chưa có tài khoản? Đăng ký
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
