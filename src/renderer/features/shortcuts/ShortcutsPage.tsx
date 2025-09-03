import type { Keybinding } from "~/shared/types/shortcuts";
import React, { useEffect, useState } from "react";

export function ShortcutsPage() {
  const [keybindings, setKeybindings] = useState<Keybinding[]>([]);

  useEffect(() => {
    window.api.shortcuts.getKeybindings().then(setKeybindings);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Keybinding</th>
              <th className="py-2 px-4 border-b text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {keybindings.map(binding => (
              <tr key={binding.command}>
                <td className="py-2 px-4 border-b">{binding.name}</td>
                <td className="py-2 px-4 border-b">
                  <span className="bg-gray-200 px-2 py-1 rounded">{binding.key}</span>
                </td>
                <td className="py-2 px-4 border-b capitalize">{binding.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
