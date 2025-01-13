// @ts-nocheck
import { registerFunction } from './container';

export const decorateMessage = registerFunction(
  "decorateMessage",
  []
)<[message: string], string>((message) => {
  return `** ${message} **`;
});