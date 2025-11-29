import axios from "axios"
import { env } from "../envoriments"
import { getCookie } from "../utils/cookie";

export const api = axios.create({
    baseURL: env.baseURL
})

api.interceptors.request.use(async (config) => {
    const token = getCookie("@App:token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error)
        if (error.response && error.response.status === 401) {
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);