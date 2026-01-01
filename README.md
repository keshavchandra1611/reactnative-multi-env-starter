
# Expo + EAS Multi-Environment Setup (TypeScript) Boilerplate

This is a **boilerplate cum guide** to set up an Expo project with **TypeScript**, EAS builds, and multiple environments (Dev / QA / Prod), including dynamic configuration for app name, package ID, icons, splash screens, and EAS build profiles. No router or navigation is included.

---

# Expo + EAS Multi-Environment Setup (TypeScript) Boiler plate

This guide shows how to configure an Expo project with **TypeScript**, EAS builds, and multiple environments (Dev / QA / Prod).

---

## 1. Create a New Expo Project

```bash
npx create-expo-app myApp --template blank-typescript
```

---

## 2. Install EAS CLI

```bash
npm install -g eas-cli
```

Check if you’re logged in:

```bash
npx expo whoami
```

If not logged in, run:

```bash
npx expo login
```

---

## 3. Initialize EAS in Your Project

```bash
npx eas init
```

- **Create an EAS project?** → `YES`  
- **Account to own this project:** → `keshav1611`

---

## 4. Add Build Scripts

In `package.json`, add:

```json
"scripts": {
  "build:dev": "npx eas build -p android --profile development --local --clear-cache",
  "build:preview": "npx eas build -p android --profile preview --local --clear-cache",
  "build:production": "npx eas build -p android --profile production --local --clear-cache"
}
```

---

## 5. App Environment Configuration

### App IDs

| Environment | Android Package Name         |
|------------|-----------------------------|
| DEV        | `com.keshav1611.myapp.dev`  |
| QA         | `com.keshav1611.myapp.qa`   |
| PROD       | `com.keshav1611.myapp`      |

---

## 6. Convert `app.json` to `app.config.ts`

Rename `app.json` → `app.config.ts`

```ts
import { ExpoConfig, ConfigContext } from "expo/config";

type AppEnv = "dev" | "qa" | "prod";

export default ({ config }: ConfigContext): ExpoConfig => {
  const ENV = (process.env.APP_ENV ?? "dev") as AppEnv;
  const baseAssetPath = `./assets/${ENV}`;

  const appIds: Record<AppEnv, string> = {
    dev: "com.keshav1611.myapp.dev",
    qa: "com.keshav1611.myapp.qa",
    prod: "com.keshav1611.myapp",
  };

  const appNames: Record<AppEnv, string> = {
    dev: "MyApp Dev",
    qa: "MyApp QA",
    prod: "MyApp",
  };

  const icons: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/icon.png`,
    qa: `${baseAssetPath}/icon.png`,
    prod: `${baseAssetPath}/icon.png`,
  };

  const adaptiveIcons: Record<AppEnv, { foreground: string; background: string }> = {
    dev: { foreground: `${baseAssetPath}/adaptive-icon.png`, background: "#ffffff" },
    qa: { foreground: `${baseAssetPath}/adaptive-icon.png`, background: "#ffffff" },
    prod: { foreground: `${baseAssetPath}/adaptive-icon.png`, background: "#ffffff" },
  };

  const splashImages: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/splash.png`,
    qa: `${baseAssetPath}/splash.png`,
    prod: `${baseAssetPath}/splash.png`,
  };

  const favicons: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/favicon.png`,
    qa: `${baseAssetPath}/favicon.png`,
    prod: `${baseAssetPath}/favicon.png`,
  };

  return {
    ...config,

    // App Identity
    name: appNames[ENV],
    slug: "myapp",
    owner: "keshav1611",
    version: "1.0.0",

    // UI / Behavior
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    // Assets
    icon: icons[ENV],
    splash: {
      image: splashImages[ENV],
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
    },

    android: {
      ...config.android,
      package: appIds[ENV],
      adaptiveIcon: {
        foregroundImage: adaptiveIcons[ENV].foreground,
        backgroundColor: adaptiveIcons[ENV].background,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: favicons[ENV],
    },

    extra: {
      env: ENV,
      eas: {
        projectId: "4b3ac7e0-0b31-4c63-b2e1-81569b1d4fe2",
      },
    },
  };
};
```

---

## 7. Configure `eas.json`

```json
{
  "build": {
    "development": {
      "env": {
        "APP_ENV": "dev"
      },
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "env": {
        "APP_ENV": "qa"
      },
      "distribution": "internal"
    },
    "production": {
      "env": {
        "APP_ENV": "prod"
      },
      "autoIncrement": true
    },
    "production_external": {
      "env": {
        "APP_ENV": "prod"
      },
      "channel": "production",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 8. Verify Configuration

Check the current config (default → `dev`):

```bash
npx expo config --type public
```

Set a specific environment:

```bash
APP_ENV=qa npx expo config --type public
APP_ENV=prod npx expo config --type public
```

You should see:

```text
name: "MyApp Dev"        # or QA / Prod
android.package: "com.keshav1611.myapp.dev"  # or QA / Prod
```

✅ This setup allows you to build **multiple environments** (Dev, QA, Prod) locally or via EAS with **dynamic assets, package names, and app names**.
