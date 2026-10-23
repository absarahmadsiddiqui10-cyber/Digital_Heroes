import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../../services/api.js";

export default function RoleRoute({ allowedRole, children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return children;
}
