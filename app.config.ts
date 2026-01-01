import { ExpoConfig, ConfigContext } from "expo/config";

type AppEnv = "dev" | "qa" | "prod";

export default ({ config }: ConfigContext): ExpoConfig => {
  const ENV = (process.env.APP_ENV ?? "dev") as AppEnv;

  const baseAssetPath = `./assets/${ENV}`; // <--- dynamic base folder

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
    dev: `${baseAssetPath}/splash-icon.png`,
    qa: `${baseAssetPath}/splash-icon.png`,
    prod: `${baseAssetPath}/splash-icon.png`,
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
    slug: "myapp",
    owner: "keshav1611",
    version: "1.0.0",

    // UI / behavior
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
        projectId: "5f12c90a-bca1-4bfb-9d32-daf9990a63ba",
      },
    },
  };
};
