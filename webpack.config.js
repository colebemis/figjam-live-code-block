const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const path = require("path");

module.exports = {
  entry: {
    editor: "./src/editor.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    // Including `publicPath` fixes a HtmlWebpackInlineSourcePlugin bug
    // https://git.io/JimSo
    publicPath: "/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/editor.html",
      filename: "editor.html",
      inlineSource: ".(js)$",
      chunks: ["editor"],
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
  ],
};
