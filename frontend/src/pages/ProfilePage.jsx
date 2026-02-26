import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { FaUser, FaPhone, FaMapMarkerAlt, FaInfoCircle, FaSave, FaCrosshairs } from "react-icons/fa";

const API_BASE =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5001";

function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    username: "",
    email: "",
    image: "",
    phone: "",
    farmLocation: "",
    bio: "",
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
          setForm((prev) => ({ ...prev, farmLocation: `${latitude}, ${longitude}` }));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setMessage({ type: "error", text: "Could not get your location. Please check permissions." });
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.patch(
        `${API_BASE}/api/profile`,
        {
          username: form.username,
          image: form.image || undefined,
          phone: form.phone || undefined,
          farmLocation: form.farmLocation || undefined,
          bio: form.bio || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setMessage({ type: "success", text: "Profile updated successfully" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.msg || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-slate-500">Loading profile…</div>
      </div>
    );
  }

  const inputStyle =
    "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition";

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-slate-50"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your farmer profile and farm details
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar / Image */}
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 flex items-center justify-center">
            {form.image ? (
              <img
                src={form.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-500">
                {form.username?.charAt(0)?.toUpperCase() || "F"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Profile image URL
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className={inputStyle}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            <FaUser size={12} />
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Your name"
            className={inputStyle}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            readOnly
            className={`${inputStyle} opacity-70 cursor-not-allowed`}
          />
          <p className="text-[11px] text-slate-600 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            <FaPhone size={12} />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className={inputStyle}
          />
        </div>

        {/* Farm location */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            <FaMapMarkerAlt size={12} />
            Farm location
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="farmLocation"
              value={form.farmLocation}
              onChange={handleChange}
              placeholder="Village, District, State"
              className={`${inputStyle} flex-1`}
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              <FaCrosshairs size={14} />
              {locating ? "Getting…" : "Use current location"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            <FaInfoCircle size={12} />
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about your farm and crops..."
            className={`${inputStyle} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <FaSave size={14} />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
