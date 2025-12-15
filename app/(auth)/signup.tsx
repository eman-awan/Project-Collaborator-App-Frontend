import { checkIfEmailInUse } from '@/api/authApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Box } from '@/components/ui/box';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { EyeIcon, EyeOffIcon, Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { usePageUnmount } from '@/hooks/usePageUnmount';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { AuthNavigationProp } from '@/routes/AuthNavigationProp';
import { AuthSchema } from '@/schema/auth/auth.schema';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useAuth } from './auth-provider';

const SignUpImage = require('../../assets/images/auth/signup-logo.png');

export default function SignUp() {
  const theme = useAppSelector(state => state.theme.mode);
  const navigation = useNavigation<AuthNavigationProp>();
  const [showPassword, setShowPassword] = React.useState(false);
  const { auth, setAuth } = useAuth();
  const [email, setEmail] = useState(auth.email);
  const [password, setPassword] = useState(auth.password);
  const isActive = useRef<boolean>(true);

  const { mutate, reset, isPending } = useMutation({
    mutationFn: checkIfEmailInUse,
    onSuccess: (available: boolean) => {
      const isActivePage = isActive.current;
      if (!isActivePage)
        return;      
      if (isActivePage && available) {
        navigation.navigate('SignUpDetails');
      } else {
        alert('Email already in use');
      }
    },
    onError: (error: Error) => {
      console.error('Email check error:', error);
      alert(error.message || 'Something went wrong');
    }
  });


  const handleContinue = () => {
    const result = AuthSchema.safeParse({ email, password });
    if (!result.success) {
      // Get the first error message
      const message = result.error.issues[0].message;
      alert(message);
      return;
    }

    setAuth(prev => ({
      ...prev,
      email,
      password,
    }));
    mutate(email);
  };

  usePageUnmount(() => {
    isActive.current = false;
    reset();
  }, [reset]);

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: AppColor.primary.light },
    { backgroundColor: AppColor.primary.dark },
    { paddingHorizontal: 12, height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
  );

  const inputFieldStyle = useThemedStyle<TextStyle>(
    { color: 'black' },
    { color: 'white' },
    { height: 48, fontSize: 16, flex: 1 }
  );

  const placeholderTextColor = theme !== 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 80, paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack space="md" style={styles.container}>
          <ThemedText lightColor="black" darkColor="white" style={styles.title}>
            Create Account
          </ThemedText>
          {/* <ThemedText style={styles.subtitle}>Create Your Account</ThemedText> */}

          <Image source={SignUpImage} style={styles.image} resizeMode="contain" />
          <FormControl style={styles.formControl}>
            <VStack style={{ rowGap: 10 }}>
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Email
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter Your Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </Input>

              {/* Password Field */}
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Password
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <InputSlot onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    color={inputFieldStyle.color as string}
                    as={showPassword ? EyeOffIcon : EyeIcon}
                    style={styles.eyeIcon}
                  />
                </InputSlot>
              </Input>
              <Box width="100%" alignItems='center' marginTop={30} style={{ display: 'flex' }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <AuthButton isLoading={isPending} disabled={isPending} onPress={handleContinue} >
                    Sign Up
                  </AuthButton>
                </LinearGradient>
              </Box>
              <HStack
                alignSelf="center"
                marginTop={20}
                justifyContent="center"
                columnGap={7}
              >
                <ThemedText lightColor='black' darkColor='white'>
                  Already got an account?
                </ThemedText>
                <ThemedText lightColor={AppColor.links.light} darkColor={AppColor.links.dark} onPress={() => navigation.navigate('SignIn')}>
                  Sign In
                </ThemedText>
              </HStack>
            </VStack>
          </FormControl>
          <ThemeToggleButton />
        </VStack>
      </ScrollView >
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 42,
    lineHeight: 42,
    marginBottom: 4,
    fontFamily: Fonts.Instrument.Serif.Regular
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 5,
    fontFamily: Fonts.Instrument.Serif.Regular
  },
  image: {
    width: 280,
    height: 140,
    marginVertical: 10,
  },
  formControl: {
    width: 300,
  },
  labelStyle: {
    fontSize: 17
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  formSubmitButton: {
    backgroundColor: 'transparent',
    display: 'flex',
    paddingVertical: 7,
    width: '100%',
  }
});
