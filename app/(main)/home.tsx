import { getMyApplications } from "@/api/applicationApi";
import { getAllProjects, getMyProjects, Project } from "@/api/projectApi";
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
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";


export default function Home() {
  const theme = useAppSelector(state => state.theme.mode);
  const firstName = useAppSelector(state => state.auth.firstName);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  });

  const { data: myProjects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
  });

  const { data: myApplications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
  });

  const activeProjectsCount = myProjects?.length || 0;
  const proposalsSentCount = myApplications?.length || 0;
  const joinedProjectsCount = myApplications?.filter(app => app.status === 'ACCEPTED').length || 0;

  // Filter projects based on search query
  const filteredProjects = projects?.filter(project => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title.toLowerCase().includes(query);
    const tagsMatch = project.tags?.some(tag => tag.toLowerCase().includes(query));
    const skillsMatch = project.requiredSkills?.some(skill => skill.toLowerCase().includes(query));
    
    return titleMatch || tagsMatch || skillsMatch;
  });

  const handleJoinProject = (project: Project) => {
    router.push({
      pathname: '/(main)/apply-project',
      params: { project: JSON.stringify(project) }
    });
  };

  const cardStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
    { backgroundColor: '#1F2937', borderColor: '#374151' },
    { 
      borderRadius: 12, 
      padding: 16, 
      marginBottom: 16,
      marginHorizontal: 16,
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

        {/* Footer: Owner and Stats */}
        <View style={styles.footer}>
          <View style={styles.ownerInfo}>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.ownerText}>
              By {item.owner.firstName} {item.owner.lastName}
            </ThemedText>
          </View>
          {item._count && (
            <View style={styles.stats}>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.statText}>
                {item._count.memberships} members · {item._count.applications} applicants
              </ThemedText>
            </View>
          )}
        </View>

        {/* Dates */}
        <View style={styles.dateContainer}>
          <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
            {' - '}
            {new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
        </View>

        {/* Join Button */}
        <LinearGradient
          colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.joinButtonGradient}
        >
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinProject(item)}
          >
            <ThemedText lightColor="white" darkColor="white" style={styles.joinButtonText}>
              Join Project
            </ThemedText>
          </TouchableOpacity>
        </LinearGradient>
      </VStack>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.emptyText}>
        No projects available yet
      </ThemedText>
      <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
        Create your first project to get started!
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

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: AppColor.primary.light },
    { backgroundColor: AppColor.primary.dark },
    { paddingHorizontal: 12, height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }
  );

  const modalBackgroundStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF' },
    { backgroundColor: '#1F2937' },
    { borderRadius: 16, padding: 20, maxHeight: '85%', width: '90%' }
  );

  const placeholderTextColor = theme !== 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
          <View>
            {/* Stats Header Section */}
            <LinearGradient
              colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, AppColor.primary.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsHeader}
            >
              <ThemedText lightColor="white" darkColor="white" style={styles.greeting}>
                Hello, {firstName || 'Developer'}!
              </ThemedText>
              <ThemedText lightColor="rgba(255,255,255,0.9)" darkColor="rgba(255,255,255,0.9)" style={styles.tagline}>
                Find amazing projects to collaborate on
              </ThemedText>
              
              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                {/* Active Projects */}
                <View style={styles.statCard}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <ThemedText lightColor="#3B82F6" darkColor="#3B82F6" style={styles.icon}>📁</ThemedText>
                  </View>
                  <ThemedText lightColor="#111827" darkColor="#111827" style={styles.statNumber}>
                    {activeProjectsCount}
                  </ThemedText>
                  <ThemedText lightColor="#6B7280" darkColor="#6B7280" style={styles.statLabel}>
                    Active Projects
                  </ThemedText>
                </View>

                {/* Proposals Sent */}
                <View style={styles.statCard}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <ThemedText lightColor="#10B981" darkColor="#10B981" style={styles.icon}>📈</ThemedText>
                  </View>
                  <ThemedText lightColor="#111827" darkColor="#111827" style={styles.statNumber}>
                    {proposalsSentCount}
                  </ThemedText>
                  <ThemedText lightColor="#6B7280" darkColor="#6B7280" style={styles.statLabel}>
                    Proposals Sent
                  </ThemedText>
                </View>

                {/* Joined Projects */}
                <View style={styles.statCard}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    <ThemedText lightColor="#8B5CF6" darkColor="#8B5CF6" style={styles.icon}>👥</ThemedText>
                  </View>
                  <ThemedText lightColor="#111827" darkColor="#111827" style={styles.statNumber}>
                    {joinedProjectsCount}
                  </ThemedText>
                  <ThemedText lightColor="#6B7280" darkColor="#6B7280" style={styles.statLabel}>
                    Joined Projects
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>

            {/* Section Title */}
            <View style={styles.sectionTitleContainer}>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.sectionTitle}>
                Discover Projects
              </ThemedText>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  statsHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
    right: 28,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerText: {
    fontSize: 13,
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
  joinButtonGradient: {
    borderRadius: 8,
    marginTop: 8,
  },
  joinButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
});