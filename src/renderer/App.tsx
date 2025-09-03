import React, { useEffect, useState } from "react";
import { Button } from "~/renderer/components/ui/button";
import { SettingsPage } from "./features/settings/SettingsPage";

interface EnvironmentInfo {
  chromeVersion: string;
  nodeVersion: string;
  electronVersion: string;
}

const App: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    window.api.environment.getEnvironment().then(setEnvInfo);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">💖 Hello World!</h1>
          <p className="text-center text-gray-600 mb-6">Welcome to your Electron application</p>
          <div className="text-center mb-6">
            <Button>Click Me</Button>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-500">Chrome:</span>
              <span className="text-gray-700">
                v
                {envInfo?.chromeVersion ?? "..."}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-500">Node.js:</span>
              <span className="text-gray-700">
                v
                {envInfo?.nodeVersion ?? "..."}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-gray-500">Electron:</span>
              <span className="text-gray-700">
                v
                {envInfo?.electronVersion ?? "..."}
              </span>
            </div>
          </div>
          <div className="p-8 border-t border-gray-200">
            <SettingsPage />
          </div>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Developed by
            {" "}
            <a href="https://github.com/kirklin" className="text-indigo-500 hover:text-indigo-600 transition-colors">Kirk Lin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
