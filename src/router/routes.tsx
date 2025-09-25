import { lazy } from "react";
import { Navigate } from "react-router-dom";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
import StudentProtectedRoute from "./StudentProtectedRoute";

// Foydalanuvchi sahifalari
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const Layout = lazy(() => import("@/layout/layout"));
const HomePage = lazy(() => import("@/features/student/home/HomePage"));
const MyResultsPage = lazy(
  () => import("@/features/student/results/MyResultsPage")
);
const MyMockResultPage = lazy(
  () => import("@/features/student/results/MyMockResultPage")
);
const MyThematicResultPage = lazy(
  () => import("@/features/student/results/MyThematicResultPage")
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
const TeacherDashboardPage = lazy(
  () => import("@/features/teacher/dashboard/DashboardPage")
);
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
const StudentMocksPage = lazy(
  () => import("@/features/teacher/students/StudentMocksPage")
);
const StudentMockResultPage = lazy(
  () => import("@/features/teacher/students/StudentMockResultPage")
);
const StudentThematicsPage = lazy(
  () => import("@/features/teacher/students/StudentThematicsPage")
);
const StudentThematicResultPage = lazy(
  () => import("@/features/teacher/students/StudentThematicResultPage")
);
const StudentReadingResultsPage = lazy(
  () => import("@/features/teacher/students/StudentReadingResultsPage")
);
const StudentListeningResultsPage = lazy(
  () => import("@/features/teacher/students/StudentListeningResultsPage")
);
const StudentWritingResultsPage = lazy(
  () => import("@/features/teacher/students/StudentWritingResultsPage")
);
const StudentSpeakingResultsPage = lazy(
  () => import("@/features/teacher/students/StudentSpeakingResultPage")
);
const StudentResultPage = lazy(
  () => import("@/features/teacher/students/StudentResultPage")
);

const TestMocksPage = lazy(() => import("@/features/test-materials/MocksPage"));
const TestMocksStatisticsPage = lazy(
  () => import("@/features/test-materials/MocksStatisticsPage")
);
const TestMockStatisticsByGroupPage = lazy(
  () => import("@/features/test-materials/MockStatisticsByGroupPage")
);
const TestMockDetailPage = lazy(
  () => import("@/features/test-materials/mock/MockDetailPage")
);
const TestThematicsPage = lazy(
  () => import("@/features/test-materials/ThematicsPage")
);
const TestThematicsStatisticsPage = lazy(
  () => import("@/features/test-materials/ThematicsStatisticsPage")
);
const TestThematicStatisticsByGroupPage = lazy(
  () => import("@/features/test-materials/ThematicStatisticsByGroupPage")
);
const ReadingMaterialStatisticsPage = lazy(
  () => import("@/features/test-materials/ReadingMaterialStatisticPage")
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
      { path: "profile", element: <ProfilePage /> },
      { path: "results", element: <MyResultsPage /> },
      { path: "results/mock/:material_id", element: <MyMockResultPage /> },
      {
        path: "results/thematic/:material_id",
        element: <MyThematicResultPage />,
      },
      {
        path: "results/:id/:test_type/:skill/:obj_id",
        element: <StudentResultPage />,
      },
      // {
      //   path: "exams",
      //   children: [
      //     { path: "readings", element: <ReadingsPage /> },
      //     { path: "readings/:id", element: <ReadingTestPage /> },
      //     { path: "listenings", element: <ListeningsPage /> },
      //     { path: "writings", element: <WritingsPage /> },
      //     { path: "speakings", element: <SpeakingsPage /> },
      //   ],
      // },
      {
        path: "tests",
        children: [
          { index: true, element: <Navigate to="mock" /> },
          { path: "mock", element: <TestMocksPage /> },
          { path: "mock/:id", element: <TestMockDetailPage /> },
          { path: "thematic", element: <TestThematicsPage /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/student" />,
      },
    ],
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
      { path: "dashboard", element: <TeacherDashboardPage /> },
      { path: "groups", element: <GroupsPage /> },
      { path: "groups/:id", element: <GroupDetailPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "students/:id", element: <StudentDetailPage /> },
      {
        path: "students/:student_id/thematic",
        element: <StudentThematicsPage />,
      },
      {
        path: "students/:student_id/thematic/:material_id",
        element: <StudentThematicResultPage />,
      },
      {
        path: "students/:student_id/mock",
        element: <StudentMocksPage />,
      },
      {
        path: "students/:student_id/mock/:material_id",
        element: <StudentMockResultPage />,
      },
      {
        path: "students/:id/results/reading",
        element: <StudentReadingResultsPage />,
      },
      {
        path: "students/:id/results/reading",
        element: <StudentReadingResultsPage />,
      },
      {
        path: "students/:id/results/listening",
        element: <StudentListeningResultsPage />,
      },
      {
        path: "students/:id/results/writing",
        element: <StudentWritingResultsPage />,
      },
      {
        path: "students/:id/results/speaking",
        element: <StudentSpeakingResultsPage />,
      },
      {
        path: "students/:id/:test_type/:skill/:obj_id",
        element: <StudentResultPage />,
      },
      {
        path: "tests",
        children: [
          { index: true, element: <Navigate to="mock" /> },
          { path: "mock", element: <TestMocksPage /> },
          {
            path: "mock/statistics/:material_id",
            element: <TestMocksStatisticsPage />,
          },
          {
            path: "mock/statistics/:material_id/groups/:group_id",
            element: <TestMockStatisticsByGroupPage />,
          },
          {
            path: "mock/reading/:id",
            element: <ReadingMaterialStatisticsPage />,
          },
          { path: "mock/:id", element: <TestMockDetailPage /> },
          { path: "thematic", element: <TestThematicsPage /> },
          {
            path: "thematic/statistics/:skill/:material_id",
            element: <TestThematicsStatisticsPage />,
          },
          {
            path: "thematic/statistics/:skill/:material_id/groups/:group_id",
            element: <TestThematicStatisticsByGroupPage />,
          },
        ],
      },
      { path: "profile", element: <ProfilePage /> },
      { path: "exams", element: <div>Exams</div> },
      {
        path: "*",
        element: <Navigate to="/teacher" />,
      },
    ],
  },
  {
    path: "/readings/:id",
    element: (
      <AuthProtectedRoute>
        <ReadingTestPage />
      </AuthProtectedRoute>
    ),
  },
  {
    path: "/writings/:id",
    element: (
      <AuthProtectedRoute>
        <WritingTestPage />
      </AuthProtectedRoute>
    ),
  },
  {
    path: "/listenings/:id",
    element: (
      <AuthProtectedRoute>
        <ListeningTestPage />
      </AuthProtectedRoute>
    ),
  },
  {
    path: "/speakings/:id",
    element: (
      <AuthProtectedRoute>
        <SpeakingTestPage />
      </AuthProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
  },
];
