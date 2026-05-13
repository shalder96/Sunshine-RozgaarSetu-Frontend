import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    wage: "",
  });

  const [originalForm, setOriginalForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 🔥 Fetch job
  useEffect(() => {
    API.get(`/jobs/${id}`)
      .then((res) => {
        setForm(res.data);
        setOriginalForm(res.data);
        setLastSaved(new Date());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // 🧠 Detect changes
  const isChanged =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  // ⚠️ Warn before leaving page
  useEffect(() => {
    const handler = (e) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isChanged]);

  // 💾 Auto-save (every 5 sec if changed)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isChanged) {
        API.put(`/jobs/${id}`, form);
        setOriginalForm(form);
        setLastSaved(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [form]);

  // 🧠 Validation
  const validate = () => {
    if (!form.title || !form.description || !form.wage) {
      return "All fields are required";
    }
    if (isNaN(form.wage)) {
      return "Wage must be a number";
    }
    return null;
  };

  // ✏️ Manual Update
  const handleUpdate = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      setSaving(true);
      await API.put(`/jobs/${id}`, form);

      setSuccess(true);
      setOriginalForm(form);
      setLastSaved(new Date());

      setTimeout(() => navigate("/dashboard"), 1500);

    } catch {
      setMessage("Update failed");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="bg-white p-6 rounded shadow w-96">

        <h2 className="text-xl font-bold text-center mb-2">
          Edit Job
        </h2>

        {/* 🕒 Last Saved */}
        {lastSaved && (
          <p className="text-xs text-gray-400 text-center mb-3">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}

        {/* ✅ Success */}
        {success && (
          <motion.div
            className="flex flex-col items-center text-green-500 mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle size={40} />
            <p>Updated Successfully!</p>
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-3">

          <input
            className="border p-2 w-full"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            className="border p-2 w-full h-24"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              className="border p-2 pl-8 w-full"
              value={form.wage}
              onChange={(e) =>
                setForm({
                  ...form,
                  wage: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">

            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 bg-blue-500 text-white py-2 rounded"
            >
              Update
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 border py-2 rounded"
            >
              Cancel
            </button>

          </div>
        </div>

        {/* ⚠️ Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-5 rounded shadow w-72 text-center">

              <p className="mb-4">Are you sure you want to update?</p>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-green-500 text-white py-1 rounded"
                >
                  Yes
                </button>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 border py-1 rounded"
                >
                  No
                </button>
              </div>

            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}