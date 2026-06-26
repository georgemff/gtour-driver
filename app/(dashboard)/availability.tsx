import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUnavailableDates, saveUnavailableDates } from '@/services/driver-app';

const weekDays = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვ'];

const monthFormatter = new Intl.DateTimeFormat('ka-GE', {
  month: 'long',
  year: 'numeric',
});

const selectedDateFormatter = new Intl.DateTimeFormat('ka-GE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function AvailabilityScreen() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUnavailableDates()
      .then((dates) => {
        setUnavailableDates(dates);
        setSavedDates(dates);
      })
      .finally(() => setLoading(false));
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);
  const hasChanges = unavailableDates.join(',') !== savedDates.join(',');
  const visibleMonthLabel = monthFormatter.format(visibleMonth);

  const toggleDate = (dateKey: string) => {
    setUnavailableDates((currentDates) => {
      if (currentDates.includes(dateKey)) {
        return currentDates.filter((date) => date !== dateKey);
      }

      return [...currentDates, dateKey].sort();
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
    setSaving(true);
    const result = await saveUnavailableDates(unavailableDates);
    setUnavailableDates(result);
    setSavedDates(result);
    setSaving(false);
  };

  const selectedDatesInMonth = unavailableDates.filter((date) =>
    date.startsWith(toMonthKey(visibleMonth)),
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
          ) : (
            <View style={styles.daysGrid}>
              {calendarDays.map((day) => {
                const isSelected = unavailableSet.has(day.key);
                const isCurrentMonth = day.month === visibleMonth.getMonth();

                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={day.key}
                    onPress={() => toggleDate(day.key)}
                    style={[
                      styles.dayButton,
                      !isCurrentMonth && styles.dayButtonMuted,
                      isSelected && styles.dayButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        !isCurrentMonth && styles.dayTextMuted,
                        isSelected && styles.dayTextSelected,
                      ]}>
                      {day.date.getDate()}
                    </Text>
                    {isSelected ? <View style={styles.dayMarker} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

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

        {selectedDatesInMonth.length ? (
          <View style={styles.selectedList}>
            {selectedDatesInMonth.map((date) => (
              <View key={date} style={styles.selectedPill}>
                <Ionicons name="calendar-outline" size={15} color="#1f3b73" />
                <Text style={styles.selectedPillText}>
                  {selectedDateFormatter.format(new Date(`${date}T12:00:00`))}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!hasChanges || saving}
          onPress={saveDates}
          style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>შენახვა</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
  dayButtonSelected: {
    backgroundColor: '#1f3b73',
  },
  dayText: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  dayTextMuted: {
    color: '#64748b',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  dayMarker: {
    backgroundColor: '#ffffff',
    borderRadius: 3,
    height: 4,
    marginTop: 4,
    width: 4,
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
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedPill: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectedPillText: {
    color: '#1f3b73',
    fontSize: 12,
    fontWeight: '800',
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
});
