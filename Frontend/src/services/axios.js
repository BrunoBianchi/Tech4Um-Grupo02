import axios from "axios"
import { env } from "../envoriments"
export const api = axios.create({
    baseURL:env.baseURL
})