import { getMyProjects, Project } from "@/api/projectApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { VStack } from "@/components/ui/vstack";
import { Fonts } from "@/fonts/font";
import { useThemedStyle } from "@/hooks/useThemedStyle";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";

const { width } = Dimensions.get('window');

export default function MyProjects() {
  const theme = useAppSelector(state => state.theme.mode);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
  });

  // Filter projects based on search query
  const filteredProjects = projects?.filter(project => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title.toLowerCase().includes(query);
    const tagsMatch = project.tags?.some(tag => tag.toLowerCase().includes(query));
    const skillsMatch = project.requiredSkills?.some(skill => skill.toLowerCase().includes(query));
    
    return titleMatch || tagsMatch || skillsMatch;
  });

  const cardStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
    { backgroundColor: '#1F2937', borderColor: '#374151' },
    { 
      borderRadius: 12, 
      padding: 20, 
      marginBottom: 16, 
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  );

  const badgeStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#5F4366' },
    { backgroundColor: AppColor.primary.light },
    { 
      paddingHorizontal: 10, 
      paddingVertical: 4, 
      borderRadius: 12, 
      marginRight: 6, 
      marginBottom: 6 
    }
  );

  const skillBadgeStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#E5E7EB' },
    { backgroundColor: '#374151' },
    { 
      paddingHorizontal: 10, 
      paddingVertical: 4, 
      borderRadius: 12, 
      marginRight: 6, 
      marginBottom: 6 
    }
  );

  const renderProjectCard = ({ item }: { item: Project }) => (
    <View style={cardStyle}>
      <VStack style={{ gap: 12 }}>
        {/* Title and Category */}
        <View>
          <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.projectTitle}>
            {item.title}
          </ThemedText>
          <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.category}>
            {item.category}
          </ThemedText>
        </View>

        {/* Description */}
        <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.description} numberOfLines={3}>
          {item.description}
        </ThemedText>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.sectionLabel}>
              Tags
            </ThemedText>
            <View style={styles.badgeContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={badgeStyle}>
                  <ThemedText lightColor="white" darkColor="white" style={styles.badgeText}>
                    {tag}
                  </ThemedText>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={badgeStyle}>
                  <ThemedText lightColor="white" darkColor="white" style={styles.badgeText}>
                    +{item.tags.length - 3}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Required Skills */}
        {item.requiredSkills && item.requiredSkills.length > 0 && (
          <View>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.sectionLabel}>
              Required Skills
            </ThemedText>
            <View style={styles.badgeContainer}>
              {item.requiredSkills.slice(0, 3).map((skill, index) => (
                <View key={index} style={skillBadgeStyle}>
                  <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.skillBadgeText}>
                    {skill}
                  </ThemedText>
                </View>
              ))}
              {item.requiredSkills.length > 3 && (
                <View style={skillBadgeStyle}>
                  <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.skillBadgeText}>
                    +{item.requiredSkills.length - 3}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Stats */}
        {item._count && (
          <View style={styles.stats}>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.statText}>
              {item._count.memberships} members · {item._count.applications} applicants
            </ThemedText>
          </View>
        )}

        {/* Dates */}
        <View style={styles.dateContainer}>
          <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
            {' - '}
            {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButtonOutline, { borderColor: theme === 'light' ? '#5F4366' : AppColor.primary.light }]}
            onPress={() => router.push({ pathname: '/(main)/project-proposals', params: { id: item.id } })}
            activeOpacity={0.7}
          >
            <ThemedText lightColor="#5F4366" darkColor={AppColor.primary.light} style={styles.actionButtonText}>
              Proposals
            </ThemedText>
          </TouchableOpacity>

          <LinearGradient
            colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({ pathname: '/(main)/manage-tasks', params: { id: item.id } })}
              activeOpacity={0.7}
            >
              <ThemedText lightColor="white" darkColor="white" style={styles.actionButtonText}>
                Manage Tasks
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </VStack>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.emptyText}>
        No projects created yet
      </ThemedText>
      <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
        Click the create button above to start your first project!
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.emptyText}>
        Failed to load projects
      </ThemedText>
      <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
        Pull down to refresh
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <FlatList
        data={filteredProjects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.headerTitle}>
                  My Projects
                </ThemedText>
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.headerSubtitle}>
                  Projects you've created
                </ThemedText>
              </View>
              <LinearGradient
                colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => router.push('/(main)/create-project')}
                >
                  <ThemedText lightColor="white" darkColor="white" style={styles.createButtonText}>
                    + Create
                  </ThemedText>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme === 'light' ? '#F9FAFB' : '#374151',
                    borderColor: theme === 'light' ? '#E5E7EB' : '#4B5563',
                    color: theme === 'light' ? '#111827' : '#F9FAFB',
                  }
                ]}
                placeholder="Search by title, tags, or skills..."
                placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#6B7280'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.clearButtonText}>
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
          </View>
        ) : error ? renderError() : renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme === 'light' ? '#5F4366' : AppColor.primary.light}
          />
        }
      />
      <ThemeToggleButton />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingBottom: 16,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  createButtonGradient: {
    borderRadius: 8,
    marginLeft: 12,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  searchContainer: {
    marginTop: 16,
    position: 'relative',
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.Instrument.Serif.Regular,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  skillBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  dateContainer: {
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
});
