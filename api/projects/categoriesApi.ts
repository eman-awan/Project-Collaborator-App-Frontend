import apiURL from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

export interface Category {
  id: number;
  name: string;
}

const fetchProjectCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiURL.get("/categories");
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
};

export function useFetchProjectCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["project-categories"],
    queryFn: fetchProjectCategories,
  });
}

export async function updateUserCategoryPreferences(categoryIds: number[]) {
  try {
    const response = await apiURL.patch("/categories/preferences", { categoryIds });
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}