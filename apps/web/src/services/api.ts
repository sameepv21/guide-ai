import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Read CSRF token directly from cookie (simpler, no API call needed)
const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + '=')) {
      return trimmed.substring(name.length + 1);
    }
  }
  return null;
};

export const authAPI = {
  login: (email: string, password: string) => {
    const token = getCsrfToken();
    return axios.post(`${API_BASE_URL}/auth/login/`, { email, password }, {
      headers: { 'X-CSRFToken': token || '' }
    });
  },
  
  signup: (email: string, password: string, firstName: string, lastName: string) => {
    const token = getCsrfToken();
    return axios.post(`${API_BASE_URL}/auth/signup/`, { 
      email, 
      password, 
      firstName, 
      lastName 
    }, {
      headers: { 'X-CSRFToken': token || '' }
    });
  },
  
  logout: () => {
    const token = getCsrfToken();
    return axios.post(`${API_BASE_URL}/auth/logout/`, {}, {
      headers: { 'X-CSRFToken': token || '' }
    });
  }
};

export const videoAPI = {
  processVideo: (videoUrl: string, query: string) => {
    const token = getCsrfToken();
    return axios.post(`${API_BASE_URL}/videos/process/`, { 
      videoUrl, 
      query 
    }, {
      headers: { 'X-CSRFToken': token || '' }
    });
  }
};
