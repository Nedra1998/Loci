import * as TOML from "@iarna/toml";
import * as _ from "lodash";
import { promises as fsPromises } from "fs";
import { errorLog } from "./log";

interface GeneralConfig {
  exclude_diary: boolean;
  generate_node_graph: boolean;
}

interface Config {
  root: string;
  general: GeneralConfig;
}

const DEFAULT_CONFIG: Config = {
  root: "",
  general: {
    exclude_diary: false,
    generate_node_graph: false,
  },
};

async function parse_config(path: string): Promise<Config | null> {
  try {
    const buffer = await fsPromises.readFile(path);
    try {
      const config = await TOML.parse.async(buffer.toString());
      return _.defaultsDeep(config, DEFAULT_CONFIG);
    } catch (err) {
      errorLog(`Failed to parse Loci config: ${path}\n${err.toString()}`);
      return null;
    }
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export { Config, parse_config };
