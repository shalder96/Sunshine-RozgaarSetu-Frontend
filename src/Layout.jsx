import { useEffect, useState, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import API from "./services/api";
import { AnimatePresence, motion } from "framer-motion";
import logo from "./assets/logo.png";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";

export default function Layout() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setUser(storedUser);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

    socketRef.current.emit("join", user._id);

    socketRef.current.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);

      toast.success(notification.text);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    API.get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch(console.log);
  }, []);

  // Photo upload function
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();

      formData.append("profilePic", file);

      const res = await API.put("/auth/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // save updated user
      localStorage.setItem("user", JSON.stringify(res.data));

      // instant UI update
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // 🔥 Active link style
  const navLinkStyle = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
      location.pathname === path
        ? "bg-blue-100 text-blue-600 shadow-sm border border-blue-200 relative overflow-hidden"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    }`;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* DESKTOP NAVBAR */}
      {!hideNavbar && (
        <motion.nav
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          className="hidden md:flex sticky top-0 z-50 items-center justify-between px-4 md:px-8 py-3 bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {/* Logo */}
          <Link to="/" className="hidden md:flex items-center gap-3">
            <img
              src={logo}
              alt="RozgaarSetu"
              className="h-10 md:h-11 object-contain"
            />

            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-blue-600">
                RozgaarSetu
              </h1>

              <p className="text-xs text-gray-500 -mt-1">Connecting Talent</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-3">
            {/* Guest */}
            {!user && (
              <>
                <Link to="/login" className={navLinkStyle("/login")}>
                  Login
                </Link>

                <Link to="/register" className={navLinkStyle("/register")}>
                  Register
                </Link>
              </>
            )}

            {/* Worker Navigation bar*/}
            {user?.role === "worker" && (
              <>
                <Link
                  to="/worker-dashboard"
                  className={navLinkStyle("/worker-dashboard")}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link to="/jobs" className={navLinkStyle("/jobs")}>
                  <Briefcase size={18} />
                  Jobs
                </Link>
              </>
            )}

            {/* Employer Navigation Bar */}
            {user?.role === "employer" && (
              <>
                <Link to="/dashboard" className={navLinkStyle("/dashboard")}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <Link to="/post-job" className={navLinkStyle("/post-job")}>
                  <PlusCircle size={18} />
                  Post Job
                </Link>
              </>
            )}

            {/* User Badge */}
            {user && (
              <div className=" hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-xl px-3 py-2 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                {/* IMAGE + NAME */}
                <div className="relative group">
                  <img
                    src={
                      user?.profilePic ||
                      "https://ui-avatars.com/api/?name=" + user?.name
                    }
                    alt="profile"
                    className="  w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  {/* OVERLAY */}
                  <label
                    htmlFor="profileUpload"
                    className=" absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] cursor-pointer"
                  >
                    Edit
                  </label>
                </div>
                {/* INFO */}
                {/* INFO */}
                <div className="flex flex-col">
                  {/* NAME */}
                  <span className=" text-sm capitalize text-gray-800 font-semibold leading-none">
                    {user?.name}
                  </span>

                  {/* ROLE BADGE */}
                  <span
                    className={` mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit   ${user?.role === "employer" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"} `}
                  >
                    {user?.role === "employer" ? "Employer" : "Worker"}
                  </span>
                </div>

                {/* HIDDEN INPUT */}
                <input
                  type="file"
                  id="profileUpload"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}

            {/* Notification button  */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 p-2.5 rounded-xl transition-all duration-300 shadow-sm"
              >
                <Bell size={20} className="text-blue-600" />

                {/* Badge */}
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[340px] bg-white text-black rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b font-semibold">
                    Notifications
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-sm">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={` p-4 border-b text-sm transition-all hover:bg-blue-50 ${
                            !n.isRead ? "bg-blue-50" : "bg-white"
                          }`}
                        >
                          {n.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className=" bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium gap-2 flex items-center"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </motion.nav>
      )}
      {/* MOBILE NAVBAR */}
      {!hideNavbar && (
        <motion.nav
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          className=" md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        >
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="RozgaarSetu" className="h-9 object-contain" />

            <div>
              <h1 className="font-black text-blue-600 text-lg">RozgaarSetu</h1>

              <p className="text-[10px] text-gray-500 -mt-1">
                Connecting Talent
              </p>
            </div>
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* NOTIFICATION */}
            {user && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className=" relative bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm"
              >
                <Bell size={20} className="text-blue-600" />

                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className=" absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>
            )}

            {/* HAMBURGER */}
            <button
              onClick={() => setMobileMenu(true)}
              className=" bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm"
            >
              <Menu size={22} className="text-blue-600" />
            </button>
          </div>
        </motion.nav>
      )}
      {/* MOBILE DRAWER */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenu(false)}
          ></div>
          <Link to="/" className="md:hidden flex items-center gap-3">
            <img
              src={logo}
              alt="RozgaarSetu"
              className="h-10 md:h-11 object-contain"
            />
          </Link>

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className=" absolute right-0 top-0 h-full w-[290px] bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-white/30 p-6 flex flex-col"
          >
            {/* TOP */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="RozgaarSetu"
                  className="h-10 object-contain"
                />

                <div>
                  <h2 className="font-black text-blue-600">RozgaarSetu</h2>

                  <p className="text-xs text-gray-500">Navigation Menu</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenu(false)}
                className=" p-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* USER */}
            {user && (
              <div className=" flex md:hidden items-center gap-2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-2xl border border-gray-200 shadow-sm max-w-fit">
                {/* IMAGE */}
                <div className="relative group shrink-0">
                  <img
                    src={
                      user?.profilePic ||
                      `https://ui-avatars.com/api/?name=${user?.name}`
                    }
                    alt="profile"
                    className=" w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                  />

                  {/* OVERLAY */}
                  <label
                    htmlFor="profileUpload"
                    className=" absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[9px] cursor-pointer"
                  >
                    Edit
                  </label>
                </div>

                {/* NAME */}
                <span className=" text-xs capitalize text-gray-800 font-semibold truncate max-w-[70px]">
                  {user?.name}
                </span>

                {/* INPUT */}
                <input
                  type="file"
                  id="profileUpload"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}

            {/* LINKS */}
            <div className="flex flex-col gap-2">
              {user?.role === "worker" && (
                <>
                  <Link
                    to="/worker-dashboard"
                    onClick={() => setMobileMenu(false)}
                    className={navLinkStyle("/worker-dashboard")}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenu(false)}
                    className={navLinkStyle("/jobs")}
                  >
                    <Briefcase size={18} />
                    Jobs
                  </Link>
                </>
              )}

              {user?.role === "employer" && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenu(false)}
                    className={navLinkStyle("/dashboard")}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  <Link
                    to="/post-job"
                    onClick={() => setMobileMenu(false)}
                    className={navLinkStyle("/post-job")}
                  >
                    <PlusCircle size={18} />
                    Post Job
                  </Link>
                </>
              )}
            </div>

            {/* LOGOUT */}
            {user && (
              <button
                onClick={handleLogout}
                className=" mt-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* PAGE TRANSITIONS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
