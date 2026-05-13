import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    role: "worker",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  // 🧠 Validation
  const validate = () => {
    if (!form.name || !form.phone || !form.password) {
      return "All fields are required";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Phone must be exactly 10 digits";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleRegister = async () => {
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

      await axios.post("http://localhost:5000/api/auth/register", form);

      setMessage("Registration successful! Redirecting...");
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center h-screen bg-gray-100"

    >
      <motion.div
        className="bg-white p-6 rounded shadow w-80"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

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
        {/* Name  */}
        <motion.div
          className="relative mb-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="border p-2 pl-10 w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </motion.div>

        {/* Phone */}
        <motion.div
          className="relative mb-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="border p-2 pl-10 w-full"
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

        {/* Password */}
        <motion.div
          className="relative mb-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />

          <input
            type={showPassword ? "text" : "password"}
            className="border p-2 pl-10 pr-10 w-full"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </motion.div>

        {/* Role */}
        <select
          className="border p-2 w-full mb-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="worker">Worker</option>
          <option value="employer">Employer</option>
        </select>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>
        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t"></div>
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t"></div>
        </div>
        {/* Login Link  */}
        <p className="text-sm text-center">
          <span className="text-gray-500">Do you have an account?</span>{" "}
          <Link
            to="/login"
            className="text-blue-500 font-semibold hover:text-blue-700 transition"
          >
            Login →
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
