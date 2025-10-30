import { useState } from "react";
import { Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useUser } from '@/hooks/use-user';
import Snack from "@/components/snack";

export default function LoginScreen() {

    const { login } = useUser();
    const [disableButton, setDisableButton] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackBarText, setSnackBarText] = useState<string>("");

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const loginSubmit = async () => {
        console.log('Login');
        if(!userName || !password) {
            setSnackBarText("შეიყვანეთ სახელი და პაროლი");
            setShowSnackbar(true);
            return;
        }
        setDisableButton(true);
        login(userName, password)
            .then((result: boolean) => {
                if(result) {
                    setDisableButton(false);
                }
            })
            .catch((_error: Error) => {
                setDisableButton(false);
            })
    }

    const snackBarDismiss = () => {
        setShowSnackbar(false);
        setSnackBarText("");
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.header}>სისტემაში შესვლა</Text>
                    <TextInput placeholder="სახელი"
                        onChangeText={setUserName} style={styles.textInput}
                        value={userName} />
                    <TextInput secureTextEntry={true} placeholder="პაროლი"
                        onChangeText={setPassword}
                        value={password} style={styles.textInput} />

                    <Button
                        disabled={disableButton}
                        title="შესვლა"
                        onPress={loginSubmit}
                    />
                </View>
            </TouchableWithoutFeedback>
            <Snack visible={showSnackbar} text={snackBarText} onDismiss={snackBarDismiss} />
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    inner: {
        padding: 24,
        rowGap: 16,
        marginBottom: 64
    },
    header: {
        fontSize: 32,
        marginBottom: 48,
        textAlign: 'center',
    },
    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
    }
});