import * as _ from "lodash";
import cli from "cli-ux";
import { promises as fsPromises } from "fs";
import { resolve } from "path";
import { ProcessorStep, FileProcessor, Link } from "./processors/processor";
import { warn, Msg } from "./log";
import * as chalk from "chalk";

async function getFiles(dir: string, exclude: string[]): Promise<string[]> {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(
      (dirent): Promise<string[]> => {
        const res = resolve(dir, dirent.name);
        if (exclude.includes(dirent.name)) return Promise.resolve([]);
        return dirent.isDirectory()
          ? getFiles(res, exclude)
          : Promise.resolve([res]);
      }
    )
  );
  return Array.prototype.concat(...files);
}

export async function process_files(
  root: string,
  processors: FileProcessor[],
  step: ProcessorStep
): Promise<[any[], Msg[]]> {
  return getFiles(root, [".git"]).then(
    async (files: string[]): Promise<[any[], Msg[]]> => {
      let title = "";
      if (step === ProcessorStep.PreProcess)
        title = chalk.blue("PreProcessing");
      else if (step === ProcessorStep.Process)
        title = chalk.green("Processing");
      else if (step === ProcessorStep.PostProcess)
        title = chalk.magenta("PostProcessing");
      const pb = cli.progress({
        format: `${title} [{bar}] {percentage}% {value}/{total} ({duration_formatted}<{eta_formatted})`,
        batIncompleteChar: " ",
      });
      pb.start(files.length);
      const results = await Promise.all(
        _.map(files, async (fname: string): [any[], Msg[]] => {
          let response = null;
          for (const proc of processors) {
            if (proc.test.test(fname)) {
              if (step === ProcessorStep.PreProcess)
                response = await proc.preProcess(fname);
              else if (step === ProcessorStep.Process)
                response = await proc.process(fname);
              else if (step === ProcessorStep.PostProcess)
                response = await proc.postProcess(fname);
              pb.increment();
              return response || [[], []];
            }
          }
          pb.increment();
          return [[], []];
        })
      );
      pb.stop();
      return [[], []];
      // return _.zip(_.unzip(results;
    }
  );
}
