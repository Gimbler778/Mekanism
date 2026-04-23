import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const finalizeAuth = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        await completeOAuthLogin(token);
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };

    finalizeAuth();
  }, [completeOAuthLogin, navigate]);

  return <div className="h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>;
};
