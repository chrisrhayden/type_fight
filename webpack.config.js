const path = require("path");

const src = path.resolve(__dirname, "src", "App.tsx");
const dist = path.resolve(__dirname, "public");

module.exports = {
  mode: "development",
  entry: src,
  output: {
    path: dist,
    filename: "app.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        use: ["ts-loader", "source-map-loader"],
        exclude: /node_module/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"]
  }
};
