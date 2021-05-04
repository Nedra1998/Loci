import * as _ from "lodash";
import { promises as fsPromises } from "fs";
import { resolve } from "path";
import * as ora from "ora";

import { Config, LoaderOptions } from "./config";
import { Loader } from "./loaders/base";
import { pretty, chalk } from "./cli-output";

import { MarkdownLoader } from "./loaders/markdown";

export function configureLoaders(
  workspaceRoot: string,
  config: Config
): Promise<Loader[]> {
  return new Promise((resolve) => {
    const spinner = ora({
      text: "Configuring file loaders...",
      indent: 1,
    }).start();
    const loaders: Loader[] = _.compact(
      _.map(config.loaders, (config: LoaderOptions, loader: string) => {
        let ldr: Loader | null = null;
        if (!config.enabled) return null;
        if (loader === "markdown")
          ldr = new MarkdownLoader(workspaceRoot, config);
        if (ldr !== null)
          pretty.success(`${chalk.green.bold("✔")} ${_.capitalize(loader)}`);
        else
          pretty.warning(
            `${chalk.red.bold("✖")} ${_.capitalize(loader)}: Unknown loader`
          );
        return ldr;
      })
    );
    spinner.succeed(`Configured ${loaders.length} file loader(s)`);
    if (loaders.length === 0) pretty.error("Failed to configure any loaders");
    return resolve(loaders);
  });
}

export async function collectSourceFiles(
  workspaceRoot: string,
  loaders: Loader[],
  config: Config,
  level: number = 0
): Promise<string[]> {
  const spinner =
    level === 0
      ? ora({ text: "Collecting project files", indent: 1 }).start()
      : null;
  const dirents = await fsPromises.readdir(workspaceRoot, {
    withFileTypes: true,
  });
  const files = await Promise.all(
    dirents.map(
      (dirent): Promise<string[]> => {
        const res = resolve(workspaceRoot, dirent.name);
        if (config.general.exclude.includes(dirent.name))
          return Promise.resolve([]);
        if (dirent.isDirectory())
          return collectSourceFiles(res, loaders, config, level + 1);
        if (_.some(loaders, (loader: Loader) => loader.test(res)))
          return Promise.resolve([res]);
        pretty.warning(`Failed to file loader for \"${res}"`);
        return Promise.resolve([]);
      }
    )
  );
  const sources = Array.prototype.concat(...files);
  if (spinner !== null)
    spinner.succeed(`Collected ${sources.length} source file(s)`);
  return sources;
}

export async function preProcess(
  sources: string[],
  loaders: Loader[],
  config: Config
): Promise<any> {
  const spinner = ora({
    text: "PreProcessing project files",
    indent: 1,
  }).start();

  const promises = await Promise.all(
    _.map(sources, (source: string) => {
      const loader: Loader | undefined = _.find(loaders, (loader: Loader) =>
        loader.test(source)
      );
      if (loader !== undefined) return loader.preProcess(source);
      return Promise.resolve([]);
    })
  );

  spinner.succeed(`PreProcessed ${sources.length} source file(s)`);
  return null;
}
