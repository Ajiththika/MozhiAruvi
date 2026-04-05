import { api } from "@/lib/api";

export interface Booking {
  _id: string;
  studentId: any;
  tutorId: any;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  amount: number;
  meetingLink?: string;
  review?: {
    rating: number;
    comment: string;
  };
}

export const initiateBooking = async (data: {
  tutorId: string;
  date: string;
  startTime: string;
  duration: number;
}) => {
  const response = await api.post("/bookings/initiate", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const confirmBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/confirm`);
  return response.data;
};

export const completeBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/complete`);
  return response.data;
};

export const submitReview = async (id: string, review: { rating: number; comment: string }) => {
  const response = await api.post(`/bookings/${id}/review`, review);
  return response.data;
};
