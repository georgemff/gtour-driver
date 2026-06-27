import {createContext, useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, View} from "react-native";
import http from "@/services/axios";
import Snack from "@/components/snack";

export const UserContext = createContext();

export default function UserProvider({children}) {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");

    useEffect(() => {
        const checkStorage = async () => {
            const token = await AsyncStorage.getItem("jwt_token");

            if (!token) {
                setLoading(false);
                return;
            }

            http.get("/profile/driver-info")
                .then(response => {
                    if (response.data.success) {
                        setUser(response.data.data)
                        setIsAuth(true);
                    }

                })
                .catch(async err => {
                    console.error(err);
                    if (err.response?.status === 401) {
                        await AsyncStorage.removeItem("jwt_token");
                        setIsAuth(false)
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        checkStorage();
    }, [])


    async function login(userName, password) {
       try {
           const axiosResponse = await http.post(`/auth/login-driver`, {email: userName, password});
           if(axiosResponse.data?.data) {
               await AsyncStorage.setItem("jwt_token", axiosResponse.data.data.access_token);
               setUser(axiosResponse.data.data);
               setIsAuth(true);

           }
           return true;

       } catch(error) {
           if(error.response?.status === 401) {
               setSnackBarText('არასწორი სახელი ან პაროლი');
               setShowSnackbar(true);
           } else if (!error.response) {
               setSnackBarText('კავშირის პრობლემა. სცადე თავიდან');
               setShowSnackbar(true);
           } else {
               setSnackBarText('შესვლა ვერ მოხერხდა');
               setShowSnackbar(true);
           }

           throw error;
       }
    }

    async function logout() {
        setIsAuth(false)
        await AsyncStorage.removeItem("jwt_token");


    }

    return (
        <UserContext.Provider value={{user, isAuth, login, logout}}>
            {
                loading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Text style={{
                            fontSize: 24,
                        }}>Loading...</Text>
                    </View>
                ) : children
            }
            <Snack visible={showSnackbar} text={snackBarText} onDismiss={() => {
                setShowSnackbar(false);
                setSnackBarText("")
            }} />

        </UserContext.Provider>
    );
}
