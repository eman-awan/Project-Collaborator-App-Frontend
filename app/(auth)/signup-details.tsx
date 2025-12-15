import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Box } from '@/components/ui/box';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';

import { signupFn } from '@/api/authApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { AuthNavigationProp } from '@/routes/AuthNavigationProp';
import { AuthDetailsSchema } from '@/schema/auth/auth.details.schema';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useAuth } from './auth-provider';


export default function SignUpDetails() {
  const theme = useAppSelector(state => state.theme.mode);
  const navigation = useNavigation<AuthNavigationProp>();
  const { auth, setAuth } = useAuth();
  const [form, setForm] = useState<{ phoneNumber: string, firstName: string, lastName: string, }>({
    phoneNumber: '',
    firstName: '',
    lastName: ''
  })

  const { mutate, isPending } = useMutation({
    mutationFn: signupFn,
    onSuccess: () => {
      navigation.reset({
        index: 1,
        routes: [
          { name: 'SignIn' },
          { name: 'VerifyOtp' },
        ],
      });
    },
    onError: (error: Error) => {
      alert(error.message || 'Something went wrong');
    }
  });

  const handleCreateAccount = () => {
    const result = AuthDetailsSchema.safeParse(form);
    if (!result.success) {
      const message = result.error.issues[0].message;
      alert(message);
      return;
    }
    const newAuth = { ...auth, ...form };
    setAuth(newAuth);
    mutate(newAuth);
  }
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
            DETAILS
          </ThemedText>
          <ThemedText style={styles.subtitle}>Enter Your details to finish creating your account.</ThemedText>
          <FormControl style={styles.formControl}>
            <VStack style={{ rowGap: 10 }}>
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    First Name
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter Your First Name Here"
                  keyboardType="ascii-capable"
                  onChangeText={text => setForm({ ...form, firstName: text })}
                />
              </Input>
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Last Name
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter Your Last Name Here"
                  keyboardType="ascii-capable"
                  onChangeText={text => setForm({ ...form, lastName: text })}
                />
              </Input>

              {/* Password Field */}
              <FormControlLabel>
                <FormControlLabelText>
                  <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                    Phone Number
                  </ThemedText>
                </FormControlLabelText>
              </FormControlLabel>
              <Input style={inputContainerStyle} variant="outline" size="md">
                {/* <InputSlot style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Box style={styles.pickerContainer}>
                    <Picker
                      placeholder={form.countryCode}
                      selectedValue={form.countryCode}
                      dropdownIconColor="#RRGGBBAA"

                      onValueChange={(code) => setForm({ ...form, countryCode: code })}
                      mode="dialog" // inline dropdown
                      style={styles.picker}
                    >
                      {["+92", "+93", "+94"].map((code) => (
                        <Picker.Item key={code} label={code} value={code} />
                      ))}
                    </Picker>
                  </Box>
                </InputSlot> */}
                <InputField
                  style={inputFieldStyle}
                  placeholderTextColor={placeholderTextColor}
                  placeholder="Enter your Phone Number"
                  value={form.phoneNumber}
                  onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
                />
              </Input>
              <Box width="100%" alignItems='center' marginTop={30} style={{ display: 'flex' }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8, width: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <AuthButton isLoading={isPending} disabled={isPending} onPress={handleCreateAccount} >
                    Create Account
                  </AuthButton>
                </LinearGradient>
              </Box>
              <ThemedText lightColor='black' darkColor='white' fontSize={13} marginTop={30}>
                By clicking “Create Account” you agree to Collabry's
                <ThemedText fontSize={13} lightColor={AppColor.links.light} darkColor={AppColor.links.dark}> Privacy Policy </ThemedText>
                and
                <ThemedText fontSize={13} lightColor={AppColor.links.light} darkColor={AppColor.links.dark}> Terms & Conditions</ThemedText>
              </ThemedText>
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
    fontSize: 55,
    lineHeight: 56,
    marginBottom: 16,
    fontFamily: Fonts.Instrument.Serif.Regular
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    width: '70%',
    textAlign: 'center',
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
  },
  pickerContainer: {
    height: Platform.OS === 'ios' ? 44 : 50,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
  },
  picker: {
    width: 91,
    height: '100%',
    marginLeft: -12,
    marginRight: -12
  },
  phoneInput: {
    flex: 1,
    height: Platform.OS === 'ios' ? 44 : 50,
    fontSize: 16,
  },
});
