import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  MapPin, 
  Bed, 
  Activity, 
  Utensils, 
  Package, 
  Navigation,
  Compass
} from "lucide-react";

function AddShelterForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [availableBeds, setAvailableBeds] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState(1);
  const [foodAvailable, setFoodAvailable] = useState(false);
  const [suppliesAvailable, setSuppliesAvailable] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const { token } = useAuth();

  // Auto-detect browser coordinates
  const detectCoordinates = () => {
    setDetectingGps(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setDetectingGps(false);
      },
      (err) => {
        console.warn(err);
        setError("Location permission denied. Please enter coordinates manually.");
        setDetectingGps(false);
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/shelters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          address,
          availableBeds: Number(availableBeds),
          urgencyLevel: Number(urgencyLevel),
          foodAvailable,
          suppliesAvailable,
          location: {
            lat: Number(lat),
            lng: Number(lng),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create shelter");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> Register Shelter
        </h3>
        <p className="text-xs text-slate-400 font-light mt-1">
          Create a new shelter location. Registered locations sync instantly on our public search directory.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Shelter Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="e.g. Hope Alliance Center"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            placeholder="e.g. 5th Main St, Richmond Road"
            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
          />
        </div>

        {/* Location Coordinates */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
              Coordinates (Latitude & Longitude)
            </label>
            <button
              type="button"
              onClick={detectCoordinates}
              disabled={detectingGps}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Navigation className="w-3 h-3 animate-pulse" />
              {detectingGps ? "Locating..." : "Auto-Detect GPS"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(event) => setLat(event.target.value)}
                required
                placeholder="Latitude (e.g. 12.9716)"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(event) => setLng(event.target.value)}
                required
                placeholder="Longitude (e.g. 77.5946)"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Available Beds and Urgency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Available Beds
            </label>
            <input
              type="number"
              min="0"
              value={availableBeds}
              onChange={(event) => setAvailableBeds(event.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Urgency level (1-5)
            </label>
            <select
              value={urgencyLevel}
              onChange={(event) => setUrgencyLevel(event.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none bg-white transition"
            >
              <option value={1}>1 - Low Priority</option>
              <option value={2}>2 - Standard</option>
              <option value={3}>3 - Elevated</option>
              <option value={4}>4 - High Urgency</option>
              <option value={5}>5 - Critical Need</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6 py-2 border-y border-slate-100">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={foodAvailable}
              onChange={(event) => setFoodAvailable(event.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Food Available
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suppliesAvailable}
              onChange={(event) => setSuppliesAvailable(event.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Supplies Available
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-2.5 rounded-xl shadow-md transition disabled:bg-slate-400 cursor-pointer hover:shadow"
        >
          {isSubmitting ? "Creating Shelter..." : "Register Location"}
        </button>
      </form>
    </div>
  );
}

export default AddShelterForm;