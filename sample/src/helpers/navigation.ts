import { registerFunction } from "../eyeosee-container.gen";

export const redirect = registerFunction("@helpers/navigation/redirect", [])<[path: string]>(
  (path) => {
    window.location.href = path;
  }
);
