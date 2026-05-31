import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiBriefcase,
  FiMessageCircle,
  FiX,
  FiSend,
  FiUser,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";
import * as assessmentApi from "../api/assessmentApi";
import * as authApi from "../api/authApi";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Aku adalah AI Assistant. Bagaimana bisa aku membantu kamu hari ini?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDashboardData(parsedUser.id);
    }
  }, []);

  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      const [userCourses, allCourses, dashboardStats] = await Promise.all([
        courseApi.getUserCourses(userId),
        courseApi.getAllCourses(),
        courseApi.getDashboardStats(userId),
      ]);

      setEnrolledCourses(userCourses);

      // Filter available courses (not yet enrolled)
      const enrolledIds = userCourses.map((c) => c.id);
      setAvailableCourses(
        allCourses.filter((c) => !enrolledIds.includes(c.id)),
      );

      setStats({
        totalEnrolled: dashboardStats.total_enrolled || 0,
        completed: dashboardStats.completed_courses || 0,
        avgProgress: Math.round(dashboardStats.avg_progress || 0),
      });

      // Fetch assessment results
      try {
        const result = await assessmentApi.getAssessmentResult(userId);
        setAssessmentResult(result.result);
      } catch (error) {
        console.log("No assessment result yet");
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.id) {
        await authApi.logoutUser(user.id);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const handleEnrollCourse = async (courseId) => {
    if (!user) return;
    try {
      setEnrollingCourseId(courseId);
      await courseApi.enrollCourse(user.id, courseId);
      loadDashboardData(user.id);
    } catch (error) {
      console.error("Error enrolling course:", error);
      alert("Gagal mendaftar kursus");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleStatClick = (statType) => {
    if (statType === "enrolled") setActiveTab("enrolled");
    else if (statType === "available") setActiveTab("available");
  };

  const handleSendMessage = async () => {
    if (chatInput.trim() === "" || chatSending) return;
    setChatSending(true);

    const userMessage = {
      id: Date.now(),
      text: chatInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");

    // Typing indicator
    const typingId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: typingId, text: "...", sender: "ai", timestamp: new Date(), typing: true }]);

    try {
      const context = {
        userName: user?.name || null,
        topProfession: assessmentResult?.recommendedJobs?.[0]?.profession || null,
        confidence: assessmentResult?.recommendedJobs?.[0]?.confidence || null,
        allProfessions: assessmentResult?.recommendedJobs?.map(j => j.profession) || [],
        physicalScore: assessmentResult?.physicalScore || null,
        communicationScore: assessmentResult?.communicationScore || null,
        problemSolvingScore: assessmentResult?.problemSolvingScore || null,
        personalityScore: assessmentResult?.personalityScore || null,
        enrolledCourses: enrolledCourses.map(c => ({
          title: c.title,
          category: c.category,
          progress: c.progress_percentage,
          completed: !!c.completed_at,
        })),
        availableCoursesCount: availableCourses.length,
        stats: stats ? {
          totalEnrolled: stats.totalEnrolled,
          completed: stats.completed,
          avgProgress: stats.avgProgress,
        } : null,
        availableCoursesList: availableCourses.map(c => ({
          title: c.title,
          category: c.category,
          durationHours: c.duration_hours,
        })),
        userEducation: user?.education || null,
        userGender: user?.gender || null,
        appPages: {
          dashboard: { label: "Dashboard / Kursus Saya", path: "/dashboard" },
          assessment: { label: "Asesmen Karier", path: "/assessment" },
          assessmentResult: { label: "Hasil Asesmen", path: "/assessment/result" },
          profile: { label: "Profil Saya", path: "/profile" },
        },
        hasAssessment: !!assessmentResult,
      };

      // Send last 10 non-typing messages as history (exclude welcome message)
      const history = messages
        .filter(m => !m.typing && m.id !== 1)
        .slice(-10)
        .map(m => ({ sender: m.sender, text: m.text }))

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, context, history }),
      });

      const data = await res.json();
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat({
        id: Date.now() + 2,
        text: data.reply || data.message || "Maaf, terjadi kesalahan.",
        sender: "ai",
        timestamp: new Date(),
      }));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== typingId).concat({
        id: Date.now() + 2,
        text: "Maaf, AI Assistant sedang tidak tersedia.",
        sender: "ai",
        timestamp: new Date(),
      }));
    } finally {
      setChatSending(false);
    }
  };

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{backgroundColor: 'white'}}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{backgroundColor: 'white', borderColor: '#CCD8E6'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{color: '#233B5E'}}>
                Belajar
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{color: '#7D8293'}}>
                Restart Career Platform
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{backgroundColor: '#233B5E'}}
              >
                <FiUser size={16} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md border border-red-200 bg-white text-red-600"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Welcome Section - Simplified */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold" style={{color: '#233B5E'}}>
            Halo, {user.name}! 👋
          </h2>
          <p className="text-sm mt-1" style={{color: '#7D8293'}}>
            Lanjutkan perjalanan belajarmu hari ini
          </p>
        </div>

        {/* Assessment Results Card */}
        {assessmentResult && (
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiBriefcase className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Hasil Asesmen Kepribadian</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded p-3 text-center">
                <p className="text-xs text-gray-600 font-medium">Fisik</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{parseFloat(assessmentResult.physicalScore).toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(parseFloat(assessmentResult.physicalScore) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 text-center">
                <p className="text-xs text-gray-600 font-medium">Komunikasi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{parseFloat(assessmentResult.communicationScore).toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-600 h-full rounded-full"
                    style={{ width: `${(parseFloat(assessmentResult.communicationScore) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 text-center">
                <p className="text-xs text-gray-600 font-medium">Problem Solving</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{parseFloat(assessmentResult.problemSolvingScore).toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-yellow-600 h-full rounded-full"
                    style={{ width: `${(parseFloat(assessmentResult.problemSolvingScore) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 text-center">
                <p className="text-xs text-gray-600 font-medium">Kepribadian</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{parseFloat(assessmentResult.personalityScore).toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${(parseFloat(assessmentResult.personalityScore) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded p-3 sm:p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Rekomendasi Pekerjaan untuk Anda:</p>
              <div className="grid grid-cols-2 gap-2" style={{gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, minmax(0, 1fr))'}}>
                {assessmentResult.recommendedJobs && assessmentResult.recommendedJobs.map((job, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded">
                    <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                    <span>{typeof job === 'object' ? job.profession : job}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Smaller & Clickable */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => handleStatClick("enrolled")}
            className="rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
            style={{backgroundColor: 'white', border: `1px solid #CCD8E6`}}
          >
            <p className="text-xs font-medium" style={{color: '#7D8293'}}>Kursus Saya</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1" style={{color: '#233B5E'}}>
              {stats.totalEnrolled}
            </p>
          </button>

          <button
            onClick={() => handleStatClick("completed")}
            className="rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
            style={{backgroundColor: 'white', border: `1px solid #CCD8E6`}}
          >
            <p className="text-xs font-medium" style={{color: '#7D8293'}}>Selesai</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1" style={{color: '#16A34A'}}>
              {stats.completed}
            </p>
          </button>

          <button
            onClick={() => handleStatClick("progress")}
            className="rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
            style={{backgroundColor: 'white', border: `1px solid #CCD8E6`}}
          >
            <p className="text-xs font-medium" style={{color: '#7D8293'}}>Progress</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1" style={{color: '#233B5E'}}>
              {stats.avgProgress}%
            </p>
          </button>

          <button
            onClick={() => handleStatClick("available")}
            className="rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
            style={{backgroundColor: 'white', border: `1px solid #CCD8E6`}}
          >
            <p className="text-xs font-medium" style={{color: '#7D8293'}}>Tersedia</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1" style={{color: '#233B5E'}}>
              {availableCourses.length}
            </p>
          </button>
        </div>

        {/* Tab Navigation - Simplified */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "enrolled"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kursus Saya ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "available"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tersedia ({availableCourses.length})
          </button>
        </div>

        {/* Enrolled Courses */}
        {activeTab === "enrolled" && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center border border-gray-200">
                <p className="text-gray-600 mb-3">Belum ada kursus yang diambil</p>
                <button
                  onClick={() => setActiveTab("available")}
                  className="px-4 py-2 text-white rounded text-sm font-medium transition-colors"
                  style={{backgroundColor: '#233B5E'}}
                >
                  Cari Kursus
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div className="relative h-32 overflow-hidden bg-gray-100">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {course.difficulty_level}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.instructor}
                      </p>

                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gray-900 h-full rounded-full transition-all duration-500"
                            style={{ width: `${course.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                        <div>{course.duration_hours} jam</div>
                        <div>{course.category}</div>
                      </div>

                      {course.completed_at ? (
                        <div className="w-full mt-3 bg-green-50 text-green-700 px-3 py-2 rounded text-xs font-medium text-center">
                          ✓ Selesai
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/course/${course.id}`)}
                          className="w-full mt-3 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                          style={{backgroundColor: '#233B5E'}}
                        >
                          Lanjutkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Courses */}
        {activeTab === "available" && (
          <div>
            {availableCourses.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center border border-gray-200">
                <p className="text-gray-600">Semua kursus sudah diambil</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div className="relative h-32 overflow-hidden bg-gray-100">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {course.difficulty_level}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.instructor}
                      </p>

                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                        <div>{course.duration_hours} jam</div>
                        <div>{course.category}</div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-gray-900">
                          Rp {(course.price / 1000).toFixed(0)}K
                        </span>
                        <button
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={enrollingCourseId === course.id}
                          className="px-3 py-1.5 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{backgroundColor: '#233B5E'}}
                        >
                          {enrollingCourseId === course.id ? "..." : "Daftar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-5 right-5 text-white p-3.5 rounded-full shadow-xl transition-all hover:scale-105 z-40"
          style={{ backgroundColor: '#233B5E' }}
          title="Buka AI Assistant"
        >
          <FiMessageCircle size={20} />
        </button>
      )}

      {/* Chat Window — full screen on mobile, floating on desktop */}
      {chatOpen && (
        <div
          className="fixed flex flex-col z-50 overflow-hidden bg-white"
          style={chatExpanded
            ? {
                bottom: '1.5rem', right: '1.5rem',
                width: '640px', height: '78vh',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(35,59,94,0.15)',
                border: '1px solid #e5e7eb',
              }
            : window.innerWidth < 640
            ? {
                bottom: 0, right: 0, left: 0,
                height: '85vh',
                borderRadius: '16px 16px 0 0',
                boxShadow: '0 -4px 24px rgba(35,59,94,0.12)',
                border: '1px solid #e5e7eb',
              }
            : {
                bottom: '1.5rem', right: '1.5rem',
                width: '360px', height: '500px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(35,59,94,0.15)',
                border: '1px solid #e5e7eb',
              }
          }
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#233B5E' }}>
                AI
              </div>
              <span className="font-semibold text-sm" style={{ color: '#233B5E' }}>AI Assistant</span>
            </div>
            <div className="flex items-center gap-0.5">
              {window.innerWidth >= 640 && (
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                  title={chatExpanded ? "Perkecil" : "Perbesar"}
                >
                  {chatExpanded ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
                </button>
              )}
              <button
                onClick={() => { setChatOpen(false); setChatExpanded(false); }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mb-1"
                    style={{ backgroundColor: '#233B5E' }}>
                    AI
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed"
                  style={{
                    maxWidth: '78%',
                    padding: '8px 12px',
                    borderRadius: message.sender === "user" ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    backgroundColor: message.sender === "user" ? '#233B5E' : '#F3F4F6',
                    color: message.sender === "user" ? '#ffffff' : '#1f2937',
                  }}
                >
                  {message.typing ? (
                    <span className="flex gap-1 items-center" style={{ height: '18px' }}>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: message.text
                          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.+?)\*/g, "<em>$1</em>")
                      }} />
                      <span className="text-xs mt-1 block" style={{ opacity: 0.5 }}>
                        {message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
              placeholder="Ketik pesan..."
              className="flex-1 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
              style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={chatInput.trim() === "" || chatSending}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 hover:opacity-85 active:scale-95"
              style={{ backgroundColor: '#233B5E' }}
            >
              {chatSending ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend size={14} />
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
