import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

//apply base url for axios
const API_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const axiosApi: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Function to get token from storage
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return process.env.ACCESS_TOKEN || null;
  }
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
};

// Function to get refresh token from storage
const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") {
    return process.env.REFRESH_TOKEN || null;
  }
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
};

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Request interceptor to add auth header
axiosApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors and token refresh
axiosApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          if (typeof window !== "undefined") {
            const useLocalStorage = !!localStorage.getItem("refreshToken");
            if (useLocalStorage) {
              localStorage.setItem("accessToken", accessToken);
              localStorage.setItem("refreshToken", newRefreshToken);
            } else {
              sessionStorage.setItem("accessToken", accessToken);
              sessionStorage.setItem("refreshToken", newRefreshToken);
            }
          }

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosApi(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

const getFormData = (values: Record<string, any>): FormData => {
  const formData: FormData = new FormData();

  for (const value in values) {
    if (values.hasOwnProperty(value)) {
      formData.append(value, values[value]);
    }
  }

  return formData;
};

export async function get<T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  return await axiosApi
    .get(url, { ...config })
    .then((response: AxiosResponse<T>) => response.data);
}

export async function post<T>(
  url: string,
  data: Record<string, any>,
  config: AxiosRequestConfig = {},
  isFormData: boolean = false
): Promise<T> {
  if (isFormData) {
    return axiosApi
      .post(url, getFormData(data), { ...config })
      .then((response: AxiosResponse<T>) => response.data);
  }
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response: AxiosResponse<T>) => response.data);
}

export async function put<T>(
  url: string,
  data: Record<string, any>,
  config: AxiosRequestConfig = {},
  isFormData: boolean = false
): Promise<T> {
  if (isFormData) {
    return axiosApi
      .put(url, getFormData(data), { ...config })
      .then((response: AxiosResponse<T>) => response.data);
  }
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response: AxiosResponse<T>) => response.data);
}

export async function del<T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  return await axiosApi
    .delete(url, { ...config })
    .then((response: AxiosResponse<T>) => response.data);
}

export default axiosApi;
