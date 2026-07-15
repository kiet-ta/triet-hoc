import { httpClient } from "../../../shared/api/httpClient";
import type { PublicResult, TopThreeItem } from "../../results/types/resultTypes";

export const ADMIN_TOKEN_KEY = "trietlylagi.adminToken";

export type AdminStats = {
  totalSurveyCount: number;
  mostCommonDominantPhilosophy: string | null;
  averageScoresByPhilosophy: Array<{
    key: string;
    nameVi: string;
    averagePercentage: number;
  }>;
  completionCountByDay: Array<{ date: string; count: number }>;
  hourlyTraffic: Array<{ hour: string; count: number }>;
};

export type AdminQuestion = {
  id: string;
  code: string;
  section: string;
  text: string;
  orderIndex: number;
  illustrationKey: string;
  isActive: boolean;
  weights: Array<{ philosophyKey: string; weight: number }>;
};

export type PhilosophyAdmin = PublicResult["dominant"];

export type CourseStatus = {
  courseCode: string;
  isSuspended: boolean;
  message: string | null;
};

export type AdminResult = {
  resultId: string;
  shareSlug: string;
  createdAt: string;
  topPhilosophy: string;
  topThree: TopThreeItem[];
};

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export const adminApi = {
  async login(email: string, password: string) {
    const payload = await httpClient.post<{ accessToken: string; tokenType: string }>(
      "/admin/auth/login",
      { email, password },
    );
    sessionStorage.setItem(ADMIN_TOKEN_KEY, payload.accessToken);
    return payload.accessToken;
  },
  logout() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  stats() {
    return httpClient.get<AdminStats>("/admin/stats", { token: getAdminToken() });
  },
  results() {
    return httpClient.get<AdminResult[]>("/admin/results", { token: getAdminToken() });
  },
  questions() {
    return httpClient.get<AdminQuestion[]>("/admin/questions", { token: getAdminToken() });
  },
  saveQuestion(question: Partial<AdminQuestion> & Omit<AdminQuestion, "id">, id?: string) {
    const body = {
      code: question.code,
      section: question.section,
      text: question.text,
      orderIndex: question.orderIndex,
      illustrationKey: question.illustrationKey,
      isActive: question.isActive,
      weights: question.weights,
    };
    if (id) return httpClient.put<AdminQuestion>(`/admin/questions/${id}`, body, { token: getAdminToken() });
    return httpClient.post<AdminQuestion>("/admin/questions", body, { token: getAdminToken() });
  },
  deleteQuestion(id: string) {
    return httpClient.delete<{ ok: boolean }>(`/admin/questions/${id}`, { token: getAdminToken() });
  },
  philosophies() {
    return httpClient.get<PhilosophyAdmin[]>("/admin/philosophies", { token: getAdminToken() });
  },
  savePhilosophy(philosophy: PhilosophyAdmin, id?: string | null) {
    if (id) return httpClient.put<PhilosophyAdmin>(`/admin/philosophies/${id}`, philosophy, { token: getAdminToken() });
    return httpClient.post<PhilosophyAdmin>("/admin/philosophies", philosophy, { token: getAdminToken() });
  },
  users() {
    return httpClient.get<Array<{ id: string; email: string; name: string | null; createdAt: string }>>("/admin/users", { token: getAdminToken() });
  },
  courseStatuses() {
    return httpClient.get<CourseStatus[]>("/admin/courses", { token: getAdminToken() });
  },
  setCourseStatus(courseCode: string, isSuspended: boolean, message: string | null) {
    return httpClient.put<CourseStatus>(
      `/admin/courses/${courseCode}`,
      { isSuspended, message },
      { token: getAdminToken() },
    );
  },
  get<T>(path: string) {
    return httpClient.get<T>(path, { token: getAdminToken() });
  },
};
