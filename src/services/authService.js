import api from './api';

export const authService = {
  // Backend routes: POST /login, POST /logout, GET /me
  login:   (credentials) => api.post('/login',  credentials),
  logout:  ()            => api.post('/logout'),
  profile: ()            => api.get('/me'),
};