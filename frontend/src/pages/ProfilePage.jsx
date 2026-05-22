import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBook, FiCheckCircle, FiLogOut, FiShield, FiAlertTriangle, FiX } from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,_#CCD8E6_0%,_#F7F6EE_52%,_#233B5E_160%)] p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/4 rounded bg-white/30" />
            <div className="h-64 rounded-3xl bg-white/30" />
            <div className="h-56 rounded-3xl bg-white/30" />
          </div>
        </div>
      </main>
    );
  }

  const isTrainer = user?.role === "trainer";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#F7F6EE_0%,_#FFFFFF_36%,_#F7F6EE_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/78 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-full border border-[#CCD8E6] bg-white px-3 py-2 text-sm font-semibold text-[#233B5E] shadow-sm transition hover:-translate-y-0.5 hover:border-[#233B5E] hover:shadow-md"
              >
                <FiArrowLeft size={16} />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#233B5E] sm:text-3xl">
                  {isTrainer ? "Profil Pelatih" : "Profile Saya"}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Informasi akun
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#CCD8E6] bg-white px-3 py-2 text-sm font-semibold text-[#233B5E] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F7F6EE] hover:shadow-md"
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
            <section className="overflow-hidden rounded-3xl border border-[#CCD8E6] bg-[linear-gradient(135deg,_#CCD8E6_0%,_#F7F6EE_55%,_#233B5E_145%)] text-[#233B5E] shadow-[0_24px_70px_rgba(35,59,94,0.16)]">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-white/70 bg-white/60 text-3xl font-bold text-[#233B5E] shadow-lg backdrop-blur sm:h-24 sm:w-24 sm:text-4xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#233B5E]">
                        <FiShield size={14} />
                        {isTrainer ? "Pelatih" : "Peserta"}
                      </div>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#233B5E] sm:text-4xl">
                        {user.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 sm:text-base">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#CCD8E6] bg-white/90 p-5 shadow-[0_18px_50px_rgba(35,59,94,0.08)] sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[#233B5E]">Data Profil</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ringkasan identitas dan kontak.
                  </p>
                </div>
                <div className="rounded-full bg-[#CCD8E6] px-3 py-1 text-xs font-semibold text-[#233B5E]">
                  {isTrainer ? "Pelatih" : "Peserta"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#CCD8E6] bg-[#F7F6EE] p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-[#233B5E]">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Tanggal Lahir
                  </p>
                  <p className="mt-2 text-sm font-semibold text-amber-700">
                    {user.birth_date ? new Date(user.birth_date).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Alamat
                  </p>
                  {isEditingAddress ? (
                    <div className="mt-2 space-y-3">
                      <input
                        type="text"
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                        className="w-full rounded-xl border border-[#CCD8E6] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#233B5E] focus:ring-4 focus:ring-[#CCD8E6]"
                        placeholder="Masukkan alamat"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAddress}
                          className="rounded-xl bg-[#233B5E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1f344f]"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditedAddress(user.address || "");
                            setIsEditingAddress(false);
                          }}
                          className="rounded-xl border border-[#CCD8E6] bg-white px-3 py-2 text-xs font-semibold text-[#233B5E] transition hover:bg-[#F7F6EE]"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-emerald-700">
                        {user.address || "-"}
                      </p>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="mt-2 text-xs font-semibold text-[#233B5E] transition hover:text-[#1f344f]"
                      >
                        Edit Alamat
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#CCD8E6] bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Jenis Kelamin
                  </p>
                  <p className="mt-2 text-sm font-semibold capitalize text-[#233B5E]">
                    {user.gender || "-"}
                  </p>
                </div>
              </div>
            </section>

            {!isTrainer && (
              <div className="rounded-3xl border border-[#CCD8E6] bg-white/90 p-5 shadow-[0_18px_50px_rgba(35,59,94,0.08)] sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <FiCheckCircle className="text-emerald-600" size={24} />
                  <h3 className="text-xl font-bold text-[#233B5E] sm:text-2xl">
                    Kursus Selesai
                  </h3>
                  <span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {completedCourses.length}
                  </span>
                </div>

                {completedCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#CCD8E6] bg-[#F7F6EE] py-12 text-center">
                    <FiBook className="mx-auto mb-3 text-[#233B5E]/40" size={32} />
                    <p className="text-[#233B5E]">
                      Belum ada kursus yang diselesaikan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-shadow hover:shadow-sm"
                      >
                        <div className="mt-1 flex-shrink-0 text-emerald-600">
                          <FiCheckCircle size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words font-semibold text-[#233B5E]">
                            {course.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-600">
                            Instruktur: {course.instructor}
                          </p>
                          <p className="text-xs text-slate-600">
                            Kategori: {course.category}
                          </p>
                          {course.completed_at && (
                            <p className="mt-2 text-xs font-medium text-emerald-700">
                              Selesai: {new Date(course.completed_at).toLocaleDateString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#CCD8E6] pt-6 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7F6EE] p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-[#233B5E] sm:text-3xl">
                      {enrolledCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Total Kursus</p>
                  </div>
                  <div className="rounded-2xl bg-[#CCD8E6] p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-[#233B5E] sm:text-3xl">
                      {completedCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-[#233B5E]">Selesai</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-amber-700 sm:text-3xl">
                      {enrolledCourses.length - completedCourses.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Sedang Belajar</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-3xl border border-[#CCD8E6] bg-white/95 p-6 shadow-[0_24px_70px_rgba(35,59,94,0.18)] backdrop-blur-md">
            <button
              onClick={handleLogoutCancel}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-[#F7F6EE] hover:text-[#233B5E]"
              aria-label="Tutup popup keluar"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#CCD8E6] text-[#233B5E]">
                <FiAlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#233B5E]">
                  Yakin anda mau keluar dari akun ini?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Anda akan keluar dari halaman profil dan perlu login lagi untuk masuk kembali.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleLogoutCancel}
                className="rounded-full border border-[#CCD8E6] px-4 py-2 text-sm font-semibold text-[#233B5E] transition hover:bg-[#F7F6EE]"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#233B5E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f344f]"
              >
                <FiLogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
