import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Charities from "./pages/Charities.jsx";
import CharityDetails from "./pages/CharityDetails.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import RoleRoute from "./components/common/RoleRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Auth signup />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/charities" element={<Charities />} />
      <Route path="/charities/:id" element={<CharityDetails />} />

      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRole="user">
            <Dashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRole="admin">
            <Admin />
          </RoleRoute>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
