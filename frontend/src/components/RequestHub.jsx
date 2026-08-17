import { useState, useEffect } from "react";
import { 
  Heart, 
  Search, 
  Filter, 
  MapPin, 
  Award, 
  Clock, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

function RequestHub({ userLocation, addToast }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, fulfilled, all

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/requests");
      if (!response.ok) throw new Error("Failed to load active requests");
      const data = await response.json();
      
      // Calculate distances & priority scores dynamically if userLocation is available
      const computedRequests = data.map(req => {
        if (!req.shelter) return req;

        const shelter = req.shelter;
        let distanceKm = null;
        let priorityScore = shelter.urgencyLevel * 10 + Math.max(50 - shelter.availableBeds, 0);

        if (userLocation && shelter.location) {
          distanceKm = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shelter.location.lat,
            shelter.location.lng
          );
          const distanceWeight = Math.max(50 - distanceKm, 0);
          priorityScore += distanceWeight;
        }

        return {
          ...req,
          distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
          priorityScore: Math.round(priorityScore)
        };
      });

      // Sort by priorityScore descending by default
      computedRequests.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

      setRequests(computedRequests);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Haversine formula helper
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const earthRadiusKm = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  // Handle fulfill request
  const handleFulfill = async (id, name, shelterName) => {
    if (!window.confirm(`Are you ready to commit to fulfilling the request for ${name} from ${shelterName}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "fulfilled" })
      });

      if (!response.ok) throw new Error("Could not update request status");

      const updated = await response.json();
      
      // Update local state
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: "fulfilled" } : r));
      addToast(`Thank you! Fulfilling request for ${shelterName}.`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (!req.shelter) return false;

    // Search query: check shelter name or notes
    const matchesSearch = 
      req.shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (req.notes && req.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Resource Filter
    const matchesResource = resourceFilter === "all" || req.resourceType === resourceFilter;

    // Urgency Filter
    const matchesUrgency = urgencyFilter === "all" || req.shelter.urgencyLevel.toString() === urgencyFilter;

    // Status Filter
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && req.status === "pending") || 
      (statusFilter === "fulfilled" && req.status === "fulfilled");

    return matchesSearch && matchesResource && matchesUrgency && matchesStatus;
  });

  const totalPending = requests.filter(r => r.status === "pending").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading active aid requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-300 fill-red-300 animate-pulse" /> NGO Support Hub
          </h2>
          <p className="text-emerald-100 mt-2 font-light">
            Review live requests for beds, meals, and emergency supplies submitted directly by shelter operators.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-xl text-center self-start md:self-auto min-w-[150px]">
          <p className="text-xs uppercase font-bold text-emerald-200 tracking-wider">Unfulfilled Needs</p>
          <p className="text-3xl font-black mt-1">{totalPending}</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative col-span-1 md:col-span-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by shelter name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
          />
        </div>

        {/* Resource Filter */}
        <div>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white transition"
          >
            <option value="all">All Resources</option>
            <option value="beds">Beds Only</option>
            <option value="food">Meals/Food</option>
            <option value="supplies">Supplies</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white transition"
          >
            <option value="pending">Pending Only</option>
            <option value="fulfilled">Fulfilled Only</option>
            <option value="all">Show All Requests</option>
          </select>
        </div>
      </div>

      {/* Results Count and Badges */}
      <div className="flex justify-between items-center px-1">
        <p className="text-sm font-semibold text-slate-500">
          Showing {filteredRequests.length} results
        </p>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setUrgencyFilter("all")}
            className={`px-3 py-1 rounded-full font-bold transition border ${
              urgencyFilter === "all" 
                ? "bg-slate-800 text-white border-slate-800" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Urgencies
          </button>
          <button
            onClick={() => setUrgencyFilter("5")}
            className={`px-3 py-1 rounded-full font-bold transition border ${
              urgencyFilter === "5" 
                ? "bg-red-600 text-white border-red-600" 
                : "bg-white text-red-600 border-red-200 hover:bg-red-50"
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* Grid of Requests */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-base font-bold text-slate-700">No matching requests found</h4>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filters to explore other community support needs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map(req => {
            const isCritical = req.shelter.urgencyLevel >= 4;

            return (
              <div 
                key={req._id}
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300/80 relative overflow-hidden ${
                  req.status === "fulfilled" ? "opacity-60 border-slate-100 bg-slate-50/50" : "border-slate-100"
                }`}
              >
                {/* Visual urgency border */}
                {!req.status === "fulfilled" && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isCritical ? "bg-red-500" : "bg-emerald-500"
                  }`} />
                )}

                {/* Top Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4 pl-1">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        req.resourceType === "beds" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        req.resourceType === "food" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}>
                        {req.resourceType}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-1.5">
                        {req.quantity} {req.resourceType.toUpperCase()}
                      </h3>
                    </div>

                    {/* Hidden score element to keep sorting active */}
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
                    <p className="text-sm font-bold text-slate-800">{req.shelter.name}</p>
                    <p className="text-xs text-slate-500 font-light flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {req.shelter.address} 
                      {req.distanceKm !== null && (
                        <span className="font-semibold text-slate-700 ml-1">
                          ({req.distanceKm} km away)
                        </span>
                      )}
                    </p>
                  </div>

                  {req.notes && (
                    <div className="pl-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Organizer Note:</p>
                      <p className="text-sm text-slate-600 mt-1 italic font-light bg-slate-50 p-2.5 rounded-lg border-l-2 border-emerald-500">
                        "{req.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between pl-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-light">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {new Date(req.createdAt).toLocaleDateString()}
                  </span>

                  {req.status === "pending" ? (
                    <button
                      onClick={() => handleFulfill(req._id, `${req.quantity} ${req.resourceType}`, req.shelter.name)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition hover:shadow flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" /> Fulfill Need
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-500" /> Fulfilled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RequestHub;
