import { Navigate } from "react-router-dom";

export default function RoleRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role === "employer") {
    return <Navigate to="/dashboard" />;
  }

  if (user?.role === "worker") {
    return <Navigate to="/worker-dashboard" />;
  }

  return <Navigate to="/login" />;
}