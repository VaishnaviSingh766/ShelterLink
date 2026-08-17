import { useState, useEffect } from "react";
import ShelterMap from "./components/ShelterMap";
import ShelterDetail from "./components/ShelterDetail";
import AuthForm from "./components/AuthForm";
import AdminDashboard from "./components/AdminDashboard";
import RequestHub from "./components/RequestHub";
import { useAuth } from "./context/AuthContext";
import { 
  Building2, 
  Map, 
  Heart, 
  Lock, 
  LogOut, 
  Search, 
  Compass, 
  Sparkles, 
  Menu, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function App() {
  const [shelters, setShelters] = useState([]);
  const [locationError, setLocationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState("find"); // "find" | "requests" | "admin"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter state for shelter list
  const [searchQuery, setSearchQuery] = useState("");

  // Toast State
  const [toasts, setToasts] = useState([]);

  const { user, logout } = useAuth();

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchShelters = (lat, lng) => {
    setIsLoading(true);
    const url = lat && lng 
      ? `http://localhost:5000/api/shelters/priority?lat=${lat}&lng=${lng}`
      : "http://localhost:5000/api/shelters";

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setShelters(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shelters:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        fetchShelters(lat, lng);
      },
      (error) => {
        console.warn("Geolocation permission denied:", error);
        setLocationError("Could not retrieve your physical location. Priority matching will exclude distance weights.");
        fetchShelters(null, null);
      }
    );
  }, []);

  // Filter shelters based on search query
  const filteredShelters = shelters.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600/10 selection:text-blue-600">
      
      {/* Dynamic Toast Notifications container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl border animate-slideIn ${
              toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" :
              toast.type === "error" ? "bg-rose-50 text-rose-800 border-rose-100" :
              "bg-slate-900 text-white border-slate-800"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />}
            <span className="text-sm font-medium leading-5 flex-grow">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 font-light text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Sticky Header Nav */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("find"); setSelectedShelter(null); }}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                ShelterLink
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Community Aid Platform</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
            <button
              onClick={() => { setActiveTab("find"); setSelectedShelter(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "find" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Map className="w-4 h-4" /> Find Shelters
            </button>
            <button
              onClick={() => { setActiveTab("requests"); setSelectedShelter(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "requests" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Heart className="w-4 h-4" /> NGO Help Hub
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setSelectedShelter(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "admin" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lock className="w-4 h-4" /> Admin Portal
            </button>
          </nav>

          {/* Desktop Right Auth Control */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-3">{user.name}</p>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Administrator</span>
                </div>
                <button
                  onClick={() => { logout(); addToast("Logged out successfully", "info"); }}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold px-3 py-2 rounded-xl text-xs transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setActiveTab("admin"); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition hover:shadow duration-200"
              >
                Admin Log In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white py-4 px-6 space-y-3 animate-slideDown">
            <button
              onClick={() => { setActiveTab("find"); setSelectedShelter(null); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                activeTab === "find" ? "bg-slate-100 text-slate-900" : "text-slate-600"
              }`}
            >
              <Map className="w-4 h-4" /> Find Shelters
            </button>
            <button
              onClick={() => { setActiveTab("requests"); setSelectedShelter(null); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                activeTab === "requests" ? "bg-slate-100 text-slate-900" : "text-slate-600"
              }`}
            >
              <Heart className="w-4 h-4" /> NGO Help Hub
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setSelectedShelter(null); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                activeTab === "admin" ? "bg-slate-100 text-slate-900" : "text-slate-600"
              }`}
            >
              <Lock className="w-4 h-4" /> Admin Portal
            </button>
            <hr className="border-slate-100" />
            {user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Admin Mode</span>
                </div>
                <button
                  onClick={() => { logout(); addToast("Logged out successfully", "info"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1 bg-slate-100 text-slate-600 font-bold px-3 py-2 rounded-xl text-xs transition"
                >
                  <LogOut className="w-4 h-4" /> Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm shadow text-center block"
              >
                Admin Log In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {locationError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 flex items-center gap-3 text-xs md:text-sm font-medium">
            <Compass className="w-5 h-5 text-amber-600 flex-shrink-0 animate-spin-slow" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Tab 1: Find Shelters (Map & List view) */}
        {activeTab === "find" && (
          <div>
            {selectedShelter ? (
              <ShelterDetail
                shelter={selectedShelter}
                onBack={() => setSelectedShelter(null)}
                addToast={addToast}
              />
            ) : (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Search and Title section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Shelter Directory</h2>
                    <p className="text-sm text-slate-400 font-light mt-0.5">Explore available shelter beds and vital assistance networks.</p>
                  </div>
                  <div className="relative w-full md:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by shelter or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition bg-white"
                    />
                  </div>
                </div>

                {/* Google Map Panel */}
                <section className="bg-white border border-slate-100 rounded-3xl p-2 shadow-sm overflow-hidden">
                  <div className="rounded-2xl overflow-hidden">
                    <ShelterMap shelters={filteredShelters} />
                  </div>
                </section>

                {/* Shelters Grid List */}
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    Shelters Available {filteredShelters.length > 0 && `(${filteredShelters.length})`}
                  </h3>

                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-3 text-xs text-slate-500 font-medium">Updating shelter lists...</p>
                    </div>
                  )}

                  {!isLoading && filteredShelters.length === 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h4 className="text-base font-bold text-slate-700">No shelters found</h4>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                        No shelters matched your search query. Try typing another location or keyword.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShelters.map((shelter) => (
                      <button
                        key={shelter._id}
                        onClick={() => setSelectedShelter(shelter)}
                        className="text-left bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all flex flex-col justify-between h-56 cursor-pointer relative group"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition">
                              {shelter.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              shelter.urgencyLevel >= 4 ? "bg-red-50 text-red-600 border border-red-100" :
                              shelter.urgencyLevel >= 3 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                              Level {shelter.urgencyLevel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-light mt-1 flex items-center gap-0.5">
                            <Compass className="w-3.5 h-3.5" /> {shelter.address}
                          </p>
                        </div>

                        <div className="space-y-4 mt-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
                              {shelter.availableBeds} beds available
                            </span>
                            {shelter.foodAvailable && (
                              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl">
                                Food Ready
                              </span>
                            )}
                            {shelter.suppliesAvailable && (
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
                                Supplies
                              </span>
                            )}
                          </div>

                          {shelter.distanceKm !== undefined && (
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500 font-light">
                              <span>Distance: <span className="font-semibold text-slate-700">{shelter.distanceKm} km away</span></span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: NGO Aid Requests Hub */}
        {activeTab === "requests" && (
          <RequestHub userLocation={userLocation} addToast={addToast} />
        )}

        {/* Tab 3: Admin Portal */}
        {activeTab === "admin" && (
          <div>
            {user ? (
              <AdminDashboard addToast={addToast} />
            ) : (
              <div className="py-8">
                <AuthForm onSuccess={() => addToast(`Welcome back, ${user ? user.name : "Admin"}!`, "success")} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Styled Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs font-light mt-auto">
        <p>© 2026 ShelterLink Project. Built for community resilience and direct NGO cooperation.</p>
      </footer>
    </div>
  );
}

export default App;