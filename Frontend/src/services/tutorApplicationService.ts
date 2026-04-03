import { api } from '@/lib/api';

export interface TutorApplicationInput {
  name: string;
  email: string;
  phone?: string;
  languages: string[];
  experience: string;
  bio: string;
  availability: string;
  certifications?: string;
}

export const submitTutorApplication = async (data: TutorApplicationInput) => {
  const response = await api.post('/tutors/apply', data);
  return response.data;
};

export const getTutorApplicationsAdmin = async () => {
  const response = await api.get('/admin/tutors/applications');
  return response.data.applications;
};

export const approveTutorApplication = async (id: string) => {
  const response = await api.patch(`/admin/tutors/${id}/approve`);
  return response.data;
};

export const rejectTutorApplication = async (id: string, adminNotes?: string) => {
  const response = await api.patch(`/admin/tutors/${id}/reject`, { adminNotes });
  return response.data;
};
