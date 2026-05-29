import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import os

# ================================================================
# KONFIGURASI HALAMAN
# ================================================================
st.set_page_config(
    page_title="RESTART Dashboard",
    page_icon="R",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ================================================================
# SESSION STATE — TEMA
# ================================================================
if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = False

def toggle_theme():
    st.session_state.dark_mode = not st.session_state.dark_mode

IS_DARK = st.session_state.dark_mode

# ================================================================
# PALET WARNA RESTART
# ================================================================
BRAND = {
    "navy": "#233B5E",
    "soft_blue": "#CCD8E6",
    "cream": "#F7F6EE",
    "grey": "#D5D5D7",
}

DARK = dict(
    bg="#16263D",
    surface="#1D314F",
    surface2="#243C5F",
    border="rgba(247,246,238,0.12)",
    border2="rgba(204,216,230,0.26)",
    text_primary="#F7F6EE",
    text_secondary="#CCD8E6",
    text_muted="#AEB9C8",
    accent="#CCD8E6",
    accent2="#F7F6EE",
    sidebar_bg="#132238",
    sidebar_border="rgba(204,216,230,0.16)",
    metric_label="#CCD8E6",
    metric_value="#F7F6EE",
    metric_delta="#CCD8E6",
    tab_inactive="#CCD8E6",
    tab_bg="rgba(247,246,238,0.05)",
    tab_border="rgba(247,246,238,0.10)",
    chart_paper="rgba(0,0,0,0)",
    chart_grid="rgba(247,246,238,0.10)",
    chart_font="#F7F6EE",
)

LIGHT = dict(
    bg="#F7F6EE",
    surface="#FFFFFF",
    surface2="#F1F2EF",
    border="rgba(35,59,94,0.12)",
    border2="rgba(35,59,94,0.22)",
    text_primary="#233B5E",
    text_secondary="#475A75",
    text_muted="#7E8A98",
    accent="#233B5E",
    accent2="#5E7B9A",
    sidebar_bg="#EFEFE8",
    sidebar_border="rgba(35,59,94,0.12)",
    metric_label="#6B7788",
    metric_value="#233B5E",
    metric_delta="#5E7B9A",
    tab_inactive="#637184",
    tab_bg="#ECEDE8",
    tab_border="rgba(35,59,94,0.10)",
    chart_paper="rgba(0,0,0,0)",
    chart_grid="rgba(35,59,94,0.08)",
    chart_font="#233B5E",
)

T = DARK if IS_DARK else LIGHT

# ================================================================
# HELPER WARNA
# ================================================================
def hex_to_rgba(hex_color, alpha=1.0):
    if not isinstance(hex_color, str) or not hex_color.startswith("#"):
        return hex_color

    hex_color = hex_color.lstrip("#")[:6]

    try:
        r, g, b = tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))
        return f"rgba({r},{g},{b},{alpha})"
    except ValueError:
        return f"rgba(35,59,94,{alpha})"

