import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { readdirSync, statSync } from "fs";
import { rmdirSync } from "node:fs";
import { normalize } from "node:path";
import { join } from "path";

// Use flora-colossus for finding all dependencies of EXTERNAL_DEPENDENCIES
// flora-colossus is maintained by MarshallOfSound (a top electron-forge contributor)
// already included as a dependency of electron-packager/galactus (so we do NOT have to add it to package.json)
// grabs nested dependencies from tree
import { DepType, Walker, type Module } from "flora-colossus";
let nativeModuleDependenciesToPackage: string[] = [];

const EXTERNAL_DEPENDENCIES = ["puppeteer", "puppeteer-core", "fluent-ffmpeg", "better-sqlite3"];

/**
 * https://github.com/electron/forge/issues/3738#issuecomment-2622541945
 */
const config: ForgeConfig = {
  packagerConfig: {
    prune: true,
    asar: { unpackDir: "" },
    ignore: (file) => {
      const filePath = file.toLowerCase();
      const KEEP_FILE = {
        keep: false,
        log: true,
      };
      // NOTE: must return false for empty string or nothing will be packaged
      if (filePath === "") KEEP_FILE.keep = true;
      if (!KEEP_FILE.keep && filePath === "/package.json") KEEP_FILE.keep = true;
      if (!KEEP_FILE.keep && filePath === "/node_modules") KEEP_FILE.keep = true;
      if (!KEEP_FILE.keep && filePath === "/.vite") KEEP_FILE.keep = true;
      if (!KEEP_FILE.keep && filePath.startsWith("/.vite/")) KEEP_FILE.keep = true;
      if (!KEEP_FILE.keep && filePath.startsWith("/node_modules/")) {
        // check if matches any of the external dependencies
        for (const dep of nativeModuleDependenciesToPackage) {
          if (filePath === `/node_modules/${dep}/` || filePath === `/node_modules/${dep}`) {
            KEEP_FILE.keep = true;
            break;
          }
          if (filePath === `/node_modules/${dep}/package.json`) {
            KEEP_FILE.keep = true;
            break;
          }
          if (filePath.startsWith(`/node_modules/${dep}/`)) {
            KEEP_FILE.keep = true;
            KEEP_FILE.log = false;
            break;
          }
        }
      }
      if (KEEP_FILE.keep) {
        if (KEEP_FILE.log) console.log("Keeping:", file);
        return false;
      }
      return true;
    },

    // if applicable, your other config / options / app info
    overwrite: true,

    // osxSign: {
    //   // if applicable, your codesigning configuration here
    // },

    // osxNotarize: {
    //   // if applicable, your notarization configuration here
    // },
  },
  rebuildConfig: {
    force: true,
  },
  makers: [new MakerSquirrel({}), new MakerZIP({}, ["darwin"]), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/electron/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/electron/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
  hooks: {
    prePackage: async () => {
      const projectRoot = normalize(__dirname);
      const getExternalNestedDependencies = async (
        nodeModuleNames: string[],
        includeNestedDeps = true
      ) => {
        const foundModules = new Set(nodeModuleNames);
        if (includeNestedDeps) {
          for (const external of nodeModuleNames) {
            type MyPublicClass<T> = {
              [P in keyof T]: T[P];
            };
            type MyPublicWalker = MyPublicClass<Walker> & {
              modules: Module[];
              walkDependenciesForModule: (moduleRoot: string, depType: DepType) => Promise<void>;
            };
            const moduleRoot = join(projectRoot, "node_modules", external);
            const walker = new Walker(moduleRoot) as unknown as MyPublicWalker;
            walker.modules = [];
            await walker.walkDependenciesForModule(moduleRoot, DepType.PROD);
            walker.modules
              .filter((dep) => (dep.nativeModuleType as number) === DepType.PROD)
              // for a package like '@realm/fetch', need to split the path and just take the first part
              .map((dep) => dep.name.split("/")[0]!)
              .forEach((name) => foundModules.add(name));
          }
        }
        return foundModules;
      };
      const nativeModuleDependencies = await getExternalNestedDependencies(EXTERNAL_DEPENDENCIES);
      nativeModuleDependenciesToPackage = Array.from(nativeModuleDependencies);
    },
    packageAfterPrune: async (_forgeConfig, buildPath) => {
      function getItemsFromFolder(
        path: string,
        totalCollection: {
          path: string;
          type: "directory" | "file";
          empty: boolean;
        }[] = []
      ) {
        try {
          const normalizedPath = normalize(path);
          const childItems = readdirSync(normalizedPath);
          const getItemStats = statSync(normalizedPath);
          if (getItemStats.isDirectory()) {
            totalCollection.push({
              path: normalizedPath,
              type: "directory",
              empty: childItems.length === 0,
            });
          }
          childItems.forEach((childItem) => {
            const childItemNormalizedPath = join(normalizedPath, childItem);
            const childItemStats = statSync(childItemNormalizedPath);
            if (childItemStats.isDirectory()) {
              getItemsFromFolder(childItemNormalizedPath, totalCollection);
            } else {
              totalCollection.push({
                path: childItemNormalizedPath,
                type: "file",
                empty: false,
              });
            }
          });
        } catch {
          return;
        }
        return totalCollection;
      }

      const getItems = getItemsFromFolder(buildPath) ?? [];
      for (const item of getItems) {
        const DELETE_EMPTY_DIRECTORIES = true;
        if (item.empty === true) {
          if (DELETE_EMPTY_DIRECTORIES) {
            const pathToDelete = normalize(item.path);
            // one last check to make sure it is a directory and is empty
            const stats = statSync(pathToDelete);
            if (!stats.isDirectory()) {
              // SKIPPING DELETION: pathToDelete is not a directory
              return;
            }
            const childItems = readdirSync(pathToDelete);
            if (childItems.length !== 0) {
              // SKIPPING DELETION: pathToDelete is not empty
              return;
            }
            rmdirSync(pathToDelete);
          }
        }
      }
    },
  },
};

export default config;
