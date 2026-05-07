import { api } from "@/lib/api";

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'text' | 'link';
  url?: string;
  content?: string;
  level: string;
  sectionId?: string;
  orderIndex: number;
  createdAt: string;
}

export const getResources = async (level?: string): Promise<Resource[]> => {
  const res = await api.get('/resources', { params: { level } });
  return res.data;
};

export const createResource = async (data: Partial<Resource>): Promise<Resource> => {
  const res = await api.post('/resources', data);
  return res.data;
};

export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
  const res = await api.patch(`/resources/${id}`, data);
  return res.data;
};

export const deleteResource = async (id: string): Promise<void> => {
  await api.delete(`/resources/${id}`);
};
