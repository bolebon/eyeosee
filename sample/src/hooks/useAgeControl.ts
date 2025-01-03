import { registerHook } from "../eyeosee-container.gen";

export const useAgeControl = registerHook("@hooks/useAgeControl", [
  "@helpers/navigation/redirect",
])<[age: number], boolean>((age, deps) => {

  const redirect = deps["@helpers/navigation/redirect"];

  if (age < 18) {
    redirect("http://www.google.fr");
    return true;
  }

  return false;
});