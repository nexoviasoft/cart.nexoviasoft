import React from "react";
import { useLocation, Link } from "react-router-dom";

const ResellerInactiveInfoPage = () => {
  const location = useLocation();
  const message =
    location.state?.message ||
    "Your merchant account is inactive. Please clear any pending payments and contact the admin to reactivate your access.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-3">
          Merchant access temporarily disabled
        </h1>
        <p className="text-sm text-slate-300 mb-4 whitespace-pre-line">
          {message}
        </p>
        <ul className="text-sm text-slate-400 list-disc pl-5 space-y-1 mb-6">
          <li>Review and clear any pending commission payments to admin.</li>
          <li>After clearing payments, contact the admin to reactivate your account.</li>
        </ul>
        <div className="flex justify-between items-center">
          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
          >
            Back to login
          </Link>
          <a
            href="mailto:xinzo.shop@gmail.com"
            className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
          >
            Contact admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResellerInactiveInfoPage;

