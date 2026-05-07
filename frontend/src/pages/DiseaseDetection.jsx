import { useState, useRef } from "react";
import axios from "axios";


const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

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
      const response = await axios.post(`${API_BASE}/api/disease/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      setResult(response.data);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Prediction failed. Please try again.";
      setError(serverMsg);
      console.error("[DiseaseDetection] predict error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const plantDisease = (() => {
    if (!result) return null;
    if (result.plant || result.diseaseName) {
      return { 
        plant: result.plant || "Unknown", 
        disease: result.diseaseName || "Unknown condition" 
      };
    }
    if (!result.disease) return null;
    const [plant, disease] = result.disease.split("___");
    return {
      plant: plant?.replaceAll("_", " "),
      disease: disease?.replaceAll("_", " "),
    };
  })();

  const confidence =
    result?.confidence != null && !Number.isNaN(Number(result.confidence))
      ? Math.min(100, Math.max(0, Number(result.confidence)))
      : null;
  const treatment = result?.treatmentAdvice || null;

  const TreatmentBlock = ({ title, items, fallback }) => {
    const list = Array.isArray(items) && items.length > 0 ? items : fallback;
    return (
      <div className="card p-5 space-y-3">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <ul className="space-y-2">
          {list.map((step, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
              <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      
      
      
      className="max-w-5xl mx-auto py-6 px-4 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/8 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">AI-Powered Analysis</span>
          </div>
          <h1 className="font-display text-[clamp(26px,5vw,40px)] font-bold leading-tight">
            Plant <span className="gradient-text">Disease</span> Detection
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
            Upload a clear photo of a plant leaf and our model will identify the species and diagnose any disease in seconds.
          </p>
        </div>
        <div className="flex gap-6 shrink-0">
          {[{ value: "38+", label: "Disease classes" }, { value: "99%", label: "Accuracy" }].map((s) => (
            <div key={s.label} className="text-right">
              <div className="font-display text-2xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upload card */}
        <div className="card p-6 flex flex-col gap-4">
          <p className="section-label">Upload leaf image</p>

          <div
            
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200 ${
              dragOver ? "bg-emerald-500/5" : "bg-slate-900/40 hover:bg-slate-900/60 hover:border-emerald-500/30"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div
              className="text-4xl"
            >
              🌿
            </div>
            <div className="text-sm font-medium text-slate-300">Drop image here</div>
            <div className="text-xs text-slate-500">or click to browse · JPG, PNG supported</div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {image && (
            <div
              
              
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800"
            >
              <span className="text-lg">🖼️</span>
              <span className="text-xs text-slate-400 flex-1 truncate">{image.name}</span>
              <span className="text-emerald-400 text-sm font-bold">✓</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-green-900/40 border-t-green-900 animate-spin" />
                Analyzing image…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔬</span>
                Predict disease
              </span>
            )}
          </button>

          {error && (
            <div
              
              
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-xs text-red-400"
            >
              <span>⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Result card */}
        <div className="card p-6 flex flex-col gap-4">
          <p className="section-label">Detection result</p>

          {!previewUrl && !result && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
              <div className="text-4xl opacity-30">🍃</div>
              <p className="text-xs text-slate-600 text-center max-w-xs">
                Upload a leaf image and run the analysis to see results here
              </p>
            </div>
          )}

          {previewUrl && (
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img src={previewUrl} alt="Uploaded leaf" className="w-full h-full object-contain" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center gap-1.5">
                  {loading ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                  ) : result ? (
                    <span className="text-emerald-400">✅</span>
                  ) : (
                    <span className="text-slate-400">🎯</span>
                  )}
                  <span className="text-xs font-medium text-white">
                    {loading ? "Analyzing…" : result ? "Analysis complete" : "Ready to analyze"}
                  </span>
                </div>
              </div>
            </div>
          )}

          
            {plantDisease && (
              <div
                
                
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Plant", value: plantDisease.plant || "Unknown" },
                    { label: "Condition", value: plantDisease.disease || "Healthy" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-slate-100 capitalize">{item.value}</div>
                    </div>
                  ))}
                </div>

                {confidence !== null && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Confidence</span>
                      <span className="text-emerald-400 font-semibold">{Math.round(confidence)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        
                        
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #059669, #34d399)" }}
                      />
                    </div>
                  </div>
                )}

                {Array.isArray(result?.top_predictions) && result.top_predictions.length > 1 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Other likely matches</div>
                    <ul className="space-y-1">
                      {result.top_predictions.slice(1).map((row, idx) => (
                        <li key={idx} className="text-xs text-slate-500">
                          {(row.disease || "").replace(/___/g, " — ").replace(/_/g, " ")}
                          <span className="text-slate-600 ml-1">({row.confidence}%)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result && !plantDisease && (
              <pre className="text-xs text-slate-500 bg-slate-900/60 rounded-xl p-4 overflow-auto max-h-40 font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          
        </div>
      </div>

      {/* Treatment card */}
      
        {treatment && (
          <div
            
            
            
            className="card p-6 space-y-5 border-emerald-500/20 bg-emerald-500/[0.02]"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold tracking-widest uppercase mb-2">
                🌱 Guided treatment plan
              </div>
              <h2 className="font-display text-xl font-bold">
                Best actions for{" "}
                <span className="text-emerald-400">{plantDisease?.plant || "your crop"}</span>
              </h2>
              {treatment.short_summary && (
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{treatment.short_summary}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TreatmentBlock
                title="🌿 Organic treatment"
                items={treatment.organic_treatment}
                fallback={[
                  "Use neem-based or other organic sprays at evening time.",
                  "Remove and destroy heavily infected leaves away from the field.",
                  "Avoid overhead irrigation to reduce leaf wetness.",
                ]}
              />
              <TreatmentBlock
                title="⚗️ Chemical treatment"
                items={treatment.chemical_treatment}
                fallback={[
                  "Consult local agriculture officer before using any fungicide or pesticide.",
                  "Always follow label dose, waiting period and safety instructions.",
                  "Rotate chemicals with different modes of action to avoid resistance.",
                ]}
              />
              <TreatmentBlock
                title="🛡️ Preventive measures"
                items={treatment.preventive_measures}
                fallback={[
                  "Use certified, disease-free seeds or seedlings.",
                  "Practice crop rotation and avoid continuous mono-cropping.",
                  "Maintain field sanitation and remove crop residues after harvest.",
                ]}
              />
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-semibold">Note:</span> This guidance is AI-generated. Always cross-check with your local agriculture officer or extension worker for dosage and products available in your area.
            </div>
          </div>
        )}
      
    </div>
  );
}

export default DiseaseDetection;
