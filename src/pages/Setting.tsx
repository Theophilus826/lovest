import React from "react";
import { FaCog, FaChevronRight } from "react-icons/fa";

const Setting: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account preferences and settings.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between border-b px-5 py-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gray-100 p-3">
                <FaCog className="text-gray-600" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Account Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your account preferences
                </p>
              </div>
            </div>

            <FaChevronRight className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;