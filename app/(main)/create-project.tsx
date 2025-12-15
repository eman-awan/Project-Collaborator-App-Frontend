import { createProject, CreateProjectData } from '@/api/projectApi';
import { useFetchProjectCategories } from '@/api/projects/categoriesApi';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemedText } from '@/components/ThemedText';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Fonts } from '@/fonts/font';
import { useThemedStyle } from '@/hooks/useThemedStyle';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';


export default function CreateProject() {
  const theme = useAppSelector(state => state.theme.mode);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!form.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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

  const handleSubmitProject = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateProjectData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        tags: tags,
        requiredSkills: skills,
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
      };

      const response = await createProject(payload);

      Alert.alert(
        'Success! 🎉',
        'Your project has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setForm({
                title: '',
                description: '',
                category: '',
                startDate: undefined,
                endDate: undefined,
              });
              setTags([]);
              setSkills([]);
              setTagInput('');
              setSkillInput('');
              setErrors({});
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create project. Please try again.';
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const categoryFetch = useFetchProjectCategories();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" style={styles.container}>
          <HStack style={styles.backBox}>
            <Button onPress={() => router.back()}>
              <Icon as={ArrowLeft} size="xl" stroke={AppColor.icons[theme]} />
            </Button>
          </HStack>
          <ThemedText lightColor="black" darkColor="white" style={styles.title}>
            CREATE PROJECT
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Fill in the details below to create your project
          </ThemedText>

          <FormControl style={styles.formControl}>
            <VStack style={{ gap: 16 }}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Project Title *
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={[inputContainerStyle, errors.title && { borderColor: '#EF4444', borderWidth: 2 }]} variant="outline" size="md">
                  <InputField
                    style={inputFieldStyle}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="Enter a catchy project title"
                    value={form.title}
                    onChangeText={text => {
                      setForm(prev => ({ ...prev, title: text }));
                      if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                    }}
                  />
                </Input>
                {errors.title && (
                  <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.errorText}>
                    {errors.title}
                  </ThemedText>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Description *
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={[inputContainerStyle, { height: 100, alignItems: 'flex-start' }, errors.description && { borderColor: '#EF4444', borderWidth: 2 }]} variant="outline" size="md">
                  <InputField
                    style={[inputFieldStyle, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="Describe your project goals and vision..."
                    value={form.description}
                    onChangeText={text => {
                      setForm(prev => ({ ...prev, description: text }));
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    multiline
                    numberOfLines={4}
                  />
                </Input>
                {errors.description && (
                  <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.errorText}>
                    {errors.description}
                  </ThemedText>
                )}
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Category *
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                {/* <Input style={[inputContainerStyle, errors.category && { borderColor: '#EF4444', borderWidth: 2 }]} variant="outline" size="md">
                  <InputField
                    style={inputFieldStyle}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="e.g., Web Development, Mobile App, AI/ML"
                    value={form.category}
                    onChangeText={text => {
                      setForm(prev => ({ ...prev, category: text }));
                      if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                    }}
                  />
                </Input> */}
                <View
                  style={[
                    inputContainerStyle,
                    errors.category && { borderColor: '#EF4444', borderWidth: 2 },
                    { borderRadius: 4, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 8 },
                  ]}
                >
                  <Picker
                    selectedValue={form.category}
                    onValueChange={(itemValue) => setForm({ ...form, category: itemValue })}
                    style={{ height: 60, width: '100%' }}
                  >
                    <Picker.Item label="Select category..." value="" />
                    {categoryFetch?.data?.map(cat => (
                      <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                    ))}
                  </Picker>
                </View>
                {categoryFetch?.error && (
                  <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.errorText}>
                    {categoryFetch?.error?.message}
                  </ThemedText>
                )}
              </View>

              {/* Tags */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Tags
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>
                <Input style={inputContainerStyle} variant="outline" size="md">
                  <InputField
                    style={inputFieldStyle}
                    placeholderTextColor={placeholderTextColor}
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                </Input>
                {tags.length > 0 && (
                  <View style={styles.badgeContainer}>
                    {tags.map((tag, index) => (
                      <View key={index} style={badgeStyle}>
                        <ThemedText lightColor="white" darkColor="white" style={styles.badgeText}>
                          {tag}
                        </ThemedText>
                        <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                          <ThemedText lightColor="white" darkColor="white" style={styles.badgeClose}>
                            ✕
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Required Skills */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Required Skills
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

              {/* Start Date */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      Start Date
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>

                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={[inputContainerStyle, errors.startDate && { borderColor: '#EF4444', borderWidth: 2 }]}
                >
                  <ThemedText
                    style={[
                      inputFieldStyle,
                      {
                        color: form.startDate ? (theme === 'dark' ? 'white' : 'black') : placeholderTextColor,
                      },
                    ]}
                  >
                    {form.startDate ? form.startDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Select Start Date'}
                  </ThemedText>
                </TouchableOpacity>

                {errors.startDate && (
                  <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.errorText}>
                    {errors.startDate}
                  </ThemedText>
                )}

                {showStartPicker && (
                  <DateTimePicker
                    value={form.startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowStartPicker(false);
                      if (selectedDate) {
                        setForm(prev => ({ ...prev, startDate: selectedDate }));
                        if (errors.startDate) setErrors(prev => ({ ...prev, startDate: '' }));
                      }
                    }}
                  />
                )}
              </View>

              {/* End Date */}
              <View style={styles.inputGroup}>
                <FormControlLabel>
                  <FormControlLabelText>
                    <ThemedText lightColor="black" darkColor="white" style={styles.labelStyle}>
                      End Date
                    </ThemedText>
                  </FormControlLabelText>
                </FormControlLabel>

                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={[inputContainerStyle, errors.endDate && { borderColor: '#EF4444', borderWidth: 2 }]}
                >
                  <ThemedText
                    style={[
                      inputFieldStyle,
                      {
                        color: form.endDate ? (theme === 'dark' ? 'white' : 'black') : placeholderTextColor,
                      },
                    ]}
                  >
                    {form.endDate ? form.endDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Select End Date'}
                  </ThemedText>
                </TouchableOpacity>

                {errors.endDate && (
                  <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.errorText}>
                    {errors.endDate}
                  </ThemedText>
                )}

                {showEndPicker && (
                  <DateTimePicker
                    value={form.endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={form.startDate || new Date()}
                    onChange={(event, selectedDate) => {
                      setShowEndPicker(false);
                      if (selectedDate) {
                        setForm(prev => ({ ...prev, endDate: selectedDate }));
                        if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
                      }
                    }}
                  />
                )}
              </View>

              {/* Submit Button */}
              <Box width="100%" style={{ marginTop: 20 }}>
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <AuthButton onPress={handleSubmitProject} disabled={isLoading}>
                    {isLoading ? 'Creating Project...' : 'Create Project'}
                  </AuthButton>
                </LinearGradient>
              </Box>
            </VStack>
          </FormControl>
        </VStack>
      </ScrollView>
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
  backBox: {
    marginBottom: 5,
    width: "100%",
    padding: 10,
    paddingLeft: 18,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  title: {
    fontSize: 40,
    lineHeight: 42,
    marginBottom: 16,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  formControl: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 60,
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
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  gradientButton: {
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});