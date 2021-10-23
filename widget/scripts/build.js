const path = require("path");
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, "../src/widget.tsx")],
    outfile: "build/widget.js",
    bundle: true,
    minify: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })
  .catch(() => process.exit(1));
