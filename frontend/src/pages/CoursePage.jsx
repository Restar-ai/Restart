import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiBook,
  FiUser,
  FiCheckCircle,
  FiAward,
} from "react-icons/fi";
import * as courseApi from "../api/courseApi";

export default function CoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const contentRef = useRef(null);
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadCourseData(parsedUser.id);
    }
  }, [courseId]);

  const loadCourseData = async (userId) => {
    try {
      setLoading(true);
      const courseDetail = await courseApi.getCourseById(courseId);
      setCourse(courseDetail);

      // Load user's enrolled courses to get progress
      const userCourses = await courseApi.getUserCourses(userId);
      const enrolledCourse = userCourses.find((c) => c.id === parseInt(courseId));
      
      if (enrolledCourse) {
        setProgress(enrolledCourse.progress || 0);
        lastProgressRef.current = enrolledCourse.progress || 0;
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  // Track scroll progress
  const handleScroll = async (e) => {
    if (!contentRef.current || !user) return;

    const element = contentRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    
    if (scrollHeight === 0) return;

    // Calculate progress based on scroll depth (max 90% from scroll)
    const scrollProgress = Math.min(90, Math.round((scrollTop / scrollHeight) * 90));
    
    if (scrollProgress !== progress && scrollProgress > lastProgressRef.current) {
      setProgress(scrollProgress);
      
      // Debounce API calls - only update if progress changed by at least 5%
      if (scrollProgress - lastProgressRef.current >= 5) {
        lastProgressRef.current = scrollProgress;
        try {
          await courseApi.updateCourseProgress(user.id, courseId, scrollProgress);
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      }
    }
  };

  const handleCompleteCourse = async () => {
    try {
      setIsCompleting(true);
      await courseApi.updateCourseProgress(user.id, courseId, 100);
      setProgress(100);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error completing course:", error);
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: "white" }}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: "white" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ color: "#7D8293" }}>Kursus tidak ditemukan</p>
        </div>
      </main>
    );
  }

  const isCompleted = progress === 100;

  return (
    <main className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: "white" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b mb-6"
        style={{ backgroundColor: "white", borderColor: "#CCD8E6" }}
      >
        <div className="max-w-4xl mx-auto px-0 sm:px-6 py-3 sm:py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 mb-4"
            style={{ color: "#233B5E" }}
          >
            <FiArrowLeft size={24} />
            <span className="font-medium">Kembali ke Dashboard</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#233B5E" }}>
            {course.title}
          </h1>
          <p style={{ color: "#7D8293" }} className="text-lg mb-6">
            {course.description}
          </p>

          {/* Course Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg border" style={{ borderColor: "#CCD8E6" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiUser size={18} style={{ color: "#233B5E" }} />
                <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                  Instruktur
                </p>
              </div>
              <p style={{ color: "#233B5E" }} className="font-medium">
                {course.instructor}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: "#CCD8E6" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiClock size={18} style={{ color: "#233B5E" }} />
                <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                  Durasi
                </p>
              </div>
              <p style={{ color: "#233B5E" }} className="font-medium">
                {course.duration_hours} jam
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: "#CCD8E6" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiBook size={18} style={{ color: "#233B5E" }} />
                <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                  Kategori
                </p>
              </div>
              <p style={{ color: "#233B5E" }} className="font-medium">
                {course.category}
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ borderColor: "#CCD8E6" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiAward size={18} style={{ color: "#233B5E" }} />
                <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                  Level
                </p>
              </div>
              <p style={{ color: "#233B5E" }} className="font-medium">
                {course.difficulty_level}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scrollable Course Content */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="lg:col-span-2 h-screen overflow-y-auto pr-4"
            style={{ backgroundColor: "white" }}
          >
            <div className="space-y-8">
              {/* Pengenalan */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Pengenalan
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Selamat datang di kursus {course.title}. Kursus ini dirancang
                  khusus untuk memberikan Anda pemahaman komprehensif tentang
                  {" "}{course.category} dengan fokus pada aplikasi praktis di
                  dunia nyata.
                </p>
                <p style={{ color: "#233B5E" }} className="leading-relaxed">
                  Melalui materi yang terstruktur dan mudah dipahami, Anda akan
                  belajar langkah demi langkah dari konsep dasar hingga tingkat
                  lanjutan. Setiap bagian dirancang untuk membangun fondasi yang
                  kuat sebelum melanjutkan ke topik berikutnya.
                </p>
              </section>

              {/* Tujuan Pembelajaran */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Tujuan Pembelajaran
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Setelah menyelesaikan kursus ini, Anda akan dapat:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle
                      size={20}
                      style={{ color: "#16A34A", marginTop: "2px", flexShrink: 0 }}
                    />
                    <span style={{ color: "#233B5E" }}>
                      Memahami konsep-konsep fundamental dalam {course.category}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle
                      size={20}
                      style={{ color: "#16A34A", marginTop: "2px", flexShrink: 0 }}
                    />
                    <span style={{ color: "#233B5E" }}>
                      Menerapkan teknik dan strategi yang telah dipelajari
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle
                      size={20}
                      style={{ color: "#16A34A", marginTop: "2px", flexShrink: 0 }}
                    />
                    <span style={{ color: "#233B5E" }}>
                      Menyelesaikan proyek nyata dengan percaya diri
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle
                      size={20}
                      style={{ color: "#16A34A", marginTop: "2px", flexShrink: 0 }}
                    />
                    <span style={{ color: "#233B5E" }}>
                      Menghindari kesalahan umum yang sering terjadi
                    </span>
                  </li>
                </ul>
              </section>

              {/* Bab 1 */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Bab 1: Dasar-Dasar
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Mari kita mulai dengan memahami fondasi utama. Dalam bab ini,
                  kita akan menjelajahi prinsip-prinsip inti yang menjadi dasar
                  dari semua topik yang akan kita pelajari.
                </p>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Penting untuk memahami konsep-konsep ini dengan baik karena
                  mereka akan menjadi batu loncatan untuk materi yang lebih
                  kompleks di bab-bab berikutnya.
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li style={{ color: "#233B5E" }}>Pengertian dasar dan definisi</li>
                  <li style={{ color: "#233B5E" }}>Sejarah dan perkembangan</li>
                  <li style={{ color: "#233B5E" }}>Manfaat dan aplikasi</li>
                  <li style={{ color: "#233B5E" }}>Standar industri terkini</li>
                </ul>
              </section>

              {/* Bab 2 */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Bab 2: Konsep Intermediate
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Sekarang kita akan meningkatkan pemahaman kita ke level yang
                  lebih tinggi. Bab ini menghadirkan konsep-konsep yang lebih
                  mendalam dan aplikasi praktis yang lebih kompleks.
                </p>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Anda akan belajar bagaimana menggabungkan pengetahuan dari bab
                  sebelumnya untuk memecahkan masalah yang lebih challenging.
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li style={{ color: "#233B5E" }}>Teknik lanjutan dan optimasi</li>
                  <li style={{ color: "#233B5E" }}>Pemecahan masalah kompleks</li>
                  <li style={{ color: "#233B5E" }}>Best practices dan tips pro</li>
                  <li style={{ color: "#233B5E" }}>Studi kasus dari praktisi</li>
                </ul>
              </section>

              {/* Bab 3 */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Bab 3: Praktik Lanjutan
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Pada bagian ini, kita masuk ke level profesional. Anda akan
                  mempelajari teknik-teknik yang digunakan oleh para ahli di
                  industri untuk mencapai hasil maksimal.
                </p>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Materi ini dirancang untuk mempersiapkan Anda dalam menghadapi
                  tantangan dunia nyata dengan strategi dan tools yang tepat.
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li style={{ color: "#233B5E" }}>Strategi implementasi skala besar</li>
                  <li style={{ color: "#233B5E" }}>Tools dan teknologi terbaru</li>
                  <li style={{ color: "#233B5E" }}>Troubleshooting dan debugging</li>
                  <li style={{ color: "#233B5E" }}>Performance optimization</li>
                </ul>
              </section>

              {/* Kesimpulan */}
              <section className="pb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#233B5E" }}>
                  Kesimpulan
                </h2>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-4">
                  Selamat! Anda telah mencapai akhir dari materi kursus ini.
                  Semoga seluruh pengetahuan yang telah Anda dapatkan dapat
                  memberikan manfaat dan menjadi bekal untuk karir Anda ke
                  depannya.
                </p>
                <p style={{ color: "#233B5E" }} className="leading-relaxed mb-6">
                  Jangan lupa untuk terus berlatih dan menerapkan apa yang telah
                  dipelajari. Pembelajaran adalah proses berkelanjutan, dan
                  dedikasi Anda akan membuat perbedaan yang signifikan.
                </p>

                {/* Completion Button */}
                <div className="bg-green-50 p-6 rounded-lg border-2" style={{ borderColor: "#16A34A" }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#233B5E" }}>
                    Siap untuk Menyelesaikan Kursus?
                  </h3>
                  <p style={{ color: "#7D8293" }} className="mb-4 text-sm">
                    Klik tombol di bawah ini untuk menyelesaikan kursus dan
                    kembali ke dashboard.
                  </p>
                  {progress === 100 && !isCompleting ? (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-lg" style={{ backgroundColor: "#f0fdf4" }}>
                      <FiCheckCircle size={24} style={{ color: "#16A34A" }} />
                      <p style={{ color: "#16A34A" }} className="font-bold">
                        Kursus Telah Selesai!
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteCourse}
                      disabled={isCompleting}
                      className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all text-center"
                      style={{
                        backgroundColor: isCompleting ? "#999" : "#16A34A",
                      }}
                    >
                      {isCompleting ? "Menyelesaikan..." : "Selesaikan Kursus"}
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div>
            {/* Progress Card */}
            <div
              className="rounded-lg border p-6 sticky top-24"
              style={{ borderColor: "#CCD8E6" }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: "#233B5E" }}>
                Progress Belajar
              </h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: "#7D8293" }} className="text-sm font-medium">
                    Persentase Penyelesaian
                  </p>
                  <p
                    style={{
                      color: "#233B5E",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {progress}%
                  </p>
                </div>
                <div
                  className="w-full h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#CCD8E6" }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      backgroundColor: progress === 100 ? "#16A34A" : "#233B5E",
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Info Box */}
              <div
                className="p-4 rounded-lg border"
                style={{ borderColor: "#CCD8E6", backgroundColor: "#F7F6EE" }}
              >
                <p style={{ color: "#7D8293" }} className="text-sm">
                  💡 <span className="font-medium">Tip:</span> Scroll melalui
                  konten untuk meningkatkan progress. Progress akan secara
                  otomatis terupdate seiring Anda membaca materi.
                </p>
              </div>

              {/* Course Info */}
              <div className="mt-8 space-y-4">
                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "#CCD8E6" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser size={18} style={{ color: "#233B5E" }} />
                    <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                      Instruktur
                    </p>
                  </div>
                  <p style={{ color: "#233B5E" }} className="font-medium text-sm">
                    {course.instructor}
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "#CCD8E6" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock size={18} style={{ color: "#233B5E" }} />
                    <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                      Durasi
                    </p>
                  </div>
                  <p style={{ color: "#233B5E" }} className="font-medium text-sm">
                    {course.duration_hours} jam
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "#CCD8E6" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FiBook size={18} style={{ color: "#233B5E" }} />
                    <p className="text-xs font-medium" style={{ color: "#7D8293" }}>
                      Kategori
                    </p>
                  </div>
                  <p style={{ color: "#233B5E" }} className="font-medium text-sm">
                    {course.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