# ================================================================
# DESKRIPSI PROFESI UMKM (Fitur Baru)
# ================================================================
DESKRIPSI_PROFESI = {
    "Admin Data": "Mengelola, memasukkan, dan merapikan data operasional atau inventaris UMKM secara akurat dan sistematis menggunakan perangkat lunak.",
    "Admin Media Sosial": "Berinteraksi dengan audiens, merespons pesan, dan memastikan akun media sosial UMKM tetap aktif, responsif, dan profesional.",
    "Affiliate Marketer": "Mempromosikan produk UMKM melalui tautan afiliasi digital dan mendapatkan komisi dari setiap penjualan atau prospek yang berhasil.",
    "Barista": "Meracik dan menyajikan minuman (kopi/teh) serta memberikan pengalaman interaksi pelanggan yang ramah di kedai kopi atau kafe.",
    "Kasir": "Melayani transaksi pembayaran, mengelola mesin kasir, memberikan kembalian, dan merekap laporan penjualan harian secara teliti.",
    "Content Creator": "Mengkonseptualisasikan dan memproduksi konten digital (video pendek, foto, tulisan) yang kreatif untuk kampanye pemasaran UMKM.",
    "Copywriter": "Menulis teks pemasaran (copy) yang ringkas dan persuasif untuk iklan, brosur, atau deskripsi produk guna menarik minat pembeli.",
    "Customer Service": "Melayani keluhan, pertanyaan, dan kebutuhan pelanggan dengan tingkat kesabaran tinggi, komunikasi empati, dan solusi yang cepat.",
    "Desainer Grafis": "Membuat materi visual yang estetik seperti logo, kemasan, banner, dan postingan media sosial untuk memperkuat identitas merek.",
    "Digital Marketer": "Merencanakan dan mengeksekusi strategi pemasaran digital, analisis data SEO, dan iklan berbayar untuk mendongkrak penjualan online.",
    "Fotografer": "Memotret produk, katalog, atau dokumentasi kegiatan UMKM dengan keahlian tata cahaya dan sudut pandang visual yang profesional.",
    "Host Live Streamer": "Melakukan siaran langsung (live streaming) interaktif di e-commerce untuk mempromosikan dan menjual produk secara real-time.",
    "Pramusaji": "Menyajikan makanan dan minuman, menjaga kebersihan meja, serta berinteraksi dan melayani pelanggan dengan ramah di rumah makan.",
    "Video Editor": "Mengedit, memotong, dan menyusun footage video mentah menjadi konten visual yang dinamis, menarik, dan siap tayang untuk promosi.",
    "Web Developer": "Membangun, mengembangkan, merawat situs web, serta memastikan fitur e-commerce atau landing page UMKM berfungsi optimal."
}


