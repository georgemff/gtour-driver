import { DriverBooking } from '@/models/booking.interface';
import http from '@/services/axios';

interface ApiResponse<T> {
  data: T;
}

export interface DriverAvailabilityBlock {
  id: number;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface DriverAvailability {
  dates: string[];
  blocks: DriverAvailabilityBlock[];
}

export async function getActiveDriverBookings(): Promise<DriverBooking[]> {
  const response = await http.get<ApiResponse<DriverBooking[]>>('/bookings/active');
  return Array.isArray(response.data.data) ? response.data.data : [];
}

export async function getDriverBooking(bookingId: number): Promise<DriverBooking | null> {
  const response = await http.get<ApiResponse<DriverBooking>>(`/bookings/${bookingId}`);
  return response.data.data || null;
}

export async function respondToDriverBooking(
  bookingId: number,
  accepted: boolean,
): Promise<{ status: number; statusLabel: string }> {
  const response = await http.post<ApiResponse<{ status: number; statusLabel: string }>>(
    `/bookings/${bookingId}/respond`,
    { accepted },
  );
  return response.data.data;
}

export async function getPassedDriverBookings(): Promise<DriverBooking[]> {
  const response = await http.get<ApiResponse<DriverBooking[]>>('/bookings/passed');
  return Array.isArray(response.data.data) ? response.data.data : [];
}

export async function getUnavailableDates(): Promise<string[]> {
  const availability = await getDriverAvailability();
  return availability.dates;
}

export async function getDriverAvailability(): Promise<DriverAvailability> {
  const response = await http.get<ApiResponse<DriverAvailability>>('/availability');
  return normalizeAvailability(response.data.data);
}

export async function saveUnavailableDates(dates: string[]): Promise<string[]> {
  const availability = await saveDriverAvailability(dates);
  return availability.dates;
}

export async function saveDriverAvailability(dates: string[]): Promise<DriverAvailability> {
  const response = await http.put<ApiResponse<DriverAvailability>>('/availability', {
    dates,
  });
  return normalizeAvailability(response.data.data);
}

export async function cancelDriverVacation(vacationId: number): Promise<DriverAvailability> {
  const response = await http.delete<ApiResponse<DriverAvailability>>(
    `/availability/${vacationId}`,
  );
  return normalizeAvailability(response.data.data);
}

export async function finishDriverVacation(vacationId: number): Promise<DriverAvailability> {
  const response = await http.patch<ApiResponse<DriverAvailability>>(
    `/availability/${vacationId}/finish`,
  );
  return normalizeAvailability(response.data.data);
}

export async function registerDriverPushToken(token: string, platform: string): Promise<void> {
  await http.post('/notifications/push-token', {
    token,
    platform,
  });
}

export async function unregisterDriverPushToken(token: string): Promise<void> {
  await http.delete('/notifications/push-token', {
    data: {
      token,
    },
  });
}

function normalizeAvailability(availability?: DriverAvailability): DriverAvailability {
  return {
    dates: Array.isArray(availability?.dates) ? availability.dates : [],
    blocks: Array.isArray(availability?.blocks) ? availability.blocks : [],
  };
}
