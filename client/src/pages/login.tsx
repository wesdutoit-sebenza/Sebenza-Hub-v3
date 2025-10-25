import { useEffect } from "react";

// Replit Auth Login - redirect to /api/login
// The login/signup UI is provided by Replit via OpenID Connect
export default function Login() {
  useEffect(() => {
    // Redirect to Replit Auth login endpoint
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <p className="text-white-brand">Redirecting to login...</p>
    </div>
  );
}
