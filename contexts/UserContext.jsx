import {createContext, useEffect, useState} from "react";
import {Text, View} from "react-native";
import http from "@/services/axios";
import Snack from "@/components/snack";
import {
    clearAuthSession,
    getStoredAuthToken,
    getStoredAuthUser,
    storeAuthSession,
} from "@/services/auth-storage";
import {changeDriverPassword} from "@/services/driver-app";

export const UserContext = createContext();

export default function UserProvider({children}) {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");

    useEffect(() => {
        const checkStorage = async () => {
            const [token, storedUser] = await Promise.all([
                getStoredAuthToken(),
                getStoredAuthUser(),
            ]);

            if (!token) {
                setLoading(false);
                return;
            }

            if (storedUser) {
                setUser(storedUser);
                setIsAuth(true);
            }

            http.get("/profile/driver-info")
                .then(async response => {
                    if (response.data.success) {
                        const driver = response.data.data;
                        setUser(driver)
                        setIsAuth(true);
                        await storeAuthSession(token, driver);
                    }

                })
                .catch(async err => {
                    console.error(err);
                    if (err.response?.status === 401) {
                        await clearAuthSession();
                        setUser(null);
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
               const {access_token, ...driver} = axiosResponse.data.data;

               await storeAuthSession(access_token, driver);
               setUser(driver);
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
        setUser(null);
        setIsAuth(false)
        await clearAuthSession();


    }

    async function changePassword(currentPassword, newPassword) {
        const updatedUser = await changeDriverPassword(currentPassword, newPassword);
        const token = await getStoredAuthToken();

        if (token) {
            await storeAuthSession(token, updatedUser);
        }

        setUser(updatedUser);

        return updatedUser;
    }

    return (
        <UserContext.Provider value={{user, isAuth, login, logout, changePassword}}>
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