# ================================================================
# CSS DINAMIS
# ================================================================
st.markdown(f"""
<style>
:root {{
    --restart-navy: {BRAND["navy"]};
    --restart-blue: {BRAND["soft_blue"]};
    --restart-cream: {BRAND["cream"]};
    --restart-grey: {BRAND["grey"]};
}}

html, body, [class*="css"] {{
    font-family: Helvetica, Arial, sans-serif !important;
}}

.stApp {{
    background: {T['bg']};
    min-height: 100vh;
}}

.block-container {{
    padding-top: 3.2rem;
    padding-bottom: 3rem;
}}

[data-testid="stSidebar"] {{
    background: {T['sidebar_bg']} !important;
    border-right: 1px solid {T['sidebar_border']} !important;
}}

[data-testid="stSidebar"] label,
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] span {{
    color: {T['text_secondary']} !important;
}}

[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3 {{
    color: {T['text_primary']} !important;
    font-family: Helvetica, Arial, sans-serif !important;
    letter-spacing: -0.02em;
}}

hr {{
    border: none;
    border-top: 1px solid {T['border']};
    margin: 1.4rem 0;
}}

h1, h2, h3, h4, h5, h6 {{
    font-family: Helvetica, Arial, sans-serif !important;
    color: {T['text_primary']} !important;
    letter-spacing: -0.03em;
}}

.stMarkdown p {{
    color: {T['text_secondary']} !important;
}}

[data-testid="stSelectbox"] > div,
[data-testid="stMultiSelect"] > div {{
    background: {T['surface']} !important;
    border: 1px solid {T['border2']} !important;
    border-radius: 12px !important;
}}

.stButton > button {{
    background: {T['surface']} !important;
    color: {T['text_primary']} !important;
    border: 1px solid {T['border2']} !important;
    border-radius: 12px !important;
    font-family: Helvetica, Arial, sans-serif !important;
    font-weight: 600 !important;
    transition: 0.18s ease !important;
}}

.stButton > button:hover {{
    border-color: {T['accent']} !important;
    transform: translateY(-1px);
}}

/* Tombol Download Khusus */
.download-btn-container .stButton > button {{
    background: linear-gradient(135deg, {T['accent']}, {T['accent2']}) !important;
    color: {"#233B5E" if IS_DARK else "#F7F6EE"} !important;
    border: none !important;
    margin-top: 10px;
    width: 100%;
}}

/* ================= TAB ATAS ================= */
.stTabs {{
    margin-top: 0.4rem;
    margin-bottom: 1rem;
}}

.stTabs [data-baseweb="tab-list"] {{
    background: {T['tab_bg']} !important;
    border-radius: 14px !important;
    padding: 6px !important;
    border: 1px solid {T['tab_border']} !important;
    gap: 6px !important;
    min-height: 48px !important;
    overflow: visible !important;
    align-items: center !important;
}}

.stTabs [data-baseweb="tab-panel"] {{
    padding-top: 1rem !important;
}}

.stTabs [data-baseweb="tab"] {{
    background: transparent !important;
    border-radius: 10px !important;
    color: {T['tab_inactive']} !important;
    font-family: Helvetica, Arial, sans-serif !important;
    font-weight: 600 !important;
    padding: 10px 22px !important;
    min-height: 38px !important;
    line-height: 1.2 !important;
}}

.stTabs [aria-selected="true"] {{
    background: {T['accent']} !important;
    color: {"#233B5E" if IS_DARK else "#F7F6EE"} !important;
}}

/* ================= METRIC CARD ================= */
[data-testid="stMetric"] {{
    background: {T['surface']} !important;
    border: 1px solid {T['border']} !important;
    border-radius: 16px !important;
    padding: 20px 22px !important;
    box-shadow: 0 10px 28px rgba(0,0,0,0.04);
}}

[data-testid="stMetric"] label {{
    color: {T['metric_label']} !important;
    font-size: 0.72rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
}}

[data-testid="stMetric"] [data-testid="stMetricValue"] {{
    color: {T['metric_value']} !important;
    font-family: Helvetica, Arial, sans-serif !important;
    font-size: 1.25rem !important;
    font-weight: 700 !important;
}}

[data-testid="stMetricDelta"] {{
    color: {T['metric_delta']} !important;
}}

/* ================= CONTAINER BORDER / CHART CARD ================= */
[data-testid="stVerticalBlockBorderWrapper"] {{
    background: {T['surface']} !important;
    border: 1px solid {T['border']} !important;
    border-radius: 18px !important;
    box-shadow: 0 12px 30px rgba(0,0,0,0.04) !important;
    padding: 18px 20px 20px 20px !important;
}}

[data-testid="stVerticalBlockBorderWrapper"] [data-testid="stVerticalBlock"] {{
    gap: 0.35rem !important;
}}

/* ================= HERO ================= */
.hero-banner {{
    background: {T['surface']};
    border: 1px solid {T['border']};
    border-radius: 20px;
    padding: 30px 34px;
    margin-bottom: 22px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 14px 34px rgba(0,0,0,0.05);
}}

.hero-banner::after {{
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: {hex_to_rgba(T['accent'], 0.10)};
    right: -80px;
    top: -90px;
}}

.hero-badge {{
    display: inline-block;
    background: {hex_to_rgba(T['accent'], 0.14)};
    color: {T['accent']};
    border: 1px solid {hex_to_rgba(T['accent'], 0.20)};
    padding: 5px 13px;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    margin-bottom: 12px;
}}

.hero-title {{
    font-family: Helvetica, Arial, sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: {T['text_primary']};
    margin: 0 0 10px 0;
    line-height: 1.15;
    letter-spacing: -0.04em;
}}

.hero-desc {{
    color: {T['text_primary']};
    font-size: 0.95rem;
    margin: 0 0 10px 0;
    line-height: 1.6;
    max-width: 800px;
    border-left: 3px solid {T['accent']};
    padding-left: 12px;
}}

.hero-sub {{
    color: {T['text_secondary']};
    font-size: 0.90rem;
    margin: 0;
    line-height: 1.7;
    max-width: 760px;
}}

.section-label {{
    color: {T['accent']};
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
}}

.section-title {{
    font-family: Helvetica, Arial, sans-serif;
    color: {T['text_primary']};
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 14px 0;
    letter-spacing: -0.02em;
}}

.stat-pill {{
    background: {T['surface']};
    border: 1px solid {T['border']};
    border-radius: 12px;
    padding: 11px 13px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}

.stat-pill .sp-label {{
    color: {T['text_primary']} !important;
    font-weight: 600;
    font-size: 0.76rem;
}}

.stat-pill .sp-value {{
    color: {T['text_primary']};
    font-size: 0.84rem;
    font-weight: 700;
}}

.riasec-card {{
    border-radius: 18px;
    padding: 22px;
    margin-bottom: 16px;
    background: {T['surface']};
    border: 1px solid {T['border']};
    color: {T['text_primary']};
    box-shadow: 0 12px 28px rgba(0,0,0,0.04);
}}

.riasec-code {{
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: {hex_to_rgba(T['accent'], 0.14)};
    color: {T['accent']};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    margin-bottom: 14px;
}}

.riasec-title {{
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 3px;
    color: {T['text_primary']};
}}

.riasec-sub {{
    font-size: 0.78rem;
    color: {T['text_muted']};
    margin-bottom: 10px;
}}

.riasec-desc {{
    color: {T['text_secondary']};
    font-size: 0.85rem;
    line-height: 1.58;
}}
</style>
""", unsafe_allow_html=True)


