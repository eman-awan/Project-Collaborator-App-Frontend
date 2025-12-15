import { Application, deleteApplication, getMyApplications, withdrawApplication } from "@/api/applicationApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { VStack } from "@/components/ui/vstack";
import { Fonts } from "@/fonts/font";
import { useThemedStyle } from "@/hooks/useThemedStyle";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";

const { width } = Dimensions.get('window');

export default function MyApplications() {
  const theme = useAppSelector(state => state.theme.mode);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: applications, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
  });

  // Filter applications based on search query
  const filteredApplications = applications?.filter(app => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const projectTitleMatch = app.project?.title?.toLowerCase().includes(query);
    const roleMatch = app.role?.toLowerCase().includes(query);
    const skillsMatch = app.skills?.some(skill => skill.toLowerCase().includes(query));
    
    return projectTitleMatch || roleMatch || skillsMatch;
  });

  const { mutate: withdraw } = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      Alert.alert('Success', 'Application withdrawn successfully');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to withdraw application');
    },
  });

  const { mutate: deleteApp } = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      Alert.alert('Success', 'Application deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete application');
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

  const getStatusColor = (status: string) => {
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

  const handleWithdraw = (id: number) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', style: 'destructive', onPress: () => withdraw(id) }
      ]
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteApp(id) }
      ]
    );
  };

  const renderApplicationCard = ({ item }: { item: Application }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <View style={cardStyle}>
        <VStack style={{ gap: 14 }}>
          {/* Status Badge */}
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

          {/* Project Title */}
          {item.project && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Project
              </ThemedText>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.projectTitle}>
                {item.project.title}
              </ThemedText>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.projectCategory}>
                {item.project.category}
              </ThemedText>
            </View>
          )}

          {/* Role */}
          <View>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
              Applied for
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
                {item.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={badgeStyle}>
                    <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.badgeText}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
                {item.skills.length > 3 && (
                  <View style={badgeStyle}>
                    <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.badgeText}>
                      +{item.skills.length - 3}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reason for Joining */}
          {item.reasonForJoining && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Motivation
              </ThemedText>
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.description} numberOfLines={3}>
                {item.reasonForJoining}
              </ThemedText>
            </View>
          )}

          {/* Availability */}
          {item.availability && (
            <View>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.label}>
                Availability
              </ThemedText>
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.text}>
                {item.availability.replace('_', ' ')}
              </ThemedText>
            </View>
          )}

          {/* Actions */}
          {item.status === 'ACCEPTED' && item.project && (
            <View style={styles.actionContainer}>
              <LinearGradient
                colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.manageTasksGradient}
              >
                <TouchableOpacity 
                  style={styles.manageTasksButton}
                  onPress={() => item.project?.id && router.push({ pathname: '/(main)/manage-tasks', params: { id: item.project.id } })}
                  activeOpacity={0.7}
                >
                  <ThemedText lightColor="white" darkColor="white" style={styles.actionButtonText}>
                    Manage Tasks
                  </ThemedText>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {item.status === 'PENDING' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.withdrawButton}
                onPress={() => handleWithdraw(item.id)}
              >
                <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.actionText}>
                  Withdraw
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {(item.status === 'REJECTED' || item.status === 'WITHDRAWN') && (
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.actionText}>
                  Delete
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
        Apply to projects to see them here!
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.emptyText}>
        Failed to load applications
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
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.headerTitle}>
              My Applications
            </ThemedText>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.headerSubtitle}>
              Track your project applications
            </ThemedText>

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
                placeholder="Search by project, role, or skills..."
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    paddingBottom: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  headerSubtitle: {
    fontSize: 16,
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  role: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  text: {
    fontSize: 14,
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
  dateText: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  manageTasksGradient: {
    flex: 1,
    borderRadius: 8,
  },
  manageTasksButton: {
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
  withdrawButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionText: {
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
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
