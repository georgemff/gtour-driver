import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginScreen() {
  const { login } = useUser();
  const [disableButton, setDisableButton] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarText, setSnackBarText] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const loginSubmit = async () => {
    if (!userName || !password) {
      setSnackBarText('შეიყვანეთ სახელი და პაროლი');
      setShowSnackbar(true);
      return;
    }

    setDisableButton(true);
    login(userName, password)
      .then((result: boolean) => {
        if (result) {
          setDisableButton(false);
        }
      })
      .catch((_error: Error) => {
        setDisableButton(false);
      });
  };

  const snackBarDismiss = () => {
    setShowSnackbar(false);
    setSnackBarText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.brandBlock}>
              <View style={styles.logoMark}>
                <Ionicons name="car-sport" size={30} color="#ffffff" />
              </View>
              <Text style={styles.brand}>Movezzy Driver</Text>
              <Text style={styles.subtitle}>შეკვეთები, კალენდარი და რეისები ერთ სივრცეში.</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>სისტემაში შესვლა</Text>
              <Text style={styles.formText}>გააგრძელე მძღოლის ანგარიშით.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ელ. ფოსტა ან სახელი</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="person-outline" size={19} color="#64748b" />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setUserName}
                    placeholder="შეიყვანე სახელი"
                    placeholderTextColor="#94a3b8"
                    style={styles.textInput}
                    value={userName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>პაროლი</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="lock-closed-outline" size={19} color="#64748b" />
                  <TextInput
                    onChangeText={setPassword}
                    placeholder="შეიყვანე პაროლი"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    style={styles.textInput}
                    value={password}
                  />
                </View>
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={disableButton}
                onPress={loginSubmit}
                style={[styles.loginButton, disableButton && styles.loginButtonDisabled]}>
                {disableButton ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>შესვლა</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Snack visible={showSnackbar} text={snackBarText} onDismiss={snackBarDismiss} />
    </SafeAreaView>
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
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64,
  },
  brand: {
    color: '#101828',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 290,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe3ef',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
  },
  formTitle: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
  },
  formText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 5,
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
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#1f3b73',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
  },
  loginButtonDisabled: {
    backgroundColor: '#a7b2c5',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
