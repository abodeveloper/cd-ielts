import { lazy } from "react";
import { Navigate } from "react-router-dom";
import AdminProtectedRoute from "./AdminProtectedRoute";
import StudentProtectedRoute from "./StudentProtectedRoute";

// Foydalanuvchi sahifalari
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const Layout = lazy(() => import("@/layout/layout"));
const HomePage = lazy(() => import("@/features/student/home/HomePage"));
const ResultsPage = lazy(
  () => import("@/features/student/results/ResultsPage")
);
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));

// Imtihon sahifalari
const ReadingsPage = lazy(
  () => import("@/features/exams/pages/readings/ReadingsPage")
);
const ReadingTestPage = lazy(
  () => import("@/features/exams/pages/readings/ReadingTestPage")
);
const ListeningsPage = lazy(
  () => import("@/features/exams/pages/listening/ListeningsPage")
);
const ListeningTestPage = lazy(
  () => import("@/features/exams/pages/listening/ListeningTestPage")
);
const WritingsPage = lazy(
  () => import("@/features/exams/pages/writing/WritingsPage")
);
const WritingTestPage = lazy(
  () => import("@/features/exams/pages/writing/WritingTestPage")
);
const SpeakingsPage = lazy(
  () => import("@/features/exams/pages/speaking/SpeakingsPage")
);
const SpeakingTestPage = lazy(
  () => import("@/features/exams/pages/speaking/SpeakingTestPage")
);

//Admin sahifalari
const GroupsPage = lazy(() => import("@/features/teacher/groups/GroupsPage"));
const GroupDetailPage = lazy(
  () => import("@/features/teacher/groups/GroupDetailPage")
);
const StudentsPage = lazy(
  () => import("@/features/teacher/students/StudentsPage")
);
const StudentDetailPage = lazy(
  () => import("@/features/teacher/students/StudentDetailPage")
);

export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Student routes
  {
    path: "/student",
    element: (
      <StudentProtectedRoute>
        <Layout />
      </StudentProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="home" /> },
      { path: "home", element: <HomePage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "profile", element: <ProfilePage /> },
      {
        path: "exams",
        children: [
          { path: "readings", element: <ReadingsPage /> },
          { path: "readings/:id", element: <ReadingTestPage /> },
          { path: "listenings", element: <ListeningsPage /> },
          { path: "writings", element: <WritingsPage /> },
          { path: "speakings", element: <SpeakingsPage /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/student" />,
      },
    ],
  },
  {
    path: "/readings/:id",
    element: (
      <StudentProtectedRoute>
        <ReadingTestPage />
      </StudentProtectedRoute>
    ),
  },
  {
    path: "/writings/:id",
    element: (
      <StudentProtectedRoute>
        <WritingTestPage />
      </StudentProtectedRoute>
    ),
  },
  {
    path: "/listenings/:id",
    element: (
      <StudentProtectedRoute>
        <ListeningTestPage />
      </StudentProtectedRoute>
    ),
  },
  {
    path: "/speakings/:id",
    element: (
      <StudentProtectedRoute>
        <SpeakingTestPage />
      </StudentProtectedRoute>
    ),
  },
  // Admin routes
  {
    path: "/teacher",
    element: (
      <AdminProtectedRoute>
        <Layout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: "dashboard", element: <div>Dashboard</div> },
      { path: "groups", element: <GroupsPage /> },
      { path: "groups/:id", element: <GroupDetailPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "students/:id", element: <StudentDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "exams", element: <div>Exams</div> },
      {
        path: "*",
        element: <Navigate to="/teacher" />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
];
