import {Snackbar} from "react-native-paper";


export default function Snack({visible, text, onDismiss} : {
    visible: boolean,
    text: string,
    onDismiss: any
}) {
    return (
        <Snackbar
            visible={visible}
            wrapperStyle={{
                top: 50
            }}
            onDismiss={onDismiss}
            duration={2000}
            action={{
                label: 'გათიშვა',
                onPress: () => {
                    onDismiss()
                },
            }}>
            {text}
        </Snackbar>
    )
}