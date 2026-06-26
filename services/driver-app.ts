import AsyncStorage from '@react-native-async-storage/async-storage';

import { DriverBooking } from '@/models/booking.interface';

const UNAVAILABLE_DATES_KEY = 'driver_unavailable_dates';

export const mockDriverBookings: DriverBooking[] = [
  {
    id: 1,
    publicId: 'MZ-1048',
    travelerName: 'Nino K.',
    from: 'Tbilisi Airport',
    to: 'Gudauri',
    pickupDate: '2026-07-03',
    dropoffDate: '2026-07-03',
    pickupTime: '10:30',
    car: 'Toyota Sienna',
    price: 120,
    status: 'active',
    notes: 'Flight lands at 09:45. Meet at arrivals.',
  },
  {
    id: 2,
    publicId: 'MZ-1051',
    travelerName: 'David L.',
    from: 'Tbilisi',
    to: 'Kazbegi',
    pickupDate: '2026-07-06',
    dropoffDate: '2026-07-07',
    pickupTime: '08:00',
    car: 'Hyundai Elantra',
    price: 210,
    status: 'active',
  },
  {
    id: 3,
    publicId: 'MZ-0977',
    travelerName: 'Ana M.',
    from: 'Batumi',
    to: 'Kutaisi Airport',
    pickupDate: '2026-06-14',
    dropoffDate: '2026-06-14',
    pickupTime: '13:15',
    car: 'Kia Optima',
    price: 95,
    status: 'completed',
  },
  {
    id: 4,
    publicId: 'MZ-0923',
    travelerName: 'Mark T.',
    from: 'Tbilisi',
    to: 'Borjomi',
    pickupDate: '2026-05-28',
    dropoffDate: '2026-05-28',
    pickupTime: '11:00',
    car: 'Toyota Sienna',
    price: 140,
    status: 'completed',
  },
];

export async function getDriverBookings(): Promise<DriverBooking[]> {
  return mockDriverBookings;
}

export async function getUnavailableDates(): Promise<string[]> {
  const storedDates = await AsyncStorage.getItem(UNAVAILABLE_DATES_KEY);

  if (!storedDates) {
    return [];
  }

  try {
    const parsedDates = JSON.parse(storedDates);
    return Array.isArray(parsedDates) ? parsedDates : [];
  } catch (_error) {
    return [];
  }
}

export async function saveUnavailableDates(dates: string[]): Promise<string[]> {
  const normalizedDates = Array.from(new Set(dates)).sort();
  await AsyncStorage.setItem(UNAVAILABLE_DATES_KEY, JSON.stringify(normalizedDates));
  return normalizedDates;
}
