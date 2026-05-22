import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiUser,
  FiLogOut,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function loadDashboardData() {
    try {
      const data = await courseApi.getTrainerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(loadDashboardData);
  }, []);

  const getParticipantStatus = (participant) => participant.stats?.status || "not-started";

  const getStatusLabel = (status) => {
    if (status === "completed") return "Selesai";
    if (status === "in-progress") return "Dalam Proses";
    return "Belum Mulai";
  };

  const getStatusVariant = (status) => {
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "in-progress") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getStatusCount = (status) => {
    if (!dashboardData?.participants) return 0;

    return dashboardData.participants.filter(
      (participant) => getParticipantStatus(participant) === status,
    ).length;
  };

  const getFilteredParticipants = () => {
    if (!dashboardData) return [];

    if (filterStatus === "all") return dashboardData.participants;
    if (filterStatus === "completed") {
      return dashboardData.participants.filter(
        (participant) => getParticipantStatus(participant) === "completed",
      );
    }
    if (filterStatus === "in-progress") {
      return dashboardData.participants.filter(
        (participant) => getParticipantStatus(participant) === "in-progress",
      );
    }
    if (filterStatus === "not-started") {
      return dashboardData.participants.filter(
        (participant) => getParticipantStatus(participant) === "not-started",
      );
    }

    return dashboardData.participants;
  };

  const handleViewProfile = (participant) => {
    localStorage.setItem("viewingParticipant", JSON.stringify(participant));
    navigate(`/participant/${participant.id}`);
  };

  const handleLogoutRequest = () => {
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
      <div className="min-h-screen bg-[linear-gradient(135deg,_#CCD8E6_0%,_#F7F6EE_52%,_#233B5E_160%)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#233B5E]"></div>
          <p className="text-[#233B5E]">Memuat data...</p>
        </div>
      </div>
    );
  }

  const filteredParticipants = getFilteredParticipants();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#F7F6EE_0%,_#FFFFFF_30%,_#F7F6EE_100%)]">
      <div className="border-b border-white/60 bg-white/78 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#233B5E]">
              Dashboard Pelatih
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pemantauan peserta dan progres pelatihan
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 rounded-full border border-[#CCD8E6] bg-white px-4 py-2 text-sm font-semibold text-[#233B5E] shadow-sm transition hover:-translate-y-0.5 hover:border-[#233B5E] hover:shadow-md"
            >
              <FiUser size={16} />
              Profil
            </button>
            <button
              onClick={handleLogoutRequest}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md"
            >
              <FiLogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#233B5E]">
            Selamat datang, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-slate-600 mt-2">
            Pantau dan kelola perkembangan peserta Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-[#CCD8E6] bg-white/90 p-6 shadow-[0_18px_50px_rgba(35,59,94,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(35,59,94,0.12)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
                  TOTAL
                </p>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  PESERTA
                </p>
                <p className="mt-3 text-4xl font-bold text-[#233B5E]">
                  {dashboardData?.totalParticipants || 0}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-medium text-[#233B5E]">
                    {getStatusCount("completed")} selesai
                  </span>{" "}
                  •{" "}
                  <span className="text-gray-600">
                    {getStatusCount("in-progress")} berlangsung
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-[#CCD8E6] p-4">
                <FiUsers className="h-8 w-8 text-[#233B5E]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
                  TINGKAT
                </p>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  KELULUSAN
                </p>
                <p className="mt-3 text-4xl font-bold text-emerald-700">
                  {dashboardData?.successPercentage || 0}%
                </p>
                <div className="mt-3 h-1.5 w-24 rounded-full bg-emerald-100">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(dashboardData?.successPercentage || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-100 p-4">
                <FiTrendingUp className="h-8 w-8 text-emerald-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-6 shadow-[0_18px_50px_rgba(245,158,11,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(245,158,11,0.12)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
                  RATA-RATA
                </p>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  PROGRES
                </p>
                <p className="mt-3 text-4xl font-bold text-amber-700">
                  {dashboardData?.avgProgress || 0}%
                </p>
                <div className="mt-3 h-1.5 w-24 rounded-full bg-amber-100">
                  <div
                    className="h-1.5 rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(dashboardData?.avgProgress || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="rounded-xl bg-amber-100 p-4">
                <FiActivity className="h-8 w-8 text-amber-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[#233B5E]">Data Peserta</h3>
          <p className="mt-1 text-sm text-slate-600">
            Pantau perkembangan dan kelola program pelatihan peserta
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-emerald-500 text-white"
                : "bg-white text-[#233B5E] border border-[#CCD8E6] hover:bg-[#F7F6EE]"
            }`}
          >
            Semua ({dashboardData?.participants?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "completed"
                ? "bg-amber-500 text-white"
                : "bg-white text-[#233B5E] border border-[#CCD8E6] hover:bg-[#F7F6EE]"
            }`}
          >
            Selesai ({getStatusCount("completed")})
          </button>
          <button
            onClick={() => setFilterStatus("in-progress")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "in-progress"
                ? "bg-rose-500 text-white"
                : "bg-white text-[#233B5E] border border-[#CCD8E6] hover:bg-[#F7F6EE]"
            }`}
          >
            Dalam Proses ({getStatusCount("in-progress")})
          </button>
          <button
            onClick={() => setFilterStatus("not-started")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "not-started"
                ? "bg-[#233B5E] text-white"
                : "bg-white text-[#233B5E] border border-[#CCD8E6] hover:bg-[#F7F6EE]"
            }`}
          >
            Belum Mulai ({getStatusCount("not-started")})
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#CCD8E6] bg-white/90 shadow-[0_18px_50px_rgba(35,59,94,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#CCD8E6] bg-[#F7F6EE]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#233B5E]">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#233B5E]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#233B5E]">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#233B5E]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#233B5E]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-[#CCD8E6]/70 hover:bg-[#F7F6EE]"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#233B5E]">
                        {participant.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {participant.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 w-48">
                          <div className="w-full rounded-full h-2 bg-[#CCD8E6]">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{
                                width: `${participant.stats.avg_progress || 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="whitespace-nowrap text-sm text-slate-600">
                            {Math.round(participant.stats.avg_progress || 0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusVariant(
                            getParticipantStatus(participant),
                          )}`}
                        >
                          {getParticipantStatus(participant) === "completed"
                            ? "✓ "
                            : getParticipantStatus(participant) === "in-progress"
                              ? "⏳ "
                              : "○ "}
                          {getStatusLabel(getParticipantStatus(participant))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewProfile(participant)}
                          className="font-medium text-[#233B5E] hover:text-[#1f344f] hover:underline"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Tidak ada narapidana untuk filter ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-md rounded-3xl border border-red-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(185,28,28,0.18)] backdrop-blur-md">
            <button
              onClick={handleLogoutCancel}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Tutup popup keluar"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <FiAlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#233B5E]">
                  Yakin anda mau keluar dari akun ini?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Anda akan keluar dari dashboard pelatih dan perlu login lagi untuk masuk kembali.
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <FiLogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
