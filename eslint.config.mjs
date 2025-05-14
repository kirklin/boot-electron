import kirklin from "@kirklin/eslint-config";

export default kirklin({
  react: true,
  typescript: true,
  formatters: true,
},
// --- Custom Rule Overrides ---
{
  rules: {
    "node/prefer-global/process": "off", // Allow using `process.env`
    "no-console": "off",
  },
});
