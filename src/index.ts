import { Command, flags } from "@oclif/command";
import * as path from "path";
import logSymbols from "log-symbols";

import { webpack, Configuration } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MinicssExtractPlugin from "mini-css-extract-plugin";
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

class Loci extends Command {
  static description = "describe the command here";

  static flags = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    directory: flags.string({
      char: "d",
      default: process.cwd(),
      description: "directory of wiki repository",
    }),
    output: flags.string({
      char: "o",
      default: path.join(process.cwd(), "dist"),
      description: "output directory for generated files",
    }),
    dev: flags.boolean({ description: "set webpack to development mode" }),
    prod: flags.boolean({ description: "set webpack to production mode" }),
    watch: flags.boolean({
      description: "watch for changes in the source directory",
    }),
    serve: flags.boolean({ description: "serve webpack server" }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(Loci);

    const prod = flags.prod || (!flags.dev && !flags.watch);

    const excludes = [
      flags.output,
      path.resolve(path.join(flags.directory, "./.git")),
    ];

    const markdownRule = {
      test: /\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|rmd)$/i,
      exclude: excludes,
      use: [
        "html-loader",
        {
          loader: "markdown-loader",
          options: {
            use: [
              require("markdown-it-emoji"),
              require("markdown-it-deflist"),
              require("markdown-it-sub"),
              require("markdown-it-mark"),
              require("markdown-it-sup"),
              require("markdown-it-footnote"),
              [require("markdown-it-anchor"), { permalink: true }],
              require("markdown-it-katex"),
            ],
          },
        },
      ],
    };
    const pdfRule = {
      test: /\.(pdf)$/i,
      exclude: excludes,
      use: ["file-loader"],
    };
    const fontRule = {
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      exclude: excludes,
      use: ["file-loader"],
    };
    const imageRule = {
      test: /\.(gif|png|jpe?g|svg)$/i,
      exclude: excludes,
      use: ["file-loader"],
    };
    const videoRule = {
      test: /\.(mp4)$/i,
      exclude: excludes,
      use: ["file-loader"],
    };

    const config: Configuration = {
      mode: prod ? "production" : "development",
      entry: path.resolve(path.join(__dirname, "../resources/index.js")),
      output: {
        filename: "bundle.js",
        chunkFilename: "[chunkhash].js",
        path: flags.output,
      },
      devtool: prod ? undefined : "inline-source-map",
      optimization: {
        minimize: prod,
      },
      plugins: [
        new HtmlWebpackPlugin({
          title: "Loci",
          template: path.resolve(
            path.join(__dirname, "../resources/index.ejs")
          ),
        }),
        new MinicssExtractPlugin(),
        new CleanWebpackPlugin(),
        new FaviconsWebpackPlugin(
          path.join(__dirname, "../resources/favicon.svg")
        ),
      ],
      module: {
        rules: [markdownRule, videoRule, imageRule, pdfRule, fontRule],
      },
    };
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err || stats === undefined) return console.error(err);
      console.log(stats.toString({ colors: true }));
    });
  }
}

export = Loci;
