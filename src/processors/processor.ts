import { parse, HTMLElement as HTML } from "node-html-parser";
import { join, normalize, dirname, extname, relative } from "path";
import * as _ from "lodash";
import * as Linkify from "linkify-it";
import * as Eta from "eta";
import { html as beautify_html } from "js-beautify";
import { Config } from "../config";
import { Msg } from "../log";

export enum ProcessorStep {
  PreProcess,
  Process,
  PostProcess,
}

export interface Link {
  source: string;
  dest: string;
  id: string | undefined;
}

export class FileProcessor {
  root: string = "";
  linkify: Linkify.LinkifyIt;
  test: RegExp;
  config: Config;

  constructor(test: RegExp, config: Config) {
    this.linkify = Linkify();
    this.test = test;
    this.config = config;
    Eta.configure({ views: join(__dirname, "../templates") });
  }

  parseHtml(html: string): HTML {
    return parse(html);
  }

  transformLinks(path: string, root: HTML): HTML {
    const rootLength = this.config.root.length;
    const cwd = dirname(path);
    _.forEach(root.querySelectorAll("a"), (link: HTML, idx: number) => {
      let linkAddress = link.getAttribute("href");
      if (
        linkAddress &&
        (!this.linkify.test(linkAddress) || linkAddress.indexOf("/") === -1)
      ) {
        linkAddress =
          linkAddress.substr(0, linkAddress.lastIndexOf(".")) + ".html";
        if (linkAddress[0] !== "/") {
          linkAddress = normalize(join(cwd, linkAddress)).slice(rootLength);
        }
        link.setAttribute("href", linkAddress);
        link.setAttribute("id", `lociLink${idx.toString()}`);
      }
    });
    return root;
  }

  extractLinks(path: string, html: HTML): Link[] {
    const cwd = relative(this.config.root, path);
    return _.compact(
      _.map(html.querySelectorAll("a"), (link: HTML): Link | null => {
        let linkAddress = link.getAttribute("href");
        if (linkAddress && linkAddress[0] === "/") {
          return {
            source: cwd,
            dest: linkAddress,
            id: link.getAttribute("id"),
          };
        }
        return null;
      })
    );
  }

  renderTemplate(template: string, data: any): Promise<string> {
    return (Eta.renderFile(template, data) || Promise.reject()).then(
      (html: string): string => {
        return beautify_html(html);
      }
    );
  }

  public async preProcess(src: string): Promise<[Link[], Msg[]]> {
    return Promise.resolve([[], []]);
  }

  public async process(src: string): Promise<[null[], Msg[]]> {
    return Promise.resolve([[], []]);
  }

  public async postProcess(src: string): Promise<[null[], Msg[]]> {
    return Promise.resolve([[], []]);
  }
}
