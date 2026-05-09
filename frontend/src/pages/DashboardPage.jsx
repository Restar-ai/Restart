import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiBook,
  FiCheckCircle,
  FiTrendingUp,
  FiPlayCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("enrolled");

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
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Belajar
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Restart Career Platform
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Welcome Section - Simplified */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Halo, {user.name}! 👋
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Lanjutkan perjalanan belajarmu hari ini
          </p>
        </div>

        {/* Stats Cards - Smaller & Clickable */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => handleStatClick("enrolled")}
            className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
          >
            <p className="text-xs text-gray-600 font-medium">Kursus Saya</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {stats.totalEnrolled}
            </p>
          </button>

          <button
            onClick={() => handleStatClick("enrolled")}
            className="bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
          >
            <p className="text-xs text-gray-600 font-medium">Selesai</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {stats.completed}
            </p>
          </button>

          <button
            onClick={() => handleStatClick("enrolled")}
            className="bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
          >
            <p className="text-xs text-gray-600 font-medium">Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {stats.avgProgress}%
            </p>
          </button>

          <button
            onClick={() => handleStatClick("available")}
            className="bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer"
          >
            <p className="text-xs text-gray-600 font-medium">Tersedia</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
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
                  className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
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
                        <button className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors">
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
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </main>
  );
}
