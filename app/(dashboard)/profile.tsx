import { useUser } from "@/hooks/use-user";
import {Alert, Button, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";


export default function ProfileScreen() {

    const { logout, user } = useUser();

    const onLogout = () => {
        Alert.alert("Warning", "ნამდვილად გსურს სისტემიდან გასვლა?" ,[
            {
                text: "არა",
                onPress: () => {},
                style: "default",
                isPreferred: true
            },
            {
                text: "დიახ",
                onPress: () => logout(),
                style: "destructive",
            },

        ])
    }
    return (
        <SafeAreaView style={styles.areaView}>
            <View style={{
                flex: 1,
            }}>
                <Text style={styles.infoTitle}>პირადი ინფორმაცია</Text>
                <Text style={styles.name}>
                    {user?.firstName} {user?.lastName}
                </Text>

            </View>

            <Button
                title="გასვლა"
                onPress={onLogout}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    areaView: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: 24,
        paddingTop: 32
    },
    name: {
        textTransform: "capitalize",
    },
    infoTitle: {
        fontWeight: "500",
        fontSize: 18,
        marginBottom: 8
    }
})