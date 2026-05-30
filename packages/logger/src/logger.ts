import winston from "winston";

export interface LoggerOptions {
  name: string;
  level?: string;
}

export type Logger = winston.Logger;

export function createLogger(options: LoggerOptions): Logger {
  const isDev = process.env["NODE_ENV"] === "development";

  return winston.createLogger({
    level: options.level ?? process.env["LOG_LEVEL"] ?? "info",
    defaultMeta: { name: options.name },
    format: isDev
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ timestamp, level, message, name, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `${timestamp as string} ${level} [${name as string}] ${message as string}${metaStr}`;
          }),
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
    transports: [new winston.transports.Console()],
  });
}
