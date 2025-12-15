import { updateUserCategoryPreferences, useFetchProjectCategories } from '@/api/projects/categoriesApi';
import { ThemedText } from '@/components/ThemedText';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { Spinner } from '@/components/ui/spinner';
import { Fonts } from '@/fonts/font';
import { useAppSelector } from '@/store/hooks';
import AppColor from '@/utils/AppColor';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



export default function Onboarding() {
  const [selected, setSelected] = useState<number[]>([]);
  const theme = useAppSelector(state => state.theme.mode);
  const { data: cate, isLoading: isFetching, error } = useFetchProjectCategories();

  const categories = cate || [];
  const toggleSelect = (categoryId: number) => {
    setSelected(prev =>
      prev.includes(categoryId) ? prev.filter(i => i !== categoryId) : [...prev, categoryId]
    );
  };
  const { mutate, isPending: isUpdatingPref } = useMutation({
    mutationFn: updateUserCategoryPreferences,
    onSuccess: () => {
      router.replace("/(main)/MainTabs");
    },
    onError: (error: Error) => {
      alert(error.message || 'Something went wrong');
    }
  })

  const handleDone = () => mutate(selected)

  const isDisabled = selected.length === 0 || isFetching || isUpdatingPref;

  const isLoading = isFetching || isUpdatingPref;

  return (
    <LinearGradient
      colors={
        theme === 'light'
          ? ['#FFFFFF', '#F3F5F7']
          : [AppColor.primary.dark, '#333']
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText
            style={styles.title}
            lightColor={AppColor.themedText.light}
            darkColor={AppColor.themedText.dark}
          >
            Let’s Get Started
          </ThemedText>
          <ThemedText
            style={styles.subtitle}
            lightColor="#444"
            darkColor="#ddd"
          >
            What type of projects interest you?
          </ThemedText>
        </View>

        <View style={styles.interestContainer}>
          {!categories || isLoading ? (
            <View style={{ padding: 16, borderRadius: 8 }}>
              <Spinner style={{ backgroundColor: AppColor.primary[theme] as string }} />
            </View>
          ) : (
            categories.map(({ id, name }) => {
              const isSelected = selected.includes(id);

              return (
                <TouchableOpacity
                  key={id}
                  activeOpacity={0.8}
                  style={[
                    styles.interestButton,
                    isSelected && styles.selectedInterestButton,
                  ]}
                  onPress={() => toggleSelect(id)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      isSelected && styles.selectedInterestText,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <TouchableOpacity
          activeOpacity={isDisabled ? 1 : 0.8}
          style={styles.doneButton}
          onPress={handleDone}
          disabled={isDisabled}
        >
          <LinearGradient
            colors={
              isDisabled
                ? ['rgba(205, 227, 204, 0.7)', 'rgba(205, 227, 204, 0.7)']
                : ['#CDE3CC', '#CDE3CC']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneGradient}
          >
            <Text style={styles.doneText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed at bottom */}
      <View style={styles.themeToggleWrapper}>
        <ThemeToggleButton />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 120,
    paddingBottom: 60, // space for toggle button
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: Fonts.Instrument.Serif.Regular,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Fonts.Instrument.Sans.Bold,
    textAlign: 'center',
    marginTop: 10,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginHorizontal: 30,
    marginTop: 10,
  },
  interestButton: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedInterestButton: {
    backgroundColor: '#F3EFFF',
    borderColor: '#5F4366',
    shadowOpacity: 0.25,
  },
  interestText: {
    fontSize: 15,
    fontFamily: Fonts.Instrument.Sans.Bold,
    color: '#111',
  },
  selectedInterestText: {
    color: '#5F4366',
    fontFamily: Fonts.Instrument.Sans.Bold,
  },
  doneButton: {
    width: 280,
    marginTop: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  doneGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  doneText: {
    fontSize: 18,
    fontFamily: Fonts.Instrument.Sans.Bold,
    color: '#3A3A3A',
  },
  themeToggleWrapper: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});
