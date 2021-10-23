const path = require("path");
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, "../src/widget.tsx")],
    outfile: "build/widget.js",
    bundle: true,
    watch: true,
    define: {
      "process.env.NODE_ENV": '"development"',
    },
  })
  .catch(() => process.exit(1));
