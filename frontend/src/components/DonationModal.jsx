import { useState } from "react";
import { CreditCard, CheckCircle, Shield, X, Heart, Printer } from "lucide-react";

function DonationModal({ shelter, onClose, addToast }) {
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null); // stores receipt details on success

  // Identify card type (Visa/Mastercard)
  const getCardType = (number) => {
    const clean = number.replace(/\D/g, "");
    if (clean.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(clean)) return "mastercard";
    return "generic";
  };

  // Card Number Formatter (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
  };

  // Expiry date formatter (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpiry(value.substring(0, 5));
  };

  // CVC digits only (max 3 digits)
  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCvc(value.substring(0, 3));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      addToast("Please enter a valid donation amount", "error");
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe payment network latency (2 seconds)
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/donations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shelter: shelter._id,
            donorName: donorName || "Anonymous Supporter",
            amount: Number(amount),
            email: email,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to process payment");
        }

        // Generate mock transaction code
        const transactionId = "TXN-" + Math.floor(100000000 + Math.random() * 900000000);
        
        setReceipt({
          transactionId,
          shelterName: shelter.name,
          donorName: donorName || "Anonymous Supporter",
          amount: Number(amount),
          email,
          date: new Date().toLocaleString(),
        });

        addToast(`Successfully donated $${amount} to ${shelter.name}!`, "success");
      } catch (err) {
        addToast(err.message, "error");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const cardBrand = getCardType(cardNumber);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoomIn relative">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10 p-1 hover:bg-slate-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        {!receipt ? (
          <div>
            {/* Visual Credit Card Preview Container */}
            <div className="bg-slate-900 p-6 flex flex-col items-center justify-center relative">
              <div className="absolute top-6 left-6 text-white/5">
                <Heart className="w-36 h-36 fill-current stroke-0" />
              </div>
              
              {/* Virtual Card Wrapper */}
              <div className="w-full max-w-[320px] aspect-[1.586/1] rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-950 p-5 text-white flex flex-col justify-between shadow-lg relative border border-white/10 overflow-hidden font-mono">
                <div className="flex justify-between items-start">
                  {/* EMV Microchip graphic */}
                  <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 opacity-90 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-30 p-0.5">
                      <div className="border border-slate-900/40"></div>
                      <div className="border border-slate-900/40"></div>
                      <div className="border border-slate-900/40"></div>
                    </div>
                  </div>
                  
                  {/* Card type logo */}
                  {cardBrand === "visa" && (
                    <span className="text-xl font-bold tracking-tight text-white italic">VISA</span>
                  )}
                  {cardBrand === "mastercard" && (
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <div className="w-6 h-6 rounded-full bg-amber-500/90"></div>
                    </div>
                  )}
                  {cardBrand === "generic" && (
                    <CreditCard className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Live formatted number */}
                  <p className="text-base tracking-widest text-white/95">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[7px] text-slate-400 font-sans uppercase">Card Holder</p>
                      <p className="text-xs uppercase tracking-wider text-slate-100 max-w-[170px] truncate">
                        {donorName || "Your Name"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-400 font-sans uppercase">Expires</p>
                      <p className="text-xs tracking-wider text-slate-100">
                        {expiry || "MM/YY"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form Fields */}
            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5">
                  Secure Checkout
                </h3>
                <p className="text-xs text-slate-400 font-light">
                  Support <span className="font-semibold text-slate-600">{shelter.name}</span>. Funds go directly to active operational requests.
                </p>
              </div>

              {/* Amount field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Donation Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount (e.g. 50)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold outline-none transition"
                />
              </div>

              {/* Name and Email grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                  />
                </div>
              </div>

              {/* Card Inputs Grid */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      value={cvc}
                      onChange={handleCvcChange}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Shield SSL label */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted 256-bit SSL Connection (Stripe sandbox simulation)</span>
              </div>

              {/* Submit pay */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-2xl shadow-md transition hover:shadow duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <span>Donate ${amount ? amount : ""}</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Receipt panel on successful transaction */
          <div className="p-6 md:p-8 space-y-6 text-center animate-fadeIn font-sans">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Successful</h3>
              <p className="text-xs text-slate-400 font-light">Thank you for your generous donation!</p>
            </div>

            {/* Receipt Card Detail */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 font-mono text-xs text-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-bold text-slate-900">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-slate-900">{receipt.shelterName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Donor Name:</span>
                <span className="font-bold text-slate-900">{receipt.donorName}</span>
              </div>
              {receipt.email && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-bold text-slate-900">{receipt.email}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/60 text-sm">
                <span className="text-slate-500 font-bold">Amount Paid:</span>
                <span className="font-extrabold text-blue-600">${receipt.amount.toFixed(2)} USD</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2">
                Date: {receipt.date}
              </div>
            </div>

            {/* Receipt buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationModal;
