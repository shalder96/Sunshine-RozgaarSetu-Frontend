import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import socket from "../socket";
import { Briefcase, Users, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingApps, setLoadingApps] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [chatUser, setChatUser] = useState(null);
  const [chatUserName, setChatUserName] = useState("");

  const chatEndRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔥 Initialize socket
  useEffect(() => {
    socket.emit("join", user._id);

    socket.on("receiveMessage", (msg) => {
      const chatKey =
        msg.sender?.toString() === user._id
          ? msg.receiver?.toString()
          : msg.sender?.toString();

      setMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), msg],
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  // 🔥 Receive messages (REAL-TIME)
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.sender]: [...(prev[msg.sender] || []), msg],
      }));
    });

    return () => socket.off("receiveMessage");
  }, []);

  // 🔥 Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 Open chat
  const openChat = async (userId, userName) => {
    setActiveChat(userId);

    setChatUser(userId);
    setChatUserName(userName);

    try {
      const res = await API.get(`/messages/${userId}`);

      setMessages((prev) => ({
        ...prev,
        [userId]: res.data,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Send message
  const sendMessage = async (receiverId) => {
    if (!newMessage.trim()) return;

    try {
      const res = await API.post("/messages", {
        receiver: receiverId,
        text: newMessage,
      });

      const message = res.data;

      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), message],
      }));

      socket.emit("sendMessage", {
        sender: user._id,
        receiver: receiverId,
        text: newMessage,
        createdAt: new Date(),
      });

      setNewMessage("");

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Fetch jobs
  useEffect(() => {
    API.get("/jobs/my-jobs")
      .then((res) => setJobs(res.data))
      .catch(console.log);
  }, []);

  // 🔥 Fetch applicants
  const fetchApplicants = async (jobId) => {
    try {
      setLoadingApps(true);
      setSelectedJob(jobId);

      const res = await API.get(`/applications/job/${jobId}`);
      setApplications(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingApps(false);
    }
  };

  // 🗑️ Delete job
  const deleteJob = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Update status
  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/applications/${id}/status`, { status });

      setApplications((prev) =>
        prev.map((app) => (app._id === id ? res.data : app)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 🔍 Filter jobs
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()),
  );
  // 📊 Stats
  const totalJobs = jobs.length;

  const hiredEmployees = applications.filter(
    (app) => app.status === "accepted",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {/* Stats */}
        <div className="flex gap-4">
          {/* Total Jobs */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/80 backdrop-blur-lg border border-white/30 hover:scale-[1.02] transition-all duration-300 shadow-xl rounded-2xl px-4 py-3 min-w-[180px] items-center flex gap-3"
          >
            <div className="p-3 rounded-xl">
              <Briefcase className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-500">Total Jobs Posted</p>

            <p className="text-2xl font-bold text-blue-600">{totalJobs}</p>
          </motion.div>

          {/* Hired Employees */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/80 backdrop-blur-lg border border-white/30 hover:scale-[1.02] transition-all duration-300 shadow-xl rounded-2xl px-4 py-3 min-w-[180px] items-center flex gap-3"
          >
            <div className="p-3 rounded-xl">
              <Users className="text-green-600" size={24} />
            </div>
            <p className="text-sm text-gray-500">Employees Hired</p>

            <p className="text-2xl font-bold text-green-600">
              {hiredEmployees}
            </p>
          </motion.div>
        </div>

        {/* Post Job Button */}
        <Link
          to="/post-job"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-sm shadow-md transition text-center"
        >
          + Post New Job
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 pointer-events-none flex items-center">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 w-full bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl px-5 py-4 shadow-lg outline-none focus:ring-4 focus:ring-blue-300/30 transition-all duration-300"
        />
      </div>

      {/* Jobs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <motion.div
            key={job._id}
            className={`bg-white/90 backdrop-blur-lg border border-white/40 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 ${
              selectedJob === job._id
                ? "border-2 border-blue-500"
                : "hover:shadow-lg"
            }`}
            whileHover={{
              y: -6,
              scale: 1.02,
            }}
          >
            <h2 className="font-semibold text-lg">{job.title}</h2>
            <div className="flex gap-2 mt-3">
              <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                Active
              </span>

              <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
                Hiring
              </span>
            </div>

            <p className="text-sm text-gray-400">
              {job.applicantCount || 0} applicants
            </p>

            <p className="text-gray-600 text-sm mt-1">{job.description}</p>

            <p className="text-green-600 font-bold mt-2">₹{job.wage}</p>

            <div className="flex gap-1 mt-3">
              <button
                onClick={() => fetchApplicants(job._id)}
                className=" flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl transition-all font-medium "
              >
                View
              </button>

              <Link
                to={`/edit-job/${job._id}`}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-2 rounded-xl transition-all font-medium text-center"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteJob(job._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      {selectedJob && (
        <motion.div
          className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur shadow-2xl p-5 overflow-y-auto z-50 border-l"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
        >
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Applicants</h2>
            <button onClick={() => setSelectedJob(null)}>✖</button>
          </div>

          {loadingApps ? (
            <p>Loading...</p>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className=" bg-white border border-gray-100 rounded-3xl p-4 mb-4 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* PROFILE HEADER */}
                <div className="flex items-start justify-between">
                  {/* LEFT PROFILE */}
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div className=" w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {app.workerId.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* USER INFO */}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base">
                        {app.workerId.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {app.workerId.phone}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Applied recently
                      </p>
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "accepted"
                        ? "bg-green-100 text-green-600"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-500"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {/* CALL */}
                  <a href={`tel:${app.workerId.phone}`}>
                    <button className=" w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg">
                      Call
                    </button>
                  </a>

                  {/* CHAT */}
                  <button
                    onClick={() =>
                      openChat(app.workerId._id, app.workerId.name)
                    }
                    className=" w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Chat
                  </button>

                  {/* ACCEPT */}
                  <button
                    onClick={() => toast.success(`Application  ${status}`)}
                    className=" w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Accept
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() => toast.error(`Application  ${status}`)}
                    className=" w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* FLOATING CHAT PANEL */}
      {chatUser && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className=" fixed right-5 bottom-5 w-[360px] h-[550px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-[100]
    "
        >
          {/* HEADER */}
          <div
            className=" bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between
      "
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <div className=" w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shadow-md">
                {chatUserName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-semibold">{chatUserName}</h3>

                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>

            {/* CLOSE */}
            <button
              onClick={() => {
                setChatUser(null);
                setActiveChat(null);
              }}
              className=" hover:bg-white/20 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {(messages[chatUser] || []).map((msg, i) => (
              <div
                key={i}
                className={`mb-3 flex ${
                  msg.sender?.toString() === user._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={` max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.sender?.toString() === user._id
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-700 rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* TIME */}
                  <p
                    className={` text-[10px] mt-1 ${
                      msg.sender?.toString() === user._id
                        ? "text-blue-100"
                        : "text-gray-400"
                    }
              `}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div ref={chatEndRef}></div>
          </div>

          {/* INPUT */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className=" flex-1 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              />

              <button
                onClick={() => sendMessage(chatUser)}
                className=" bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl transition-all font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
