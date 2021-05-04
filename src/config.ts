import * as TOML from "@iarna/toml";
import * as _ from "lodash";
import { promises as fsPromises } from "fs";
import { pretty } from "./cli-output";

interface GeneralConfig {
  exclude_diary: boolean;
  generate_node_graph: boolean;
  exclude: string[];
}
export interface LoaderOptions {
  enabled: boolean;
  test: string;
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

export interface Config {
  general: GeneralConfig;
  loaders: { [key: string]: LoaderOptions };
}

const DEFAULT_CONFIG: Config = {
  general: {
    exclude_diary: false,
    generate_node_graph: false,
    exclude: ['.git']
  },
  loaders: {
    markdown: {
      enabled: true,
      test: ".(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|rmd)$",
    },
  },
};

export async function loadConfig(path: string): Promise<Config | null> {
  try {
    const buffer = await fsPromises.readFile(path);
    try {
      const config = await TOML.parse.async(buffer.toString());
      pretty.success({
        title: "CONFIG",
        message: `Loaded Loci config from ${path}`,
      });
      return _.defaultsDeep(config, DEFAULT_CONFIG);
    } catch (err) {
      pretty.error({
        title: "CONFIG",
        message: `Failed to parse Loci config: ${path}\n${err.toString()}`,
      });
      return null;
    }
  } catch (e) {
    pretty.info({
      title: "CONFIG",
      message: "No Loci config found, using default values",
    });
    return DEFAULT_CONFIG;
  }
}
