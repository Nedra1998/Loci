import { join } from "path";
import { Command, flags } from "@oclif/command";
import { loadConfig, Config } from "./config";
import { collectSourceFiles, configureLoaders, preProcess } from "./workspace";

class Loci extends Command {
  static description = "describe the command here";

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
      description: "wiki configuration path",
    }),
    templates: flags.string({
      description: "HTML templates directory",
    }),
  };

  static args = [];

  async run() {
    const { args, flags } = this.parse(Loci);
    const config: Config | null = await loadConfig(
      flags.config || join(flags.source, "loci.toml")
    );
    pretty.display(undefined, false);
    if (config === null) return;

    const loaders = await configureLoaders(flags.source, config);
    pretty.display("Configured loaders");
    const sources = await collectSourceFiles(flags.source, loaders, config);
    pretty.display("Collected source files");
    const metadata = await preProcess(sources, loaders, config);
    pretty.display("PreProcessed files");
    console.log(metadata);
  }
}

export = Loci;
