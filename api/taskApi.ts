import apiURL from "@/api/axios";

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: number;
  assigneeId?: number;
  createdById: number;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  _count?: {
    comments: number;
  };
}

export interface TaskComment {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assigneeId?: number;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface CreateCommentDto {
  taskId: number;
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

// ===================== TASK ENDPOINTS =====================

export async function createTask(data: CreateTaskDto): Promise<Task> {
  const response = await apiURL.post("/tasks", data);
  return response.data;
}

export async function getMyTasks(): Promise<Task[]> {
  const response = await apiURL.get("/tasks/my-tasks");
  return response.data;
}

export async function getProjectTasks(projectId: number): Promise<Task[]> {
  const response = await apiURL.get(`/tasks/project/${projectId}`);
  return response.data;
}

export async function getTaskById(id: number): Promise<Task> {
  const response = await apiURL.get(`/tasks/${id}`);
  return response.data;
}

export async function updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
  const response = await apiURL.patch(`/tasks/${id}`, data);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await apiURL.delete(`/tasks/${id}`);
}

// ===================== COMMENT ENDPOINTS =====================

export async function createComment(data: CreateCommentDto): Promise<TaskComment> {
  const response = await apiURL.post("/tasks/comments", data);
  return response.data;
}

export async function getTaskComments(taskId: number): Promise<TaskComment[]> {
  const response = await apiURL.get(`/tasks/${taskId}/comments`);
  return response.data;
}

export async function updateComment(id: number, data: UpdateCommentDto): Promise<TaskComment> {
  const response = await apiURL.patch(`/tasks/comments/${id}`, data);
  return response.data;
}

export async function deleteComment(id: number): Promise<void> {
  await apiURL.delete(`/tasks/comments/${id}`);
}
