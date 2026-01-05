import { ExpoConfig, ConfigContext } from "expo/config";

type AppEnv = "dev" | "qa" | "prod";

export default ({ config }: ConfigContext): ExpoConfig => {
  const ENV = (process.env.APP_ENV ?? "dev") as AppEnv;

  const baseAssetPath = `./assets/${ENV}`; // <--- dynamic base folder

  const appIds: Record<AppEnv, string> = {
    dev: "com.leapclicker.ap.dev",
    qa: "com.leapclicker.ap.qa",
    prod: "com.leapclicker.ap",
  };

  const appNames: Record<AppEnv, string> = {
    dev: "Leap Clicker Dev",
    qa: "Leap Clicker QA",
    prod: "Leap Clicker",
  };

  const icons: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/icon.png`,
    qa: `${baseAssetPath}/icon.png`,
    prod: `${baseAssetPath}/icon.png`,
  };

  const adaptiveIcons: Record<
    AppEnv,
    { foreground: string; background: string }
  > = {
    dev: {
      foreground: `${baseAssetPath}/adaptive-icon.png`,
      background: "#ffffff",
    },
    qa: {
      foreground: `${baseAssetPath}/adaptive-icon.png`,
      background: "#ffffff",
    },
    prod: {
      foreground: `${baseAssetPath}/adaptive-icon.png`,
      background: "#ffffff",
    },
  };

  const splashImages: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/splash-screen.png`,
    qa: `${baseAssetPath}/splash-screen.png`,
    prod: `${baseAssetPath}/splash-screen.png`,
  };

  const favicons: Record<AppEnv, string> = {
    dev: `${baseAssetPath}/favicon.png`,
    qa: `${baseAssetPath}/favicon.png`,
    prod: `${baseAssetPath}/favicon.png`,
  };

  return {
    ...config,

    // App identity
    name: appNames[ENV],
    slug: "new-leap-clicker-ap",
    owner: "physicswallah",
    version: "1.0.0",

    // UI / behavior
    orientation: "landscape",
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
      // @ts-expect-error — Expo supports this, typings are outdated
      language: "java",
      adaptiveIcon: {
        foregroundImage: adaptiveIcons[ENV].foreground,
        backgroundColor: adaptiveIcons[ENV].background,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      jsEngine: "hermes", // enable Hermes
    },

    web: {
      favicon: favicons[ENV],
    },

    // ✅ Plugins for Proguard / resource shrinking
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            shrinkResources: true, // remove unused resources
            extraProguardRules: `
              -keep class com.facebook.react.** { *; }
              -keep class com.facebook.hermes.** { *; }
            `,
          },
        },
      ],
    ],

    extra: {
      env: ENV,
      eas: {
        projectId: "b6a52104-b34a-4cc1-bad0-1a5814fd1440",
      },
    },
  };
};
