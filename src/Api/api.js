import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:4000/api' });

export function setAuthHeader(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
}

export default API;
