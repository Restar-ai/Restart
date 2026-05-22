import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBook, FiCheckCircle, FiLogOut, FiShield } from "react-icons/fi";
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
      const normalizedCourses = userCourses || [];
      setEnrolledCourses(normalizedCourses);
      setCompletedCourses(normalizedCourses.filter((course) => course.completed_at));
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/4 rounded bg-gray-200" />
            <div className="h-64 rounded-3xl bg-gray-200" />
            <div className="h-56 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  const isTrainer = user?.role === "trainer";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
              >
                <FiArrowLeft size={16} />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {isTrainer ? "Profil Pelatih" : "Profile Saya"}
                </h1>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Informasi akun
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md"
            >
              <FiLogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {user && (
          <>
            <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-slate-900 text-white shadow-2xl shadow-blue-100">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-3xl font-bold shadow-lg backdrop-blur sm:h-24 sm:w-24 sm:text-4xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                        <FiShield size={14} />
                        {isTrainer ? "Pelatih" : "Peserta"}
                      </div>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        {user.name}
                      </h2>
                      <p className="mt-2 text-sm text-white/80 sm:text-base">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Data Profil</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ringkasan identitas dan kontak.
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {isTrainer ? "Pelatih" : "Peserta"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Tanggal Lahir
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {user.birth_date ? new Date(user.birth_date).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Alamat
                  </p>
                  {isEditingAddress ? (
                    <div className="mt-2 space-y-3">
                      <input
                        type="text"
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Masukkan alamat"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAddress}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditedAddress(user.address || "");
                            setIsEditingAddress(false);
                          }}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.address || "-"}
                      </p>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="mt-2 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                      >
                        Edit Alamat
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Jenis Kelamin
                  </p>
                  <p className="mt-2 text-sm font-semibold capitalize text-gray-900">
                    {user.gender || "-"}
                  </p>
                </div>
              </div>
            </section>

            {!isTrainer && (
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <FiCheckCircle className="text-green-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Kursus Selesai
                  </h3>
                  <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {completedCourses.length}
                  </span>
                </div>

                {completedCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                    <FiBook className="mx-auto mb-3 text-gray-400" size={32} />
                    <p className="text-gray-600">
                      Belum ada kursus yang diselesaikan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-4 transition-shadow hover:shadow-sm"
                      >
                        <div className="mt-1 flex-shrink-0 text-green-600">
                          <FiCheckCircle size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words font-semibold text-gray-900">
                            {course.title}
                          </h4>
                          <p className="mt-1 text-xs text-gray-600">
                            Instruktur: {course.instructor}
                          </p>
                          <p className="text-xs text-gray-600">
                            Kategori: {course.category}
                          </p>
                          {course.completed_at && (
                            <p className="mt-2 text-xs font-medium text-green-700">
                              Selesai: {new Date(course.completed_at).toLocaleDateString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-200 pt-6 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {enrolledCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">Total Kursus</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {completedCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">Selesai</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {enrolledCourses.length - completedCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">Sedang Belajar</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
