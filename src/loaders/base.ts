import * as Eta from "eta";
import { join } from "path";
import { promises as fsPromises } from "fs";
import { JSDOM } from "jsdom";
import {
  js as beautify_js,
  css as beautify_css,
  html as beautify_html,
} from "js-beautify";

import { pretty } from "../cli-output";

export class Loader {
  fileTest: RegExp;
  constructor(fileTest: RegExp) {
    this.fileTest = fileTest;
    Eta.configure({ views: join(__dirname, "../templates") });
  }

  parseHtml(source: string): JSDOM {
    return new JSDOM(source);
  }

  renderTemplate(templateName: string, data: any): Promise<string> {
    return Eta.renderFile(templateName, data) || Promise.reject();
  }

  beautify(source: string, type: string = "html"): Promise<string> {
    return new Promise((resolve) => {
      if (type === "html") resolve(beautify_html(source));
      else if (type === "css") resolve(beautify_css(source));
      else if (type === "js") resolve(beautify_js(source));
      else {
        pretty.warning(`Cannot beautify "${type}", skipping`);
        resolve(source);
      }
    });
  }

  readFile(filePath: string): Promise<string> {
    return fsPromises
      .readFile(filePath)
      .then((buffer: Buffer): string => buffer.toString());
  }
  writeFile(filePath: string, data: string): Promise<void> {
    return fsPromises.writeFile(filePath, data);
  }

  test(filePath: string): boolean {
    return this.fileTest.test(filePath);
  }

  preProcess(filePath: string): Promise<any> {return Promise.resolve(null);}
}
