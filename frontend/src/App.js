// App.js
import React, { useState } from "react";
import axios from "axios";
import { FaAppleAlt, FaCarrot, FaBreadSlice, FaDrumstickBite } from "react-icons/fa";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const ingredientIcons = {
    apple: <FaAppleAlt color="#FF7D29" />,
    carrot: <FaCarrot color="#FF7D29" />,
    bread: <FaBreadSlice color="#FFBF78" />,
    chicken: <FaDrumstickBite color="#7B4019" />,
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setIngredients([]);
      setSuggestions([]);
      setSelected(null);
      setRecipe("");
    }
  };

  const detectAndSuggest = async () => {
    if (!image) return alert("Select an image first!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await axios.post("https://recipe-generator-1ppm.onrender.com/detect-and-suggest", formData);
      setIngredients(res.data.detected || []);
      setSuggestions(res.data.suggestions || []);
      setSelected(null);
      setRecipe("");
    } catch {
      alert("Detection failed.");
    } finally {
      setLoading(false);
    }
  };

  const pickRecipe = async (name, idx) => {
    setSelected(idx);
    setRecipe("");
    setLoading(true);
    try {
      const res = await axios.post("https://recipe-generator-1ppm.onrender.com/generate-recipe", {
        recipe_name: name,
        ingredients,
      });
      setRecipe(res.data.recipe || "");
    } catch {
      alert("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = (text) => {
    return text
      .split(/\n+/)
      .map((line) =>
        line
          .replace(/^#+\s*/, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .trim()
      )
      .map((clean, idx) => {
        if (/^Title:/i.test(clean)) return <h2 key={idx} style={styles.recipeTitle}>{clean.replace(/^Title:\s*/i, "")}</h2>;
        if (/^Ingredients:/i.test(clean)) return <h3 key={idx} style={styles.subTitle}>Ingredients</h3>;
        if (/^- /.test(clean) || /^\* /.test(clean)) return <li key={idx} style={styles.listItem}>{clean.replace(/^[-*]\s*/, "")}</li>;
        if (/^Instructions:/i.test(clean)) return <h3 key={idx} style={styles.subTitle}>Instructions</h3>;
        if (/^Step\s*\d+/i.test(clean)) return <h4 key={idx} style={styles.stepTitle}>{clean}</h4>;
        if (clean) return <p key={idx} style={styles.paragraph}>{clean}</p>;
        return null;
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🍴</div>
        <h1 style={styles.title}>RecGen</h1>
        <p style={styles.subtitle}>Snap a dish, pick a recipe, cook happy.</p>
      </div>

      <div style={styles.mainSection}>
        <div style={styles.leftColumn}>
          <div style={{ ...styles.card, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }}>
            <h2 style={styles.cardTitle}>Upload Your Dish</h2>
            <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => document.getElementById("fileInput").click()} style={styles.uploadButton}>
                {image ? "Change Image" : "Choose Image"}
              </button>
              <button onClick={detectAndSuggest} disabled={loading || !image} style={styles.button}>
                {loading ? "Processing..." : "Detect & Suggest"}
              </button>
            </div>
            {preview && <img src={preview} alt="Preview" style={styles.previewImage} />}

            {ingredients.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={styles.subTitle}>Detected Ingredients</h3>
                <div style={styles.ingredients}>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} style={styles.ingredientItem}>
                      {ingredientIcons[ing.toLowerCase()] || "🥗"} {ing}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={styles.subTitle}>Pick a Recipe</h3>
                <div style={styles.suggestionGrid}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => pickRecipe(s, i)}
                      style={{
                        ...styles.suggestionBtn,
                        outline: selected === i ? "3px solid #7B4019" : "none",
                        transform: selected === i ? "scale(1.02)" : "scale(1.0)",
                      }}
                    >
                      {i + 1}. {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.rightColumn}>
          {recipe && (
            <div style={{ ...styles.card, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
              <h2 style={styles.cardTitle}>Generated Recipe</h2>
              <div>{renderRecipe(recipe)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #FFEEA9, #FFBF78)",
    padding: 32,
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 40,
    lineHeight: 1,
  },
  title: {
    fontSize: "3rem",
    color: "#7B4019",
    margin: 0,
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  subtitle: {
    color: "#7B4019",
    opacity: 0.9,
    marginTop: 6,
  },
  mainSection: {
    display: "flex",
    gap: 24,
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftColumn: { flex: "0 0 360px", minWidth: 320 },
  rightColumn: { flex: 1, minWidth: 360 },
  card: {
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  },
  cardTitle: { color: "#FF7D29", marginBottom: 12, fontWeight: 700 },
  uploadButton: {
    backgroundColor: "#FF7D29",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 12,
    cursor: "pointer",
    border: "none",
  },
  button: {
    backgroundColor: "#7B4019",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 12,
    cursor: "pointer",
    border: "none",
  },
  previewImage: {
    marginTop: 14,
    width: "100%",
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  subTitle: { color: "#7B4019", marginTop: 12, marginBottom: 8, fontSize: "1.15rem", fontWeight: 700 },
  stepTitle: { marginTop: 8, marginBottom: 4, fontWeight: 600, color: "#FF7D29" },
  listItem: { marginBottom: 6, paddingLeft: 16 },
  paragraph: { marginBottom: 8, lineHeight: 1.6 },
  ingredients: { display: "flex", flexWrap: "wrap", gap: 10 },
  ingredientItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#FFEEA9",
    padding: "6px 12px",
    borderRadius: 12,
    fontWeight: 600,
    color: "#7B4019",
  },
  suggestionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
  },
  suggestionBtn: {
    textAlign: "left",
    background: "#FFFFFF",
    border: "1px solid rgba(123,64,25,0.15)",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    color: "#7B4019",
  },
  recipeTitle: {
    color: "#7B4019",
    marginTop: 0,
    marginBottom: 12,
  },
};

export default App;
