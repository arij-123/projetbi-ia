import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur depuis localStorage
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (token && userData && userData.id) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = () => {
    if (!user) return "?";
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (!user) return "Chargement...";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return "Utilisateur";
  };

  const getRoleLabel = () => {
    if (!user) return "";
    switch (user.role) {
      case "admin":
        return "Administrateur";
      case "doctor":
        return "Médecin";
      default:
        return "Patient";
    }
  };

  const getRoleColor = () => {
    if (!user) return "bg-gray-100 text-gray-600";
    switch (user.role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "doctor":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (loading) {
    return (
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-xl">
                <div className="w-6 h-6"></div>
              </div>
              <div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo et titre */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SkinAI</h1>
              <p className="text-xs text-gray-500">
                Détection IA des maladies de peau
              </p>
            </div>
          </div>

          {/* Navigation et utilisateur */}
          <div className="flex items-center gap-6 flex-wrap">
            {/* Navigation */}
            <nav className="flex gap-1">
              <button
                onClick={() => navigate("/predict")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Prédiction
              </button>
              <button
                onClick={() => navigate("/doctors")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Médecins
              </button>
              <button
                onClick={() => navigate("/history")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                📋 Historique
              </button>
              {user?.role === "doctor" && (
                <button
                  onClick={() => navigate("/my-appointments")}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Mes Rendez-vous
                </button>
              )}
{user?.role === "admin" && (
  <button onClick={() => navigate("/admin")}                 
   className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"

>
    Users
  </button>
)}
           
            </nav>

            {/* Séparateur */}
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            {/* Infos utilisateur */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {getInitials()}
                </div>
                
                {/* Menu déroulant au survol */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl hidden group-hover:block z-50 border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getInitials()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor()}`}>
                        {getRoleLabel()}
                      </span>
                    </div>
                    {user?.city && (
                      <p className="text-xs text-gray-500 mt-2">
                        📍 {user.city} {user.location && `• ${user.location}`}
                      </p>
                    )}
                    {user?.age && (
                      <p className="text-xs text-gray-500">
                        🎂 {user.age} ans
                      </p>
                    )}
                    {user?.phone && (
                      <p className="text-xs text-gray-500">
                        📞 {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Nom et rôle (visible sur desktop) */}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
                <p className={`text-xs capitalize ${getRoleColor()}`}>
                  {getRoleLabel()}
                </p>
              </div>
              
              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium ml-2"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}