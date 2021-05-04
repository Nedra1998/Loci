import { Loader } from "./base";
import { LoaderOptions } from "../config";
import { JSDOM } from "jsdom";
import * as MarkdownIt from "markdown-it";
import * as hljs from "highlight.js";
import * as _ from "lodash";
import { pretty } from "../cli-output";

function isStringArray(
  array: string | number | boolean | string[] | number[] | boolean[]
): array is string[] {
  if (typeof array !== "object") return false;
  return typeof array[0] === "string";
}

export class MarkdownLoader extends Loader {
  md: MarkdownIt;
  constructor(workspaceRoot: string, options: LoaderOptions) {
    super(new RegExp(options.test, "i"));
    this.md = MarkdownIt({
      html: true,
      linkify: options.linkify ? options.linkify === true : true,
      typographer: options.typographer ? options.typographer === true : true,
      highlight: (str: string, lang: string): string => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return "";
      },
    });
    let plugins: string[] = [
      "anchor",
      "emoji",
      "footnote",
      "deflist",
      "imsize",
    ];
    if (options.plugins && isStringArray(options.plugins)) {
      plugins = options.plugins;
    }
    _.forEach(plugins, (plugin) =>
      this.md.use(require("markdown-it-" + plugin))
    );
  }

  generateHtml(source: string): Promise<JSDOM> {
    return new Promise((resolve, reject) => {
      let markdown: string = "";
      try {
        markdown = this.md.render(source);
      } catch (err) {
        pretty.error(`Failed to render markdown:\n${err}`);
        reject();
      }
      try {
        resolve(this.parseHtml(markdown));
      } catch (err) {
        pretty.error(`Failed to parse generated html:\n${err}`);
        reject();
      }
    });
  }

  preProcess(filePath: string): Promise<any> {
    return this.readFile(filePath)
      .then((source: string) => this.generateHtml(source))
      .then((html: JSDOM) => {
        console.log(html.window.querySelectorAll("a"));
      });
  }
}
