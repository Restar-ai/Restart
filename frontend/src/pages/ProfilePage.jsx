import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiBook,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedAddress(parsedUser.address || "");
      loadProfileData(parsedUser.id);
    }
  }, []);

  const loadProfileData = async (userId) => {
    try {
      setLoading(true);
      const userCourses = await courseApi.getUserCourses(userId);
      setEnrolledCourses(userCourses);

      // Filter completed courses
      const completed = userCourses.filter((course) => course.completed_at);
      setCompletedCourses(completed);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/update-address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ address: editedAddress, user_id: user.id }),
      });

      if (response.ok) {
        const updatedUser = { ...user, address: editedAddress };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditingAddress(false);
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Profile Saya
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Informasi akun dan pembelajaran
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {user && (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
              <div className="flex items-start gap-4 sm:gap-6 mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 capitalize">
                    {user.role || "Peserta"}
                  </p>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-start gap-3">
                  <FiMail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCalendar className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Tanggal Lahir
                    </p>
                    <p className="text-sm text-gray-900">
                      {user.birth_date ? new Date(user.birth_date).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Alamat</p>
                    {isEditingAddress ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={editedAddress}
                          onChange={(e) => setEditedAddress(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                          placeholder="Masukkan alamat"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveAddress}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditedAddress(user.address || "");
                              setIsEditingAddress(false);
                            }}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-900">
                          {user.address || "-"}
                        </p>
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
                        >
                          Edit Alamat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiBook className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Jenis Kelamin</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {user.gender || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Courses Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiCheckCircle className="text-green-600" size={24} />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Kursus Selesai
                </h3>
                <span className="ml-auto bg-green-100 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {completedCourses.length}
                </span>
              </div>

              {completedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600">
                    Belum ada kursus yang diselesaikan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="text-green-600 mt-1 flex-shrink-0">
                        <FiCheckCircle size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 break-words">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Instruktur: {course.instructor}
                        </p>
                        <p className="text-xs text-gray-600">
                          Kategori: {course.category}
                        </p>
                        {course.completed_at && (
                          <p className="text-xs text-green-700 font-medium mt-2">
                            Selesai:{" "}
                            {new Date(course.completed_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {enrolledCourses.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Kursus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {completedCourses.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Selesai</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-700">
                      {enrolledCourses.length - completedCourses.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Sedang Belajar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full mt-6 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded font-medium transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </>
        )}
      </div>
    </main>
  );
}
