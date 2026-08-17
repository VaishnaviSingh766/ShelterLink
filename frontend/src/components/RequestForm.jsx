import { useState } from "react";
import { HelpCircle, Layers, ListTodo, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

function RequestForm({ shelters, defaultShelterId, addToast }) {
  const [shelterId, setShelterId] = useState(defaultShelterId || "");
  const [resourceType, setResourceType] = useState("beds");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shelter: shelterId,
          resourceType: resourceType,
          quantity: quantity,
          notes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create request");
      }

      setShelterId(defaultShelterId || "");
      setResourceType("beds");
      setQuantity(1);
      setNotes("");
      setSubmitStatus("success");
      if (addToast) {
        addToast("Resource request submitted successfully!", "success");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setSubmitStatus("error");
      if (addToast) {
        addToast("Failed to submit request. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" /> Request Resources
        </h3>
        <p className="text-xs text-slate-400 font-light mt-1">
          Are resources running low? Submit a request for food, beds, or supplies. NGOs can view and fulfill this request on the Help Hub.
        </p>
      </div>

      {submitStatus === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Your request has been published to the public NGO Support Hub.</span>
        </div>
      )}
      {submitStatus === "error" && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>We encountered an issue submitting your request. Please check inputs and try again.</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Shelter selection - only show if there isn't a default shelter lock */}
        {!defaultShelterId && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Target Shelter Location
            </label>
            <div className="relative">
              <select
                value={shelterId}
                onChange={(event) => setShelterId(event.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition"
              >
                <option value="">-- Choose a shelter --</option>
                {shelters.map((shelter) => (
                  <option key={shelter._id} value={shelter._id}>
                    {shelter.name} ({shelter.address})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Resource and Quantity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Needed Resource Type
            </label>
            <div className="relative">
              <select
                value={resourceType}
                onChange={(event) => setResourceType(event.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition"
              >
                <option value="beds">Beds / Open Slots</option>
                <option value="food">Meals / Food Rations</option>
                <option value="supplies">General Supplies (Blankets, Kits)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Required Quantity
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
            Additional context / Notes
          </label>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Provide context e.g. 'Looking for 15 heavy winter blankets as temperatures are dropping next week.'"
              rows="3"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
      >
        {isSubmitting ? "Submitting Request..." : "Submit Aid Request"}
      </button>
    </form>
  );
}

export default RequestForm;