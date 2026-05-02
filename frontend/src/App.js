import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Predict from "./pages/Predict.jsx";
import Doctors from "./pages/Doctors.jsx";
import History from "./pages/History.jsx";
import Admin from "./pages/Admin.jsx";
import AdminDashboard from "./pages/AdminDashboard";

import "./index.css";

// Composant pour protéger les routes (non-admins uniquement)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si admin, rediriger vers son dashboard
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
}

// Composant pour vérifier si l'utilisateur est admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== "admin") {
    return <Navigate to="/predict" replace />;
  }
  
  return children;
}

// Redirection intelligente basée sur le rôle
function NavigateBasedOnRole() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin → Dashboard, sinon → Predict
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/predict" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* Routes protégées (uniquement pour non-admins) */}
      <Route path="/predict" element={
        <ProtectedRoute>
          <Predict />
        </ProtectedRoute>
      } />
      
      <Route path="/doctors" element={
        <ProtectedRoute>
          <Doctors />
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />
      
      {/* Routes admin */}
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />

      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />

      {/* Redirection par défaut intelligente */}
      <Route path="/" element={<NavigateBasedOnRole />} />
      <Route path="*" element={<NavigateBasedOnRole />} />
    </Routes>
  );
}