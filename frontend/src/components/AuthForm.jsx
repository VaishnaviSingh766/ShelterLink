import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const endpoint = mode === "login" ? "login" : "signup";
    const body =
      mode === "login" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid authentication credentials");
      }

      login(data.user, data.token);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden animate-fadeIn">
      {/* Decorative Brand Header */}
      <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 px-6 py-8 text-center text-white relative">
        <div className="absolute top-4 right-4 text-white/10">
          <ShieldCheck className="w-24 h-24 stroke-[1]" />
        </div>
        <h3 className="text-2xl font-black tracking-tight">
          {mode === "login" ? "Admin Security Portal" : "Join ShelterLink"}
        </h3>
        <p className="text-xs text-blue-100/80 font-light mt-1 max-w-[280px] mx-auto">
          {mode === "login"
            ? "Sign in using your operator credentials to manage your listings."
            : "Register your administrative account to publish and update beds."}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="operator@shelter.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Operator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition disabled:bg-slate-400 hover:shadow mt-2"
          >
            {isSubmitting
              ? "Authenticating..."
              : mode === "login"
              ? "Access Account"
              : "Register Account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="text-blue-600 hover:text-blue-700 text-xs font-bold w-full text-center block"
        >
          {mode === "login"
            ? "Need to register a shelter? Create an administrator account"
            : "Already have an administrative account? Log in"}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;