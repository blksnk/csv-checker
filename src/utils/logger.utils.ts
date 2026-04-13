import {
  Logger as Log,
  objectKeys,
  objectValues,
  transformObject,
  type LoggerConfig,
  type NonOptional,
} from "@ubloimmo/front-util";

/** Logger prefix strings for each log level, after applying a scope prefix. */
type PrefixConf = NonOptional<LoggerConfig["prefixes"]>;

const basePrefixes: PrefixConf = {
  info: "Info",
  error: "Error",
  warn: "Warn",
  log: "Log",
  debug: "Debug",
};

/**
 * Builds padded, level-specific prefix strings for a named logger scope.
 *
 * @param {string} prefix - Scope name shown in each log line
 * @return {PrefixConf} Prefix map aligned to the longest label width
 */
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

/**
 * Factory for scoped {@link Log} instances with aligned prefixes.
 */
export class Logger {
  constructor() {}

  /**
   * Creates a logger instance with the given scope prefix.
   *
   * @param {string} prefix - Scope label prepended to log output
   * @param {Omit<LoggerConfig, "prefixes">} [config] - Logger options except prefixes
   * @return {Log} Configured logger
   */
  derive(prefix: string, config: Omit<LoggerConfig, "prefixes"> = {}): Log {
    return Log({
      prefixes: getLoggerPrefixes(prefix),
      spacing: 0,
      ...config,
    });
  }

  /**
   * Static alias for {@link Logger#derive}.
   *
   * @param {string} prefix - Scope label prepended to log output
   * @param {Omit<LoggerConfig, "prefixes">} [config] - Logger options except prefixes
   * @return {Log} Configured logger
   */
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
