const path = require("path");

const src = path.resolve(__dirname, "dist", "index.js");
const dist = path.resolve(__dirname, "public");

module.exports = {
  mode: "development",
  entry: src,
  output: {
    path: dist,
    filename: "index.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ]
  }
};
