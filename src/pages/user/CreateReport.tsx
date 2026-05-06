import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MapView from "../../components/MapView";
import { useState, useEffect } from "react";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const CreateReport = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [showManualWarning, setShowManualWarning] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [damage, setDamage] = useState("Rusak ringan");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolocation");
      return;
    }

    setLoadingLocation(true); // 🔥 mulai loading

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toString();
        const lng = pos.coords.longitude.toString();

        setLatitude(lat);
        setLongitude(lng);

        // 🔥 WAJIB TAMBAH INI
        getAddress(lat, lng);

        setLoadingLocation(false);
      },
      (err) => {
        setLoadingLocation(false);

        // 🔥 versi advance (buat skripsi)
        if (err.code === 1) {
          alert("Izin lokasi ditolak");
        } else if (err.code === 2) {
          alert("Lokasi tidak tersedia");
        } else {
          alert("Terjadi kesalahan");
        }
      },
    );
  };

  const getAddress = async (lat: string, lng: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "sijalan-bali-app",
          },
        },
      );

      const data = await res.json();

      const namaJalan =
        data.address?.road ||
        data.address?.pedestrian ||
        data.address?.residential ||
        "";

      const nomor = data.address?.house_number || "";

      const jalan = `${namaJalan} ${nomor}`.trim();

      setAddress(jalan || data.display_name || "");
    } catch (err) {
      console.log(err);
      setAddress("");
    }
  };

  const getCoordinatesFromAddress = async (query: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=id`,
        {
          headers: {
            "User-Agent": "sijalan-bali-app",
          },
        },
      );

      const data = await res.json();

      if (data.length > 0) {
        return {
          lat: data[0].lat,
          lng: data[0].lon,
        };
      }

      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [showOption, setShowOption] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    if (images.length >= 3) {
      alert("Maksimal 3 foto");
      return;
    }

    const url = URL.createObjectURL(file);

    setImages((prev) => [...prev, url]);
    setImageFiles((prev) => [...prev, file]);
    setShowOption(false);

    // 🔥 MODE LOGIC TETAP
    if (!isManualMode) {
      getLocation();
    } else {
      setLatitude("");
      setLongitude("");
      setAddress("");
      setShowManualWarning(true);
    }

    e.target.value = "";
  };

  const searchAddress = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&countrycodes=id&viewbox=114.4,-8.05,115.75,-8.85&bounded=1`,
        {
          headers: {
            "User-Agent": "sijalan-bali-app",
          },
        },
      );

      const data: Suggestion[] = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleMapChange = async (lat: number, lng: number) => {
    const latStr = lat.toString();
    const lngStr = lng.toString();

    setLatitude(latStr);
    setLongitude(lngStr);

    setLoadingLocation(true); // 🔥 mulai loading

    await getAddress(latStr, lngStr);

    setLoadingLocation(false); // 🔥 selesai
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    if (images.length === 0) {
      alert("Foto belum diupload");
      return;
    }

    let finalLat = latitude;
    let finalLng = longitude;

    // 🔥 kalau manual → ambil fresh coordinate
    if (isManualMode && address) {
      const coords = await getCoordinatesFromAddress(address);

      if (!coords) {
        alert("Alamat tidak ditemukan");
        return;
      }

      finalLat = coords.lat;
      finalLng = coords.lng;
    }

    if (!finalLat || !finalLng) {
      alert("Lokasi belum valid");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("roadName", address);
      formData.append("landmark", landmark);
      formData.append("damage", damage);
      formData.append("description", description);
      formData.append("lat", finalLat);
      formData.append("lng", finalLng);

      // 🔥 append semua gambar
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal membuat laporan");
        return;
      }
    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan server");
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000); // auto hilang 2 detik

    // reset
    setImages([]);
    setImageFiles([]);
    setLatitude("");
    setLongitude("");
    setAddress("");
    setLandmark("");
    setDamage("Rusak ringan");
    setDescription("");
    setSuggestions([]);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        id="fileGallery"
        style={{ display: "none" }}
        onChange={handleImage}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="fileCamera"
        style={{ display: "none" }}
        onChange={handleImage}
      />
      <Navbar setOpenSidebar={setOpenSidebar} />

      <div style={styles.container}>
        <Sidebar
          open={isMobile ? openSidebar : true}
          setOpen={setOpenSidebar}
        />

        <div style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Buat Laporan</h1>
              <p style={styles.subtitle} className="subtitle-green">
                Lengkapi data di bawah ini untuk melaporkan infrastruktur jalan
                yang rusak.
              </p>
            </div>
          </div>

          <div style={styles.headerDivider} className="divider-dynamic"></div>

          {/* CARD */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Form Laporan Kerusakan Jalan</h3>
            <div style={styles.cardDivider}></div> {/* 🔥 TAMBAH INI */}
            {/* FOTO */}
            <div style={styles.section}>
              <p style={{ ...styles.label, color: "white" }}>
                Foto Kondisi Jalan*
              </p>

              <div style={styles.uploadBox}>
                {/* 🔥 KALAU KOSONG */}
                {images.length === 0 && (
                  <div
                    style={styles.emptyState}
                    onClick={() => setShowOption(true)}
                  >
                    <span style={{ fontSize: "32px" }}>＋</span>
                    <small>Upload Foto Di Sini</small>
                  </div>
                )}

                {/* 🔥 KALAU ADA FOTO */}
                {images.length > 0 && (
                  <>
                    <div style={styles.imageGrid}>
                      {images.map((img, i) => (
                        <div
                          key={i}
                          style={styles.imageItem}
                          onMouseEnter={(e) => {
                            const overlay = e.currentTarget.querySelector(
                              ".overlay",
                            ) as HTMLDivElement;
                            if (overlay) overlay.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            const overlay = e.currentTarget.querySelector(
                              ".overlay",
                            ) as HTMLDivElement;
                            if (overlay) overlay.style.opacity = "0";
                          }}
                        >
                          <img
                            src={img}
                            style={styles.previewImage}
                            onClick={() => setPreviewImage(img)}
                          />
                          <div
                            className="overlay"
                            style={styles.imageOverlay}
                            onClick={() => setPreviewImage(img)}
                          >
                            🔍
                          </div>

                          <button
                            style={styles.deleteBtn}
                            onClick={(e) => {
                              e.stopPropagation();

                              URL.revokeObjectURL(img);

                              const newImages = images.filter(
                                (_, index) => index !== i,
                              );
                              setImages(newImages);

                              const newFiles = imageFiles.filter(
                                (_, index) => index !== i,
                              );

                              setImageFiles(newFiles);

                              if (newImages.length === 0) {
                                setLatitude("");
                                setLongitude("");
                                setAddress("");
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {images.length < 3 && (
                        <div
                          style={styles.addBox}
                          onClick={() => setShowOption(true)}
                        >
                          <span style={{ fontSize: "28px" }}>＋</span>
                          <small>Tambah</small>
                        </div>
                      )}
                    </div>

                    <small
                      style={{
                        color: "#94a3b8",
                        marginTop: "8px",
                        display: "block",
                        textAlign: "center",
                      }}
                    >
                      {images.length}/3 foto
                    </small>
                  </>
                )}
              </div>
            </div>
            {/* GEOSPASIAL */}
            <div style={styles.geoSection}>
              <div style={styles.geoLeft}>
                <div style={{ marginBottom: "8px" }}>
                  <h4 style={{ marginBottom: "4px", color: "white" }}>
                    Data Geospasial*
                  </h4>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Gunakan lokasi otomatis untuk akurasi terbaik.
                  </p>
                </div>

                <button
                  style={styles.detectBtn}
                  onClick={getLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? "Mengambil..." : "Deteksi Lokasi"}
                </button>
                {loadingLocation && (
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Mengambil lokasi...
                  </p>
                )}

                <div style={{ ...styles.field, color: "#e2e8f0" }}>
                  {/* NAMA JALAN */}

                  <div style={styles.field}>
                    <label style={styles.inputLabel}>Nama Jalan</label>
                  </div>

                  <input
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      searchAddress(e.target.value);
                    }}
                    onBlur={() => {
                      if (isManualMode && address) {
                        getCoordinatesFromAddress(address);
                      }
                    }}
                    placeholder="Nama Jalan"
                    style={styles.input}
                  />
                  <div style={styles.field}>
                    <label style={styles.inputLabel}>Lokasi</label>
                    <input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Contoh: depan Indomaret"
                      style={styles.input}
                    />
                  </div>

                  {suggestions.length > 0 && (
                    <div style={styles.suggestionBox}>
                      {suggestions.map((item, i) => (
                        <div
                          key={i}
                          style={styles.suggestionItem}
                          onClick={() => {
                            setAddress(item.display_name);
                            setLatitude(item.lat);
                            setLongitude(item.lon);
                            setSuggestions([]);
                          }}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {loadingLocation ? (
                    <small style={{ color: "#94a3b8", marginTop: "4px" }}>
                      Mengambil alamat...
                    </small>
                  ) : latitude && longitude && address ? (
                    <small style={{ color: "#94a3b8", marginTop: "4px" }}>
                      Lokasi otomatis, silakan koreksi jika kurang tepat
                    </small>
                  ) : null}
                </div>

                {/* LATITUDE & LONGITUDE (PINDAH KE BAWAH) */}
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.inputLabel}>Latitude</label>
                    <input
                      style={styles.input}
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.inputLabel}>Longitude</label>
                    <input
                      style={styles.input}
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.mapBox}>
                <MapView
                  lat={latitude}
                  lng={longitude}
                  onChangeLocation={handleMapChange}
                />
              </div>
            </div>
            {/* KERUSAKAN */}
            <div style={styles.bottomForm}>
              {/* TINGKAT KERUSAKAN */}
              <div style={styles.damageField}>
                <label style={styles.inputLabel}>Tingkat Kerusakan*</label>

                <select
                  style={styles.select}
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                >
                  <option value="Rusak ringan">Rusak ringan</option>
                  <option value="Rusak sedang">Rusak sedang</option>
                  <option value="Rusak berat">Rusak berat</option>
                </select>
              </div>

              {/* DESKRIPSI */}
              <div style={styles.descField}>
                <label style={styles.inputLabel}>Keterangan / Deskripsi*</label>
                <textarea
                  placeholder="Jelaskan Kerusakan Jalan"
                  style={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            {/* BUTTON */}
            <div style={styles.submitWrapper}>
              <button className="btn-submit" onClick={handleSubmit}>
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      </div>
      {showOption && (
        <div style={styles.modalOverlay} onClick={() => setShowOption(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p>Pilih sumber foto</p>

            <button
              style={styles.modalBtn}
              onClick={() => {
                setIsManualMode(false); // ✅ AUTO MODE
                document.getElementById("fileCamera")?.click();
                setShowOption(false);
              }}
            >
              📸 Ambil Foto Sekarang
            </button>

            <button
              style={styles.modalBtn}
              onClick={() => {
                setIsManualMode(true); // ✅ MANUAL MODE
                document.getElementById("fileGallery")?.click();
                setShowOption(false);
              }}
            >
              📁 Upload dari Galeri
            </button>

            <button onClick={() => setShowOption(false)}>❌ Batal</button>
          </div>
        </div>
      )}
      {showManualWarning && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={{ fontWeight: "500" }}>
              ⚠️ Silahkan isi lokasi manual mulai dari nama jalan
            </p>

            <button
              style={styles.modalBtn}
              onClick={() => setShowManualWarning(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {previewImage && (
        <div style={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
          <div
            style={styles.previewWrapper}
            onClick={(e) => e.stopPropagation()} // 🔥 biar ga ke-close kalau klik gambar
          >
            <img src={previewImage} style={styles.fullPreview} />

            <button
              style={styles.closePreviewBtn}
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={styles.successOverlay}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={{ margin: "10px 0 4px 0" }}>Laporan Berhasil Dikirim</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>
              Terima kasih! Data Anda sudah masuk sistem 🚀
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 60px)",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: "28px 24px", // 🔥 SAMA PERSIS
    backgroundColor: "var(--bg-main)",
    color: "var(--text-main)",
    overflowY: "auto" as const, // ✅ INI KUNCINYA
    paddingBottom: "100px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    margin: 0,
    color: "var(--text-main)", // 🔥 INI KUNCINYA
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-main)",
    marginTop: "6px", // 🔥 ganti ini
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px", // 🔥 dari 60 → 24
  },
  headerDivider: {
    height: "1px",

    marginBottom: "30px",
    marginTop: "0px", // 🔥 WAJIB kalau mau sama persis
  },
  card: {
    backgroundColor: "#1E293B",
    padding: "16px 20px 24px 20px", // 🔥 atas lebih kecil
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.1)",
    marginTop: window.innerWidth < 768 ? "-10px" : "0px", // 🔥 NAIK
  },
  cardTitle: {
    marginTop: "4px",
    marginBottom: "16px",
    fontWeight: "600",
    fontSize: "16px",
    color: "white", // 🔥 FORCE PUTIH
  },
  cardDivider: {
    height: "1px",
    backgroundColor: "rgba(148,163,184,0.20)",
    marginBottom: "20px",
  },
  uploadBox: {
    border: "2px dashed #475569",
    padding: "50px 20px",
    textAlign: "center" as const,
    borderRadius: "12px",
    marginBottom: "24px",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-sub)",
    cursor: "pointer",
  },
  geoSection: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    backgroundColor: "#0F172A",
    padding: "20px",
    borderRadius: "12px",
    flexDirection:
      window.innerWidth < 768 ? ("column" as const) : ("row" as const),
  },
  geoLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  mapBox: {
    width: window.innerWidth < 768 ? "100%" : "320px",
    height: "300px",
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: 1,
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "#020617",
    color: "white",
  },
  textarea: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "#020617",
    color: "white",
    minHeight: "80px",
  },
  bottomForm: {
    display: "flex" as const,
    gap: "16px",
    marginBottom: "24px",
    alignItems: "flex-start", // ✅ balik lagi
    flexDirection:
      window.innerWidth < 768 ? ("column" as const) : ("row" as const),
  },
  detectBtn: {
    padding: "10px",
    backgroundColor: "#1E3A8A",
    border: "1px solid #3b82f6",
    borderRadius: "8px",
    color: "#93c5fd",
    cursor: "pointer",
  },
  submitWrapper: {
    display: "flex",
    justifyContent: "flex-end",
  },
  section: {
    marginBottom: "20px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "10px",
    display: "block",
  },
  row: {
    display: "flex" as const,
    flexDirection:
      window.innerWidth < 768 ? ("column" as const) : ("row" as const),
    gap: "12px",
  },

  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },

  inputLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "6px",
  },

  damageField: {
    width: "250px", // 🔥 bikin kecil sesuai Figma
    display: "flex",
    flexDirection: "column" as const,
  },

  descField: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "#020617",
    color: "white",
    height: "42px", // ✅ fix tinggi normal
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)", // 🔥 lebih gelap
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // 🔥 GAS POLLL
  },

  modal: {
    backgroundColor: "#1E293B",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  modalBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.2)",
    backgroundColor: "#020617",
    color: "white",
    cursor: "pointer",
  },
  deleteBtn: {
    position: "absolute" as const,
    top: "6px",
    right: "6px",
    backgroundColor: "rgba(235, 16, 16, 0.7)",
    border: "none",
    borderRadius: "50%",
    color: "white",
    width: "26px",
    height: "26px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionBox: {
    backgroundColor: "#020617",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    marginTop: "4px",
    maxHeight: "150px",
    overflowY: "auto" as const,
  },

  suggestionItem: {
    padding: "8px",
    cursor: "pointer" as const,
    borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 🔥 FULL LEBAR
    justifyContent: "center", // 🔥 INI KUNCINYA
    gap: "12px",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "0.3s",
  },
  addBox: {
    border: "2px dashed #475569",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    cursor: "pointer",
    aspectRatio: "1 / 1",
    backgroundColor: "#020617",
    transition: "all 0.25s ease",
  },
  addBoxHover: {
    borderColor: "#3b82f6",
    backgroundColor: "#0B1220",
    transform: "scale(1.03)",
  },
  imageItem: {
    position: "relative" as const,
    borderRadius: "12px",
    overflow: "hidden",
    aspectRatio: "1 / 1", // 🔥 WAJIB
    backgroundColor: "#020617",
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "220px", // 🔥 penting biar tengah
    cursor: "pointer",
  },
  imageOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "0.3s",
    cursor: "pointer",
    fontSize: "24px",
  },
  fullPreview: {
    maxWidth: "90vw", // 🔥 BATAS LEBAR
    maxHeight: "85vh", // 🔥 BATAS TINGGI
    objectFit: "contain" as const, // 🔥 BIAR PROPORSIONAL
    borderRadius: "12px",
  },
  previewWrapper: {
    position: "relative" as const,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  closePreviewBtn: {
    position: "absolute" as const,
    top: "-12px",
    right: "-12px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(235, 16, 16, 0.7)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  successBox: {
    backgroundColor: "#1E293B",
    padding: "24px 28px",
    borderRadius: "14px",
    textAlign: "center" as const,
    animation: "fadeIn 0.3s ease",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  successIcon: {
    fontSize: "36px",
  },
};

export default CreateReport;
