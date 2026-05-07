import { api } from "@/lib/api";

export interface ResourceSection {
  _id: string;
  title: string;
  description?: string;
  level: string;
  orderIndex: number;
  createdAt: string;
}

export const getSections = async (level?: string): Promise<ResourceSection[]> => {
  const res = await api.get('/resource-sections', { params: { level } });
  return res.data;
};

export const createSection = async (data: Partial<ResourceSection>): Promise<ResourceSection> => {
  const res = await api.post('/resource-sections', data);
  return res.data;
};

export const updateSection = async (id: string, data: Partial<ResourceSection>): Promise<ResourceSection> => {
  const res = await api.patch(`/resource-sections/${id}`, data);
  return res.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await api.delete(`/resource-sections/${id}`);
};
