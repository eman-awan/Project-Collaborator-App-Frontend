import { createComment, CreateCommentDto, getTaskById, getTaskComments, TaskComment } from "@/api/taskApi";
import { ThemedText } from "@/components/ThemedText";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Fonts } from "@/fonts/font";
import { useThemedStyle } from "@/hooks/useThemedStyle";
import { useAppSelector } from "@/store/hooks";
import AppColor from "@/utils/AppColor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";

export default function TaskComments() {
  const theme = useAppSelector(state => state.theme.mode);
  const currentUserEmail = useAppSelector(state => state.auth.email);
  const queryClient = useQueryClient();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [commentText, setCommentText] = useState('');

  const taskIdNum = parseInt(taskId);

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskIdNum],
    queryFn: () => getTaskById(taskIdNum),
    enabled: !!taskIdNum,
  });

  const { data: commentsData, isLoading: commentsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['task-comments', taskIdNum],
    queryFn: () => getTaskComments(taskIdNum),
    enabled: !!taskIdNum,
  });

  // Reverse comments to show latest at the end
  const comments = commentsData ? [...commentsData].reverse() : [];

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskIdNum] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      setCommentText('');
    },
  });

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const commentData: CreateCommentDto = {
      taskId: taskIdNum,
      content: commentText.trim(),
    };

    createCommentMutation.mutate(commentData);
  };

  const inputContainerStyle = useThemedStyle<ViewStyle>(
    { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
    { backgroundColor: '#374151', borderColor: '#4B5563' },
    {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    }
  );

  const inputStyle = useThemedStyle<any>(
    { color: '#111827' },
    { color: '#F9FAFB' },
    {
      flex: 1,
      fontSize: 15,
      fontFamily: Fonts.Instrument.Serif.Regular,
      minHeight: 40,
      maxHeight: 100,
    }
  );

  const renderCommentItem = ({ item }: { item: TaskComment }) => {
    const isCurrentUser = item.author.email === currentUserEmail;

    return (
      <View style={[styles.commentWrapper, isCurrentUser ? styles.commentRight : styles.commentLeft]}>
        <View style={[
          styles.commentBubble,
          isCurrentUser 
            ? (theme === 'light' ? styles.commentBubbleCurrentLight : styles.commentBubbleCurrentDark)
            : (theme === 'light' ? styles.commentBubbleOtherLight : styles.commentBubbleOtherDark)
        ]}>
          {!isCurrentUser && (
            <ThemedText 
              lightColor={theme === 'light' ? '#5F4366' : AppColor.primary.light}
              darkColor={AppColor.primary.light}
              style={styles.authorName}
            >
              {item.author.firstName} {item.author.lastName}
            </ThemedText>
          )}
          <ThemedText 
            lightColor={isCurrentUser ? 'white' : '#111827'}
            darkColor={isCurrentUser ? 'white' : '#F9FAFB'}
            style={styles.commentText}
          >
            {item.content}
          </ThemedText>
          <ThemedText 
            lightColor={isCurrentUser ? 'rgba(255,255,255,0.7)' : '#9CA3AF'}
            darkColor={isCurrentUser ? 'rgba(255,255,255,0.7)' : '#6B7280'}
            style={styles.commentTime}
          >
            {new Date(item.createdAt).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (taskLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            task ? (
              <View style={styles.taskHeader}>
                <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.taskTitle}>
                  {task.title}
                </ThemedText>
                {task.description && (
                  <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.taskDescription}>
                    {task.description}
                  </ThemedText>
                )}
                <View style={styles.commentsHeaderDivider} />
                <ThemedText lightColor="#111827" darkColor="#F9FAFB" style={styles.commentsHeader}>
                  Comments ({comments?.length || 0})
                </ThemedText>
              </View>
            ) : null
          }
          ListEmptyComponent={
            commentsLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={theme === 'light' ? '#5F4366' : AppColor.primary.light} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={styles.emptyText}>
                  No comments yet
                </ThemedText>
                <ThemedText lightColor="#9CA3AF" darkColor="#6B7280" style={styles.emptySubtext}>
                  Be the first to comment!
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

        {/* Comment Input */}
        <View style={styles.inputSection}>
          <View style={inputContainerStyle}>
            <TextInput
              style={inputStyle}
              placeholder="Leave your comment..."
              placeholderTextColor={theme === 'light' ? '#9CA3AF' : '#6B7280'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSendComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
            >
              <ThemedText 
                lightColor={commentText.trim() ? '#5F4366' : '#D1D5DB'}
                darkColor={commentText.trim() ? AppColor.primary.light : '#6B7280'}
                style={styles.sendButton}
              >
                {createCommentMutation.isPending ? '⏳' : '➤'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ThemeToggleButton />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },
  taskHeader: {
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  commentsHeaderDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.Instrument.Serif.Regular,
  },
  commentWrapper: {
    marginBottom: 16,
  },
  commentLeft: {
    alignItems: 'flex-start',
  },
  commentRight: {
    alignItems: 'flex-end',
  },
  commentBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  commentBubbleCurrentLight: {
    backgroundColor: '#5F4366',
  },
  commentBubbleCurrentDark: {
    backgroundColor: AppColor.primary.light,
  },
  commentBubbleOtherLight: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  commentBubbleOtherDark: {
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.Instrument.Serif.Regular,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 11,
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
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    fontSize: 20,
    marginLeft: 8,
  },
});
