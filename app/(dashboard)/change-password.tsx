import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Snack from '@/components/snack';
import { useUser } from '@/hooks/use-user';

export default function ChangePasswordScreen() {
  const { changePassword, user } = useUser();
  const params = useLocalSearchParams<{ required?: string }>();
  const isRequired = params.required === '1' || user?.isFirstLogin;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarText, setSnackBarText] = useState('');

  const showMessage = (message: string) => {
    setSnackBarText(message);
    setShowSnackbar(true);
  };

  const submit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('შეავსე ყველა ველი');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('ახალი პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('ახალი პაროლები არ ემთხვევა');
      return;
    }

    if (currentPassword === newPassword) {
      showMessage('ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      showMessage('პაროლი წარმატებით შეიცვალა');
      router.replace('/profile' as never);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showMessage('მიმდინარე პაროლი არასწორია');
      } else if (!error.response) {
        showMessage('კავშირის პრობლემა. სცადე თავიდან');
      } else {
        showMessage('პაროლის შეცვლა ვერ მოხერხდა');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (isRequired) {
      router.replace('/profile' as never);
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={goBack}
                style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#101828" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>
                  {isRequired ? 'პირველი შესვლა' : 'უსაფრთხოება'}
                </Text>
                <Text style={styles.title}>პაროლის შეცვლა</Text>
              </View>
            </View>

            {isRequired ? (
              <View style={styles.notice}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#1f3b73" />
                <Text style={styles.noticeText}>
                  ანგარიშის უსაფრთხოებისთვის შეცვალე დროებითი პაროლი.
                </Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <PasswordInput
                icon="lock-closed-outline"
                label="მიმდინარე პაროლი"
                onChangeText={setCurrentPassword}
                placeholder="შეიყვანე მიმდინარე პაროლი"
                value={currentPassword}
              />
              <PasswordInput
                icon="key-outline"
                label="ახალი პაროლი"
                onChangeText={setNewPassword}
                placeholder="მინიმუმ 8 სიმბოლო"
                value={newPassword}
              />
              <PasswordInput
                icon="checkmark-circle-outline"
                label="გაიმეორე ახალი პაროლი"
                onChangeText={setConfirmPassword}
                placeholder="გაიმეორე ახალი პაროლი"
                value={confirmPassword}
              />

              <TouchableOpacity
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={submit}
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>შენახვა</Text>
                    <Ionicons name="save-outline" size={19} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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

function PasswordInput({
  icon,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={19} color="#64748b" />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.textInput}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f6f8fb',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 32,
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
    fontSize: 27,
    fontWeight: '900',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderColor: '#c7d7fe',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  noticeText: {
    color: '#1f3b73',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#dbe3ef',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  textInput: {
    color: '#101828',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 52,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#1f3b73',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
  },
  submitButtonDisabled: {
    backgroundColor: '#a7b2c5',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
