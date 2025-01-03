import { registerComponent } from "./eyeosee-container.gen";

const App = registerComponent("@components/App", [
  "@hooks/useAgeControl",
])<{ minAge: number }>(({ minAge, __deps }) => {
  const useAgeControl = __deps["@hooks/useAgeControl"];

  useAgeControl(minAge);

  return <h1>Hello, World!</h1>;
});

export default App;
