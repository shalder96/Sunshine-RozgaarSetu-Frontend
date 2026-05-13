import axios from "axios";

export default function JobCard({ job }) {

  const handleApply = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/applications/${job._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Applied successfully!");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error applying");
    }
  };

  return (
    <div className="border p-4 rounded">
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <p>₹{job.wage}</p>

      <button
        onClick={handleApply}
        className="bg-blue-500 text-white px-3 py-1 mt-2"
      >
        Apply
      </button>
    </div>
  );
}