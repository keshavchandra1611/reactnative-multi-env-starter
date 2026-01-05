import { Dimensions, NativeModules } from "react-native";

// export const getSizeFromNativeModules = async (): Promise<{
//   width: number;
//   height: number;
//   density: number;
// }> => {
//   try {
//     const { width, height, density } =
//       await NativeModules.DisplayMetricsModule.getScreenSize();
//     return { width, height, density };
//   } catch (err) {
//     console.error("Error getting screen size:", err);
//     return { width: 0, height: 0, density: 0 }; // fallback
//   }
// };

const screenCategories = [
  "SD", // 0 → ≤ 720p (SD)
  "HD", // 1 → 1280×720 (HD)
  "FHD", // 2 → 1920×1080 (Full HD)
  "QHD", // 3 → 2560×1440 (QHD)
  "UHD", // 4 → 3840×2160 (4K)
];

const screenScales = {
  fontScale:        [0.8, 1, 1.3, 1.6, 2],
  imageScale:       [0.8, 1, 1.3, 1.6, 2],
  paddingScale:     [0.8, 1, 1.3, 1.6, 2],
  heightScale:      [0.8, 1, 1.3, 1.6, 2],
  widthScale:       [0.8, 1, 1.3, 1.6, 2],
  marginScale:      [0.8, 1, 1.3, 1.6, 2],
  borderRadiusScale:[0.8, 1, 1.3, 1.6, 2],
  borderWidth:      [0.8, 1, 1.3, 1.6, 2],
  gapScale:         [0.8, 1, 1.3, 1.6, 2],
  defaultScale:     [0.8, 1, 1.3, 1.6, 2],
};

let cachedSizeConfig: ReturnType<typeof getFreshSizeConfig>;

const getScreenCategoryIndex = () => {
  const { width, height } = Dimensions.get("window");
  if (width >= 3840 || height >= 2160) return 4; // 4K
  if (width >= 2560 || height >= 1440) return 3; // QHD
  if (width >= 1920 || height >= 1080) return 2; // Full HD
  if (width >= 1280 || height >= 720) return 1; // HD
  return 0; // Below 720p // (SD)
};

// ✅ Internal function to freshly compute config
const getFreshSizeConfig = () => {
  const index = getScreenCategoryIndex();
  const { width, height } = Dimensions.get("window");
  // console.log(
  //   `\x1b[1;33m🐹 width. height:\x1b[0m \x1b[0;35m${width} -  ${height}\x1b[0m`
  // );

  // console.log("screenCategories[index]")
  // console.log(screenCategories[index])

  return {
    cat: screenCategories[index],
    screenWidth: width,
    screenHeight: height,
    resolution:
      index === 4
        ? "≈ 3840×2160 (4K)"
        : index === 3
        ? "≈ 2560×1440 (QHD)"
        : index === 2
        ? "≈ 1920×1080 (Full HD)"
        : index === 1
        ? "≈ 1280×720 (HD)"
        : "≤ 720p (SD)",
    fontScale: screenScales.fontScale[index],
    imageScale: screenScales.imageScale[index],
    paddingScale: screenScales.paddingScale[index],
    heightScale: screenScales.heightScale[index],
    widthScale: screenScales.widthScale[index],
    marginScale: screenScales.marginScale[index],
    borderRadiusScale: screenScales.borderRadiusScale[index],
    borderWidth: screenScales.borderWidth[index],
    gapScale: screenScales.gapScale[index],
    defaultScale: screenScales.defaultScale[index],
  };
};

// ✅ Public function - always returns the current config
export const getSizeConfig = () => {
  if (!cachedSizeConfig) {
    cachedSizeConfig = getFreshSizeConfig();
  }
  return cachedSizeConfig;
};

// ✅ Set up a one-time listener for changes
const subscribeToDimensionChanges = () => {
  const { width, height } = Dimensions.get("window");
  Dimensions.addEventListener("change", () => {
    // console.log(
    //   `\x1b[1;33m🐹 From screenConfig.ts:\x1b[0m \x1b[0;35m Width-${width}, Height-${height}\x1b[0m`
    // );
    cachedSizeConfig = getFreshSizeConfig();
    // console.log(
    //   `\x1b[1;33m🐹 From screenConfig.ts:\x1b[0m \x1b[0;35m[ScreenConfig] Dimensions changed, config updated\x1b[0m`
    // );
  });
};

// Call once at app init
subscribeToDimensionChanges();

//Can be used like this for detect change and fast refresh

//   const [reloadKey, setReloadKey] = useState(0);
//   const [sizeConfig, setSizeConfig] = useState(() => getSizeConfig());

//   // Watch for sizeConfig change
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const newConfig = getSizeConfig();
//       if (JSON.stringify(newConfig) !== JSON.stringify(sizeConfig)) {
//         console.log("Size config changed — triggering rerender");
//         setSizeConfig(newConfig);
//         setReloadKey(prev => prev + 1);
//       }
//     }, 500); // Check every 500ms (tune as needed)

//     return () => clearInterval(interval);
//   }, [sizeConfig]);

// <View style={styles.container} key={reloadKey}>
