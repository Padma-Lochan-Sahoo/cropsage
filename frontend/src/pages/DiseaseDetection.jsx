import { useState, useRef } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #020a06;
    --surface: #0b1a0f;
    --surface2: #0f2014;
    --border: rgba(52, 211, 100, 0.12);
    --border-bright: rgba(52, 211, 100, 0.35);
    --emerald: #34d364;
    --emerald-dim: rgba(52, 211, 100, 0.08);
    --emerald-glow: rgba(52, 211, 100, 0.25);
    --text: #f0faf2;
    --text-muted: #5d8a6b;
    --text-soft: #9bbfa6;
    --rose: #fb7185;
    --rose-dim: rgba(251, 113, 133, 0.08);
  }

  body { background: var(--bg); }

  .page {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  .page::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 15% 0%, rgba(52,211,100,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 85% 100%, rgba(52,211,100,0.05) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Subtle grid texture */
  .page::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: linear-gradient(rgba(52,211,100,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(52,211,100,0.02) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .container {
    width: 100%;
    max-width: 1000px;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .header {
    margin-bottom: 48px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--emerald);
    background: var(--emerald-dim);
    border: 1px solid var(--border-bright);
    border-radius: 100px;
    padding: 5px 12px;
    margin-bottom: 14px;
  }

  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--emerald);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  h1 span {
    color: var(--emerald);
  }

  .subtitle {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 420px;
    font-weight: 300;
    margin-top: 12px;
  }

  /* Stats */
  .stats {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .stat {
    text-align: right;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--emerald);
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 3px;
  }

  /* Main grid */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 680px) {
    .grid { grid-template-columns: 1fr; }
    .header { flex-direction: column; align-items: flex-start; }
    .stats { flex-direction: row; }
  }

  /* Cards */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: border-color 0.3s;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--emerald-dim) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .card:hover { border-color: var(--border-bright); }
  .card:hover::before { opacity: 1; }

  .card-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Upload zone */
  .upload-zone {
    border: 1.5px dashed var(--border-bright);
    border-radius: 16px;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.25s;
    background: var(--emerald-dim);
    text-align: center;
    position: relative;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--emerald);
    background: rgba(52, 211, 100, 0.12);
    transform: translateY(-1px);
  }

  .upload-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: rgba(52, 211, 100, 0.12);
    border: 1px solid var(--border-bright);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 4px;
    transition: transform 0.2s;
  }

  .upload-zone:hover .upload-icon { transform: scale(1.08) rotate(-3deg); }

  .upload-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .upload-sub {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 300;
  }

  /* File info */
  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-top: 12px;
    animation: slideIn 0.25s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .file-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    background: var(--emerald-dim);
    border: 1px solid var(--border-bright);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .file-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-check {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: var(--emerald);
    display: flex; align-items: center; justify-content: center;
    color: #020a06;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* Button */
  .btn {
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    border: none;
    background: var(--emerald);
    color: #020a06;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
  }

  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  }

  .btn:hover:not(:disabled) {
    background: #4ade80;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px var(--emerald-glow);
  }

  .btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loading spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(2,10,6,0.3);
    border-top-color: #020a06;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error */
  .error {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--rose);
    background: var(--rose-dim);
    border: 1px solid rgba(251,113,133,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    margin-top: 12px;
    animation: slideIn 0.25s ease;
  }

  /* Result card */
  .result-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 320px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--text-muted);
    text-align: center;
  }

  .empty-icon {
    font-size: 40px;
    opacity: 0.3;
    filter: grayscale(1);
  }

  .empty-text {
    font-size: 13px;
    line-height: 1.5;
    font-weight: 300;
    max-width: 220px;
  }

  /* Preview */
  .preview-wrap {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    animation: slideIn 0.3s ease;
  }

  .preview-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0; right: 0;
    background: linear-gradient(to top, rgba(2,10,6,0.85), transparent);
    padding: 16px 14px 12px;
  }

  .preview-label {
    font-size: 11px;
    color: var(--text-soft);
    font-weight: 300;
  }

  /* Detection result */
  .detection {
    background: var(--surface2);
    border: 1px solid var(--border-bright);
    border-radius: 14px;
    padding: 18px;
    animation: revealResult 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .detection::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--emerald), transparent);
  }

  @keyframes revealResult {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detection-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .detection-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detection-key {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--emerald);
  }

  .detection-value {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.2;
  }

  .confidence-bar-wrap {
    margin-top: 16px;
  }

  .confidence-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .confidence-track {
    height: 4px;
    border-radius: 4px;
    background: var(--border);
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--emerald), #86efac);
    transition: width 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .raw-result {
    font-size: 11px;
    color: var(--text-soft);
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    padding: 12px;
    border: 1px solid var(--border);
    white-space: pre-wrap;
    word-break: break-all;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    animation: slideIn 0.3s ease;
  }

  /* Treatment advice */
  .treatment-card {
    margin-top: 28px;
    background: radial-gradient(circle at 0% 0%, rgba(52,211,100,0.16), transparent 55%),
                var(--surface);
    border-radius: 22px;
    border: 1px solid var(--border-bright);
    padding: 22px 22px 20px;
    position: relative;
    overflow: hidden;
  }

  .treatment-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: radial-gradient(circle at 12% 0%, rgba(52,211,100,0.26), transparent 55%);
    opacity: 0.35;
    pointer-events: none;
  }

  .treatment-content {
    position: relative;
    z-index: 1;
  }

  .treatment-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(15,118,110,0.35);
    border: 1px solid rgba(34,197,94,0.5);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 10px;
  }

  .treatment-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .treatment-title-main {
    font-family: 'Syne', sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: var(--text);
  }

  .treatment-title-main span {
    color: var(--emerald);
  }

  .treatment-subtitle {
    font-size: 13px;
    color: var(--text-muted);
  }

  .treatment-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .treatment-block {
    background: rgba(2,10,6,0.7);
    border-radius: 14px;
    padding: 12px 13px;
    border: 1px solid rgba(15,118,110,0.6);
  }

  .treatment-block h4 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--emerald);
    margin-bottom: 6px;
  }

  .treatment-block ul {
    list-style: disc;
    padding-left: 16px;
  }

  .treatment-block li {
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.5;
    margin-bottom: 3px;
  }

  .treatment-notes {
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-soft);
  }

  .treatment-notes span {
    color: var(--emerald);
    font-weight: 500;
  }

  @media (max-width: 680px) {
    .treatment-grid { grid-template-columns: 1fr; }
  }

  /* Tips */
  .tips {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 20px;
  }

  @media (max-width: 680px) {
    .tips { grid-template-columns: 1fr; }
    .detection-row { grid-template-columns: 1fr; }
  }

  .tip {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: border-color 0.2s;
  }

  .tip:hover { border-color: var(--border-bright); }

  .tip-icon {
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1;
    margin-top: 1px;
  }

  .tip-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }

  .tip-desc {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 300;
    line-height: 1.5;
  }
