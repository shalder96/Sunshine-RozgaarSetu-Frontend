import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "../assets/job-hero.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 🧠 Validation
  const validate = () => {
    if (!form.phone || !form.password) {
      return "All fields are required";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Phone must be 10 digits";
    }

    return null;
  };

  const handleLogin = async () => {
    const error = validate();

    if (error) {
      setMessage(error);
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setIsSuccess(false);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
      );

      // ✅ Save user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Login successful! Redirecting...");
      setIsSuccess(true);

      setTimeout(() => {
        const role = res.data.user.role;

        if (role === "employer") {
          navigate("/dashboard");
        } else {
          navigate("/worker-dashboard");
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 items-center justify-center px-4 relative overflow-hidden">
      {/* BLOBS  */}
      <div className="hidden sm:block absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-400 opacity-30 blur-3xl rounded-full animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-green-400 opacity-30 blur-3xl rounded-full animate-pulse"></div>
      <div className="hidden sm:block absolute top-[40%] left-[40%] w-[250px] h-[250px] bg-cyan-300 opacity-20 blur-3xl rounded-full animate-pulse"></div>

      {/* LEFT SIDE */}
      <div className="LEFT-SIDE hidden lg:flex flex-col justify-center px-8 xl:px-20 text-white">
        <h1 className=" text-4xl xl:text-6xl font-extrabold leading-tight">
          Find Work.
          <br />
          Build Future.
        </h1>

        <p className="mt-6 text-base xl:text-xl text-blue-100 max-w-lg leading-relaxed">
          RozgaarSetu connects skilled workers with trusted employers through a
          fast, modern, and real-time hiring platform.
        </p>

        {/* Features */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <p className="text-base xl:text-lg">Real-time hiring & chat system</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <p className="text-base xl:text-lg">Secure job applications</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <p className="text-base xl:text-lg">Trusted employers & workers</p>
          </div>
        </div>
        {/* job-hero.png */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-10 flex justify-center"
        >
          <img
            src={heroImage}
            alt="RozgaarSetu"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </motion.div>
      </div>
      {/* RIGHT SIDE (FORM) */}
      <div className="flex items-center justify-center px-4 py-10 p-6">
        <motion.div
          className=" RIGHT-SIDE w-full max-w-md bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)] transition-all duration-500 "
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
              RozgaarSetu
            </h1>

            <p className="text-gray-500 mt-2">
              Connecting Talent with Opportunity
            </p>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm mb-3 text-center ${
                isSuccess ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </motion.p>
          )}

          {/* Phone Input */}
          <motion.div
            className="relative mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className=" w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-300/40 focus:border-blue-500 hover:shadow-lg pl-10"
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            className="relative mb-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type={showPassword ? "text" : "password"}
              className=" w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-300/40 focus:border-blue-500 hover:shadow-lg pl-10"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {/* Eye Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            disabled={loading}
            className=" w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] py-3 sm:py-4"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t"></div>
            <span className="mx-2 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t"></div>
          </div>

          {/* Register link */}
          <p className="text-sm text-center">
            <span className="text-gray-500">Don’t have an account?</span>{" "}
            <Link
              to="/register"
              className="text-blue-500 font-semibold hover:text-blue-700 transition"
            >
              Register →
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
