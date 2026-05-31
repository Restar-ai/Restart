import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiBook,
  FiPhone,
  FiLock,
  FiCamera,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";
import * as authApi from "../api/authApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    phone: "",
    education: "",
    address: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setEditProfile({
        phone: parsedUser.phone || "",
        education: parsedUser.education || "",
        address: parsedUser.address || "",
        password: "",
        confirmPassword: "",
        photo: null,
      });
      if (parsedUser.photo) {
        setPhotoPreview(parsedUser.photo);
      } else {
        setPhotoPreview(null);
      }
      loadProfileData(parsedUser.id);
    }
  }, []);

  const loadProfileData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch profile data from API
      const profileRes = await authApi.getProfile(userId);
      const updatedUser = profileRes.user;
      
      // Set user state dengan data fresh dari database
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update editProfile dengan data terbaru dari database
      setEditProfile({
        phone: updatedUser.phone || "",
        education: updatedUser.education || "",
        address: updatedUser.address || "",
        password: "",
        confirmPassword: "",
        photo: null,
      });
      
      // Update photo preview
      if (updatedUser.photo) {
        setPhotoPreview(updatedUser.photo);
      }
      
      // Load courses untuk participant
      if (updatedUser.role !== "trainer") {
        const userCourses = await courseApi.getUserCourses(userId);
        setEnrolledCourses(userCourses);

        // Filter completed courses
        const completed = userCourses.filter((course) => course.completed_at);
        setCompletedCourses(completed);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/update-address`, {
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result;
        setPhotoPreview(base64String);
        setEditProfile({ ...editProfile, photo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (editProfile.password !== editProfile.confirmPassword) {
      setPasswordError("Password tidak cocok!");
      return;
    }

    try {
      const updateData = {
        user_id: user.id,
        phone: editProfile.phone,
        education: editProfile.education,
        address: editProfile.address,
      };

      if (editProfile.password) {
        updateData.password = editProfile.password;
      }

      if (editProfile.photo && editProfile.photo.startsWith("data:")) {
        updateData.photo = editProfile.photo;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUserData = response.json ? response.json() : null;
        const updatedUser = {
          ...user,
          phone: editProfile.phone,
          education: editProfile.education,
          address: editProfile.address,
        };
        
        // Jika ada photo dari form, simpan ke user object
        if (editProfile.photo && editProfile.photo.startsWith("data:")) {
          updatedUser.photo = editProfile.photo;
          setPhotoPreview(editProfile.photo);
        }
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditingProfile(false);
        setPasswordError("");
        setEditProfile({ ...editProfile, password: "", confirmPassword: "" });
        alert("Profil berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setPasswordError("Terjadi kesalahan saat update profil");
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
    <main className="min-h-screen" style={{backgroundColor: 'white'}}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{backgroundColor: 'white', borderColor: '#CCD8E6'}}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{color: '#233B5E'}}>
                Profile Saya
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{color: '#7D8293'}}>
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
            <div className="bg-white rounded-lg border p-6 sm:p-8 mb-6" style={{borderColor: '#CCD8E6'}}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{backgroundColor: '#233B5E'}}>
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-bold text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{color: '#233B5E'}}>
                      {user.name}
                    </h2>
                    <p className="text-sm mt-1 capitalize" style={{color: '#7D8293'}}>
                      {user.role || "Peserta"}
                    </p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    style={{backgroundColor: '#233B5E', color: 'white'}}
                  >
                    <FiEdit2 size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6" style={{borderColor: '#CCD8E6'}}>
                <div className="flex items-start gap-3">
                  <FiMail className="mt-1 flex-shrink-0" size={20} style={{color: '#233B5E'}} />
                  <div>
                    <p className="text-xs font-medium" style={{color: '#7D8293'}}>Email</p>
                    <p className="text-sm break-all" style={{color: '#233B5E'}}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="mt-1 flex-shrink-0" size={20} style={{color: '#233B5E'}} />
                  <div>
                    <p className="text-xs font-medium" style={{color: '#7D8293'}}>Nomor Telepon</p>
                    <p className="text-sm" style={{color: '#233B5E'}}>
                      {user.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCalendar className="mt-1 flex-shrink-0" size={20} style={{color: '#233B5E'}} />
                  <div>
                    <p className="text-xs font-medium" style={{color: '#7D8293'}}>Tanggal Lahir</p>
                    <p className="text-sm" style={{color: '#233B5E'}}>
                      {user.birth_date ? new Date(user.birth_date).toLocaleDateString("id-ID") : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiBook className="mt-1 flex-shrink-0" size={20} style={{color: '#233B5E'}} />
                  <div>
                    <p className="text-xs font-medium" style={{color: '#7D8293'}}>Pendidikan Terakhir</p>
                    <p className="text-sm" style={{color: '#233B5E'}}>
                      {user.education || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <FiMapPin className="mt-1 flex-shrink-0" size={20} style={{color: '#233B5E'}} />
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{color: '#7D8293'}}>Alamat</p>
                    <p className="text-sm" style={{color: '#233B5E'}}>
                      {user.address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
              <div className="bg-white rounded-lg border p-6 sm:p-8 mb-6" style={{borderColor: '#CCD8E6'}}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{color: '#233B5E'}}>Edit Profil</h3>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setPasswordError("");
                      setPhotoPreview(null);
                    }}
                    className="p-1"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{color: '#233B5E'}}>
                      <FiCamera size={16} className="inline mr-2" />
                      Upload Foto Profil
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{backgroundColor: '#233B5E'}}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : user.photo ? (
                          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="w-full px-4 py-2 border rounded-lg text-sm"
                        style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                        />
                        <p className="text-xs mt-2" style={{color: '#7D8293'}}>
                          Format: JPG, PNG (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{borderColor: '#CCD8E6'}}></div>

                  {/* Nomor Telepon */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#233B5E'}}>
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg text-sm"
                      style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                      placeholder="Contoh: 08123456789"
                    />
                  </div>

                  {/* Pendidikan Terakhir */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#233B5E'}}>
                      Pendidikan Terakhir
                    </label>
                    <select
                      value={editProfile.education}
                      onChange={(e) => setEditProfile({ ...editProfile, education: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg text-sm"
                      style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                    >
                      <option value="">- Pilih Pendidikan -</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Sarjana">Sarjana</option>
                    </select>
                  </div>

                  {/* Alamat */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: '#233B5E'}}>
                      Alamat
                    </label>
                    <input
                      type="text"
                      value={editProfile.address}
                      onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg text-sm"
                      style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="border-t pt-4" style={{borderColor: '#CCD8E6'}}>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{color: '#233B5E'}}>
                      <FiLock size={16} />
                      Ubah Password (Opsional)
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: '#233B5E'}}>
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={editProfile.password}
                        onChange={(e) => {
                          setEditProfile({ ...editProfile, password: e.target.value });
                          setPasswordError("");
                        }}
                        className="w-full px-4 py-2 border rounded-lg text-sm"
                        style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2" style={{color: '#233B5E'}}>
                        Konfirmasi Password
                      </label>
                      <input
                        type="password"
                        value={editProfile.confirmPassword}
                        onChange={(e) => {
                          setEditProfile({ ...editProfile, confirmPassword: e.target.value });
                          setPasswordError("");
                        }}
                        className="w-full px-4 py-2 border rounded-lg text-sm"
                        style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                        placeholder="Ulangi password baru"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-sm text-red-600 mt-2">{passwordError}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm transition"
                      style={{backgroundColor: '#233B5E'}}
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setPasswordError("");
                        setPhotoPreview(null);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition border"
                      style={{borderColor: '#CCD8E6', color: '#233B5E'}}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
            {user?.role !== "trainer" && (
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
            )}

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
