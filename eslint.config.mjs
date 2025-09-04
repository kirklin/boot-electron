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
    "perfectionist/sort-imports": ["error", {
      groups: [
        "reflect-metadata",
        "type",
        ["parent-type", "sibling-type", "index-type", "internal-type"],

        "builtin",
        "external",
        "internal",
        ["parent", "sibling", "index"],
        "side-effect",
        "object",
        "unknown",
      ],
      customGroups: [{
        groupName: "reflect-metadata",
        elementNamePattern: ["^reflect-metadata$", "^reflect-metadata-.+"],
      }],
      newlinesBetween: "ignore",
      order: "asc",
      type: "natural",
    }],
  },
});
