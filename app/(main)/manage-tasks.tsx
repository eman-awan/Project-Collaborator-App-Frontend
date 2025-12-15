import { getProjectById } from "@/api/projectApi";
import { createTask, CreateTaskDto, getProjectTasks, Priority, Task, TaskStatus, updateTask } from "@/api/taskApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { Fonts } from "@/fonts/font";
import { useThemedStyle } from "@/hooks/useThemedStyle";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";

export default function ManageTasks() {
  const theme = useAppSelector(state => state.theme.mode);
  const currentUserId = useAppSelector(state => state.auth.email); // You may need user ID here
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const projectId = parseInt(id);

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTaskForAssignee, setSelectedTaskForAssignee] = useState<number | null>(null);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState<number | null>(null);
  const [selectedTaskForPriority, setSelectedTaskForPriority] = useState<number | null>(null);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: tasks, isLoading: tasksLoading, refetch, isRefetching } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setNewTaskTitle('');
      setShowAddTask(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setSelectedTaskForAssignee(null);
      setSelectedTaskForStatus(null);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update task');
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const taskData: CreateTaskDto = {
      title: newTaskTitle.trim(),
      projectId: projectId,
    };

    createTaskMutation.mutate(taskData);
  };

  const handleAssignTask = (taskId: number, assigneeId: number) => {
    updateTaskMutation.mutate({ id: taskId, data: { assigneeId } });
  };

  const handleUnassignTask = (taskId: number) => {
    updateTaskMutation.mutate({ id: taskId, data: { assigneeId: null } });
  };

  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    updateTaskMutation.mutate({ id: taskId, data: { status } });
  };

  const cardStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
    { backgroundColor: '#1F2937', borderColor: '#374151' },
    { 
      borderRadius: 12, 
      padding: 16, 
      marginBottom: 16, 
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  );

  const inputStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#111827' },
    { backgroundColor: '#374151', borderColor: '#4B5563', color: '#F9FAFB' },
    {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      fontFamily: Fonts.Instrument.Serif.Regular,
    }
  );

  const assigneeModalStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF' },
    { backgroundColor: '#1F2937' },
    {
      borderRadius: 16,
      padding: 20,
      height: '80%',
      width: 300,
      maxWidth: '95%',
    }
  );

  const statusModalStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#FFFFFF' },
    { backgroundColor: '#1F2937' },
    {
      borderRadius: 16,
      padding: 20,
      width: '90%',
    }
  );

  // Get accepted applicants for assignee selection
  const acceptedApplicants = project?.applications?.filter(app => app.status === 'ACCEPTED') || [];
  const filteredApplicants = acceptedApplicants.filter(app => 
    `${app.user.firstName} ${app.user.lastName}`.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
  );

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return { light: '#6B7280', dark: '#9CA3AF' };
      case 'IN_PROGRESS':
        return { light: '#3B82F6', dark: '#60A5FA' };
      case 'IN_REVIEW':
        return { light: '#F59E0B', dark: '#FBBF24' };
      case 'BLOCKED':
        return { light: '#EF4444', dark: '#F87171' };
      case 'COMPLETED':
        return { light: '#10B981', dark: '#34D399' };
      case 'CANCELLED':
        return { light: '#6B7280', dark: '#9CA3AF' };
      default:
        return { light: '#6B7280', dark: '#9CA3AF' };
    }
  };

  const statusOptions: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED', 'CANCELLED'];
  const priorityOptions: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'LOW':
        return { light: '#10B981', dark: '#34D399' };
      case 'MEDIUM':
        return { light: '#3B82F6', dark: '#60A5FA' };
      case 'HIGH':
        return { light: '#F59E0B', dark: '#FBBF24' };
      case 'URGENT':
        return { light: '#EF4444', dark: '#F87171' };
      default:
        return { light: '#3B82F6', dark: '#60A5FA' };
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <View style={cardStyle}>
        <VStack style={{ gap: 12 }}>
          {/* Task Title and Priority */}
          <View style={styles.taskTitleRow}>
            <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.taskTitle}>
              {item.title}
            </ThemedText>
            <TouchableOpacity 
              onPress={() => setSelectedTaskForPriority(item.id)}
              style={[
                styles.priorityBadge, 
                { 
                  borderColor: theme === 'light' ? getPriorityColor(item.priority).light : getPriorityColor(item.priority).dark,
                  borderWidth: 1.5,
                }
              ]}
            >
              <ThemedText 
                lightColor={getPriorityColor(item.priority).light} 
                darkColor={getPriorityColor(item.priority).dark} 
                style={styles.priorityText}
              >
                {item.priority}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Assignee and Status Row */}
          <View style={styles.taskActions}>
            {item.assignee ? (
              <View style={styles.assigneeButton}>
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.assigneeText}>
                  {item.assignee.firstName} {item.assignee.lastName}
                </ThemedText>
                {item.status === 'COMPLETED' ? (
                  <ThemedText style={styles.personIcon}>🎉</ThemedText>
                ) : (
                  <TouchableOpacity onPress={() => handleUnassignTask(item.id)}>
                    <ThemedText style={styles.personIcon}>❌</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.assigneeButton}
                onPress={() => setSelectedTaskForAssignee(item.id)}
              >
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.assigneeText}>
                  Assign
                </ThemedText>
                <ThemedText style={styles.personIcon}>👤</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setSelectedTaskForStatus(item.id)}
              style={[styles.statusBadge, { backgroundColor: theme === 'light' ? statusColors.light : statusColors.dark }]}
            >
              <ThemedText lightColor="white" darkColor="white" style={styles.statusText}>
                {item.status.replace('_', ' ')}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Creator and Comments Row */}
          <View style={styles.footerRow}>
            <View style={styles.creatorContainer}>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.creatorLabel}>
                Created by:
              </ThemedText>
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.creatorName}>
                {item.createdBy.firstName} {item.createdBy.lastName}
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.commentsButton}
              onPress={() => router.push({ pathname: '/(main)/task-comments', params: { taskId: item.id } } as any)}
            >
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.commentsText}>
                💬 {item._count?.comments || 0}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </VStack>
      </View>
    );
  };

  if (projectLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Project not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Project Info */}
            <HStack style={styles.backBox}>
              <Button onPress={() => router.back()}>
                <Icon as={ArrowLeft} size="xl" stroke={AppColor.icons[theme]} />
              </Button>
            </HStack>
            <View style={styles.projectInfo}>
              <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.projectTitle}>
                {project.title}
              </ThemedText>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.category}>
                {project.category}
              </ThemedText>
              <ThemedText lightColor="#374151" darkColor="#D1D5DB" style={styles.description}>
                {project.description}
              </ThemedText>
            </View>

            {/* Add Task Section */}
            <View style={styles.addTaskSection}>
              {!showAddTask ? (
                <LinearGradient
                  colors={theme === 'light' ? ['#5F4366', '#707A8D'] : [AppColor.primary.light, 'gray']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddTask(true)}
                  >
                    <ThemedText lightColor="white" darkColor="white" style={styles.addButtonText}>
                      + Add Task
                    </ThemedText>
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <View style={styles.taskInputContainer}>
                  <TextInput
                    style={inputStyle as any}
                    placeholder="Enter task title and press Enter"
                    placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#6B7280'}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                    autoFocus
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => setShowAddTask(false)}>
                    <ThemedText lightColor="#EF4444" darkColor="#F87171" style={styles.cancelText}>
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tasks List Header */}
            <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.sectionTitle}>
              Tasks
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          tasksLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.emptyText}>
                No tasks yet
              </ThemedText>
              <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
                Add your first task to get started!
              </ThemedText>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme === 'light' ? '#5F4366' : AppColor.primary.light}
          />
        }
      />

      {/* Assignee Selection Modal */}
      <Modal
        visible={selectedTaskForAssignee !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTaskForAssignee(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTaskForAssignee(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[assigneeModalStyle, { alignSelf: 'center' }]}>
              {updateTaskMutation.isPending ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.loadingText}>
                    Assigning task...
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.modalTitle}>
                    Assign Task
                  </ThemedText>

                  <TextInput
                    style={[inputStyle as any, { marginVertical: 12 }]}
                    placeholder="Search team members..."
                    placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#6B7280'}
                    value={assigneeSearchQuery}
                    onChangeText={setAssigneeSearchQuery}
                  />

                  <ScrollView style={styles.assigneeList}>
                    {filteredApplicants.map((app) => (
                      <TouchableOpacity
                        key={app.user.id}
                        style={styles.assigneeItem}
                        onPress={() => {
                          if (selectedTaskForAssignee) {
                            handleAssignTask(selectedTaskForAssignee, app.user.id);
                          }
                        }}
                      >
                        <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.assigneeName}>
                          {app.user.firstName} {app.user.lastName}
                        </ThemedText>
                        <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.assigneeEmail}>
                          {app.user.email}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Status Selection Modal */}
      <Modal
        visible={selectedTaskForStatus !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTaskForStatus(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTaskForStatus(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={statusModalStyle}>
              {updateTaskMutation.isPending ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.loadingText}>
                    Updating status...
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.modalTitle}>
                    Change Status
                  </ThemedText>

                  <View style={styles.statusList}>
                    {statusOptions.map((status) => {
                      const statusColors = getStatusColor(status);
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[styles.statusOption, { backgroundColor: theme === 'light' ? statusColors.light : statusColors.dark }]}
                          onPress={() => {
                            if (selectedTaskForStatus) {
                              handleStatusChange(selectedTaskForStatus, status);
                            }
                          }}
                        >
                          <ThemedText lightColor="white" darkColor="white" style={styles.statusOptionText}>
                            {status.replace('_', ' ')}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={selectedTaskForPriority !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTaskForPriority(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTaskForPriority(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={statusModalStyle}>
              {updateTaskMutation.isPending ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.loadingText}>
                    Updating priority...
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.modalTitle}>
                    Change Priority
                  </ThemedText>

                  <View style={styles.statusList}>
                    {priorityOptions.map((priority) => {
                      const priorityColors = getPriorityColor(priority);
                      return (
                        <TouchableOpacity
                          key={priority}
                          style={[styles.statusOption, { backgroundColor: theme === 'light' ? priorityColors.light : priorityColors.dark }]}
                          onPress={() => {
                            if (selectedTaskForPriority) {
                              updateTaskMutation.mutate(
                                { id: selectedTaskForPriority, data: { priority } },
                                {
                                  onSuccess: () => {
                                    setSelectedTaskForPriority(null);
                                  }
                                }
                              );
                            }
                          }}
                        >
                          <ThemedText lightColor="white" darkColor="white" style={styles.statusOptionText}>
                            {priority}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ThemeToggleButton />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  projectInfo: {
    marginBottom: 24,
  },
  backBox: {
    marginBottom: 10,
    width: "100%",
    padding: 10,
    paddingLeft: 0,
    justifyContent: "flex-start",
    alignItems: "center"
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
  addTaskSection: {
    marginBottom: 24,
  },
  addButtonGradient: {
    borderRadius: 8,
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  taskInputContainer: {
    gap: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorLabel: {
    fontSize: 12,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusAssigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  assigneeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assigneeText: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  personIcon: {
    fontSize: 16,
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsText: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 16,
  },
  assigneeList: {
    maxHeight: 300,
  },
  assigneeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 2,
  },
  assigneeEmail: {
    fontSize: 14,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  statusList: {
    gap: 12,
    marginTop: 12,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
});
