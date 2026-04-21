import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Predict from "./pages/Predict.jsx";
import Doctors from "./pages/Doctors.jsx";
import History from "./pages/History.jsx";
import Admin from "./pages/Admin.jsx";

import "./index.css";

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
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

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* Routes protégées (tous utilisateurs connectés) */}
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
      
      {/* Route admin (réservée aux administrateurs) */}
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/predict" />} />
      <Route path="*" element={<Navigate to="/predict" />} />
    </Routes>
  );
}