# ================================================================
# DEFINISI KOLOM
# ================================================================
KOMPETENSI_COLS = [
    "Stamina", "Static Strength", "Manual Dexterity", "Spatial Orientation",
    "Active Listening", "Speaking", "Service Orientation", "Coordination",
    "Troubleshooting", "Time Management"
]

FISIK = ["Stamina", "Static Strength", "Manual Dexterity", "Spatial Orientation"]
SOSIAL = ["Active Listening", "Speaking", "Service Orientation", "Coordination"]
TEKNIS = ["Troubleshooting", "Time Management"]

RIASEC_COLS = [
    "Realistic", "Investigative", "Artistic",
    "Social", "Enterprising", "Conventional"
]

RIASEC_COLORS = {
    "Realistic": "#8A4B4B",
    "Investigative": "#233B5E",
    "Artistic": "#9B8358",
    "Social": "#5E7B9A",
    "Enterprising": "#6E5878",
    "Conventional": "#7E8A98",
}

RIASEC_ID = {
    "Realistic": "R",
    "Investigative": "I",
    "Artistic": "A",
    "Social": "S",
    "Enterprising": "E",
    "Conventional": "C",
}

# Interpretasi Holland Code
HOLLAND_DESC = {
    "R": "bekerja secara praktis, mengeksekusi hal teknis, dan berorientasi pada hasil nyata",
    "I": "melakukan analisis mendalam, observasi, dan pemecahan masalah logis",
    "A": "mengekspresikan kreativitas, ide visual, dan inovasi yang fleksibel",
    "S": "melayani, berinteraksi, dan mendampingi orang lain dengan empati",
    "E": "memimpin, mengambil inisiatif, dan berorientasi pada target bisnis",
    "C": "bekerja secara terstruktur, sangat rapi, dan berbasis pada akurasi data"
}

PALETTE = [
    "#233B5E",
    "#5E7B9A",
    "#CCD8E6",
    "#8A9AAF",
    "#D5D5D7",
    "#7E8A98",
]

CT = dict(
    paper_bgcolor=T["chart_paper"],
    plot_bgcolor=T["chart_paper"],
    font=dict(color=T["chart_font"], family="Helvetica, Arial, sans-serif"),
)


