import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);


  // 🔥 Fetch jobs
  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
  API.get("/applications/my")
    .then(res => {
      const appliedIds = res.data.map(app => app.jobId);
      setAppliedJobs(appliedIds);
    })
    .catch(console.log);
}, []);

  // 🔥 Apply
  const applyJob = async (jobId) => {
    try {
      await API.post("/applications", { jobId });

      toast.success("Application submitted successfully ✅");
      setAppliedJobs((prev) => [...prev, jobId]);

      setTimeout(() => toast.dismiss(), 2000);
    } catch (err) {
      console.log(err);
      toast.error("Already applied for this job");
      setTimeout(() => toast.dismiss(), 2000);
    }
  };

  // 🔍 Filter jobs
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        Find Work Near You
      </h2>

      {/* Message */}
      {toast && (
        <p className="text-center mb-4 text-sm font-semibold text-green-600">
          {toast.message}
        </p>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search jobs..."
        className="border p-2 w-full mb-6 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading */}
      {loading ? (
        <p className="text-center text-gray-400">Loading jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-gray-400">No jobs found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              className="bg-white p-4 rounded shadow hover:shadow-lg"
              whileHover={{ scale: 1.03 }}
            >
              {/* Title */}
              <h3 className="font-semibold text-lg">
                {job.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mt-1">
                {job.description}
              </p>

              {/* Wage */}
              <p className="text-green-600 font-bold mt-2">
                ₹{job.wage}
              </p>

              {/* Button */}
              <button
                onClick={() => applyJob(job._id)}
                disabled={appliedJobs.includes(job._id)}
                className={`w-full mt-3 py-2 rounded text-white ${
                  appliedJobs.includes(job._id)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {appliedJobs.includes(job._id)
                  ? "Applied"
                  : "Apply Now"}
              </button>

            </motion.div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Jobs;