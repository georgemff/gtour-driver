import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriverBooking } from '@/models/booking.interface';
import { getPassedDriverBookings } from '@/services/driver-app';

const longDateFormatter = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadBookings = useCallback(async () => {
    try {
      setErrorMessage('');
      const result = await getPassedDriverBookings();
      setBookings(result);
    } catch {
      setErrorMessage('ისტორიის ჩატვირთვა ვერ მოხერხდა.');
    }
  }, []);

  useEffect(() => {
    loadBookings().finally(() => setLoading(false));
  }, [loadBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBookings();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>დასრულებული რეისები</Text>
          <Text style={styles.title}>ისტორია</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <Ionicons name="checkmark-done-outline" size={22} color="#1f3b73" />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewValue}>{bookings.length}</Text>
            <Text style={styles.overviewLabel}>დასრულებული შეკვეთა</Text>
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewValue}>
              {bookings[0]?.pickupDate
                ? longDateFormatter.format(new Date(bookings[0].pickupDate))
                : '-'}
            </Text>
            <Text style={styles.overviewLabel}>ბოლო რეისი</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#1f3b73" />
          </View>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={loadBookings} />
        ) : bookings.length ? (
          <View style={styles.timeline}>
            {bookings.map((booking) => (
              <HistoryCard key={booking.id} booking={booking} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={44} color="#93a0b8" />
            <Text style={styles.emptyTitle}>ისტორია ცარიელია</Text>
            <Text style={styles.emptyText}>დასრულებული შეკვეთები აქ დაემატება.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorState}>
      <Ionicons name="cloud-offline-outline" size={42} color="#b42318" />
      <Text style={styles.errorTitle}>მონაცემები ვერ ჩაიტვირთა</Text>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Ionicons name="refresh-outline" size={17} color="#ffffff" />
        <Text style={styles.retryButtonText}>თავიდან ცდა</Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryCard({ booking }: { booking: DriverBooking }) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.bookingId}>{booking.publicId}</Text>
          <Text style={styles.routeTitle}>
            {booking.from} → {booking.to}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Info icon="person-outline" value={booking.travelerName} />
        <Info
          icon="calendar-outline"
          value={longDateFormatter.format(new Date(booking.pickupDate))}
        />
        <Info icon="car-sport-outline" value={booking.car} />
      </View>
    </View>
  );
}

function Info({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={15} color="#64748b" />
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: '#f6f8fb',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
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
  overviewCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    padding: 16,
  },
  overviewIcon: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  overviewContent: {
    flex: 1,
  },
  overviewValue: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
  },
  overviewLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  timeline: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  bookingId: {
    color: '#1f3b73',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  routeTitle: {
    color: '#101828',
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  infoItem: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  infoText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
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
  errorState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ffd7d7',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#1f3b73',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
