import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { FaUser, FaPhone, FaMapMarkerAlt, FaInfoCircle, FaSave, FaCrosshairs } from "react-icons/fa";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    username: "", email: "", image: "", phone: "", farmLocation: "", bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          image: res.data.image || "",
          phone: res.data.phone || "",
          farmLocation: res.data.farmLocation || "",
          bio: res.data.bio || "",
        });
      } catch (err) {
        setMessage({ type: "error", text: err.response?.data?.msg || "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation is not supported by your browser" });
      return;
    }
    setLocating(true);
    setMessage({ type: "", text: "" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.village || addr.hamlet || addr.suburb,
            addr.town || addr.city || addr.county,
            addr.state,
            addr.country,
          ].filter(Boolean);
          setForm((prev) => ({ ...prev, farmLocation: parts.join(", ") }));
          setMessage({ type: "success", text: "Location filled successfully" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch {
          setMessage({ type: "error", text: "Could not reverse geocode location" });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setMessage({ type: "error", text: "Could not get location. Please check permissions." });
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.put(`${API_BASE}/api/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.msg || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const initial = (form.username?.charAt(0) || "F").toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-100">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your farm profile and preferences</p>
      </div>

      {message.text && (
        <div className={`mb-6 rounded-xl px-4 py-3 text-sm border animate-in ${
          message.type === "success"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            : "bg-red-500/10 text-red-400 border-red-500/25"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="card p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-lg">
            {form.image ? (
              <img src={form.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="section-label block mb-1.5">Profile image URL</label>
            <input type="url" name="image" value={form.image} onChange={handleChange}
              placeholder="https://..." className="input-field text-xs" />
          </div>
        </div>

        {/* Username */}
        <div className="card p-5 space-y-1.5">
          <label className="section-label flex items-center gap-1.5"><FaUser size={10} /> Username</label>
          <input type="text" name="username" value={form.username} onChange={handleChange}
            required placeholder="Your name" className="input-field" />
        </div>

        {/* Email */}
        <div className="card p-5 space-y-1.5">
          <label className="section-label block">Email</label>
          <input type="email" value={form.email} readOnly className="input-field opacity-50 cursor-not-allowed" />
          <p className="text-[11px] text-slate-600">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div className="card p-5 space-y-1.5">
          <label className="section-label flex items-center gap-1.5"><FaPhone size={10} /> Phone</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="+91 98765 43210" className="input-field" />
        </div>

        {/* Farm location */}
        <div className="card p-5 space-y-1.5">
          <label className="section-label flex items-center gap-1.5"><FaMapMarkerAlt size={10} /> Farm location</label>
          <div className="flex gap-2">
            <input type="text" name="farmLocation" value={form.farmLocation} onChange={handleChange}
              placeholder="Village, District, State" className="input-field flex-1" />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap active:scale-95"
            >
              <FaCrosshairs size={12} />
              {locating ? "Getting…" : "Use location"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-5 space-y-1.5">
          <label className="section-label flex items-center gap-1.5"><FaInfoCircle size={10} /> Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
            placeholder="Tell us about your farm and crops..." className="input-field resize-none" />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary active:scale-95"
        >
          <FaSave size={13} />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
