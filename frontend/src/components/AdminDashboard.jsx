import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Bed, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  Package, 
  Plus, 
  Compass,
  AlertCircle,
  Clock,
  Heart,
  DollarSign
} from "lucide-react";
import AddShelterForm from "./AddShelterForm";

function AdminDashboard({ addToast }) {
  const { token, user } = useAuth();
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals / Editing state
  const [isAdding, setIsAdding] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [activeShelterId, setActiveShelterId] = useState(null); // Selected shelter to view requests for

  // Form states for editing
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBeds, setEditBeds] = useState(0);
  const [editUrgency, setEditUrgency] = useState(1);
  const [editFood, setEditFood] = useState(false);
  const [editSupplies, setEditSupplies] = useState(false);
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Fetch admin's shelters
      const shelterRes = await fetch("http://localhost:5000/api/shelters/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!shelterRes.ok) throw new Error("Failed to load your shelters");
      const shelterData = await shelterRes.json();
      setShelters(shelterData);

      // 2. Fetch all requests to filter
      const requestRes = await fetch("http://localhost:5000/api/requests");
      if (!requestRes.ok) throw new Error("Failed to load requests");
      const requestData = await requestRes.json();
      setRequests(requestData);

      // 3. Fetch admin's donations ledger
      const donationRes = await fetch("http://localhost:5000/api/donations/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (donationRes.ok) {
        const donationData = await donationRes.json();
        setDonations(donationData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests that belong to this admin's shelters
  const adminRequests = requests.filter(req => 
    req.shelter && shelters.some(s => s._id === req.shelter._id)
  );

  // Group pending requests count
  const pendingRequestsCount = adminRequests.filter(req => req.status === "pending").length;
  
  // Total beds managed
  const totalBeds = shelters.reduce((acc, curr) => acc + curr.availableBeds, 0);

  // Total funds raised
  const totalFunds = donations.reduce((acc, curr) => acc + curr.amount, 0);

  // Handle Edit click
  const startEdit = (shelter) => {
    setEditingShelter(shelter);
    setEditName(shelter.name);
    setEditAddress(shelter.address);
    setEditBeds(shelter.availableBeds);
    setEditUrgency(shelter.urgencyLevel);
    setEditFood(shelter.foodAvailable);
    setEditSupplies(shelter.suppliesAvailable);
    setEditLat(shelter.location.lat);
    setEditLng(shelter.location.lng);
  };

  // Handle Edit Submit (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/shelters/${editingShelter._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          address: editAddress,
          availableBeds: Number(editBeds),
          urgencyLevel: Number(editUrgency),
          foodAvailable: editFood,
          suppliesAvailable: editSupplies,
          location: {
            lat: Number(editLat),
            lng: Number(editLng)
          }
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update shelter");
      }

      const updated = await response.json();
      setShelters(prev => prev.map(s => s._id === updated._id ? updated : s));
      setEditingShelter(null);
      addToast("Shelter updated successfully", "success");
      fetchAdminData(); // Refresh list to update potential requests bindings
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Shelter (DELETE)
  const handleDeleteShelter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shelter? This action cannot be undone.")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/shelters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete shelter");
      }

      setShelters(prev => prev.filter(s => s._id !== id));
      addToast("Shelter deleted successfully", "success");
      fetchAdminData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // Handle Fulfill Request (PUT)
  const handleFulfillRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "fulfilled" })
      });

      if (!response.ok) throw new Error("Failed to fulfill request");

      const updatedReq = await response.json();
      setRequests(prev => prev.map(r => r._id === requestId ? updatedReq : r));
      addToast("Request marked as fulfilled!", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // Handle Delete Request (DELETE)
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this resource request?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete request");

      setRequests(prev => prev.filter(r => r._id !== requestId));
      addToast("Request deleted successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Control Panel</h2>
          <p className="text-blue-100 mt-2 font-light">
            Manage your shelter registrations, update real-time capacities, and respond to community aid requests.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="self-start md:self-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" /> Register Shelter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Shelters</p>
            <p className="text-2xl font-bold text-slate-900">{shelters.length}</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Beds Managed</p>
            <p className="text-2xl font-bold text-slate-900">{totalBeds}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Requests</p>
            <p className="text-2xl font-bold text-slate-900">{pendingRequestsCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Funds Raised</p>
            <p className="text-2xl font-bold text-slate-900">${totalFunds.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid: My Shelters List */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Shelters List</h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Real-time Sync
            </span>
          </div>

          {shelters.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-base font-semibold text-slate-700">No shelters registered yet</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Register your first shelter to start offering beds, and posting resource requests for NGOs to fulfill.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Add Shelter
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {shelters.map(shelter => {
                const shelterRequests = adminRequests.filter(req => req.shelter && req.shelter._id === shelter._id);
                const pendingCount = shelterRequests.filter(req => req.status === "pending").length;

                return (
                  <div key={shelter._id} className="p-6 transition hover:bg-slate-50/50">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      {/* Shelter Details */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-slate-900">{shelter.name}</h4>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            shelter.urgencyLevel >= 4 ? "bg-red-50 text-red-600 border border-red-100" :
                            shelter.urgencyLevel >= 3 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            Urgency {shelter.urgencyLevel}/5
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-light flex items-center gap-1">
                          <Compass className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          {shelter.address} <span className="text-slate-300">|</span> Lat: {shelter.location.lat}, Lng: {shelter.location.lng}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                            <Bed className="w-3.5 h-3.5" /> {shelter.availableBeds} Beds available
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                            shelter.foodAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            <Utensils className="w-3.5 h-3.5" /> Food {shelter.foodAvailable ? "Ready" : "None"}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                            shelter.suppliesAvailable ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            <Package className="w-3.5 h-3.5" /> Supplies {shelter.suppliesAvailable ? "Ready" : "None"}
                          </span>
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} Needs attention
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Shelter Actions */}
                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                        <button
                          onClick={() => setActiveShelterId(activeShelterId === shelter._id ? null : shelter._id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            activeShelterId === shelter._id 
                              ? "bg-slate-800 text-white" 
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {activeShelterId === shelter._id ? "Close Requests" : `Requests (${shelterRequests.length})`}
                        </button>
                        <button
                          onClick={() => startEdit(shelter)}
                          className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl transition"
                          title="Edit Shelter"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShelter(shelter._id)}
                          className="p-2 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition"
                          title="Delete Shelter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Requests Panel */}
                    {activeShelterId === shelter._id && (
                      <div className="mt-6 border-t border-slate-100 pt-6 animate-slideDown">
                        <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                          Resource Requests for {shelter.name}
                        </h5>

                        {shelterRequests.length === 0 ? (
                          <p className="text-sm text-slate-400 font-light italic">
                            No requests have been filed for this shelter. Any visitor can request supplies on the detail page.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shelterRequests.map(req => (
                              <div 
                                key={req._id} 
                                className={`border rounded-xl p-4 relative ${
                                  req.status === "fulfilled" 
                                    ? "bg-slate-50/50 border-slate-100 opacity-60" 
                                    : "bg-white border-slate-200 shadow-sm"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-800 capitalize">
                                        {req.resourceType} ({req.quantity})
                                      </span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        req.status === "fulfilled" 
                                          ? "bg-slate-200 text-slate-600" 
                                          : "bg-amber-100 text-amber-700"
                                      }`}>
                                        {req.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 font-light flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      Created {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                    {req.notes && (
                                      <p className="text-xs bg-slate-50 text-slate-600 p-2 rounded-lg mt-2 font-mono">
                                        Note: "{req.notes}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {req.status === "pending" && (
                                      <button
                                        onClick={() => handleFulfillRequest(req._id)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                        title="Mark Fulfilled"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteRequest(req._id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete Request"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Donations Ledger Received */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Donations Ledger
          </h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Funding History
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-600">No donations received yet</h4>
            <p className="text-xs text-slate-400 mt-1">
              Public visitors can support you by clicking the Heart button on your shelter detail page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Shelter</th>
                  <th className="px-6 py-3">Donor Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-light">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{d.shelter ? d.shelter.name : "Unknown Shelter"}</td>
                    <td className="px-6 py-4">{d.donorName}</td>
                    <td className="px-6 py-4">{d.email}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">${d.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Shelter Dialog */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-zoomIn">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <AddShelterForm 
              onSuccess={(newShelter) => {
                setShelters(prev => [...prev, newShelter]);
                setIsAdding(false);
                addToast(`${newShelter.name} created successfully!`, "success");
                fetchAdminData();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Shelter Dialog */}
      {editingShelter && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-zoomIn">
            <button
              onClick={() => setEditingShelter(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Shelter Details
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Shelter Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Available Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editBeds}
                    onChange={(e) => setEditBeds(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Urgency Level (1-5)
                  </label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value)}
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

              <div className="flex gap-6 py-2 border-y border-slate-100">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editFood}
                    onChange={(e) => setEditFood(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Food Available
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editSupplies}
                    onChange={(e) => setEditSupplies(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Supplies Available
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShelter(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
