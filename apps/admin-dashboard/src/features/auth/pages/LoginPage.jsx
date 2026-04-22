import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setCredentials } from "../../../store/slices/authSlice";
import api from "../../../services/api";
import socket from "../../../socket/socket";
import { ROLES } from "../../../shared/constants";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", form);
      const { user, accessToken } = data.data;

      // Only allow admin roles
      // Only allow super_admin
      if (user.role !== "super_admin") {
        setError("Access denied. Super Admin credentials required.");
        setLoading(false);
        return;
      }

      dispatch(setCredentials({ user, accessToken }));
      socket.auth = { token: accessToken };
      socket.connect();

      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed.";
      setError(msg);
      console.log(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200
    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
    focus:border-transparent transition-all
  `;

  return (
    <div
      className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950
                    to-slate-900 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16
                          bg-blue-600 rounded-2xl shadow-lg mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CERN Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            Administrative Control Panel
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Admin Sign in
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-slate-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="admin@cern.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter password"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-100 rounded-xl p-3"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700
                         text-white font-semibold rounded-xl transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span
                  className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin"
                />
              )}
              Sign in to Admin Panel
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Access restricted to authorized administrators only
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
