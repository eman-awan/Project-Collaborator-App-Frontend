import { acceptApplication, Application, rejectApplication } from "@/api/applicationApi";
import { getProjectById } from "@/api/projectApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { VStack } from "@/components/ui/vstack";
import { Fonts } from "@/fonts/font";
import { useThemedStyle } from "@/hooks/useThemedStyle";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

const { width } = Dimensions.get('window');

export default function ProjectProposals() {
  const theme = useAppSelector(state => state.theme.mode);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const projectId = parseInt(id);

  const { data: project, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      Alert.alert('Success', 'Application accepted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to accept application');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      Alert.alert('Success', 'Application rejected');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to reject application');
    },
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

  const handleAccept = (applicationId: number) => {
    Alert.alert(
      'Accept Application',
      'Are you sure you want to accept this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptMutation.mutate(applicationId) },
      ]
    );
  };

  const handleReject = (applicationId: number) => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => rejectMutation.mutate(applicationId) },
      ]
    );
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { light: '#F59E0B', dark: '#FBBF24' };
      case 'ACCEPTED':
        return { light: '#10B981', dark: '#34D399' };
      case 'REJECTED':
        return { light: '#EF4444', dark: '#F87171' };
      case 'WITHDRAWN':
        return { light: '#6B7280', dark: '#9CA3AF' };
      default:
        return { light: '#6B7280', dark: '#9CA3AF' };
    }
  };

  const renderApplicationCard = ({ item }: { item: Application }) => {
    const statusColors = getStatusColors(item.status);

    return (
      <View style={cardStyle}>
        <VStack style={{ gap: 12 }}>
          {/* Status Badge and Date */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: theme === 'light' ? statusColors.light : statusColors.dark }
            ]}>
              <ThemedText lightColor="white" darkColor="white" style={styles.statusText}>
                {item.status.replace('_', ' ')}
              </ThemedText>
            </View>
            <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </ThemedText>
          </View>

          {/* Applicant Name */}
          {item.user && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Applicant
              </ThemedText>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.applicantName}>
                {item.user.firstName} {item.user.lastName}
              </ThemedText>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.applicantEmail}>
                {item.user.email}
              </ThemedText>
            </View>
          )}

          {/* Role */}
          <View>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
              Applied For
            </ThemedText>
            <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.role}>
              {item.role}
            </ThemedText>
          </View>

          {/* Skills */}
          {item.skills && item.skills.length > 0 && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Skills
              </ThemedText>
              <View style={styles.badgeContainer}>
                {item.skills.map((skill, index) => (
                  <View key={index} style={skillBadgeStyle}>
                    <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.badgeText}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Availability */}
          {item.availability && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Availability
              </ThemedText>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.availability}>
                {item.availability.replace('_', ' ')}
              </ThemedText>
            </View>
          )}

          {/* Reason for Joining */}
          {item.reasonForJoining && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Motivation
              </ThemedText>
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.motivation}>
                {item.reasonForJoining}
              </ThemedText>
            </View>
          )}

          {/* Action Buttons - Only show for PENDING applications */}
          {item.status === 'PENDING' && (
            <View style={styles.actionContainer}>
              <LinearGradient
                colors={theme === 'light' ? ['#10B981', '#059669'] : ['#34D399', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.acceptButtonGradient}
              >
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleAccept(item.id)}
                  disabled={acceptMutation.isPending}
                >
                  <ThemedText lightColor="white" darkColor="white" style={styles.actionButtonText}>
                    {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                  </ThemedText>
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity 
                style={[styles.rejectButton, { borderColor: theme === 'light' ? '#EF4444' : '#F87171' }]}
                onPress={() => handleReject(item.id)}
                disabled={rejectMutation.isPending}
              >
                <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.actionButtonText}>
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </VStack>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.emptyText}>
        No applications yet
      </ThemedText>
      <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
        Applications will appear here when users apply to your project
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.emptyText}>
        Failed to load project
      </ThemedText>
      <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
        Pull down to refresh
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
      </View>
    );
  }

  if (error || !project) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme === 'light' ? '#5F4366' : AppColor.primary.light}
          />
        }
      >
        {renderError()}
        <ThemeToggleButton />
      </ScrollView>
    );
  }

  // Filter applications by status
  const pendingApplications = project.applications?.filter((app) => app.status === 'PENDING') || [];
  const reviewedApplications = project.applications?.filter((app) => app.status !== 'PENDING') || [];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[...pendingApplications, ...reviewedApplications]}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Project Info - No Card */}
            <View style={styles.projectInfo}>
              {/* Title and Category */}
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.projectTitle}>
                {project.title}
              </ThemedText>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.category}>
                {project.category}
              </ThemedText>

              {/* Description */}
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.description}>
                {project.description}
              </ThemedText>
            </View>

            {/* Applications Section Header */}
            <View style={styles.sectionHeader}>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.sectionTitle}>
                Applications
              </ThemedText>
              {pendingApplications.length > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: theme === 'light' ? '#F59E0B' : '#FBBF24' }]}>
                  <ThemedText lightColor="white" darkColor="white" style={styles.statusText}>
                    {pendingApplications.length} Pending
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={renderEmptyState()}
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
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
  },
  projectInfo: {
    marginBottom: 24,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 2,
  },
  applicantEmail: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  role: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  availability: {
    fontSize: 15,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  motivation: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  acceptButtonGradient: {
    flex: 1,
    borderRadius: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    textAlign: 'center',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
});
