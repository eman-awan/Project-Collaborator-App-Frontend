import apiURL from "@/api/axios";

export interface CreateApplicationData {
  projectId: number;
  role: string;
  skills: string[];
  reasonForJoining?: string;
  availability?: string;
}

export interface Application {
  id: number;
  role: string;
  skills: string[];
  reasonForJoining?: string;
  availability?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  userId: number;
  projectId: number;
  createdAt: string;
  project?: {
    id: number;
    title: string;
    category: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export async function createApplication(data: CreateApplicationData): Promise<Application> {
  const response = await apiURL.post("/applications", data);
  return response.data;
}

export async function getMyApplications(): Promise<Application[]> {
  const response = await apiURL.get("/applications/my-applications");
  return response.data;
}

export async function withdrawApplication(id: number): Promise<Application> {
  const response = await apiURL.patch(`/applications/${id}/withdraw`);
  return response.data;
}

export async function deleteApplication(id: number): Promise<void> {
  await apiURL.delete(`/applications/${id}`);
}

export async function acceptApplication(id: number): Promise<Application> {
  const response = await apiURL.patch(`/applications/${id}/accept`);
  return response.data;
}

export async function rejectApplication(id: number): Promise<Application> {
  const response = await apiURL.patch(`/applications/${id}/reject`);
  return response.data;
}
