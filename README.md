# 👁️ EyeOSee

Simplify dependency injection in React with ease and type safety.

## 📚 Table of Contents

1. [✨ Why EyeOSee?](#-why-eyeosee)
2. [🚀 Features](#-features)
3. [📦 Installation](#-installation)
4. [🏁 Getting Started](#-getting-started)
5. [⚙️ Core Concepts](#-core-concepts)
6. [💡 Usage Examples](#-usage-examples)
7. [🧪 Testing](#-testing)
7. [📌 Conclusion](#-conclusion)
8. [🙌 Contributing](#-contributing)
9. [📄 License](#-license)


## ✨ Why EyeOSee?

Imagine building a React app where your components, hooks, and helpers are seamlessly organized, effortlessly tested, and elegantly managed. **EyeOSee** makes this vision a reality by introducing a simple, type-safe dependency injection system for React projects.

Without EyeOSee, managing dependencies in a React app can become a tangled web:

- Components tightly coupled to hooks and utilities.
- Hard-to-mock dependencies, making unit testing a nightmare.
- Growing codebases that become difficult to maintain.

**EyeOSee** solves this by providing a smooth, automated way to inject dependencies, keeping your code modular and testable.


## 🚀 Features

- 🛠 **Effortless Dependency Injection** - Simplify how your React components, hooks, and helpers connect.
- 🧩 **Seamless Separation of Concerns** - Cleanly split logic for better maintainability.
- 🔒 **TypeScript Native** - Fully type-safe for confident coding.
- 🧪 **Testing Made Simple** - Isolate and test each piece independently.


## 📦 Installation

Install EyeOSee using your favorite package manager:

```bash
npm install eyeosee
# or
yarn add eyeosee
```

## 🏁 Getting Started

### 1️⃣ Generate the Container

Your application's dependencies live in a container. Generate it easily:

**Using CLI:**

```bash
npx eyeosee-generator generate
```

📂 This will create a file named `eyeosee-container.gen.ts` in your `src` directory.

**Using Bundler Plugins:**

Keep your container updated automatically using the EyeOSee bundler plugins.

**For Vite:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { eyeoseeVitePlugin } from "eyeosee/bundler";

export default defineConfig({
  plugins: [
    react(),
    eyeoseeVitePlugin({
      // Source files to generate the container from
      includes: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  ],
});
```

**For Webpack:**

```javascript
const path = require("path");
const { eyeoseeWebpackPlugin } = require("eyeosee/bundler");

module.exports = {
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new eyeoseeWebpackPlugin({
      // Source files to generate the container from
      includes: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  ],
};
```

⚠️ *Note: Webpack requires restarting the dev server when adding new files.*

## ⚙️ Core Concepts

At the heart of EyeOSee is its **container system**, designed to manage and inject dependencies seamlessly. Here's a detailed breakdown of its core components:

### 🗂️ The container

- **`container`** – The central instance that holds all registered dependencies. Think of it as a smart registry for your app's logic.
- **`ContainerDependencies`** – A TypeScript type that maps all registered dependencies in the container. This provides full type safety and ensures consistent use of dependencies across your project.

### 📝 Registration functions

EyeOSee provides intuitive functions to register different kinds of dependencies:

- **`registerFunction`** → Registers utility/helper functions.
- **`registerHook`** → Registers React hooks for dependency injection.
- **`registerComponent`** → Registers React components with injected dependencies.

### ⚡ Initialization utils

- **`initContainer`** – An asynchronous function that initializes the container. It ensures that all dependencies are registered and ready to be used.
- **`ContainerInitializer`** – A React component that wraps your app. It only renders its children after the container is fully initialized, ensuring a safe and stable dependency environment.

## 💡 Usage Examples

Let’s walk through a practical example of how EyeOSee can simplify dependency management and testing in your React application. Imagine we want to build a **User Profile** feature that fetches user data from an API and displays it.

### 🏗️ Project Structure

To follow the **Single Responsibility Principle**, we'll split the logic into:

1. **`fetchUser`** – A function to handle the API call.
2. **`useUser`** – A custom hook to manage data fetching and loading states.
3. **`UserProfile`** – A React component that displays the user data.

Without EyeOSee, these entities would tightly import each other, making unit testing cumbersome. With EyeOSee, we inject dependencies, making everything more modular and easier to test.


### 1️⃣ Creating the `fetchUser` Function

```typescript
import { registerFunction } from "./eyeosee-container.gen";

// ✅ Define the User type to ensure type safety across the app
// This prevents errors when dealing with user data.
type User = {
  id: number;
  name: string;
  avatarUrl: string;
};

// ✅ Register the fetchUser function in the container
// This makes the function available for dependency injection.
export const fetchUser = registerFunction(
  "fetchUser",
  []
)<
  [id: number], // 📝 Arguments: a `number` argument for user ID
  Promise<User> // 📝 Return type: a Promise resolving to a `User` object
>(async (id) => {
  // 🌐 Perform the API call to fetch user data
  return await fetch(`https://my-api.com/users/${id}`).then((r) => r.json());
});
```

**🔍 Explanation:**

- **Typed Arguments:** `[id: number]` defines that the function expects a number as input.
- **Typed Return:** `Promise<User>` enforces that the function returns a `User` object wrapped in a promise.
- **Dependency Injection:** `registerFunction` makes `fetchUser` available for injection.


### 2️⃣ Creating the `useUser` Hook

```typescript
import { useState, useEffect } from "react";
import { registerHook } from "./eyeosee-container.gen";
import type { User } from "./fetchUser";

// ✅ Define the state type to manage user data and loading state
export type UserState = {
  user?: User;
  isLoading: boolean;
};

// ✅ Register the useUser hook with fetchUser as a dependency
export const useUser = registerHook("useUser", [
  "fetchUser",
])<
  [id: number], // 📝 Arguments: a `number` argument for user ID
  UserState // Return type: a `UserState` object
>((id, deps) => {
  const [state, setState] = useState<UserState>({
    user: undefined,
    isLoading: true,
  });

  useEffect(() => {
    setState({ user: undefined, isLoading: true });

    // 🗣️ Calls "fetchUser" from the "deps" paramater automatically
    // appended in the hook's arguments
    deps.fetchUser(id).then((user) => {
      setState({ user, isLoading: false });
    });
  }, [id]);

  return state;
});
```

**🔍 Explanation:**

- **Typed Arguments:** `[id: number]` is the list of arguments expected by the hook.
- **Typed Return:** `UserState` is the return type of the hook.
- **Dependency Injection:** `fetchUser` is injected using `deps` to avoid direct imports.


### 3️⃣ Creating the `UserProfile` Component

```typescript
import { registerComponent } from './eyeosee-container.gen';

// ✅ Define props for the UserProfile component
// This ensures that only the correct props can be passed to the component.
type UserProfileProps = {
  id: number;
};

// ✅ Register the UserProfile component and inject the useUser hook
export const UserProfile = registerComponent("UserProfile", ["useUser"])
<UserProfileProps>(({ id, __deps }) => {
  // 🔌 Injected useUser hook is accessed via __deps that is
  // automatically added to component's props
  const { user, isLoading } = __deps.useUser(id);

  if (isLoading) {
    return <span>Loading...</span>; // ⏳ Show loading state
  }

  // ✅ Display user data when loaded
  return (
    <div>
      <img data-testid="avatar" src={user.avatarUrl} alt={user.name} />
      <span data-testid="name">{user.name}</span>
    </div>
  );
});
```

**🔍 Explanation:**

- **Typed Props:** `<UserProfileProps>` strictly defines props expected by the component.
- **Dependency Injection:** `useUser` is injected using `__deps` to avoid direct imports.


### 4️⃣ Rendering the Component

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { ContainerInitializer } from './eyeosee-container.gen';
import { UserProfile } from './UserProfile';

const rootElement = document.getElementById("root")!;

// 🚀 Initialize the app with the dependency container
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* 🔄 Ensure the container is ready before rendering components */}
    <ContainerInitializer fallback={<p>Loading container...</p>}>
      <UserProfile id={42} />
    </ContainerInitializer>
  </React.StrictMode>
);
```

**🔍 Explanation:**

- **`ContainerInitializer`:** Ensures dependencies are ready before rendering.
- **Fallback UI:** Displays a loading message while initializing the container.


## 🧪 Testing

Now that we have set up dependency injection with EyeOSee, let's explore how it simplifies testing in our React applications. By isolating dependencies, EyeOSee makes unit tests more reliable and easier to write.

### 1️⃣ Testing the `fetchUser` Function

As the `fetchUser` doesn't have any dependencies, we can test it as we would test any regular function.
In our case, as this function performs network calls, we can simply mock them using a library like `nock`.

```typescript
import { beforeAll, test, expect } from "vitest";
import nock from "nock";
import { initContainer } from "./eyeosee-container.gen";
import { fetchUser } from "./fetchUser";

// ✅ Initialize the container before running tests
beforeAll(initContainer);

test("fetchUser fetches the user data", async () => {
  // 🔍 Mock the API call
  const scope = nock("https://my-api.com").get("/users/42").reply(200, {
    id: 42,
    name: "John Smith",
    avatarUrl: "https://cdn.acme.com/users/42.png",
  });

  // 📥 Call the fetchUser function
  const user = await fetchUser(42);

  // ✅ Ensure the mock API was called
  scope.done();

  // 🧐 Validate the result
  expect(user).toEqual({
    id: 42,
    name: "John Smith",
    avatarUrl: "https://cdn.acme.com/users/42.png",
  });
});
```

**🔎 Explanation:**

- **`beforeAll(initContainer)`** ensures the dependency container is initialized before tests run.
- **`nock`** mocks the external API, eliminating real network calls.
- The test verifies that `fetchUser` properly retrieves and formats user data.

### 2️⃣ Testing the `useUser` Hook in Isolation

Hooks often have dependencies that make them tricky to test. With EyeOSee, you can override dependencies to isolate the hook logic.

```typescript
import { beforeAll, test, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { initContainer } from "./eyeosee-container.gen";
import { useUser } from "./useUser";
import type { User } from "./fetchUser";

// ✅ Initialize the container
beforeAll(initContainer);

test("useUser loads user data", async () => {
  // 🔧 Create a mock promise
  const { promise, resolve } = Promise.withResolvers<User>();

  // 🧪 Render the hook with a mock dependency
  const { result } = renderHook(() =>
    useUser(42, {
      fetchUser: (id) => {
        expect(id).toEqual(42);
        return promise;
      },
    })
  );

  // ⏳ Assert initial loading state
  expect(result.current).toEqual({ isLoading: true, user: undefined });

  // 🔄 Simulate the promise resolving
  act(() => {
    resolve({
      id: 42,
      name: "John Smith",
      avatarUrl: "https://cdn.acme.com/users/42.png",
    });
  });

  await waitFor(() => {
    // ✅ Check if the hook updated correctly
    expect(result.current).toEqual({
      isLoading: false,
      user: {
        id: 42,
        name: "John Smith",
        avatarUrl: "https://cdn.acme.com/users/42.png",
      },
    });
  });
});
```

**🔎 Explanation:**

- The hook is rendered with a mocked `fetchUser` function.
- By manually resolving the promise, we simulate async data fetching.
- This isolates and tests the hook without real API calls.

### 3️⃣ Testing the `UserProfile` Component

Components often combine multiple pieces of logic, but with EyeOSee, we can easily mock dependencies to isolate the UI logic.

```typescript
import { beforeAll, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { initContainer } from "./eyeosee-container.gen";
import { UserProfile } from "./UserProfile";

// ✅ Initialize the container
beforeAll(initContainer);

test("UserProfile displays a loading state", () => {
  // 🧪 Render with mocked loading state
  render(
    <UserProfile
      id={42}
      __deps={{
        useUser: (id) => {
          // 🧐 Verify that the right id is passed
          expect(id).toEqual(42);

          return { isLoading: true, user: undefined };
        },
      }}
    />
  );

  // 🔍 Check for loading indicator
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("UserProfile displays user data", () => {
  // 🧪 Render with mock user data
  render(
    <UserProfile
      id={42}
      __deps={{
        useUser: () => ({
          isLoading: false,
          user: {
            id: 42,
            name: "John Smith",
            avatarUrl: "https://cdn.acme.com/users/42.png",
          },
        }),
      }}
    />
  );

  // 🧐 Verify the displayed content
  expect(screen.getByTestId("name")).toHaveTextContent("John Smith");
  expect(screen.getByTestId("avatar")).toHaveAttribute(
    "src",
    "https://cdn.acme.com/users/42.png"
  );
});
```

**🔎 Explanation:**

- We mock the `useUser` hook to control the component's state.
- The component is tested in both the loading and loaded states.

By injecting mock implementations of dependencies, EyeOSee simplifies component testing. No need to worry about internal state transitions—just focus on the component behavior!

## 📌 Conclusion

EyeOSee empowers React developers to build scalable, maintainable, and testable applications by introducing a seamless dependency injection system. Here’s why EyeOSee stands out:

### 🎯 Key Advantages

- **Simplified Dependency Management:** Automatically manage and inject dependencies without cluttered imports.
- **Enhanced Type Safety:** Define clear input and output types for functions, hooks, and components, reducing runtime errors.
- **Streamlined Testing:** Effortlessly mock dependencies, enabling isolated and reliable unit tests.
- **Improved Code Organization:** Promote clean architecture by separating concerns between helpers, hooks, and components.
- **Scalability:** Easily adapt and extend applications without introducing tight coupling or complex refactoring.

By leveraging EyeOSee, you ensure that your React projects are more modular, flexible, and robust. Whether you’re working on small features or large-scale applications, EyeOSee makes dependency management clear and hassle-free.

So, why wait? Start building cleaner, more maintainable React apps today with **EyeOSee**! 👁️✨

## 🙌 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License. Use it freely and responsibly.

---

Happy Coding! 💙
