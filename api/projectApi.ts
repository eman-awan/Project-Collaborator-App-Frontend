import apiURL from "@/api/axios";

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  requiredSkills: string[];
  startDate: string;
  endDate: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  memberships: Array<{
    id: number;
    role: string;
    status: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
    };
  }>;
  applications?: Array<{
    id: number;
    role: string;
    skills: string[];
    reasonForJoining?: string;
    availability?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
    userId: number;
    projectId: number;
    createdAt: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string;
    };
  }>;
  _count?: {
    applications: number;
    memberships: number;
  };
}

export const createProject = async (projectData: CreateProjectData) => {
  try {
    const response = await apiURL.post("/projects", projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await apiURL.get("/projects");
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getMyProjects = async (): Promise<Project[]> => {
  try {
    const response = await apiURL.get("/projects/my-projects");
    return response.data;
  } catch (error) {
    console.error('Error fetching my projects:', error);
    throw error;
  }
};

export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await apiURL.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw error;
  }
};

// other project realted api function will be added here