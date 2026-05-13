import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import socket from "../socket";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function WorkerDashboard() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [chatUser, setChatUser] = useState(null);
  // const [message, setMessage] = useState("");
  const [chatUserName, setChatUserName] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);

  const chatEndRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    socket.emit("join", user._id);
  }, [user._id]);

  // 🔥 Receive messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      toast.success("New message received 💬");
      setMessages((prev) => ({
        ...prev,
        [msg.sender?.toString()]: [
          ...(prev[msg.sender?.toString()] || []),
          msg,
        ],
      }));
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // 🔥 Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // 🔥 Fetch applications
  useEffect(() => {
    API.get("/applications/my")
      .then((res) => setApplications(res.data))
      .catch(console.log);
  }, []);

  // 🔥 Open chat
  const openChat = async (employerId, employerName) => {
    setChatUser(employerId);
    setChatUserName(employerName);

    try {
      const res = await API.get(`/messages/${employerId}`);

      setMessages((prev) => ({
        ...prev,
        [employerId]: res.data,
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

      // ✅ Instantly update UI
      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), message],
      }));

      // ✅ Real-time socket emit
      socket.emit("sendMessage", {
        sender: user._id,
        receiver: receiverId,
        text: newMessage,
        createdAt: new Date(),
      });

      // ✅ Clear input
      setNewMessage("");

      // ✅ Auto scroll
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.log(err);
    }
  };

  // 🗑️ Withdraw
  const withdrawApplication = async () => {
    try {
      setWithdrawingId(selectedWithdrawId);

      await API.delete(`/applications/${selectedWithdrawId}`);

      setApplications((prev) =>
        prev.filter((app) => app._id !== selectedWithdrawId),
      );

      toast.success("Application withdrawn");

      setShowWithdrawModal(false);

      setTimeout(() => {
        toast.dismiss();
      }, 2500);
    } catch (err) {
      console.log(err);

      toast.error("Error withdrawing application");
    } finally {
      setWithdrawingId(null);
    }
  };

  // 🔍 Filter
  const filteredApps = applications.filter((app) =>
    app.jobId?.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      {/* Stat Cards  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* TOTAL */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Applied</p>

          <h2 className="text-3xl font-black text-blue-600 mt-2">
            {applications.length}
          </h2>
        </div>

        {/* PENDING */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>

          <h2 className="text-3xl font-black text-yellow-500 mt-2">
            {applications.filter((a) => a.status === "pending").length}
          </h2>
        </div>

        {/* ACCEPTED */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Accepted</p>

          <h2 className="text-3xl font-black text-green-500 mt-2">
            {applications.filter((a) => a.status === "accepted").length}
          </h2>
        </div>

        {/* REJECTED */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Rejected</p>

          <h2 className="text-3xl font-black text-red-500 mt-2">
            {applications.filter((a) => a.status === "rejected").length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search applied jobs..."
        className="border p-2 rounded w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Applications */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">🚀</div>

            <h2 className="text-2xl font-bold text-gray-700">
              No Applications Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Start applying to jobs and track them here.
            </p>

            <Link
              to="/jobs"
              className=" inline-block mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-all"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          filteredApps.map((app) => (
            <motion.div
              key={app._id}
              className=" bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              whileHover={{ scale: 1.03 }}
            >
              {/* Job */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* ICON */}
                  <div className=" w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                    {app.jobId?.title?.charAt(0).toUpperCase()}
                  </div>

                  {/* INFO */}
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">
                      {app.jobId?.title}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Employer: {app.jobId?.postedBy?.name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {app.jobId?.description}
                    </p>
                    <p className="text-green-600 font-bold mt-2">
                      ₹{app.jobId?.wage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mt-3 ${
                  app.status === "accepted"
                    ? "bg-green-100 text-green-600"
                    : app.status === "rejected"
                      ? "bg-red-100 text-red-500"
                      : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    app.status === "accepted"
                      ? "bg-green-500"
                      : app.status === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                />

                {app.status}
              </span>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() =>
                    openChat(
                      app.jobId?.postedBy?._id,
                      app.jobId?.postedBy?.name,
                    )
                  }
                  className=" bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl transition-all font-medium hover:shadow-lg"
                >
                  Chat
                </button>

                <button
                  onClick={() => {
                    setSelectedWithdrawId(app._id);
                    setShowWithdrawModal(true);
                  }}
                  className=" bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl transition-all font-medium hover:shadow-lg"
                >
                  Withdraw
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      {/* FLOATING CHAT PANEL */}
      {chatUser && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className="fixed right-4 bottom-4 w-80 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col z-50 border"
        >
          {/* Header */}
          <div className="bg-blue-500 text-white p-3 rounded-t-2xl flex justify-between items-center">
            <div>
              <p className="font-semibold">{chatUserName}</p>

              <p className="text-xs opacity-80">Employer</p>
            </div>

            <button
              onClick={() => {
                setChatUser(null);
              }}
              className="text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {(messages[chatUser] || []).map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${
                  msg.sender?.toString() === user._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm ${
                    msg.sender?.toString() === user._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              className="border rounded-full px-4 py-2 flex-1 outline-none"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              onClick={() => sendMessage(chatUser)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-full"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-3">Withdraw Application?</h2>

            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={withdrawApplication}
                disabled={withdrawingId}
                className={`px-4 py-2 rounded-lg text-white ${
                  withdrawingId ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {withdrawingId ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
