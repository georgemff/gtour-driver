import { useUser } from "@/hooks/use-user";
import { Stack } from "expo-router";

export default function AppStack() {
    const { isAuth } = useUser();

    return (
        <Stack>
            <Stack.Protected guard={isAuth}>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!isAuth}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>)
}