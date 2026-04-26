import axios from "axios";

const api = axios.create({
    baseURL: "https://smart-kost-management-production.up.railway.app",
});

export default api;
