"use client";
import { useRouter } from "next/navigation";  

export default function AboutPage() {
  const router = useRouter(); 
    const currentYear = new Date().getFullYear();
  return (
     <div className="min-h-screen bg-gray-100 -mt-6 -mx-6">
      
      {/* Top Header */}
    <div className="bg-gray-200 text-black text-center py-3 font-semibold text-sm tracking-wide -mx-6 border-b border-white/20 backdrop-blur-sm shadow-sm">
  About
</div> 

      {/* Content Wrapper */}
      <div className="px-6 py-6">

        {/* Copyright Section */}
        <div className="text-sm text-gray-700 mb-6">
          <p className="font-semibold">
            © 2025-{currentYear} NirvanaSoftTech Inc. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed">
            Warning: This computer program is protected by copyright law and
            international treaties. Unauthorized reproduction or distribution
            of this program, or any portion of it, may result in severe civil
            and criminal penalties, and will be prosecuted to the maximum
            extent possible under the law.
          </p>
        </div>

        {/* License Info Box */}
        <div className="bg-[rgb(211,211,211)] p-5 border border-white/30 backdrop-blur-sm shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 ">
            This product is licensed to:
          </h2>

          <div className="space-y-2 text-sm text-gray-800">
            <p><span className="font-semibold">Name:</span> Internal</p>
            <p><span className="font-semibold">Version:</span> 9d409a974</p>
            <p>
              <span className="font-semibold">Commit Hash:</span>{" "}
              d409a97490ad81371ebd88d015d45347df8dd1e4
            </p>
            <p>
              <span className="font-semibold">Branch:</span>{" "}
              Progressive_Meter_pechanga
            </p>
            <p>
              <span className="font-semibold">Release Date:</span>{" "}
              2026-01-01 09:29
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="flex gap-6 mt-6 text-sm px-1">
      <button
        onClick={() => router.push("/license")}
        className="text-teal-700 hover:underline text-sm font-medium cursor-pointer transition-colors"
      >
        License
      </button>
    </div>

<div className="-mx-6 border-t border-gray-400 mt-4"></div>

      </div>
    </div>
  );
}