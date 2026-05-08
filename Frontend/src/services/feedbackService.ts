import { api } from "@/lib/api";

export interface Feedback {
  _id: string;
  userEmail: string;
  rating: number;
  comment?: string;
  userId?: string;
  createdAt: string;
}

export const getFeedbacks = async (): Promise<Feedback[]> => {
  const response = await api.get("/feedback");
  return response.data;
};

export const deleteFeedback = async (id: string): Promise<void> => {
  await api.delete(`/feedback/${id}`);
};
