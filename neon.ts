import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // SafeDrop uses its own FastAPI authentication.
  auth: false,

  // Neon Object Storage
  preview: {
    buckets: {
      "safedrop-files": {},
    },
  },

  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }

    if (!branch.exists) {
      // New non-default branches: auto-expire after 7 days
      return { ttl: "7d" };
    }

    // Existing branch: no changes
    return {};
  },
});
