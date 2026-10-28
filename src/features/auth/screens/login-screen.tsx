import React, {useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import {Button, HelperText, Text, TextInput} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {loginUser, mapAuthError} from '../../../services/auth-service';
import {flatInputProps, flatStyles} from '../../../theme/component-styles';
import type {RootStackParamList} from '../../../navigation/types';
import {validateLogin} from '../validation';

type TextInputRef = React.ComponentRef<typeof RNTextInput>;
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({email: false, password: false});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInputRef>(null);

  const errors = validateLogin({email, password});
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
      const code = (e as {code?: string}).code;
      setFormError(code ? mapAuthError(code) : (e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          Đăng nhập
        </Text>
        <TextInput
          {...flatInputProps}
          testID="login-email"
          label="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched(t => ({...t, email: true}))}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={showEmailError}
          disabled={submitting}
        />
        <HelperText type="error" visible={showEmailError}>
          {errors.email}
        </HelperText>
        <TextInput
          {...flatInputProps}
          testID="login-password"
          ref={passwordRef}
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(t => ({...t, password: true}))}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={showPasswordError}
          disabled={submitting}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(s => !s)}
            />
          }
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
          onPress={submit}
          loading={submitting}
          disabled={submitting}
          style={flatStyles.buttonShape}
          contentStyle={flatStyles.buttonContent}>
          Đăng nhập
        </Button>
        <View style={styles.link}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            disabled={submitting}>
            Chưa có tài khoản? Đăng ký
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {flexGrow: 1, justifyContent: 'center', padding: 24},
  title: {marginBottom: 24},
  formError: {marginBottom: 8},
  link: {alignItems: 'center', marginTop: 16},
});
