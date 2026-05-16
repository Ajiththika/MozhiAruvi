import { api } from '@/lib/api';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Failed to upload image');
  }

  return response.data.url;
};

export const uploadVideo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await api.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Failed to upload video');
  }

  return response.data.url;
};
