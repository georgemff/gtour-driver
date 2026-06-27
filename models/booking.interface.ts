export type DriverBookingStatus = 'active' | 'completed' | 'canceled';

export interface DriverBooking {
  id: number;
  publicId: string;
  travelerName: string;
  from: string;
  to: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  car: string;
  status: DriverBookingStatus;
  statusLabel?: string;
  persons?: number;
  pets?: boolean;
  notes?: string;
}
