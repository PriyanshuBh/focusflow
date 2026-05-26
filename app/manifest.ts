import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FocusFlow | Minimalist Deep Work Dashboard",
    short_name: "FocusFlow",
    description: "A minimalist Pomodoro timer, unified Time Blocker, Kanban board, and atmosphere engine for deep work.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0c10",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/og-image.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
