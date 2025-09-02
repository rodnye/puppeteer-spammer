import { logger as coreLogger } from "../core/logger";

export const logger = coreLogger.child({msgPrefix: '[Queue]'});