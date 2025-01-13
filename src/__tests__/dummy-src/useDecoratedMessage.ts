// @ts-nocheck
import { registerHook } from './container';

export const useDecoratedMessage = registerHook("useDecoratedMessage", [
  "decorateMessage",
])<[message: string], string>((message, deps) => {
  return deps.decorateMessage(message);
});