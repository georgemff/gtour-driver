import axios from "axios";
import {Alert} from "react-native";
import {getStoredAuthToken} from "@/services/auth-storage";

const http = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 15000,
});

http.interceptors.request.use(async (request) => {
    const token = await getStoredAuthToken();
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
}, error => {
    console.log("Request Error", error);
    if(error.request) {
        Alert.alert("კავშირის პრობლემა", error.message ? error.message : "");
    }
    return Promise.reject(error)
});

http.interceptors.response.use((response) => response,
    async (error) => {
        console.log("Response Error", error);

        if(error.request && !error.response) {
            Alert.alert("კავშირის პრობლემა", error.message ? error.message : "");
        }
        return Promise.reject(error);
    })

export default http;
