import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import Snack from '@/components/snack';
import { DriverBooking } from '@/models/booking.interface';
import { getDriverBooking, respondToDriverBooking } from '@/services/driver-app';

const dateFormatter = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function DriverBookingDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(params.id);
  const [booking, setBooking] = useState<DriverBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState<'accept' | 'decline' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackText, setSnackText] = useState('');

  const loadBooking = useCallback(async () => {
    if (!Number.isFinite(bookingId)) {
      setErrorMessage('ჯავშნის იდენტიფიკატორი არასწორია.');
      return;
    }

    try {
      setErrorMessage('');
      const result = await getDriverBooking(bookingId);
      setBooking(result);
    } catch {
      setErrorMessage('ჯავშნის ჩატვირთვა ვერ მოხერხდა.');
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking().finally(() => setLoading(false));
  }, [loadBooking]);

  const pending = booking?.statusLabel === 'Pending';
  const status = useMemo(() => getStatusMeta(booking?.statusLabel), [booking?.statusLabel]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBooking();
    } finally {
      setRefreshing(false);
    }
  };

  const respond = async (accepted: boolean) => {
    if (!booking || submitting) {
      return;
    }

    try {
      setSubmitting(accepted ? 'accept' : 'decline');
      const response = await respondToDriverBooking(booking.id, accepted);
      setBooking({
        ...booking,
        statusLabel: response.statusLabel,
      });
      setSnackText(accepted ? 'ჯავშანი დადასტურდა.' : 'ჯავშანი გაუქმდა.');
    } catch {
      setSnackText('სტატუსის შეცვლა ვერ მოხერხდა.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#101828" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>ჯავშნის დეტალები</Text>
            <Text style={styles.title}>{booking?.publicId || 'ჯავშანი'}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#1f3b73" />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={42} color="#b42318" />
            <Text style={styles.errorTitle}>მონაცემები ვერ ჩაიტვირთა</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={loadBooking} style={styles.retryButton}>
              <Ionicons name="refresh-outline" size={17} color="#ffffff" />
              <Text style={styles.retryButtonText}>თავიდან ცდა</Text>
            </TouchableOpacity>
          </View>
        ) : booking ? (
          <>
            <View style={styles.statusBanner}>
              <View style={[styles.statusIcon, { backgroundColor: status.background }]}>
                <Ionicons name={status.icon} size={22} color={status.color} />
              </View>
              <View style={styles.statusTextBlock}>
                <Text style={[styles.statusTitle, { color: status.color }]}>{status.title}</Text>
                <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>მარშრუტი</Text>
              <RouteLine icon="navigate-circle-outline" label="საიდან" value={booking.from} />
              <View style={styles.routeSeparator} />
              <RouteLine icon="location-outline" label="სად" value={booking.to} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ინფორმაცია</Text>
              <InfoRow icon="person-outline" label="მგზავრი" value={booking.travelerName} />
              <InfoRow icon="calendar-outline" label="აღება" value={formatDateTime(booking.pickupDate, booking.pickupTime)} />
              <InfoRow icon="calendar-clear-outline" label="დასრულება" value={dateFormatter.format(new Date(booking.dropoffDate))} />
              <InfoRow icon="people-outline" label="მგზავრები" value={`${booking.persons || 0}`} />
              <InfoRow icon="paw-outline" label="ცხოველი" value={booking.pets ? 'კი' : 'არა'} />
              <InfoRow icon="car-sport-outline" label="მანქანა" value={booking.car} />
            </View>

            {booking.notes ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>კომენტარი</Text>
                <Text style={styles.notes}>{booking.notes}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={!pending || !!submitting}
                onPress={() => respond(false)}
                style={[styles.actionButton, styles.declineButton, (!pending || !!submitting) && styles.disabledButton]}>
                {submitting === 'decline' ? (
                  <ActivityIndicator color="#b42318" />
                ) : (
                  <>
                    <Ionicons name="close-outline" size={20} color="#b42318" />
                    <Text style={styles.declineButtonText}>გაუქმება</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={!pending || !!submitting}
                onPress={() => respond(true)}
                style={[styles.actionButton, styles.acceptButton, (!pending || !!submitting) && styles.disabledButton]}>
                {submitting === 'accept' ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-outline" size={20} color="#ffffff" />
                    <Text style={styles.acceptButtonText}>დადასტურება</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </ScrollView>
      <Snack visible={!!snackText} text={snackText} onDismiss={() => setSnackText('')} />
    </SafeAreaView>
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
      <View style={styles.routeTextBlock}>
        <Text style={styles.routeLabel}>{label}</Text>
        <Text style={styles.routeValue}>{value}</Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color="#1f3b73" />
      </View>
      <View style={styles.routeTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function getStatusMeta(statusLabel?: string) {
  if (statusLabel === 'Accepted') {
    return {
      title: 'ჯავშანი დადასტურებულია',
      subtitle: 'მგზავრს უკვე გაეგზავნა შეტყობინება.',
      icon: 'checkmark-circle-outline' as const,
      color: '#15803d',
      background: '#dcfce7',
    };
  }

  if (statusLabel === 'Canceled') {
    return {
      title: 'ჯავშანი გაუქმებულია',
      subtitle: 'მგზავრს უკვე გაეგზავნა შეტყობინება.',
      icon: 'close-circle-outline' as const,
      color: '#b42318',
      background: '#fee4e2',
    };
  }

  return {
    title: 'ახალი ჯავშნის მოთხოვნა',
    subtitle: 'აირჩიე დადასტურება ან გაუქმება.',
    icon: 'alert-circle-outline' as const,
    color: '#1f3b73',
    background: '#e9effc',
  };
}

function formatDateTime(date: string, time: string) {
  return `${dateFormatter.format(new Date(date))}, ${time}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  headerText: {
    flex: 1,
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
  stateCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 50,
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
  statusBanner: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 16,
  },
  statusIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  statusSubtitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  routeLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  routeTextBlock: {
    flex: 1,
  },
  routeSeparator: {
    backgroundColor: '#dbe3ef',
    height: 1,
    marginLeft: 30,
    marginVertical: 12,
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
    lineHeight: 21,
    marginTop: 2,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 9,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
    marginTop: 2,
  },
  notes: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  declineButton: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffd7d7',
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: '#1f3b73',
  },
  disabledButton: {
    opacity: 0.45,
  },
  declineButtonText: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '900',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