`;

function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setResult(null);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!image) { setError("Please upload a leaf image first."); return; }
    const formData = new FormData();
    formData.append("image", image);
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("http://localhost:5001/api/disease/predict", formData);
      setResult(response.data);
    } catch {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plantDisease = (() => {
    if (!result) return null;
    // Prefer structured fields from backend, but fall back to raw string
    if (result.plant || result.diseaseName) {
      return {
        plant: result.plant || "Unknown",
        disease: result.diseaseName || "Unknown condition",
      };
    }
    if (!result.disease) return null;
    const [plant, disease] = result.disease.split("___");
    return {
      plant: plant?.replaceAll("_", " "),
      disease: disease?.replaceAll("_", " "),
    };
  })();

  const confidence = result?.confidence ? Math.round(result.confidence) * 10 : null;
  const treatment = result?.treatmentAdvice || null;

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="container">

          {/* Header */}
          <div className="header">
            <div>
              <div className="badge">
                <span className="badge-dot" />
                AI-Powered Analysis
              </div>
              <h1>Plant <span>Disease</span><br />Detection</h1>
              <p className="subtitle">
                Upload a clear photo of a plant leaf and our model will identify the species and diagnose any disease in seconds.
              </p>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-value">38+</div>
                <div className="stat-label">Disease classes</div>
              </div>
              <div className="stat">
                <div className="stat-value">99%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid">

            {/* Upload card */}
            <div className="card">
              <div className="card-label">Upload leaf image</div>

              <div
                className={`upload-zone${dragOver ? " drag-over" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="upload-icon">🌿</div>
                <div className="upload-title">Drop image here</div>
                <div className="upload-sub">or click to browse · JPG, PNG supported</div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {image && (
                <div className="file-info">
                  <div className="file-icon">🖼️</div>
                  <span className="file-name">{image.name}</span>
                  <div className="file-check">✓</div>
                </div>
              )}

              <button className="btn" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Analyzing image…
                  </>
                ) : (
                  <>
                    <span>🔬</span>
                    Predict disease
                  </>
                )}
              </button>

              {error && (
                <div className="error">
                  <span>⚠️</span>
                  {error}
                </div>
              )}
            </div>

            {/* Result card */}
            <div className="result-card">
              <div className="card-label">Detection result</div>

              {!previewUrl && !result && (
                <div className="empty-state">
                  <div className="empty-icon">🍃</div>
                  <p className="empty-text">Upload a leaf image and run the analysis to see results here</p>
                </div>
              )}

              {previewUrl && (
                <div className="preview-wrap">
                  <img src={previewUrl} alt="Uploaded leaf" className="preview-img" />
                  <div className="preview-overlay">
                    <div className="preview-label">
                      {loading ? "⏳ Analyzing…" : result ? "✅ Analysis complete" : "Ready to analyze"}
                    </div>
                  </div>
                </div>
              )}

              {plantDisease && (
                <div className="detection">
                  <div className="detection-row">
                    <div className="detection-item">
                      <div className="detection-key">Plant</div>
                      <div className="detection-value">{plantDisease.plant || "Unknown"}</div>
                    </div>
                    <div className="detection-item">
                      <div className="detection-key">Condition</div>
                      <div className="detection-value">{plantDisease.disease || "Healthy"}</div>
                    </div>
                  </div>
                  {confidence !== null && (
                    <div className="confidence-bar-wrap">
                      <div className="confidence-label">
                        <span>Confidence</span>
                        <span>{confidence}%</span>
                      </div>
                      <div className="confidence-track">
                        <div className="confidence-fill" style={{ width: `${confidence}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result && !plantDisease && (
                <pre className="raw-result">{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          </div>

          {/* Treatment advice (separate card) */}
          {treatment && (
            <div className="treatment-card">
              <div className="treatment-content">
                <div className="treatment-pill">
                  <span style={{ fontSize: "12px" }}>🌱</span>
                  Guided treatment plan
                </div>
                <div className="treatment-title">
                  <div className="treatment-title-main">
                    Best actions for{" "}
                    <span>
                      {plantDisease?.plant || "your crop"}
                    </span>
                  </div>
                  <div className="treatment-subtitle">
                    {treatment.short_summary ||
                      "Step-by-step field advice based on the detected condition."}
                  </div>
                </div>

                <div className="treatment-grid">
                  <div className="treatment-block">
                    <h4>Organic treatment</h4>
                    <ul>
                      {(Array.isArray(treatment.organic_treatment) && treatment.organic_treatment.length > 0
                        ? treatment.organic_treatment
                        : [
                            "Use neem-based or other organic sprays at evening time.",
                            "Remove and destroy heavily infected leaves away from the field.",
                            "Avoid overhead irrigation to reduce leaf wetness.",
                          ]
                      ).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="treatment-block">
                    <h4>Chemical treatment</h4>
                    <ul>
                      {(Array.isArray(treatment.chemical_treatment) && treatment.chemical_treatment.length > 0
                        ? treatment.chemical_treatment
                        : [
                            "Consult local agriculture officer before using any fungicide or pesticide.",
                            "Always follow label dose, waiting period and safety instructions.",
                            "Rotate chemicals with different modes of action to avoid resistance.",
                          ]
                      ).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="treatment-block">
                    <h4>Preventive measures</h4>
                    <ul>
                      {(Array.isArray(treatment.preventive_measures) && treatment.preventive_measures.length > 0
                        ? treatment.preventive_measures
                        : [
                            "Use certified, disease‑free seeds or seedlings.",
                            "Practice crop rotation and avoid continuous mono‑cropping.",
                            "Maintain field sanitation and remove crop residues after harvest.",
                          ]
                      ).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="treatment-notes">
                  <span>Note:</span> This guidance is AI‑generated. Always cross‑check with your local
                  agriculture officer or extension worker for dosage and products available in your area.
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="tips">
            {[
              { icon: "☀️", title: "Good lighting", desc: "Natural light gives the clearest results. Avoid harsh shadows on the leaf." },
              { icon: "🔍", title: "Close-up shot", desc: "Fill the frame with the leaf so the model can detect fine details." },
              { icon: "📐", title: "Flat angle", desc: "Shoot from directly above the leaf for consistent classification." },
            ].map((tip) => (
              <div className="tip" key={tip.title}>
                <div className="tip-icon">{tip.icon}</div>
                <div>
                  <div className="tip-title">{tip.title}</div>
                  <div className="tip-desc">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

export default DiseaseDetection;