import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true // MASS FIX: Idhu dhaan HttpOnly cookie-ah automatic-ah anuppum!
});

export default api;