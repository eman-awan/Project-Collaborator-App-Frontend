import { updateUserAvatarUrlApi, updateUserProfileApi } from '@/api/authApi';
import CloudinaryService from '@/api/cloudinary/cloudinary.service';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { ProjectNavigationProps } from '@/routes/ProjectNavigationProps';
import { updateAvatarUrl, updateProfile } from '@/store/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { ViewStyle } from '@expo/html-elements/build/primitives/View';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { Settings } from "lucide-react-native";
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const { firstName, lastName, email, phoneNumber, avatarUrl } = useAppSelector(
    state => state.auth
  );
  const navigator = useNavigation<ProjectNavigationProps>();
  const theme = useAppSelector(state => state.theme.mode);
  const dispatch = useAppDispatch()

  const themedStyles = useThemedStyle<ViewStyle>(
    styles.lightContainer,
    styles.darkContainer,
    styles.common
  );

  const [isEditing, setIsEditing] = useState(false);

  const [localFirstName, setLocalFirstName] = useState(firstName ?? '');
  const [localLastName, setLocalLastName] = useState(lastName ?? '');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber ?? '');

  // react-query mutation
  const { mutate: updateProfileMutate, isPending: isLoading } = useMutation({
    mutationFn: updateUserProfileApi,
    onSuccess: (data) => {
      dispatch(updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      }));
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to update profile');
    }
  });

  const saveProfile = () => {
    updateProfileMutate({
      firstName: localFirstName,
      lastName: localLastName,
      phoneNumber: localPhoneNumber,
    });
  };

  const cancelEdit = () => {
    setLocalFirstName(firstName ?? '');
    setLocalLastName(lastName ?? '');
    setLocalPhoneNumber(phoneNumber ?? '');
    setIsEditing(false);
  };

  const { mutate: updateAvatarUrlMutate } = useMutation({
    mutationFn: updateUserAvatarUrlApi,
    onSuccess: (data: { avatarUrl: string }) => {
      dispatch(updateAvatarUrl(data.avatarUrl));
    },
    onError: (error: any) => {
      console.error('Failed to update avatar URL:', error);
      alert(error?.message || 'Failed to upload Profile Image');
      // Optional: show toast or alert here
    }
  });


  const pickAndUploadImage = async () => {
    try {
      // Open image library with Expo ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,   // optional: lets user crop/resize
        quality: 1,
      });

      if (result.canceled) return; // user cancelled

      const asset = result.assets[0];
      if (!asset.uri) return;
      const uploadedUrl = await CloudinaryService.uploadImage(asset.uri, 'image/jpeg');

      // Call mutation to update backend
      updateAvatarUrlMutate(uploadedUrl);

    } catch (error) {
      console.warn('Image upload failed', error);
      alert('Failed to upload image');
    }
  };

  const iconColor = AppColor.icons[theme];

  return (
    <ScrollView contentContainerStyle={[themedStyles, { padding: 20 }]}>
      <View style={styles.profileHeader}>
        <HStack width={"100%"} justifyContent="flex-end" alignItems="center">
          {/* <Button onPress={() => navigator.goBack()}>
            <Icon as={ArrowLeft} size="xl" color={iconColor} />
          </Button> */}
          <Button onPress={() => navigator.navigate("settings")}>
            <Icon as={Settings} size="xl" color={iconColor} />
          </Button>
        </HStack>
        <ButtonGroup>
          <TouchableOpacity onPress={pickAndUploadImage}>
            <Image
              source={{
                uri: avatarUrl
                  ? `${avatarUrl}?t=${new Date().getTime()}`
                  : 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </ButtonGroup>
        <Text
          style={[
            styles.nameText,
            { color: theme === 'light' ? '#000' : '#fff' },
          ]}
        >
          {firstName && lastName ? `${firstName} ${lastName}` : 'Guest User'}
        </Text>
        <Text
          style={[
            styles.emailText,
            { color: theme === 'light' ? '#555' : '#ccc' },
          ]}
        >
          {email || 'No email provided'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: theme === 'light' ? '#333' : '#eee' }]}>
          Personal Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme === 'light' ? '#444' : '#bbb' }]}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: theme === 'light' ? '#000' : '#fff' }]}
              value={localFirstName}
              onChangeText={setLocalFirstName}
              autoCapitalize="words"
            />
          ) : (
            <Text style={[styles.value, { color: theme === 'light' ? '#000' : '#fff' }]}>
              {firstName || '-'}
            </Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme === 'light' ? '#444' : '#bbb' }]}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: theme === 'light' ? '#000' : '#fff' }]}
              value={localLastName}
              onChangeText={setLocalLastName}
              autoCapitalize="words"
            />
          ) : (
            <Text style={[styles.value, { color: theme === 'light' ? '#000' : '#fff' }]}>
              {lastName || '-'}
            </Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme === 'light' ? '#444' : '#bbb' }]}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: theme === 'light' ? '#000' : '#fff' }]}
              value={localPhoneNumber}
              onChangeText={setLocalPhoneNumber}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.value, { color: theme === 'light' ? '#000' : '#fff' }]}>
              {phoneNumber || '-'}
            </Text>
          )}
        </View>
      </View>

      {/* Buttons */}
      {!isEditing ? (
        <Button backgroundColor={AppColor.button[theme]} style={styles.editButton} onPress={() => setIsEditing(true)}>
          <ButtonText style={styles.editButtonText}>Edit Profile</ButtonText>
        </Button>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
          <Button
            backgroundColor="green"
            style={[styles.editButton, { flex: 1, marginRight: 5 }]}
            onPress={saveProfile}
            disabled={isLoading}
          >
            <ButtonText style={styles.editButtonText}>{isLoading ? 'Saving...' : 'Save'}</ButtonText>
          </Button>

          <Button
            backgroundColor="red"
            style={[styles.editButton, { flex: 1, marginLeft: 5 }]}
            onPress={cancelEdit}
            disabled={isLoading}
          >
            <ButtonText style={styles.editButtonText}>Cancel</ButtonText>
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  common: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    fontSize: 14,
    minWidth: 150,
  },
  infoCard: {
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
