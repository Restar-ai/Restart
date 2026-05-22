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
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200";
    if (status === "in-progress") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const filteredParticipants = getFilteredParticipants();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Pelatih
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pemantauan peserta dan progres pelatihan
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-gray-950"
            >
              <FiUser size={16} />
              Profil
            </button>
            <button
              onClick={handleLogoutRequest}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 transition hover:text-red-600"
            >
              <FiLogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Selamat datang, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-gray-600 mt-2">
            Pantau dan kelola perkembangan peserta Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold tracking-wide mb-1">
                  TOTAL
                </p>
                <p className="text-gray-500 text-xs font-semibold tracking-wide">
                  PESERTA
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                  {dashboardData?.totalParticipants || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-blue-600 font-medium">
                    {getStatusCount("completed")} selesai
                  </span>{" "}
                  •{" "}
                  <span className="text-gray-600">
                    {getStatusCount("in-progress")} berlangsung
                  </span>
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <FiUsers className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold tracking-wide mb-1">
                  TINGKAT
                </p>
                <p className="text-gray-500 text-xs font-semibold tracking-wide">
                  KELULUSAN
                </p>
                <p className="text-4xl font-bold text-blue-600 mt-3">
                  {dashboardData?.successPercentage || 0}%
                </p>
                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(dashboardData?.successPercentage || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <FiTrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-semibold tracking-wide mb-1">
                  RATA-RATA
                </p>
                <p className="text-gray-500 text-xs font-semibold tracking-wide">
                  PROGRES
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                  {dashboardData?.avgProgress || 0}%
                </p>
                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-gray-900 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(dashboardData?.avgProgress || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-xl">
                <FiActivity className="w-8 h-8 text-gray-900" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Data Peserta</h3>
          <p className="text-gray-600 text-sm mt-1">
            Pantau perkembangan dan kelola program pelatihan peserta
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semua ({dashboardData?.participants?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Selesai ({getStatusCount("completed")})
          </button>
          <button
            onClick={() => setFilterStatus("in-progress")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "in-progress"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Dalam Proses ({getStatusCount("in-progress")})
          </button>
          <button
            onClick={() => setFilterStatus("not-started")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "not-started"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Belum Mulai ({getStatusCount("not-started")})
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {participant.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {participant.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 w-48">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${participant.stats.avg_progress || 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 whitespace-nowrap">
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
                          className="font-medium text-blue-500 hover:text-blue-700 hover:underline"
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
                      className="px-6 py-8 text-center text-gray-500"
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
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={handleLogoutCancel}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Tutup popup keluar"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <FiAlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Yakin anda mau keluar dari akun ini?
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Anda akan keluar dari dashboard pelatih dan perlu login lagi untuk masuk kembali.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleLogoutCancel}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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
