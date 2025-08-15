import React, { useState } from "react";
import axios from "axios";
import { FaAppleAlt, FaCarrot, FaBreadSlice, FaDrumstickBite } from "react-icons/fa";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const ingredientIcons = {
    apple: <FaAppleAlt color="#FF6B6B" />,
    carrot: <FaCarrot color="#FFA500" />,
    bread: <FaBreadSlice color="#F7DC6F" />,
    chicken: <FaDrumstickBite color="#C0392B" />,
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Select an image first!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await axios.post("http://127.0.0.1:8000/detect-and-retrieve", formData);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🍴 RecGen</h1>
        <p style={styles.subtitle}>Snap a dish, get recipes instantly!</p>
      </div>

      {/* Main Section */}
      <div style={styles.mainSection}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Upload Card */}
          <div style={{ ...styles.card, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}>
            <h2 style={styles.cardTitle}>Upload Your Dish</h2>
            <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => document.getElementById("fileInput").click()} style={styles.uploadButton}>
                {image ? "Change Image" : "Choose Image"}
              </button>
              <button onClick={handleUpload} disabled={loading || !image} style={styles.button}>
                {loading ? "Processing..." : "Upload"}
              </button>
            </div>
            {preview && <img src={preview} alt="Preview" style={styles.previewImage} />}

            {/* Detected Ingredients */}
            {data && data.detected && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={styles.subTitle}>Detected Ingredients</h3>
                <div style={styles.ingredients}>
                  {data.detected.map((ing, idx) => (
                    <div key={idx} style={styles.ingredientItem}>
                      {ingredientIcons[ing.toLowerCase()] || "🥗"} {ing}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recipe */}
        <div style={styles.rightColumn}>
          {data && data.recipe && (
            <div style={{ ...styles.card, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
              <h2 style={styles.cardTitle}>Generated Recipe</h2>
              {data.recipe.split(/\n+/).map((line, idx) => {
                if (line.startsWith("#### **Ingredients**") || line.startsWith("#### Ingredients")) {
                  return <h3 key={idx} style={styles.subTitle}>Ingredients</h3>;
                } else if (line.startsWith("- ") || line.startsWith("* ")) {
                  return <li key={idx} style={styles.listItem}>{line.replace(/^- /, "")}</li>;
                } else if (line.startsWith("#### **Instructions**") || line.startsWith("#### Instructions")) {
                  return <h3 key={idx} style={styles.subTitle}>Instructions</h3>;
                } else if (line.match(/^\*\*Step \d/)) {
                  return <h4 key={idx} style={styles.stepTitle}>{line}</h4>;
                } else if (line.trim() !== "") {
                  return <p key={idx} style={styles.paragraph}>{line}</p>;
                } else {
                  return null;
                }
              })}
            </div>
          )}
          {data && data.error && <p style={{ color: "red" }}>{data.error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(120deg, #f0f4ff, #e0fff8)",
    padding: "40px",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "3rem", color: "#4B91F2" },
  subtitle: { fontSize: "1.2rem", color: "#555" },

  mainSection: {
    display: "flex",
    gap: "30px",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftColumn: { flex: "0 0 300px", minWidth: "280px" },
  rightColumn: { flex: 1, minWidth: "320px" },

  card: {
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  },
  cardTitle: { color: "#4B91F2", marginBottom: "15px" },
  uploadButton: { backgroundColor: "#FF6B35", color: "#fff", padding: "10px 20px", borderRadius: "12px", cursor: "pointer" },
  button: { backgroundColor: "#4B91F2", color: "#fff", padding: "10px 20px", borderRadius: "12px", cursor: "pointer" },
  previewImage: { marginTop: "15px", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },

  subTitle: { color: "#FF6B35", marginTop: "15px", marginBottom: "8px", fontSize: "1.2rem", fontWeight: "600" },
  stepTitle: { marginTop: "10px", marginBottom: "5px", fontWeight: "500", color: "#4B91F2" },
  listItem: { marginBottom: "5px", paddingLeft: "15px" },
  paragraph: { marginBottom: "10px", lineHeight: "1.5" },

  ingredients: { display: "flex", flexWrap: "wrap", gap: "10px" },
  ingredientItem: { display: "flex", alignItems: "center", gap: "8px", background: "#f4faff", padding: "6px 12px", borderRadius: "10px", fontWeight: "500" },
};

export default App;
