import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriverBooking } from '@/models/booking.interface';
import { getDriverBookings } from '@/services/driver-app';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
});

const dateFormatter = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'short',
});

export default function HomeScreen() {
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'active'),
    [bookings],
  );

  const loadBookings = useCallback(async () => {
    const result = await getDriverBookings();
    setBookings(result);
  }, []);

  useEffect(() => {
    loadBookings().finally(() => setLoading(false));
  }, [loadBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const totalUpcoming = activeBookings.reduce((sum, booking) => sum + booking.price, 0);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>დღევანდელი სამუშაო</Text>
            <Text style={styles.title}>აქტიური შეკვეთები</Text>
          </View>
          <View style={styles.counter}>
            <Text style={styles.counterValue}>{activeBookings.length}</Text>
            <Text style={styles.counterLabel}>აქტიური</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="calendar-clear-outline" size={20} color="#1f3b73" />
            <Text style={styles.summaryValue}>{activeBookings.length}</Text>
            <Text style={styles.summaryLabel}>მომავალი რეისი</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={20} color="#1f3b73" />
            <Text style={styles.summaryValue}>{moneyFormatter.format(totalUpcoming)}</Text>
            <Text style={styles.summaryLabel}>ჯამური თანხა</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#1f3b73" />
          </View>
        ) : activeBookings.length ? (
          <View style={styles.list}>
            {activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={44} color="#93a0b8" />
            <Text style={styles.emptyTitle}>აქტიური შეკვეთები არ არის</Text>
            <Text style={styles.emptyText}>ახალი შეკვეთები აქ გამოჩნდება.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingCard({ booking }: { booking: DriverBooking }) {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.bookingId}>{booking.publicId}</Text>
          <Text style={styles.traveler}>{booking.travelerName}</Text>
        </View>
        <View style={styles.statusChip}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>აქტიური</Text>
        </View>
      </View>

      <View style={styles.routeBlock}>
        <RouteLine icon="navigate-circle-outline" label="საიდან" value={booking.from} />
        <View style={styles.routeSeparator} />
        <RouteLine icon="location-outline" label="სად" value={booking.to} />
      </View>

      <View style={styles.metaRow}>
        <Meta icon="time-outline" value={`${dateFormatter.format(new Date(booking.pickupDate))}, ${booking.pickupTime}`} />
        <Meta icon="car-sport-outline" value={booking.car} />
        <Meta icon="cash-outline" value={moneyFormatter.format(booking.price)} />
      </View>

      {booking.notes ? <Text style={styles.notes}>{booking.notes}</Text> : null}
    </View>
  );
}

function RouteLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.routeLine}>
      <Ionicons name={icon} size={20} color="#1f3b73" />
      <View>
        <Text style={styles.routeLabel}>{label}</Text>
        <Text style={styles.routeValue}>{value}</Text>
      </View>
    </View>
  );
}

function Meta({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color="#64748b" />
      <Text style={styles.metaText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    color: '#101828',
    fontSize: 28,
    fontWeight: '800',
  },
  counter: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 18,
    minWidth: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  counterValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  summaryValue: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  list: {
    gap: 14,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookingId: {
    color: '#1f3b73',
    fontSize: 13,
    fontWeight: '800',
  },
  traveler: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  statusChip: {
    alignItems: 'center',
    backgroundColor: '#eaf8f0',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    backgroundColor: '#16a34a',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  routeBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
  },
  routeLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  routeSeparator: {
    backgroundColor: '#dbe3ef',
    height: 1,
    marginVertical: 10,
    marginLeft: 30,
  },
  routeLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  routeValue: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaItem: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  notes: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 6,
  },
});
