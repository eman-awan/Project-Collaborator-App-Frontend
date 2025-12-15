import { createApplication, CreateApplicationData } from '@/api/applicationApi';
import { Project } from '@/api/projectApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export default function ApplyProject() {
  const theme = useAppSelector(state => state.theme.mode);
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  
  // Parse project data from params
  const project: Project = params.project ? JSON.parse(params.project as string) : null;

  const [applicationForm, setApplicationForm] = useState({
    role: '',
    reasonForJoining: '',
    availability: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);

  const { mutate: submitApplication, isPending: isSubmitting } = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      Alert.alert('Success', 'Your application has been submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            router.back();
          }
        }
      ]);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit application';
      Alert.alert('Error', message);
    },
  });

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmitApplication = () => {
    if (!project) {
      Alert.alert('Error', 'Project information not found');
      return;
    }

    if (!applicationForm.role.trim()) {
      Alert.alert('Validation Error', 'Please enter your desired role');
      return;
    }

    if (skills.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one skill');
      return;
    }

    const payload: CreateApplicationData = {
      projectId: project.id,
      role: applicationForm.role.trim(),
      skills: skills,
      reasonForJoining: applicationForm.reasonForJoining.trim() || undefined,
      availability: applicationForm.availability.trim() || undefined,
    };

    submitApplication(payload);
  };

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

  const badgeStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#5F4366' },
    { backgroundColor: AppColor.primary.light },
    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8, marginBottom: 8 }
  );

  const dropdownItemStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB' },
    { backgroundColor: '#374151', borderBottomColor: '#4B5563' },
    { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 }
  );

  const dropdownContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
    { backgroundColor: '#1F2937', borderColor: '#4B5563' },
    { 
      borderRadius: 8, 
      borderWidth: 1, 
      marginTop: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  );

  const availabilityOptions = [
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Part Time', value: 'PART_TIME' },
    { label: 'Not Available', value: 'NOT_AVAILABLE' },
  ];

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText>Project not found</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Pressable 
        style={{ flex: 1 }} 
        onPress={() => showAvailabilityDropdown && setShowAvailabilityDropdown(false)}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <VStack space="md" style={styles.container}>
          <ThemedText lightColor="black" darkColor="white" style={styles.title}>
            APPLY TO PROJECT
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {project.title}
          </ThemedText>

          <FormControl style={styles.formControl}>
            <VStack style={{ gap: 16 }}>
              {/* Role */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Desired Role *
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={inputContainerStyle} variant="outline" size="md">
                  <InputField
                    style={inputFieldStyle}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="e.g., Developer, Designer, PM"
                    value={applicationForm.role}
                    onChangeText={(text) => setApplicationForm(prev => ({ ...prev, role: text }))}
                  />
                </Input>
              </View>

              {/* Skills */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Your Skills *
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={inputContainerStyle} variant="outline" size="md">
                  <InputField
                    style={inputFieldStyle}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChangeText={setSkillInput}
                    onSubmitEditing={handleAddSkill}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                </Input>
                {skills.length > 0 && (
                  <View style={styles.badgeContainer}>
                    {skills.map((skill, index) => (
                      <View key={index} style={badgeStyle}>
                        <ThemedText lightColor="white" darkColor="white" style={styles.badgeText}>
                          {skill}
                        </ThemedText>
                        <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                          <ThemedText lightColor="white" darkColor="white" style={styles.badgeClose}>
                            ✕
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Reason for Joining */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Why do you want to join?
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={[inputContainerStyle, { height: 100, alignItems: 'flex-start' }]} variant="outline" size="md">
                  <InputField
                    style={[inputFieldStyle, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="Share your motivation..."
                    value={applicationForm.reasonForJoining}
                    onChangeText={(text) => setApplicationForm(prev => ({ ...prev, reasonForJoining: text }))}
                    multiline
                    numberOfLines={4}
                  />
                </Input>
              </View>

              {/* Availability */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Availability
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Pressable 
                  onPress={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
                  style={inputContainerStyle}
                >
                  <ThemedText 
                    lightColor={applicationForm.availability ? 'black' : 'rgba(0,0,0,0.5)'}
                    darkColor={applicationForm.availability ? 'white' : 'rgba(255,255,255,0.5)'}
                    style={[inputFieldStyle, { paddingVertical: 0 }]}
                  >
                    {applicationForm.availability 
                      ? availabilityOptions.find(opt => opt.value === applicationForm.availability)?.label 
                      : 'Select Availability'}
                  </ThemedText>
                </Pressable>
                {showAvailabilityDropdown && (
                  <View style={dropdownContainerStyle}>
                    {availabilityOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          dropdownItemStyle,
                          index === availabilityOptions.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setApplicationForm(prev => ({ ...prev, availability: option.value }));
                          setShowAvailabilityDropdown(false);
                        }}
                      >
                        <ThemedText 
                          lightColor="black" 
                          darkColor="white"
                          style={{ fontSize: 16, fontFamily: Fonts.Instrument.Serif.Regular }}
                        >
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                >
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.cancelButtonText}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>

                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  <AuthButton onPress={handleSubmitApplication} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </AuthButton>
                </LinearGradient>
              </View>
            </VStack>
          </FormControl>
        </VStack>
      </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 8,
    fontFamily: Fonts.Instrument.Serif.Regular,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  formControl: {
    width: '100%',
    paddingHorizontal: 20,
  },
  labelStyle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  badgeClose: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  submitButtonGradient: {
    flex: 1,
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
