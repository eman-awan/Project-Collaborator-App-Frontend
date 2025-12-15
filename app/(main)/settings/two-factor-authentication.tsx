import { disableTwoFaApi, generateQRCode, verifyAndEnableTwoFa } from "@/api/authApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { disableTwoFa, enableTwoFa } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft, KeyIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function TwoFactorAuthentication() {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [qrVisible, setQrVisible] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [code, setCode] = useState<string>("");
  const theme = useAppSelector(state => state.theme.mode);
  const isTwoFactorAuthenticationEnabled = useAppSelector(state => state.auth.isTwoFactorAuthenticationEnabled);
  const dispatch = useAppDispatch();
  const [authUrl, setAuthUrl] = useState<string>('');

  const { mutate: createQRCode, isPending: isCreatingQRCode } = useMutation({
    mutationFn: generateQRCode,
    onSuccess: (data) => {
      setQrVisible(true);
      setQrCode(data.qrCode);
      setAuthUrl(data.authUrl);
    },
    onError: (error: Error) => {
      alert(error?.message || 'Something went wrong');
    }
  })

  const { mutate: verifyAndEnableMultiFa, isPending: isEnablingTwoFa } = useMutation({
    mutationFn: verifyAndEnableTwoFa,
    onSuccess: () => {
      alert('Your Two Fa has been enabled');
      dispatch(enableTwoFa());
      setQrVisible(false);
    },
    onError: (error: Error) => {
      alert(error?.message || 'Something went wrong');
    }
  })


  const { mutate: disableTwoFaMutate, isPending: isDisablingTwoFa } = useMutation({
    mutationFn: disableTwoFaApi,
    onSuccess: () => {
      setQrVisible(false);
      dispatch(disableTwoFa());
      setQrCode('');
    },
    onError: (error: Error) => {
      alert(error?.message || 'Something went wrong');
    }
  })

  const handleCreateAndShowQrCode = () => createQRCode();

  const handleDisableTwoFa = () => {
    if (!isTwoFactorAuthenticationEnabled)
      throw new Error('You have already disabled your Two Factor Authentication');
    disableTwoFaMutate();
  };


  const handleVerifyAndEnableTwoFa = () => verifyAndEnableMultiFa(code);

  const loading: boolean = isCreatingQRCode || isDisablingTwoFa || isEnablingTwoFa;
  const disabled: boolean = loading;

  return (
    <Box style={styles.container} backgroundColor={theme === 'dark' ? 'black' : 'white'}>
      <HStack style={styles.backBox}>
        <Button onPress={() => router.back()}>
          <Icon as={ArrowLeft} size="xl" stroke={AppColor.icons[theme]} />
        </Button>
      </HStack>
      <Box margin={20} padding={10} borderColor="white" style={styles.twoFaBox}>
        <HStack columnGap={10}>
          <KeyIcon />
          <ThemedText style={styles.title}>Two-Factor Authentication</ThemedText>
        </HStack>
        <ThemedText style={styles.description}>
          Add an extra layer of security to your account by enabling two-factor authentication (2FA).
        </ThemedText>

        {!isEnabled ? (
          <>
            {
              isTwoFactorAuthenticationEnabled ?
                <Button disabled={disabled} style={styles.enableButton} backgroundColor={"rgba(220,0,0,1)"} onPress={handleDisableTwoFa}>
                  <ButtonText style={styles.buttonText}>Disable 2FA</ButtonText>
                </Button>
                : !qrVisible ? (
                  <Button disabled={disabled} style={styles.enableButton} backgroundColor={AppColor.button[theme]} onPress={handleCreateAndShowQrCode}>
                    <ButtonText style={styles.buttonText}>Enable 2FA</ButtonText>
                  </Button>
                ) : (
                  <View style={styles.qrSection}>
                    <View style={styles.qrPlaceholder}>
                      {qrCode !== '' ? (
                        <Image
                          source={{ uri: qrCode }}
                          style={{ width: 200, height: 200 }}
                          resizeMode="contain"
                        />
                      ) : <Text style={styles.qrText}>QR Code here</Text>}
                    </View>
                    <VStack>
                      <ThemedText>
                        You may also add the following link in the authenticator app directly:
                      </ThemedText>

                      <Pressable onPress={() => Linking.openURL(authUrl)}>
                        <ThemedText
                          style={{ textDecorationLine: 'underline' }}
                          color={AppColor.links[theme]}
                        >
                          {authUrl}
                        </ThemedText>
                      </Pressable>
                    </VStack>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit code"
                      keyboardType="numeric"
                      value={code}
                      onChangeText={setCode}
                    />

                    <View style={styles.buttonGroup}>
                      <Button
                        disabled={disabled}
                        backgroundColor={AppColor.button[theme]}
                        style={styles.verifyButton}
                        onPress={handleVerifyAndEnableTwoFa}
                      >
                        <ButtonText style={styles.buttonText}>Verify & Enable</ButtonText>
                      </Button>

                      <Button
                        disabled={disabled}
                        style={styles.cancelButton}
                        onPress={() => setQrVisible(false)}
                      >
                        <ButtonText style={styles.cancelText}>Cancel</ButtonText>
                      </Button>
                    </View>
                  </View>
                )}
          </>
        ) : (
          <View style={styles.enabledSection}>
            <Text style={styles.enabledText}>
              Two Factor Authentication is enabled on your account
            </Text>
            <TouchableOpacity style={styles.disableButton} onPress={() => setIsEnabled(false)}>
              <Text style={styles.buttonText}>Disable 2FA</Text>
            </TouchableOpacity>
          </View>
        )}
        {loading && <Spinner size={50} style={styles.loadingSpinner} color={AppColor.button[theme]} />}
        <ThemeToggleButton />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    height: '100%'
  },
  backBox: {
    marginBottom: 5,
    width: "100%",
    padding: 10,
    paddingLeft: 18,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  twoFaBox: {
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  enableButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loadingSpinner: {
    marginTop: 40
  },
  qrSection: {
    alignItems: "center",
    gap: 10,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: "#e5e7eb",
    borderStyle: "dashed",
    borderColor: "#9ca3af",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  qrText: {
    color: "#6b7280",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  verifyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelText: {
    color: "#374151",
  },
  enabledSection: {
    alignItems: "center",
    gap: 10,
  },
  enabledText: {
    color: "#16a34a",
    fontSize: 16,
    textAlign: "center",
  },
  disableButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
});
