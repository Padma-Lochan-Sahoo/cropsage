/**
 * Fertilizer Recommendation Controller
 * Rule-based recommendations from soil data a general farmer would know:
 * soil type, pH, N/P/K levels (low/medium/high), optional crop, area (acres).
 */

// Crops suitable for soil type + pH combinations (simplified for Indian/global farming)
const CROP_SUITABILITY = {
  clay: {
    acidic: ["Rice", "Tea", "Potato", "Sugarcane", "Jute"],
    neutral: ["Wheat", "Rice", "Sugarcane", "Cotton", "Soybean"],
    alkaline: ["Cotton", "Barley", "Sugarcane", "Mustard"],
  },
  loam: {
    acidic: ["Potato", "Oats", "Rye", "Tea", "Blueberry"],
    neutral: ["Wheat", "Maize", "Rice", "Soybean", "Tomato", "Cotton", "Chickpea", "Lentil"],
    alkaline: ["Wheat", "Barley", "Cotton", "Mustard", "Alfalfa"],
  },
  sandy: {
    acidic: ["Groundnut", "Potato", "Carrot", "Watermelon", "Pineapple"],
    neutral: ["Groundnut", "Maize", "Millet", "Watermelon", "Tomato", "Onion", "Carrot"],
    alkaline: ["Pearl millet", "Sorghum", "Groundnut", "Cotton"],
  },
  silt: {
    acidic: ["Rice", "Potato", "Oats"],
    neutral: ["Wheat", "Maize", "Rice", "Soybean", "Sugarcane", "Vegetables"],
    alkaline: ["Wheat", "Barley", "Sugarcane"],
  },
  clay_loam: {
    acidic: ["Rice", "Potato", "Tea", "Sugarcane"],
    neutral: ["Wheat", "Maize", "Rice", "Cotton", "Soybean", "Chickpea"],
    alkaline: ["Wheat", "Cotton", "Sugarcane", "Mustard"],
  },
  sandy_loam: {
    acidic: ["Groundnut", "Potato", "Maize", "Tomato"],
    neutral: ["Wheat", "Maize", "Groundnut", "Tomato", "Chickpea", "Onion", "Cotton"],
    alkaline: ["Pearl millet", "Sorghum", "Cotton", "Groundnut"],
  },
};

