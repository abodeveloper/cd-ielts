import { lazy } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const Layout = lazy(() => import("@/layout/layout"));
const HomePage = lazy(() => import("@/features/profile/home/HomePage"));
const ResultsPage = lazy(
  () => import("@/features/profile/results/ResultsPage")
);
const DetailPage = lazy(() => import("@/features/profile/detail/DetailPage"));

//Exams
const ReadingsPage = lazy(
  () => import("@/features/exams/pages/readings/ReadingsPage")
);
const ReadingTestPage = lazy(
  () => import("@/features/exams/pages/readings/ReadingTestPage")
);
const ListeningPage = lazy(
  () => import("@/features/exams/pages/listening/ListeningPage")
);
const WritingPage = lazy(
  () => import("@/features/exams/pages/writing/WritingPage")
);
const SpeakingPage = lazy(
  () => import("@/features/exams/pages/speaking/SpeakingPage")
);

export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // bu index yo‘nalish
        element: <Navigate to="home" />, // `home` ichki route
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "results",
        element: <ResultsPage />,
      },
      {
        path: "detail",
        element: <DetailPage />,
      },
      {
        path: "exams",
        children: [
          {
            path: "readings",
            element: <ReadingsPage />,
          },
          {
            path: "readings/:id",
            element: <ReadingTestPage />,
          },
          {
            path: "listenings",
            element: <ListeningPage />,
          },
          {
            path: "writings",
            element: <WritingPage />,
          },
          {
            path: "speakings",
            element: <SpeakingPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/readings/:id",
    element: (
      <ProtectedRoute>
        <ReadingTestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/profile" />,
  },
];
