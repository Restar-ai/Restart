import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLogOut,
  FiUser,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function ParticipantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const storedParticipant = localStorage.getItem("viewingParticipant");
    if (storedParticipant) {
      const data = JSON.parse(storedParticipant);
      setParticipant(data);
      loadParticipantCourses(id);
    }
  }, [id]);

  const loadParticipantCourses = async (userId) => {
    try {
      setLoading(true);
      const userCourses = await courseApi.getUserCourses(userId);
      setCourses(userCourses || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleBack = () => {
    localStorage.removeItem("viewingParticipant");
    navigate("/dashboard");
  };

  if (!participant || loading) {
    return (
      <main className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  const completedCourses = courses.filter((c) => c.completed_at).length;
  const totalCourses = courses.length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) /
            totalCourses,
        )
      : 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
              >
                <FiArrowLeft size={16} />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Profile Narapidana
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Participant Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiUser className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {participant.name}
              </h2>
              <p className="text-gray-600">{participant.email}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {participant.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600 font-medium">NIK</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {participant.nik || "-"}
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600 font-medium">Gender</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {participant.gender === "male" ? "Pria" : "Wanita"}
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600 font-medium">Tanggal Lahir</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(participant.birth_date).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600 font-medium">Alamat</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {participant.address || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Kursus Selesai
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {completedCourses}/{totalCourses}
            </p>
            <p className="text-xs text-gray-500 mt-2">dari total kursus</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Rata-rata Progress
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {avgProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${avgProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Total Kursus
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {totalCourses}
            </p>
            <p className="text-xs text-gray-500 mt-2">kursus terdaftar</p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Daftar Kursus
            </h3>
          </div>

          {courses.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {course.instructor}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Kategori: {course.category} • Durasi:{" "}
                        {course.duration_hours} jam
                      </p>
                    </div>
                    <div className="text-right">
                      {course.completed_at ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <FiCheckCircle size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          <FiClock size={14} /> Dalam Proses
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {course.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${course.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-600">
              <p>Belum ada kursus yang didaftar</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
