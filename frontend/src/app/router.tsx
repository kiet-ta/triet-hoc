import { createBrowserRouter, Navigate } from "react-router-dom";

import { AnimatedLayout } from "./AnimatedLayout";

import { LandingPage } from "../pages/LandingPage";
import { QuizIntroPage } from "../pages/QuizIntroPage";
import { QuizPage } from "../pages/QuizPage";
import { ResultPage } from "../pages/ResultPage";
import { HistoryPage } from "../pages/HistoryPage";
import { UserHistoryPage } from "../pages/user/HistoryPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AboutPage } from "../pages/AboutPage";
import { KnowledgePage } from "../pages/KnowledgePage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminQuestionsPage } from "../pages/admin/AdminQuestionsPage";
import { AdminPhilosophiesPage } from "../pages/admin/AdminPhilosophiesPage";
import { AdminVisitorsPage } from "../pages/admin/AdminVisitorsPage";
import { AdminCoursesPage } from "../pages/admin/AdminCoursesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AnimatedLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "quiz/:courseCode/intro", element: <QuizIntroPage /> },
      { path: "quiz/:courseCode", element: <QuizPage /> },
      { path: "results/:shareSlug", element: <ResultPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "user/history", element: <UserHistoryPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "kho-tang", element: <KnowledgePage /> },
      { path: "admin/login", element: <AdminLoginPage /> },
      { path: "admin", element: <AdminDashboardPage /> },
      { path: "admin/users", element: <AdminUsersPage /> },
      { path: "admin/questions", element: <AdminQuestionsPage /> },
      { path: "admin/philosophies", element: <AdminPhilosophiesPage /> },
      { path: "admin/visitors", element: <AdminVisitorsPage /> },
      { path: "admin/courses", element: <AdminCoursesPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ]
  }
]);
