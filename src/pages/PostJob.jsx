import { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function PostJob() {

  const initialForm = {
    title: "",
    description: "",
    wage: ""
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!form.title || !form.description || !form.wage) {
      return "All fields are required";
    }
    if (isNaN(form.wage)) {
      return "Wage must be a number";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      setMessage(error);
      setSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/jobs", form);

      setSuccess(true);
      setForm(initialForm);

      // auto hide success
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.log(err);
      
      setMessage("Error posting job");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white p-6 rounded shadow w-96 relative"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >

        <h2 className="text-xl font-bold mb-4 text-center">
          Post a Job
        </h2>

        {/* ✅ Success Animation */}
        {success && (
          <motion.div
            className="flex flex-col items-center mb-3 text-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle size={40} />
            <p className="text-sm">Job Posted Successfully!</p>
          </motion.div>
        )}

        {/* ❌ Error Message */}
        {message && (
          <p className="text-red-500 text-sm text-center mb-3">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Title */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="border p-2 w-full"
            placeholder="Job Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          {/* 📝 Description (textarea) */}
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            className="border p-2 w-full resize-none h-24"
            placeholder="Job Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* 💰 Wage with ₹ */}
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">
              ₹
            </span>

            <motion.input
              whileFocus={{ scale: 1.02 }}
              className="border p-2 pl-8 w-full"
              placeholder="Wage"
              value={form.wage}
              onChange={(e) =>
                setForm({
                  ...form,
                  wage: e.target.value.replace(/\D/g, "")
                })
              }
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-green-300"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Posting..." : "Post Job"}
          </motion.button>

        </form>
      </motion.div>
    </motion.div>
  );
}