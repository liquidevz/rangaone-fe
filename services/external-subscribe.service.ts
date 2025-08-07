import axios, { AxiosInstance } from "axios";

export interface CreateSubscribePayload {
  email: string;
  product_id?: string;
  product_name?: string;
  expiration_datetime: string; // ISO string
}

export interface CreateSubscribeResponse {
  message: string;
  invite_link?: string;
  invite_expires_at?: string;
  subscription_expires_at?: string;
}

// Use a separate env for this external subscription system
// Try multiple possible env names to be flexible during integration
const SUBSCRIBE_API_BASE_URL:
  | string
  | undefined =
  process.env.NEXT_PUBLIC_EXTERNAL_SUBSCRIBE_BASE_URL ||
  process.env.NEXT_PUBLIC_SUBSCRIBE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_COMMUNITY_API_BASE_URL;

const externalClient: AxiosInstance = axios.create({
  // If not configured, axios will use absolute URL calls only
  baseURL: SUBSCRIBE_API_BASE_URL || undefined,
});

export const externalSubscribeService = {
  isConfigured(): boolean {
    return Boolean(SUBSCRIBE_API_BASE_URL);
  },

  async subscribe(
    payload: CreateSubscribePayload
  ): Promise<CreateSubscribeResponse | null> {
    try {
      if (!this.isConfigured()) {
        console.warn(
          "External subscribe API base URL is not configured. Skipping subscribe call.",
        );
        return null;
      }

      const response = await externalClient.post<CreateSubscribeResponse>(
        "/api/subscribe",
        payload,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("External subscribe API call failed:", error);
      return null;
    }
  },

  async subscribeMany(
    payloads: CreateSubscribePayload[]
  ): Promise<Array<CreateSubscribeResponse | null>> {
    if (!payloads || payloads.length === 0) return [];
    const tasks = payloads.map((payload) =>
      this.subscribe(payload).catch((err) => {
        console.error("Subscribe call failed for payload:", payload, err);
        return null;
      })
    );
    return Promise.all(tasks);
  },
};


