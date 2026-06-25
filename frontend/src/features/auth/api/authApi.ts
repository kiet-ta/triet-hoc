import { httpClient } from "../../../shared/api/httpClient";
import { LoginPayload, RegisterPayload, AuthResponse, User } from "../types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", payload.email);
    formData.append("password", payload.password);
    
    return httpClient.post<AuthResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData, // fetch uses body
    });
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    return httpClient.post<User>("/auth/register", payload);
  },

  getMe: async (): Promise<User> => {
    return httpClient.get<User>("/auth/me");
  },
};