# ================================================================
# LOAD & AGREGASI DATA
# ================================================================
@st.cache_data(show_spinner=False)
def load_and_aggregate():
    path = "Master_Data_RESTART.csv"

    if not os.path.exists(path):
        st.error("File `Master_Data_RESTART.csv` tidak ditemukan.")
        st.stop()

    df_raw = pd.read_csv(path, sep=";")

    required_cols = ["Target_Profesi"] + KOMPETENSI_COLS + RIASEC_COLS
    missing_cols = [col for col in required_cols if col not in df_raw.columns]

    if missing_cols:
        st.error(f"Kolom berikut belum ada di CSV: {', '.join(missing_cols)}")
        st.stop()

    for col in KOMPETENSI_COLS + RIASEC_COLS:
        df_raw[col] = pd.to_numeric(df_raw[col], errors="coerce").fillna(0)

    df_agg = (
        df_raw
        .groupby("Target_Profesi")[KOMPETENSI_COLS + RIASEC_COLS]
        .mean()
        .reset_index()
    )

    return df_agg


df = load_and_aggregate()

@st.cache_data
def convert_df_to_csv(dataframe):
    # Cache agar tidak komputasi ulang tiap kali tombol di klik
    return dataframe.to_csv(index=False, sep=";").encode('utf-8')


