import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LogIn } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#19316d] via-[#3972a1] via-[#f8d32d] to-[#198a40] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-white font-bold text-2xl">PHP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/80">Sign in to your PHP Directory account</p>
        </div>
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-[#19316d]/95 border-2 border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#19316d] to-[#3972a1] rounded-full mb-4 border-2 border-white/30">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#19316d] dark:text-white mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access your PHP Directory account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* MVP Mode Info */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#f8d32d]/20 border border-[#f8d32d]/40 rounded-lg text-[#19316d] text-sm"
            >
              <p className="font-semibold mb-1">MVP Demo Mode - Quick Login:</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>
                  <strong>Admin:</strong> admin@school.edu / admin123
                </li>
                <li>
                  <strong>PHP:</strong> php@school.edu / php123
                </li>
              </ul>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-[#b42940]/20 border border-[#b42940]/40 rounded-lg text-[#b42940] text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="you@school.edu"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#3972a1] focus:border-[#3972a1] bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="bg-gradient-to-r from-[#19316d] to-[#3972a1] hover:from-[#19316d]/90 hover:to-[#3972a1]/90 text-white border-0"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/80">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#f8d32d] hover:text-[#f8d32d]/80 font-medium underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