// Fertilizer types and when to use (N-P-K focus)
const FERTILIZER_DB = {
  Rice: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 80, timing: "Split: basal + tillering + panicle", note: "Apply in 2–3 splits" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 50, timing: "Tillering and panicle stage", note: "Reduce if soil has organic matter" },
    high_n: { name: "Minimal N", npk: "0-0-0", kgPerAcre: 0, timing: "Skip nitrogen", note: "Focus on P and K only" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal application at sowing", note: "Mix well in soil" },
    medium_p: { name: "DAP or SSP", npk: "18-46-0 or 0-16-0", kgPerAcre: 25, timing: "Basal", note: "SSP also adds sulphur" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "Phosphorus sufficient" },
    low_k: { name: "MOP (Muriate of Potash)", npk: "0-0-60", kgPerAcre: 25, timing: "Basal or split with N", note: "Improves grain quality" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 12, timing: "Basal", note: "Optional top-up" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "Potassium sufficient" },
  },
  Wheat: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 100, timing: "Split: sowing, crown root, flowering", note: "Critical for yield" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 60, timing: "Crown root and flowering", note: "Two splits" },
    high_n: { name: "Minimal N", npk: "46-0-0", kgPerAcre: 20, timing: "Only if deficiency appears", note: "Avoid excess N" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 55, timing: "Basal at sowing", note: "Essential for root growth" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 30, timing: "Basal", note: "Standard dose" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 20, timing: "Basal", note: "Strengthens straw" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 10, timing: "Basal", note: "Maintenance dose" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Maize: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 120, timing: "Split: 3–4 times from sowing to tasseling", note: "Heavy feeder" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 70, timing: "V4, V8, tasseling", note: "Split application" },
    high_n: { name: "Minimal N", npk: "46-0-0", kgPerAcre: 25, timing: "Only at tasseling if needed", note: "Reduce leaching risk" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal at sowing", note: "Important for early growth" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 28, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 25, timing: "Basal or split", note: "For stalk strength" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 12, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Cotton: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 90, timing: "Split: sowing, squaring, flowering", note: "Avoid late N" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 55, timing: "Squaring and flowering", note: "Two splits" },
    high_n: { name: "Minimal N", npk: "46-0-0", kgPerAcre: 20, timing: "Only at squaring if needed", note: "Excess N promotes vegetative growth" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal", note: "For root and boll development" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 28, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 30, timing: "Basal + flowering", note: "Improves boll quality" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 15, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Sugarcane: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 150, timing: "Split: planting, tillering, grand growth", note: "Long duration crop" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 90, timing: "Tillering and grand growth", note: "Multiple splits" },
    high_n: { name: "Minimal N", npk: "46-0-0", kgPerAcre: 30, timing: "Grand growth only if needed", note: "Reduce for better sugar" },
    low_p: { name: "DAP / Rock phosphate", npk: "18-46-0", kgPerAcre: 60, timing: "Basal at planting", note: "Essential for ratoon" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 35, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 40, timing: "Basal + grand growth", note: "Critical for yield" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 20, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Tomato: {
    low_n: { name: "Urea / CAN", npk: "46-0-0", kgPerAcre: 60, timing: "Split: transplanting, flowering, fruit set", note: "Avoid excess N" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 35, timing: "Flowering and fruit set", note: "Two splits" },
    high_n: { name: "Minimal N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
    low_p: { name: "DAP / SSP", npk: "18-46-0", kgPerAcre: 45, timing: "Basal at transplanting", note: "For root and fruit" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 25, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 35, timing: "Flowering and fruit development", note: "Improves quality" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 18, timing: "Basal + fruit set", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Groundnut: {
    low_n: { name: "Urea (light)", npk: "46-0-0", kgPerAcre: 20, timing: "Early growth only", note: "Legume fixes N; avoid excess" },
    medium_n: { name: "No N or minimal", npk: "-", kgPerAcre: 0, timing: "-", note: "Rely on rhizobium" },
    high_n: { name: "No N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
    low_p: { name: "DAP / SSP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal at sowing", note: "Critical for pods" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 28, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 25, timing: "Basal", note: "For pod fill" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 12, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Chickpea: {
    low_n: { name: "Starter N only", npk: "46-0-0", kgPerAcre: 15, timing: "At sowing only", note: "Legume; rest from fixation" },
    medium_n: { name: "No N", npk: "-", kgPerAcre: 0, timing: "-", note: "Fixation sufficient" },
    high_n: { name: "No N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal", note: "Essential for nodules and yield" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 28, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 20, timing: "Basal", note: "For grain quality" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 10, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Potato: {
    low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 80, timing: "Split: planting, tuber initiation", note: "Critical for tuber size" },
    medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 50, timing: "Planting and tuber initiation", note: "Two splits" },
    high_n: { name: "Minimal N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
    low_p: { name: "DAP / SSP", npk: "18-46-0", kgPerAcre: 55, timing: "Basal at planting", note: "For tuber set" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 30, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 45, timing: "Basal + tuber bulking", note: "Improves quality and shelf life" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 22, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
  Soybean: {
    low_n: { name: "Starter N", npk: "46-0-0", kgPerAcre: 15, timing: "At sowing only", note: "Legume fixes N" },
    medium_n: { name: "No N", npk: "-", kgPerAcre: 0, timing: "-", note: "Fixation sufficient" },
    high_n: { name: "No N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
    low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 50, timing: "Basal", note: "For nodules and pods" },
    medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 28, timing: "Basal", note: "Standard" },
    high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
    low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 25, timing: "Basal", note: "For grain" },
    medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 12, timing: "Basal", note: "Maintenance" },
    high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
  },
};

// Default recommendations for crops not in FERTILIZER_DB (generic NPK)
const DEFAULT_FERTILIZER = {
  low_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 60, timing: "Split at sowing and growth stages", note: "Adjust per crop duration" },
  medium_n: { name: "Urea", npk: "46-0-0", kgPerAcre: 35, timing: "Split application", note: "Standard dose" },
  high_n: { name: "Minimal N", npk: "-", kgPerAcre: 0, timing: "-", note: "N sufficient" },
  low_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 40, timing: "Basal at sowing", note: "Mix in root zone" },
  medium_p: { name: "DAP", npk: "18-46-0", kgPerAcre: 22, timing: "Basal", note: "Standard" },
  high_p: { name: "No P", npk: "-", kgPerAcre: 0, timing: "-", note: "P sufficient" },
  low_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 25, timing: "Basal or split", note: "For quality" },
  medium_k: { name: "MOP", npk: "0-0-60", kgPerAcre: 12, timing: "Basal", note: "Maintenance" },
  high_k: { name: "No K", npk: "-", kgPerAcre: 0, timing: "-", note: "K sufficient" },
};

function getSuitableCrops(soilType, ph) {
  const key = (soilType || "").toLowerCase().replace(/\s+/g, "_");
  const phKey = (ph || "").toLowerCase();
  const map = CROP_SUITABILITY[key] || CROP_SUITABILITY.loam;
  const crops = map[phKey] || map.neutral || [];
  return [...new Set(crops)];
}

function getFertilizerForCrop(crop, nitrogen, phosphorus, potassium, areaAcres) {
  const ref = FERTILIZER_DB[crop] || DEFAULT_FERTILIZER;
  const nLevel = (nitrogen || "medium").toLowerCase();
  const pLevel = (phosphorus || "medium").toLowerCase();
  const kLevel = (potassium || "medium").toLowerCase();

  const nMap = { low: "low_n", medium: "medium_n", high: "high_n" };
  const pMap = { low: "low_p", medium: "medium_p", high: "high_p" };
  const kMap = { low: "low_k", medium: "medium_k", high: "high_k" };

  const nRec = ref[nMap[nLevel] || "medium_n"];
  const pRec = ref[pMap[pLevel] || "medium_p"];
  const kRec = ref[kMap[kLevel] || "medium_k"];

  const area = Math.max(0.1, parseFloat(areaAcres) || 1);
  const list = [];

  if (nRec && nRec.kgPerAcre > 0) {
    list.push({
      type: "Nitrogen (N)",
      fertilizer: nRec.name,
      npk: nRec.npk,
      kgPerAcre: nRec.kgPerAcre,
      totalKg: Math.round(nRec.kgPerAcre * area * 10) / 10,
      timing: nRec.timing,
      note: nRec.note,
    });
  }
  if (pRec && pRec.kgPerAcre > 0) {
    list.push({
      type: "Phosphorus (P)",
      fertilizer: pRec.name,
      npk: pRec.npk,
      kgPerAcre: pRec.kgPerAcre,
      totalKg: Math.round(pRec.kgPerAcre * area * 10) / 10,
      timing: pRec.timing,
      note: pRec.note,
    });
  }
  if (kRec && kRec.kgPerAcre > 0) {
    list.push({
      type: "Potassium (K)",
      fertilizer: kRec.name,
      npk: kRec.npk,
      kgPerAcre: kRec.kgPerAcre,
      totalKg: Math.round(kRec.kgPerAcre * area * 10) / 10,
      timing: kRec.timing,
      note: kRec.note,
    });
  }

  return list;
}

/**
 * POST /api/fertilizer/recommend
 * Body: { soilType, ph, nitrogen, phosphorus, potassium, crop?, region?, areaAcres? }
 */
export const recommend = async (req, res) => {
  try {
    const {
      soilType,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      crop,
      region,
      areaAcres,
    } = req.body || {};

    if (!soilType || !ph) {
      return res.status(400).json({
        msg: "Soil type and pH are required",
      });
    }

    const suitableCrops = getSuitableCrops(soilType, ph);
    let fertilizerRecommendations = [];
    let selectedCrop = (crop || "").trim();

    if (selectedCrop) {
      fertilizerRecommendations = getFertilizerForCrop(
        selectedCrop,
        nitrogen || "medium",
        phosphorus || "medium",
        potassium || "medium",
        areaAcres
      );
    }

    const tips = [];
    if ((ph || "").toLowerCase() === "acidic") {
      tips.push("Consider adding lime (e.g. agricultural lime) over time to raise pH toward neutral, if your target crop prefers neutral soil.");
    }
    if ((ph || "").toLowerCase() === "alkaline") {
      tips.push("Gypsum or sulphur can help lower pH in alkaline soils; use as per soil test and crop requirement.");
    }
    if (!selectedCrop && suitableCrops.length > 0) {
      tips.push("Select a crop from the suitable list above and submit again to get fertilizer type and quantity.");
    }
    tips.push("For best results, get a soil test done periodically and adjust doses. These are general recommendations.");

    res.json({
      suitableCrops,
      cropUsed: selectedCrop || null,
      fertilizerRecommendations,
      areaAcres: Math.max(0.1, parseFloat(areaAcres) || 1),
      region: region || null,
      tips,
      input: {
        soilType,
        ph,
        nitrogen: nitrogen || "medium",
        phosphorus: phosphorus || "medium",
        potassium: potassium || "medium",
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to generate fertilizer recommendation" });
  }
};
