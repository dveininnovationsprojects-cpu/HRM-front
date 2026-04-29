import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Backend properties padi port 8080 dhaan correct 
    withCredentials: true, // JWT cookie handling-ku idhu dhaan mass 
});

export default api;