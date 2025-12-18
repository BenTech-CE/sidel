import axios from "axios";

axios.defaults.withCredentials = true;

export const apiURL = "http://localhost:8080";

const api = axios.create({
    baseURL: apiURL,
    withCredentials: true,
});

export default api;