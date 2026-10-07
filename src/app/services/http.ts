/** Gọi API JSON đơn giản, ném lỗi kèm message từ server nếu thất bại. */
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Lỗi ${res.status}`);
  }
  return data as T;
}

export const post = <T>(url: string, body: unknown) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body) });

export const get = <T>(url: string) => request<T>(url);
