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
  paymentStatus?: 'unpaid' | 'paid';
  amount: number;
  meetingLink?: string;
  review?: {
    rating: number;
    comment: string;
  };
}

export const requestBooking = async (data: {
  tutorId: string;
  date: string;
  startTime: string;
  duration: number;
  requestType: string;
  content: string;
}) => {
  const response = await api.post("/bookings/request", data);
  return response.data;
};

export const payBooking = async (bookingId: string) => {
  const response = await api.post(`/bookings/${bookingId}/pay`);
  return response.data; // { url: 'stripe_checkout_url' }
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const confirmBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/confirm`);
  return response.data;
};

export const declineBooking = async (id: string) => {
  const response = await api.patch(`/bookings/${id}/decline`);
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

export const updateMeetingLink = async (id: string, meetingLink: string) => {
  const response = await api.patch(`/bookings/${id}/link`, { meetingLink });
  return response.data;
};

export const rescheduleBooking = async (id: string, date: string, startTime: string) => {
  const response = await api.patch(`/bookings/${id}/reschedule`, { date, startTime });
  return response.data;
};
