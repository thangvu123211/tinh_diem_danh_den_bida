import { environment } from '../../environments/environment';
import { get, post } from './http';

export interface NguoiChoi {
  id: number;
  ten_nguoi_choi: string;
  thoi_gian_tao?: string;
}

export interface TranDau {
  id: number;
  ten_tran: string;
  trang_thai: 'dang_dau' | 'ket_thuc' | 'huy';
  client_id?: string;
  thoi_gian_tao?: string;
  thoi_gian_ket_thuc?: string;
}

export interface TaoTranDauResponse {
  success: boolean;
  message: string;
  data: { tran_dau: TranDau };
}

export interface TranDauNguoiChoi {
  id: number;
  tran_dau_id: number;
  nguoi_choi_id: number;
  diem: number;
  vi_tri: number;
  thoi_gian_tham_gia?: string;
}

export interface ThemNguoiChoiResponse {
  success: boolean;
  message: string;
  data: {
    tran_dau: TranDau;
    nguoi_choi: NguoiChoi;
    tran_dau_nguoi_choi: TranDauNguoiChoi;
  };
}

const api = `${environment.apiUrl}/api`;

export const nguoiChoiService = {
  // Tạo trận đấu
  taoTranDau: (clientId: string) =>
    post<TaoTranDauResponse>(`${api}/tran-dau`, {
      ten_tran: 'Trận đấu hôm nay',
      client_id: clientId,
    }),

  // Thêm người chơi vào trận
  themNguoiChoi: (tranDauId: number, tenNguoiChoi: string) =>
    post<ThemNguoiChoiResponse>(`${api}/tran-dau/nguoi-choi`, {
      tran_dau_id: tranDauId,
      ten_nguoi_choi: tenNguoiChoi,
    }),

  // Lấy danh sách người chơi trong trận
  layDanhSachNguoiChoi: (tranDauId: number) => get<any[]>(`${api}/tran-dau/${tranDauId}/nguoi-choi`),
};
