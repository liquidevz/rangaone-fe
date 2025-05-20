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

// Only set the token if we're on the client side and a token exists
if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axiosApi.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    const sessionToken = sessionStorage.getItem("accessToken");
    if (sessionToken) {
      axiosApi.defaults.headers.common["Authorization"] = sessionToken;
    }
  }
}

const getFormData = (values: Record<string, any>): FormData => {
  const formData: FormData = new FormData();

  for (const value in values) {
    if (values.hasOwnProperty(value)) {
      formData.append(value, values[value]);
    }
  }

  return formData;
};

axiosApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(error)
);

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
