import { useState } from "react";
import ShelterMap from "./ShelterMap";
import RequestForm from "./RequestForm";
import DonationModal from "./DonationModal";
import { ArrowLeft, Compass, Bed, Utensils, Package, Heart, Award } from "lucide-react";

function ShelterDetail({ shelter, onBack, addToast }) {
  const [showDonate, setShowDonate] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-slate-500 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details + Map (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Title, Address & Donate Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {shelter.name}
                  </h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    shelter.urgencyLevel >= 4 ? "bg-red-50 text-red-700 border-red-100" :
                    shelter.urgencyLevel >= 3 ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    Urgency: {shelter.urgencyLevel}/5
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-light flex items-center gap-1">
                  <Compass className="w-4 h-4" />
                  {shelter.address}
                </p>
              </div>

              {/* Donation button */}
              <button
                onClick={() => setShowDonate(true)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition hover:shadow duration-200 cursor-pointer select-none self-start sm:self-auto"
              >
                <Heart className="w-4 h-4 fill-current text-white animate-pulse" /> Support Shelter
              </button>
            </div>

            {/* Badges Info */}
            <div className="flex flex-wrap gap-3 py-2 border-y border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-xl">
                <Bed className="w-4 h-4" />
                <span>{shelter.availableBeds} beds currently available</span>
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl ${
                shelter.foodAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
              }`}>
                <Utensils className="w-4 h-4" />
                <span>Meal services {shelter.foodAvailable ? "active" : "inactive"}</span>
              </div>

              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl ${
                shelter.suppliesAvailable ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"
              }`}>
                <Package className="w-4 h-4" />
                <span>Critical supplies {shelter.suppliesAvailable ? "available" : "depleted"}</span>
              </div>
            </div>

            {/* Distance representation without priority score text */}
            {shelter.distanceKm !== undefined && shelter.distanceKm !== null && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-light">
                <Compass className="w-5 h-5 text-blue-500 animate-spin-slow" />
                <span>
                  This location is registered <span className="font-semibold text-slate-900">{shelter.distanceKm} km away</span> from your current coordinates.
                </span>
              </div>
            )}

            {/* Interactive Map (single marker focus) */}
            <div className="rounded-2xl overflow-hidden border border-slate-150 shadow-sm">
              <ShelterMap shelters={[shelter]} focusedShelter={shelter} />
            </div>

          </div>
        </div>

        {/* Right Column: Request Form (1/3 width on desktop) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <RequestForm 
              shelters={[shelter]} 
              defaultShelterId={shelter._id} 
              addToast={addToast}
            />
          </div>
        </div>

      </div>

      {/* Donation Modal popup */}
      {showDonate && (
        <DonationModal
          shelter={shelter}
          onClose={() => setShowDonate(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}

export default ShelterDetail;