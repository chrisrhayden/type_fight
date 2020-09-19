const path = require("path");

const src = path.resolve(__dirname, "dist", "main.js");
const dist = path.resolve(__dirname, "public");

module.exports = {
  mode: "development",
  entry: src,
  output: {
    path: dist,
    filename: "main.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ["source-map-loader"],
      },
    ]
  }
};