# ================================================================
# SIDEBAR
# ================================================================
with st.sidebar:
    logo_dark = "Logo_RESTART_Dark.png"
    logo_light = "Logo_RESTART_Light.png"

    logo_path = logo_dark if IS_DARK else logo_light

    if os.path.exists(logo_path):
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image(logo_path, width=160)

    elif os.path.exists("Logo RESTART.png"):
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image("Logo RESTART.png", width=160)

    else:
        st.markdown(
            f"""
            <div style="text-align:center; padding:18px 0 10px 0;">
                <div style="font-size:2rem; font-weight:800; color:{T['accent']}; letter-spacing:0.05em;">R</div>
                <div style="font-size:1rem; font-weight:700; color:{T['text_primary']}; letter-spacing:0.22em;">RESTART</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    theme_label = "Light mode" if IS_DARK else "Dark mode"
    st.button(theme_label, on_click=toggle_theme, use_container_width=True)

    st.markdown("---")
    st.markdown('<span class="section-label">Pilih Profesi</span>', unsafe_allow_html=True)

    daftar_profesi = sorted(df["Target_Profesi"].unique().tolist())
    profesi_terpilih = st.selectbox(
        "Profesi:",
        daftar_profesi,
        label_visibility="collapsed"
    )

    rp = df[df["Target_Profesi"] == profesi_terpilih].iloc[0]
    sk = rp[KOMPETENSI_COLS].astype(float)
    ri = rp[RIASEC_COLS].astype(float)

    dom_r = ri.idxmax()
    dom_c = RIASEC_COLORS.get(dom_r, T["accent"])
    code3 = "".join([RIASEC_ID[r] for r in ri.sort_values(ascending=False).index[:3]])

    st.markdown(f"""
    <br>
    <span class="section-label">Ringkasan</span>
    <div style="margin-top:9px;">
        <div class="stat-pill">
            <span class="sp-label">RIASEC Dominan</span>
            <span class="sp-value" style="color:{dom_c};">{dom_r}</span>
        </div>
        <div class="stat-pill">
            <span class="sp-label">Rata-rata Keahlian</span>
            <span class="sp-value">{sk.mean():.2f} / 5.0</span>
        </div>
        <div class="stat-pill">
            <span class="sp-label">Keahlian Kritis</span>
            <span class="sp-value" style="color:{T['accent']};">{(sk >= 3.5).sum()} fitur</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ================================================================
# TABS UTAMA
# ================================================================
tab1, tab2, tab3 = st.tabs([
    "Profil Kompetensi",
    "Komparasi Profesi",
    "Kamus RIASEC"
])


# ================================================================
# TAB 1 — PROFIL PROFESI
# ================================================================
with tab1:
    desc_profesi = DESKRIPSI_PROFESI.get(profesi_terpilih, "Deskripsi profesi belum tersedia di database.")

    st.markdown(f"""
    <div class="hero-banner">
        <div class="hero-badge">Analitik Karier · {profesi_terpilih}</div>
        <div class="hero-title">{profesi_terpilih}</div>
        <div class="hero-desc">
            {desc_profesi}
        </div>
        <div class="hero-sub">
            Karakteristik pekerjaan ini sangat selaras dengan potensi individu yang memiliki profil Holland Code: 
            <b style="color:{dom_c};">{code3}</b>.
        </div>
    </div>
    """, unsafe_allow_html=True)

    k1, k2, k3, k4 = st.columns(4)

    with k1:
        st.metric("Kompetensi Utama", sk.idxmax(), f"{sk.max():.2f} / 5.0")

    with k2:
        st.metric("RIASEC Dominan", dom_r, f"Kode 3: {code3}")

    with k3:
        st.metric("Skill Sosial", f"{rp[SOSIAL].mean():.2f}", "Rata-rata")

    with k4:
        st.metric("Skill Fisik", f"{rp[FISIK].mean():.2f}", "Rata-rata")

    st.markdown("<br>", unsafe_allow_html=True)

    c1, c2 = st.columns([1.2, 0.8], gap="medium")

    with c1:
        with st.container(border=True):
            st.markdown(
                """
                <span class="section-label">10 Parameter Kompetensi</span>
                <div class="section-title">Distribusi Keahlian</div>
                """,
                unsafe_allow_html=True
            )

            sk_sorted = sk.sort_values(ascending=False)

            fig_b = go.Figure(go.Bar(
                x=sk_sorted.values,
                y=sk_sorted.index,
                orientation="h",
                marker=dict(
                    color=[
                        "#233B5E", "#314C72", "#426084", "#587798", "#6F8EAB",
                        "#8BA6BD", "#A7BACD", "#CCD8E6", "#D5D5D7", "#E8E8E4"
                    ],
                    line=dict(color=hex_to_rgba(T["accent"], 0.18), width=1)
                ),
                text=[f"{v:.2f}" for v in sk_sorted.values],
                textposition="outside",
                textfont=dict(color=T["text_secondary"], size=11),
            ))

            fig_b.update_layout(
                **CT,
                height=390,
                margin=dict(l=150, r=45, t=10, b=35),
                xaxis=dict(
                    range=[0, 5.5],
                    showgrid=True,
                    gridcolor=T["chart_grid"],
                    zeroline=False,
                ),
                yaxis=dict(
                    categoryorder="total ascending",
                    tickfont=dict(size=11, color=T["text_secondary"]),
                ),
                bargap=0.34,
                showlegend=False,
            )

            st.plotly_chart(fig_b, use_container_width=True)

    with c2:
        with st.container(border=True):
            st.markdown(
                """
                <span class="section-label">Psikologi Karier</span>
                <div class="section-title">Profil RIASEC</div>
                """,
                unsafe_allow_html=True
            )

            ri_values = ri.values.tolist()

            fig_rd = go.Figure(go.Scatterpolar(
                r=ri_values + [ri_values[0]],
                theta=RIASEC_COLS + [RIASEC_COLS[0]],
                fill="toself",
                fillcolor=hex_to_rgba(BRAND["navy"], 0.16),
                line=dict(color=T["accent"], width=2.4),
                marker=dict(size=6, color=T["accent"]),
            ))

            fig_rd.update_layout(
                **CT,
                height=290,
                margin=dict(l=30, r=30, t=20, b=20),
                polar=dict(
                    bgcolor="rgba(0,0,0,0)",
                    radialaxis=dict(
                        visible=True,
                        range=[0, 7],
                        gridcolor=T["chart_grid"],
                        tickfont=dict(size=10, color=T["text_muted"]),
                    ),
                    angularaxis=dict(
                        gridcolor=T["chart_grid"],
                        tickfont=dict(color=T["text_secondary"], size=11),
                    ),
                ),
                showlegend=False,
            )

            st.plotly_chart(fig_rd, use_container_width=True)

            # --- FITUR BARU: INTERPRETASI KODE 3 HURUF ---
            top1, top2, top3 = code3[0], code3[1], code3[2]
            
            st.markdown(f"""
            <div style="background:{hex_to_rgba(T['accent'], 0.08)}; border:1px solid {T['border2']}; border-radius:12px; padding:15px; margin-bottom:20px; margin-top:-5px;">
                <div style="font-size:0.75rem; font-weight:700; color:{T['accent']}; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:5px;">
                    🧠 Interpretasi DNA Karier ({code3})
                </div>
                <div style="font-size:0.85rem; color:{T['text_secondary']}; line-height:1.6;">
                    Lingkungan kerja ini paling optimal bagi individu yang suka <b>{HOLLAND_DESC[top1]}</b>, 
                    yang dipadukan dengan kemampuan untuk <b>{HOLLAND_DESC[top2]}</b>, 
                    serta didukung oleh kebiasaan <b>{HOLLAND_DESC[top3]}</b>.
                </div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(f"""
            <div style="margin-top:15px; font-weight:700; color:{T['text_primary']};">
                Kategori Modul Keahlian
            </div>

            <div class="stat-pill">
                <span class="sp-label">Fisik & Motorik</span>
                <span class="sp-value">{rp[FISIK].mean():.2f} / 5.0</span>
            </div>

            <div class="stat-pill">
                <span class="sp-label">Komunikasi & Sosial</span>
                <span class="sp-value">{rp[SOSIAL].mean():.2f} / 5.0</span>
            </div>

            <div class="stat-pill">
                <span class="sp-label">Pemecahan Masalah</span>
                <span class="sp-value">{rp[TEKNIS].mean():.2f} / 5.0</span>
            </div>
            """, unsafe_allow_html=True)


# ================================================================
# TAB 2 — KOMPARASI PROFESI
# ================================================================
with tab2:
    st.markdown(
        '<div class="section-title">Bandingkan Karakteristik Antar Profesi</div>',
        unsafe_allow_html=True
    )

    comp = st.multiselect(
        "Pilih maksimal 4 profesi:",
        options=daftar_profesi,
        default=[profesi_terpilih],
        max_selections=4
    )

    if len(comp) >= 2:
        c1, c2 = st.columns(2, gap="medium")

        with c1:
            with st.container(border=True):
                st.markdown(
                    """
                    <span class="section-label">Overlay Kepribadian</span>
                    <div class="section-title">Komparasi RIASEC</div>
                    """,
                    unsafe_allow_html=True
                )

                fig_cr = go.Figure()

                for i, prof in enumerate(comp):
                    rv_ = (
                        df[df["Target_Profesi"] == prof]
                        .iloc[0][RIASEC_COLS]
                        .astype(float)
                        .tolist()
                    )

                    pc_ = PALETTE[i % len(PALETTE)]

                    fig_cr.add_trace(go.Scatterpolar(
                        r=rv_ + [rv_[0]],
                        theta=RIASEC_COLS + [RIASEC_COLS[0]],
                        fill="toself",
                        name=prof,
                        line=dict(color=pc_, width=2),
                        fillcolor=hex_to_rgba(pc_, 0.14),
                    ))

                fig_cr.update_layout(
                    **CT,
                    height=360,
                    polar=dict(
                        bgcolor="rgba(0,0,0,0)",
                        radialaxis=dict(gridcolor=T["chart_grid"], range=[0, 7]),
                        angularaxis=dict(gridcolor=T["chart_grid"]),
                    ),
                    margin=dict(t=20, b=20),
                    legend=dict(
                        orientation="h",
                        yanchor="bottom",
                        y=-0.20,
                        xanchor="center",
                        x=0.5,
                    ),
                )

                st.plotly_chart(fig_cr, use_container_width=True)

        with c2:
            with st.container(border=True):
                st.markdown(
                    """
                    <span class="section-label">Komparasi Keahlian</span>
                    <div class="section-title">5 Kompetensi Tertinggi</div>
                    """,
                    unsafe_allow_html=True
                )

                rows_c = []

                for prof in comp:
                    sk_c = (
                        df[df["Target_Profesi"] == prof]
                        .iloc[0][KOMPETENSI_COLS]
                        .astype(float)
                    )

                    for feature, value in sk_c.sort_values(ascending=False).head(5).items():
                        rows_c.append({
                            "Profesi": prof,
                            "Kompetensi": feature,
                            "Skor": value,
                        })

                fig_g = px.bar(
                    pd.DataFrame(rows_c),
                    x="Kompetensi",
                    y="Skor",
                    color="Profesi",
                    barmode="group",
                    color_discrete_sequence=PALETTE,
                    height=360,
                )

                fig_g.update_layout(
                    **CT,
                    xaxis=dict(tickangle=-28, gridcolor=T["chart_grid"]),
                    yaxis=dict(range=[0, 5.2], gridcolor=T["chart_grid"]),
                    margin=dict(l=35, r=20, t=20, b=90),
                )

                st.plotly_chart(fig_g, use_container_width=True)

    else:
        st.info("Pilih minimal 2 profesi untuk melihat grafik komparasi.")


# ================================================================
# TAB 3 — KAMUS RIASEC
# ================================================================
with tab3:
    st.markdown(
        '<div class="section-title">Kamus Psikologi Karier Holland Code</div>',
        unsafe_allow_html=True
    )

    cards = [
        dict(
            code="R",
            title="Realistic",
            sub="The Doers",
            desc="Berorientasi pada aktivitas fisik dan teknis. Cocok dengan pekerjaan yang melibatkan alat, mesin, operasi lapangan, atau proses praktis."
        ),
        dict(
            code="I",
            title="Investigative",
            sub="The Thinkers",
            desc="Analitis dan senang memecahkan masalah. Cocok dengan pekerjaan berbasis data, riset, observasi, dan penalaran logis."
        ),
        dict(
            code="A",
            title="Artistic",
            sub="The Creators",
            desc="Kreatif, ekspresif, dan menyukai ruang eksplorasi. Cocok untuk pekerjaan yang membutuhkan ide, visual, tulisan, atau desain."
        ),
        dict(
            code="S",
            title="Social",
            sub="The Helpers",
            desc="Berorientasi pada interaksi dan bantuan kepada orang lain. Cocok untuk pekerjaan edukasi, layanan, komunikasi, dan pendampingan."
        ),
        dict(
            code="E",
            title="Enterprising",
            sub="The Persuaders",
            desc="Suka memimpin, memengaruhi, dan mengambil keputusan. Cocok untuk pekerjaan bisnis, penjualan, negosiasi, dan manajemen."
        ),
        dict(
            code="C",
            title="Conventional",
            sub="The Organizers",
            desc="Terstruktur, teliti, dan sistematis. Cocok untuk pekerjaan administrasi, data, dokumentasi, keuangan, dan prosedur operasional."
        ),
    ]

    gc1, gc2, gc3 = st.columns(3, gap="medium")
    gcols = [gc1, gc2, gc3]

    for i, c in enumerate(cards):
        with gcols[i % 3]:
            st.markdown(f"""
            <div class="riasec-card">
                <div class="riasec-code">{c['code']}</div>
                <div class="riasec-title">{c['title']}</div>
                <div class="riasec-sub">{c['sub']}</div>
                <div class="riasec-desc">{c['desc']}</div>
            </div>
            """, unsafe_allow_html=True)