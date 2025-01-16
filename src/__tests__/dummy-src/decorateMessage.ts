// @ts-nocheck
import { registerFunction } from './container';

export const decorateMessage = registerFunction(
  "decorateMessage",
  ["CONFIG"]
)<[message: string], string>((message, deps) => {
  return `${deps.CONFIG.DECORATION} ${message} ${deps.CONFIG.DECORATION}`;
});