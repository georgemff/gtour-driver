import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useUser } from '@/hooks/use-user';

export default function ProfileScreen() {
  const { logout, user } = useUser();
  const [imageFailed, setImageFailed] = useState(false);

  const initials = useMemo(() => {
    const firstName = user?.firstName?.[0] ?? '';
    const lastName = user?.lastName?.[0] ?? '';
    return `${firstName}${lastName}`.toUpperCase() || 'DR';
  }, [user]);

  const profilePictureUrl = user?.profilePictureUrl || user?.profilePicture;
  const showProfilePicture = Boolean(profilePictureUrl && !imageFailed);

  useEffect(() => {
    setImageFailed(false);
  }, [profilePictureUrl]);

  const onLogout = () => {
    Alert.alert('Warning', 'ნამდვილად გსურს სისტემიდან გასვლა?', [
      {
        text: 'არა',
        onPress: () => {},
        style: 'default',
        isPreferred: true,
      },
      {
        text: 'დიახ',
        onPress: () => logout(),
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>მძღოლის სივრცე</Text>
          <Text style={styles.title}>პროფილი</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {showProfilePicture ? (
              <Image
                source={{ uri: profilePictureUrl }}
                onError={() => setImageFailed(true)}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.role}>Movezzy Driver</Text>
        </View>

        <View style={styles.detailsCard}>
          <InfoRow icon="person-outline" label="სახელი" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} />
          <InfoRow icon="mail-outline" label="ელ. ფოსტა" value={user?.email ?? 'არ არის მითითებული'} />
          <InfoRow icon="shield-checkmark-outline" label="სტატუსი" value="აქტიური" />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push('/change-password' as never)}
          style={styles.changePasswordButton}>
          <Ionicons name="key-outline" size={20} color="#1f3b73" />
          <Text style={styles.changePasswordText}>პაროლის შეცვლა</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#b42318" />
          <Text style={styles.logoutText}>გასვლა</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 22,
    marginBottom: 16,
    padding: 24,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    width: 64,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarText: {
    color: '#1f3b73',
    fontSize: 21,
    fontWeight: '900',
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  role: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: '#edf2f7',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  infoValue: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#fff1f1',
    borderColor: '#ffd7d7',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  changePasswordButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  changePasswordText: {
    color: '#1f3b73',
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutText: {
    color: '#b42318',
    fontSize: 16,
    fontWeight: '800',
  },
});
