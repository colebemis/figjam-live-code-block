const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const path = require("path");

module.exports = (env, argv) => ({
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry: {
    main: "./src/main.tsx",
    editor: "./src/editor.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    // Including `publicPath` fixes a HtmlWebpackInlineSourcePlugin bug
    // https://git.io/JimSo
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/editor.html",
      inject: "body",
      filename: "editor.html",
      inlineSource: ".(js)$",
      chunks: ["editor"],
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
  ],
});
