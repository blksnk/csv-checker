import {
  Logger as Log,
  objectKeys,
  objectValues,
  transformObject,
  type LoggerConfig,
  type NonOptional,
} from "@ubloimmo/front-util";

type PrefixConf = NonOptional<LoggerConfig["prefixes"]>;

const basePrefixes: PrefixConf = {
  info: "Info",
  error: "Error",
  warn: "Warn",
  log: "Log",
  debug: "Debug",
};

function getLoggerPrefixes(prefix: string): PrefixConf {
  const prefixes = transformObject(
    basePrefixes,
    (value, key) => `<${prefix}> | ${value}${key === "log" ? "" : "\n"}`,
  );
  const maxLength = objectValues(prefixes).reduce(
    (acc, str) => Math.max(acc, str.length),
    0,
  );
  for (const key of objectKeys(prefixes)) {
    const str = prefixes[key];
    const diff = maxLength - str.length;
    prefixes[key] = str + Array.from({ length: diff }).fill(" ");
  }

  return prefixes;
}

export class Logger {
  constructor() {}

  derive(prefix: string, config: Omit<LoggerConfig, "prefixes"> = {}): Log {
    return Log({
      prefixes: getLoggerPrefixes(prefix),
      spacing: 0,
      ...config,
    });
  }

  static derive(
    prefix: string,
    config: Omit<LoggerConfig, "prefixes"> = {},
  ): Log {
    return Log({
      prefixes: getLoggerPrefixes(prefix),
      spacing: 0,
      ...config,
    });
  }
}
