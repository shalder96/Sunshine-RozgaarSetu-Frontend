import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import { Toaster } from "react-hot-toast";

import Layout from "./Layout";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";


const JobList = lazy(() => import("./pages/JobList"));
const PostJob = lazy(() => import("./pages/PostJob"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const EditJob = lazy(() => import("./pages/EditJob"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Default route  */}
      <Route index element={<RoleRedirect />} />

      {/* Public routes  */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Worker route  */}
      <Route
        path="jobs"
        element={
          <ProtectedRoute role="worker">
            <JobList />
          </ProtectedRoute>
        }
      />
      {/* Employer route  */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute role="employer">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="post-job"
        element={
          <ProtectedRoute role="employer">
            <PostJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="edit-job/:id"
        element={
          <ProtectedRoute role="employer">
            <EditJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="worker-dashboard"
        element={
          <ProtectedRoute role="worker">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#fff",
            color: "#111",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  </StrictMode>,
);
