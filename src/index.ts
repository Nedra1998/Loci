import { Command, flags } from "@oclif/command";
import { join } from "path";
import * as _ from "lodash";

import { parse_config } from "./config";
import { warnLog, handleMsgs } from "./log";
import { MarkdownProcessor } from "./processors/markdown";
import { ProcessorStep, Link } from "./processors/processor";
import { process_files } from "./handler";

class Loci extends Command {
  static description = "Zettelkasten wiki site generator";

  static flags = {
    version: flags.version({ char: "V" }),
    help: flags.help({ char: "h" }),
    source: flags.string({
      char: "s",
      default: process.cwd(),
      description: "wiki root source directory",
    }),
    dest: flags.string({
      char: "d",
      description: "wiki site output directory",
    }),
    config: flags.string({
      default: join(process.cwd(), "loci.toml"),
      description: "wiki configuration path",
    }),
    templates: flags.string({
      description: "HTML templates directory",
    }),
  };

  static args = [];

  async run() {
    const { args, flags } = this.parse(Loci);
    const config = await parse_config(flags.config);
    if (config === null) return;
    config.root = flags.source;
    const processors = [new MarkdownProcessor(config)];
    const links = _.flatten(
      await process_files<Link>(config.root, processors, ProcessorStep.PreProcess)
    );
    // handleMsgs(results);
    // console.log(results);
  }
}

export = Loci;
