import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Snack from '@/components/snack';
import {
  cancelDriverVacation,
  DriverAvailabilityBlock,
  finishDriverVacation,
  getDriverAvailability,
  saveDriverAvailability,
} from '@/services/driver-app';

const weekDays = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვ'];

const monthFormatter = new Intl.DateTimeFormat('ka-GE', {
  month: 'long',
  year: 'numeric',
});

const vacationDateFormatter = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function AvailabilityScreen() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarText, setSnackBarText] = useState('');
  const [rangeStartDate, setRangeStartDate] = useState<string | null>(null);
  const [vacationBlocks, setVacationBlocks] = useState<DriverAvailabilityBlock[]>([]);
  const [updatingVacationId, setUpdatingVacationId] = useState<number | null>(null);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const availability = await getDriverAvailability();
      setUnavailableDates([]);
      setVacationBlocks(availability.blocks);
      setRangeStartDate(null);
    } catch {
      setLoadError('კალენდრის ჩატვირთვა ვერ მოხერხდა.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const visibleMonthLabel = monthFormatter.format(visibleMonth);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const toggleDate = (dateKey: string) => {
    if (dateKey < todayKey) {
      return;
    }

    setSaveError('');

    if (!rangeStartDate) {
      setRangeStartDate(dateKey);
      setUnavailableDates([dateKey]);
      return;
    }

    if (rangeStartDate === dateKey && unavailableDates.length === 1) {
      setRangeStartDate(null);
      setUnavailableDates([]);
      return;
    }

    setUnavailableDates(() => {
      const rangeDates = getDateRange(rangeStartDate, dateKey);
      setRangeStartDate(null);
      return rangeDates;
    });
  };

  const changeMonth = (direction: -1 | 1) => {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + direction);
      return startOfMonth(nextMonth);
    });
  };

  const saveDates = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const result = await saveDriverAvailability(unavailableDates);
      setUnavailableDates([]);
      setVacationBlocks(result.blocks);
      setRangeStartDate(null);
      setSnackBarText('შვებულების დღეები შენახულია');
      setShowSnackbar(true);
    } catch (error) {
      const apiMessage = getApiErrorMessage(error);
      if (apiMessage.includes('VACATION_DATES_OVERLAP_ACTIVE_BOOKING')) {
        const conflictDetails = apiMessage.split('VACATION_DATES_OVERLAP_ACTIVE_BOOKING:')[1]?.trim();
        setSaveError(
          conflictDetails
            ? `არჩეულ დღეებში აქტიური შეკვეთა გაქვს (${conflictDetails}). ამ დღეებზე შვებულების მონიშვნა შეუძლებელია.`
            : 'არჩეულ დღეებში აქტიური შეკვეთა გაქვს. ამ დღეებზე შვებულების მონიშვნა შეუძლებელია.',
        );
      } else if (apiMessage.includes('VACATION_MUST_BE_ONE_CONTINUOUS_RANGE')) {
        setSaveError('შვებულება უნდა იყოს ერთი უწყვეტი პერიოდი.');
      } else if (apiMessage.includes('VACATION_DATES_CANNOT_BE_IN_PAST')) {
        setSaveError('წარსული დღეების არჩევა შეუძლებელია.');
      } else if (apiMessage.includes('VACATION_DATES_OVERLAP_EXISTING_VACATION')) {
        const conflictDetails = apiMessage.split('VACATION_DATES_OVERLAP_EXISTING_VACATION:')[1]?.trim();
        setSaveError(
          conflictDetails
            ? `არჩეული დღეები ემთხვევა არსებულ შვებულებას (${conflictDetails}).`
            : 'არჩეული დღეები ემთხვევა არსებულ შვებულებას.',
        );
      } else {
        setSaveError('ცვლილებების შენახვა ვერ მოხერხდა. სცადე თავიდან.');
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelVacation = (vacationId: number) => {
    Alert.alert('შვებულების გაუქმება', 'ნამდვილად გსურს ამ შვებულების გაუქმება?', [
      {
        text: 'არა',
        style: 'cancel',
      },
      {
        text: 'დიახ',
        style: 'destructive',
        onPress: async () => {
          if (updatingVacationId) {
            return;
          }

          setUpdatingVacationId(vacationId);
          setSaveError('');
          try {
            const result = await cancelDriverVacation(vacationId);
            setUnavailableDates([]);
            setVacationBlocks(result.blocks);
            setRangeStartDate(null);
            setSnackBarText('შვებულება გაუქმებულია');
            setShowSnackbar(true);
          } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            if (apiMessage.includes('FINISHED_VACATION_CANNOT_BE_CANCELED')) {
              setSaveError('დასრულებული შვებულების გაუქმება შეუძლებელია.');
            } else {
              setSaveError('შვებულების გაუქმება ვერ მოხერხდა. სცადე თავიდან.');
            }
          } finally {
            setUpdatingVacationId(null);
          }
        },
      },
    ]);
  };

  const finishVacation = (vacationId: number) => {
    Alert.alert('შვებულების დასრულება', 'ნამდვილად გსურს ამ შვებულების დღეს დასრულება?', [
      {
        text: 'არა',
        style: 'cancel',
      },
      {
        text: 'დიახ',
        onPress: async () => {
          if (updatingVacationId) {
            return;
          }

          setUpdatingVacationId(vacationId);
          setSaveError('');
          try {
            const result = await finishDriverVacation(vacationId);
            setUnavailableDates([]);
            setVacationBlocks(result.blocks);
            setRangeStartDate(null);
            setSnackBarText('შვებულება დასრულებულია');
            setShowSnackbar(true);
          } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            if (apiMessage.includes('FUTURE_VACATION_CANNOT_BE_FINISHED')) {
              setSaveError('მომავალი შვებულების დასრულება შეუძლებელია. შეგიძლია გააუქმო.');
            } else if (apiMessage.includes('VACATION_ALREADY_FINISHED')) {
              setSaveError('შვებულება უკვე დასრულებულია.');
            } else {
              setSaveError('შვებულების დასრულება ვერ მოხერხდა. სცადე თავიდან.');
            }
          } finally {
            setUpdatingVacationId(null);
          }
        },
      },
    ]);
  };

  const selectedDatesInMonth = unavailableDates.filter((date) =>
    date.startsWith(toMonthKey(visibleMonth)),
  );
  const sortedVacationBlocks = useMemo(
    () =>
      [...vacationBlocks].sort((firstBlock, secondBlock) => {
        const firstFinished = firstBlock.endDate < todayKey;
        const secondFinished = secondBlock.endDate < todayKey;

        if (firstFinished !== secondFinished) {
          return firstFinished ? 1 : -1;
        }

        return firstFinished
          ? secondBlock.startDate.localeCompare(firstBlock.startDate)
          : firstBlock.startDate.localeCompare(secondBlock.startDate);
      }),
    [todayKey, vacationBlocks],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>შენი კალენდარი</Text>
          <Text style={styles.title}>ხელმისაწვდომობა</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="airplane-outline" size={22} color="#1f3b73" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>მონიშნე შვებულების დღეები</Text>
            <Text style={styles.infoText}>
              მონიშნულ დღეებში ახალი შეკვეთები აღარ უნდა დაგენიშნოს.
            </Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => changeMonth(-1)}
              style={styles.monthButton}>
              <Ionicons name="chevron-back" size={20} color="#101828" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{visibleMonthLabel}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => changeMonth(1)}
              style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={20} color="#101828" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#1f3b73" />
            </View>
          ) : loadError ? (
            <View style={styles.errorState}>
              <Ionicons name="cloud-offline-outline" size={38} color="#b42318" />
              <Text style={styles.errorTitle}>კალენდარი ვერ ჩაიტვირთა</Text>
              <Text style={styles.errorText}>{loadError}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={loadAvailability}
                style={styles.retryButton}>
                <Ionicons name="refresh-outline" size={17} color="#ffffff" />
                <Text style={styles.retryButtonText}>თავიდან ცდა</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.daysGrid}>
              {calendarDays.map((day) => {
                const isSelected = unavailableSet.has(day.key);
                const isCurrentMonth = day.month === visibleMonth.getMonth();
                const isPastDate = day.key < todayKey;
                const hasPreviousSelectedDate = unavailableSet.has(addDays(day.key, -1));
                const hasNextSelectedDate = unavailableSet.has(addDays(day.key, 1));
                const isRangeStart = isSelected && !hasPreviousSelectedDate;
                const isRangeEnd = isSelected && !hasNextSelectedDate;
                const isRangeMiddle = isSelected && hasPreviousSelectedDate && hasNextSelectedDate;

                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={isPastDate}
                    key={day.key}
                    onPress={() => toggleDate(day.key)}
                    style={[
                      styles.dayButton,
                      !isCurrentMonth && styles.dayButtonMuted,
                      isPastDate && styles.dayButtonDisabled,
                      isRangeMiddle && styles.dayButtonRangeMiddle,
                      isSelected && !isRangeMiddle && styles.dayButtonSelected,
                      isRangeStart && styles.dayButtonRangeStart,
                      isRangeEnd && styles.dayButtonRangeEnd,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        !isCurrentMonth && styles.dayTextMuted,
                        isPastDate && styles.dayTextDisabled,
                        isRangeMiddle && styles.dayTextRangeMiddle,
                        isSelected && !isRangeMiddle && styles.dayTextSelected,
                      ]}>
                      {day.date.getDate()}
                    </Text>
                    {isSelected && !isRangeMiddle ? <View style={styles.dayMarker} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <Text style={styles.rangeHint}>
          {rangeStartDate
            ? 'აირჩიე შვებულების დასრულების დღე'
            : 'აირჩიე შვებულების პირველი დღე, შემდეგ დასრულების დღე'}
        </Text>

        <View style={styles.selectionCard}>
          <View>
            <Text style={styles.selectionTitle}>არჩეული დღეები</Text>
            <Text style={styles.selectionText}>
              {selectedDatesInMonth.length
                ? `${selectedDatesInMonth.length} დღე ამ თვეში`
                : 'ამ თვეში დღეები არ არის მონიშნული'}
            </Text>
          </View>
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionBadgeText}>{unavailableDates.length}</Text>
          </View>
        </View>

        {saveError ? (
          <View style={styles.saveErrorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#b42318" />
            <Text style={styles.saveErrorText}>{saveError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!unavailableDates.length || saving || Boolean(loadError)}
          onPress={saveDates}
          style={[
            styles.saveButton,
            (!unavailableDates.length || saving || Boolean(loadError)) && styles.saveButtonDisabled,
          ]}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>შენახვა</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.vacationsSection}>
          <Text style={styles.vacationsTitle}>შვებულებები</Text>
          {sortedVacationBlocks.length ? (
            <View style={styles.vacationsList}>
              {sortedVacationBlocks.map((block) => (
                <VacationCard
                  key={block.id}
                  block={block}
                  updating={updatingVacationId === block.id}
                  onCancel={cancelVacation}
                  onFinish={finishVacation}
                  todayKey={todayKey}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyVacationCard}>
              <Ionicons name="calendar-clear-outline" size={20} color="#64748b" />
              <Text style={styles.emptyVacationText}>შვებულება ჯერ არ არის დამატებული</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <Snack
        visible={showSnackbar}
        text={snackBarText}
        onDismiss={() => {
          setShowSnackbar(false);
          setSnackBarText('');
        }}
      />
    </SafeAreaView>
  );
}

function VacationCard({
  block,
  updating,
  onCancel,
  onFinish,
  todayKey,
}: {
  block: DriverAvailabilityBlock;
  updating: boolean;
  onCancel: (vacationId: number) => void;
  onFinish: (vacationId: number) => void;
  todayKey: string;
}) {
  const isFinished = block.endDate < todayKey;
  const isOngoing = block.startDate <= todayKey && block.endDate >= todayKey;
  const daysCount = getDateRange(block.startDate, block.endDate).length;
  const dateLabel =
    block.startDate === block.endDate
      ? formatVacationDate(block.startDate)
      : `${formatVacationDate(block.startDate)} - ${formatVacationDate(block.endDate)}`;

  return (
    <View style={styles.vacationCard}>
      <View style={styles.vacationIcon}>
        <Ionicons name="calendar-outline" size={18} color="#1f3b73" />
      </View>
      <View style={styles.vacationContent}>
        <Text style={styles.vacationDates}>{dateLabel}</Text>
        <Text style={styles.vacationDays}>{daysCount} დღე</Text>
      </View>
      <View style={[styles.vacationStatus, isFinished && styles.vacationStatusFinished]}>
        <Text style={[styles.vacationStatusText, isFinished && styles.vacationStatusTextFinished]}>
          {isFinished ? 'დასრულებული' : 'აქტიური'}
        </Text>
      </View>
      {!isFinished ? (
        <TouchableOpacity
          accessibilityRole="button"
          disabled={updating}
          onPress={() => (isOngoing ? onFinish(block.id) : onCancel(block.id))}
          style={[
            styles.vacationActionButton,
            isOngoing && styles.vacationFinishButton,
            updating && styles.vacationActionButtonDisabled,
          ]}>
          {updating ? (
            <ActivityIndicator color="#b42318" size="small" />
          ) : (
            <>
              <Ionicons
                name={isOngoing ? 'checkmark-outline' : 'close-outline'}
                size={15}
                color={isOngoing ? '#166534' : '#b42318'}
              />
              <Text
                style={[
                  styles.vacationActionText,
                  isOngoing && styles.vacationFinishText,
                ]}>
                {isOngoing ? 'დასრულება' : 'გაუქმება'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  return '';
}

function formatVacationDate(dateKey: string) {
  return vacationDateFormatter.format(new Date(`${dateKey}T12:00:00`));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getDateRange(startDate: string, endDate: string) {
  const rangeStart = startDate <= endDate ? startDate : endDate;
  const rangeEnd = startDate <= endDate ? endDate : startDate;
  const dates: string[] = [];
  let currentDate = rangeStart;

  while (currentDate <= rangeEnd) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      month: date.getMonth(),
    };
  });
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
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    padding: 16,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '800',
  },
  infoText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  monthTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    color: '#64748b',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    height: 260,
    justifyContent: 'center',
  },
  errorState: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  errorTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
  },
  errorText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#1f3b73',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayButton: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayButtonMuted: {
    opacity: 0.35,
  },
  dayButtonDisabled: {
    opacity: 0.22,
  },
  dayButtonSelected: {
    backgroundColor: '#1f3b73',
  },
  dayButtonRangeMiddle: {
    backgroundColor: '#e7eefb',
    borderRadius: 8,
  },
  dayButtonRangeStart: {
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
  },
  dayButtonRangeEnd: {
    borderBottomRightRadius: 14,
    borderTopRightRadius: 14,
  },
  dayText: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  dayTextMuted: {
    color: '#64748b',
  },
  dayTextDisabled: {
    color: '#94a3b8',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  dayTextRangeMiddle: {
    color: '#1f3b73',
  },
  dayMarker: {
    backgroundColor: '#ffffff',
    borderRadius: 3,
    height: 4,
    marginTop: 4,
    width: 4,
  },
  rangeHint: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  selectionCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
  },
  selectionTitle: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '800',
  },
  selectionText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  selectionBadge: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 16,
    minWidth: 46,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectionBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  saveErrorCard: {
    alignItems: 'center',
    backgroundColor: '#fff1f1',
    borderColor: '#ffd7d7',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveErrorText: {
    color: '#b42318',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#1f3b73',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 52,
  },
  saveButtonDisabled: {
    backgroundColor: '#a7b2c5',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  vacationsSection: {
    marginTop: 18,
  },
  vacationsTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  vacationsList: {
    gap: 10,
  },
  vacationCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  vacationIcon: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  vacationContent: {
    flex: 1,
  },
  vacationDates: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '900',
  },
  vacationDays: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  vacationStatus: {
    backgroundColor: '#eaf8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  vacationStatusFinished: {
    backgroundColor: '#f1f5f9',
  },
  vacationStatusText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '900',
  },
  vacationStatusTextFinished: {
    color: '#64748b',
  },
  vacationActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff1f1',
    borderColor: '#ffd7d7',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 8,
  },
  vacationFinishButton: {
    backgroundColor: '#eaf8f0',
    borderColor: '#bbf0cf',
  },
  vacationActionButtonDisabled: {
    opacity: 0.6,
  },
  vacationActionText: {
    color: '#b42318',
    fontSize: 11,
    fontWeight: '900',
  },
  vacationFinishText: {
    color: '#166534',
  },
  emptyVacationCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  emptyVacationText: {
    color: '#64748b',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
});
