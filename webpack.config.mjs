import { CleanWebpackPlugin } from "clean-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";

export default {
  entry: path.resolve(process.cwd(), "src/index.mjs"),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  output: {
    path: path.resolve(process.cwd(), "dist"),
    filename: "spatialhash.mjs",
    library: "$",
    libraryTarget: "umd",
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
};
