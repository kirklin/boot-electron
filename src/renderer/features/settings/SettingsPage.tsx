import type { AppSettings } from "~/shared/types/settings";
import React, { useEffect, useState } from "react";

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    window.api.settings.get().then(setSettings);
  }, []);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as AppSettings["theme"];
    if (settings) {
      const newSettings = { ...settings, theme: newTheme };
      setSettings(newSettings);
      window.api.settings.save(newSettings);
    }
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700">
            Theme
          </label>
          <select
            id="theme-select"
            value={settings.theme}
            onChange={handleThemeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
};
