import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiTrendingUp, FiActivity } from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await courseApi.getTrainerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParticipants = () => {
    if (!dashboardData) return [];

    if (filterStatus === "all") return dashboardData.participants;
    if (filterStatus === "completed")
      return dashboardData.participants.filter(
        (p) => (p.stats.completed_courses || 0) > 0,
      );
    if (filterStatus === "in-progress")
      return dashboardData.participants.filter(
        (p) =>
          (p.stats.completed_courses || 0) === 0 &&
          (p.stats.total_courses || 0) > 0,
      );
    if (filterStatus === "not-started")
      return dashboardData.participants.filter(
        (p) => (p.stats.total_courses || 0) === 0,
      );

    return dashboardData.participants;
  };

  const handleViewProfile = (participant) => {
    localStorage.setItem("viewingParticipant", JSON.stringify(participant));
    navigate(`/participant/${participant.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Pelatih
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-900"
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Selamat datang, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-gray-600 mt-2">
            Pantau dan kelola perkembangan narapidana Anda
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Peserta */}
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
                    {dashboardData?.participants?.filter(
                      (p) => (p.stats.completed_courses || 0) > 0,
                    ).length || 0}{" "}
                    selesai
                  </span>{" "}
                  •{" "}
                  <span className="text-gray-600">
                    {dashboardData?.participants?.filter(
                      (p) =>
                        (p.stats.completed_courses || 0) === 0 &&
                        (p.stats.total_courses || 0) > 0,
                    ).length || 0}{" "}
                    berlangsung
                  </span>
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <FiUsers className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Success Percentage */}
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

          {/* Average Progress */}
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

        {/* Data Peserta Section Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Data Peserta</h3>
          <p className="text-gray-600 text-sm mt-1">
            Pantau perkembangan dan kelola program pelatihan peserta
          </p>
        </div>

        {/* Filters */}
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
            Selesai (
            {dashboardData?.participants?.filter(
              (p) => (p.stats.completed_courses || 0) > 0,
            ).length || 0}
            )
          </button>
          <button
            onClick={() => setFilterStatus("in-progress")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "in-progress"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Dalam Proses (
            {dashboardData?.participants?.filter(
              (p) =>
                (p.stats.completed_courses || 0) === 0 &&
                (p.stats.total_courses || 0) > 0,
            ).length || 0}
            )
          </button>
          <button
            onClick={() => setFilterStatus("not-started")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "not-started"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Belum Mulai (
            {dashboardData?.participants?.filter(
              (p) => (p.stats.total_courses || 0) === 0,
            ).length || 0}
            )
          </button>
        </div>

        {/* Participants Table */}
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
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
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
                        {(participant.stats.completed_courses || 0) > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Selesai
                          </span>
                        ) : (participant.stats.total_courses || 0) > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Dalam Proses
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ○ Belum Mulai
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewProfile(participant)}
                          className="text-blue-500 hover:text-blue-700 hover:underline font-medium"
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
    </div>
  );
}
