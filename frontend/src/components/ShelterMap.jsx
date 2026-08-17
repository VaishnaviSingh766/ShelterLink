import { useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { Compass, AlertCircle } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "380px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

// Subtle silver styled theme for modern appearance
const mapOptions = {
  disableDefaultUI: true, // cleaner UX
  zoomControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#f3f4f6" }], // Tailwind slate-100
    },
    {
      featureType: "poi",
      elementType: "geometry.fill",
      stylers: [{ color: "#e5e7eb" }], // Tailwind slate-200
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#bfdbfe" }], // Tailwind blue-200
    },
  ],
};

function ShelterMap({ shelters = [], focusedShelter }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedShelter, setSelectedShelter] = useState(null);

  if (loadError) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl h-[380px] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <h4 className="font-bold text-slate-800 text-sm">Failed to load Map API</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Google Maps failed to initialize. Please check your API key settings or network connection.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-slate-50 rounded-2xl h-[380px] flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <Compass className="w-10 h-10 text-blue-500 mb-2 animate-spin-slow" />
        <h4 className="font-bold text-slate-600 text-sm">Rendering Satellite Map...</h4>
      </div>
    );
  }

  const mapCenter = focusedShelter && focusedShelter.location
    ? { lat: Number(focusedShelter.location.lat), lng: Number(focusedShelter.location.lng) }
    : defaultCenter;

  const mapZoom = focusedShelter ? 15 : 12;
  const sheltersToShow = focusedShelter ? [focusedShelter] : shelters;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={mapZoom}
      options={mapOptions}
    >
      {sheltersToShow
        .filter(s => s && s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number")
        .map((shelter) => (
          <Marker
            key={shelter._id}
            position={{ lat: shelter.location.lat, lng: shelter.location.lng }}
            onClick={() => setSelectedShelter(shelter)}
          />
        ))}

      {selectedShelter && (
        <InfoWindow
          position={{
            lat: selectedShelter.location.lat,
            lng: selectedShelter.location.lng,
          }}
          onCloseClick={() => setSelectedShelter(null)}
        >
          <div className="p-2 min-w-[160px] font-sans">
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{selectedShelter.name}</h4>
            <p className="text-xs text-slate-500 mt-1 font-light">{selectedShelter.address}</p>
            <div className="mt-2 flex items-center justify-between text-xs font-semibold bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Available Beds:</span>
              <span className="text-blue-600">{selectedShelter.availableBeds}</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default ShelterMap;