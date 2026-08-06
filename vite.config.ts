import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
  },
  ssr: {
    noExternal: ['firebase', '@firebase/app', '@firebase/database', '@firebase/analytics']
  }
});
