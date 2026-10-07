import { environment } from '../../environments/environment';
import { post } from './http';

const api = environment.apiUrl;

export const authService = {
  async login(data: { email: string; mat_khau: string }): Promise<any> {
    const res = await post<any>(`${api}/api/auth/login`, data);
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role || '');
      localStorage.setItem('user', JSON.stringify(res.data));
      const userId = res.data?.ma_nguoi_dung || res.data?.id;
      localStorage.setItem('ma_nguoi_dung', userId);
    }
    return res;
  },

  register: (data: any) => post<any>(`${api}/api/auth/register`, data),

  getToken: () => localStorage.getItem('token'),

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getRole: () => localStorage.getItem('role'),

  isLoggedIn: () => !!localStorage.getItem('token'),

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  sendOtp: (email: string) => post<any>(`${api}/auth/send-otp`, { email }),

  resetPassword: (data: { email: string; otp: string; mat_khau_moi: string }) =>
    post<any>(`${api}/auth/reset-password`, data),

  registerSendOtp: (data: any) => post<any>(`${api}/register`, data),

  verifyRegisterOtp: (data: any) => post<any>(`${api}/auth/verify-register-otp`, data),
};
