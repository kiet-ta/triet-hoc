import { httpClient } from "../../../shared/api/httpClient";

export type HistoryItem = {
  id: string;
  created_at: string;
  share_slug: string;
  result_summary?: string;
};

export const usersApi = {
  getHistory: async (): Promise<HistoryItem[]> => {
    return httpClient.get<HistoryItem[]>("/users/me/history");
  },
  
  checkUnsynced: async (anonymousClientId: string): Promise<{ count: number }> => {
    return httpClient.get<{ count: number }>(`/history/${anonymousClientId}/unsynced`);
  },
  
  syncHistory: async (anonymousClientId: string): Promise<{ success: boolean }> => {
    return httpClient.post<{ success: boolean }>("/users/me/sync-history", {
      anonymous_client_id: anonymousClientId
    });
  }
};
