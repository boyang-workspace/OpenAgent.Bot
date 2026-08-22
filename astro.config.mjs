import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://www.openagent.bot",
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough"
  })
});
