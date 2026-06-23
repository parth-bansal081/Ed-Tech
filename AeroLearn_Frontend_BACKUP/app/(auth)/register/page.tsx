"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    primaryLanguage: "en",
    disability: "none",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Data Saved Locally:", formData);
    // After saving, push user to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a051b] text-white font-sans p-4">
      <div className="w-full max-w-md bg-[#130b2e] border border-[#23154d] rounded-2xl p-8 shadow-2xl">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-purple-400 flex items-center justify-center gap-2">
            ⚡ AeroLearn
          </h1>
          <p className="text-xs text-gray-400 mt-2">Create your custom accessibility profile 🚀</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Your Email Address ✉️
            </label>
            <input
              type="email"
              required
              className="w-full bg-[#0d0722] border border-[#2b1b5c] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="name@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Your Secret Password 🔑
            </label>
            <input
              type="password"
              required
              className="w-full bg-[#0d0722] border border-[#2b1b5c] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Primary Language */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Preferred Base Language 🌐
            </label>
            <select
              className="w-full bg-[#0d0722] border border-[#2b1b5c] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-300"
              value={formData.primaryLanguage}
              onChange={(e) => setFormData({ ...formData, primaryLanguage: e.target.value })}
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
            </select>
          </div>

          {/* Accommodations / Disability Flags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Accessibility Adaptation 🛠️
            </label>
            <select
              className="w-full bg-[#0d0722] border border-[#2b1b5c] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-300"
              value={formData.disability}
              onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
            >
              <option value="none">Standard Mode (No Assistance)</option>
              <option value="visual">Visual Mode (Voice Commands & Text-to-Speech)</option>
              <option value="auditory">Auditory Mode (Sign Language Avatar & Highlights)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] text-sm tracking-wide"
          >
            REGISTER & EXPLORE! 🚀
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Already registered?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Log In here 🔑
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}