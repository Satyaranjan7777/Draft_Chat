import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-base-200">
        <div className="flex items-center gap-3 rounded-full bg-base-100 px-5 py-3 text-sm font-medium shadow-sm ring-1 ring-base-300">
          <Loader className="h-5 w-5 animate-spin text-primary" />
          Checking your session
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
