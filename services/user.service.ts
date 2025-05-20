import { get } from "@/lib/axios";

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  provider: string;
  changedPasswordAt?: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    return await get<UserProfile>("/api/user/profile", {
      headers: {
        accept: "*/*",
      },
    });
  },
};
