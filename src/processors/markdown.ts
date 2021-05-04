import * as MarkdownIt from "markdown-it";
import * as _ from "lodash";
import * as hljs from "highlight.js";
import { promises as fsPromises } from "fs";
import { basename } from "path";
import { HTMLElement as HTML } from "node-html-parser";

import { FileProcessor, Link } from "./processor";
import { Config } from "../config";
import { Msg } from "../log";

export class MarkdownProcessor extends FileProcessor {
  md: MarkdownIt;
  constructor(config: Config) {
    super(/\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|rmd)$/i, config);
    this.md = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str: string, lang: string): string => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
        return "";
      },
    })
      .use(require("markdown-it-anchor"))
      .use(require("markdown-it-emoji"))
      .use(require("markdown-it-footnote"))
      .use(require("markdown-it-deflist"))
      .use(require("markdown-it-imsize"));
  }

  generateHtml(src: string): Promise<HTML> {
    return fsPromises
      .readFile(src)
      .then((buffer: Buffer): string => buffer.toString())
      .then((source: string): HTML => this.parseHtml(this.md.render(source)))
      .then((html: HTML) => this.transformLinks(src, html));
  }

  // public async generate(src: string): Promise<Msg[]> {
  //   const source: string = (await fsPromises.readFile(src)).toString();
  //   const html = this.transformLinks(src, this.md.render(source));
  //   const output = await this.renderTemplate("markdown", {
  //     body: html,
  //     title: basename(src),
  //   });
  //   return Promise.resolve([]);
  // }

  public async preProcess(src: string): Promise<[Link[], Msg[]]> {
    return this.generateHtml(src).then((html: HTML) => {
      if (src === "/home/arden/Loci/applications/neovim/neovim.md")
        console.log(html.toString());
      return [this.extractLinks(src, html), []];
    });
  }
  // public async process(src: string): Promise<Msg[]> {
  //   return Promise.resolve([]);
  // }
  // public async postProcess(src: string): Promise<Msg[]> {
  //   return Promise.resolve([]);
  // }
}
