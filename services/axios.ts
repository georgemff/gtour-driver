import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert} from "react-native";
const http = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
});

http.interceptors.request.use(async (request) => {
    const token = await AsyncStorage.getItem("jwt_token");
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

        if(error.request) {
            Alert.alert("კავშირის პრობლემა", error.message ? error.message : "");
        }
        if(error.response && error.response.status === 401) {
            //TODO: Log out
            await AsyncStorage.removeItem("jwt_token");
        }

        return Promise.reject(error);
    })

export default http;
