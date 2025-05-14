import React from "react";

// Get API exposed through preload script
declare const versions: {
  node: () => string;
  chrome: () => string;
  electron: () => string;
};

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>💖 Hello World!</h1>
      <p>Welcome to your Electron application.</p>
      <p>
        This application is using Chrome (v
        {versions.chrome()}
        ), Node.js (v
        {versions.node()}
        ),
        and Electron (v
        {versions.electron()}
        )
      </p>
    </div>
  );
};

export default App;
