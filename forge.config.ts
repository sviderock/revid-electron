import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { readdirSync, statSync } from "fs";
import { copy, mkdirs } from "fs-extra";
import path, { dirname, join, resolve } from "path";

function getInstalledPackagesString() {
  const nodeModulesPath = path.join(process.cwd(), "node_modules");

  try {
    const packages = readdirSync(nodeModulesPath).filter((dir) => {
      // Filter out dot files and directories that start with a dot.
      if (dir.startsWith(".")) {
        return false;
      }
      // Check if it is a directory.
      const dirPath = path.join(nodeModulesPath, dir);
      return statSync(dirPath).isDirectory();
    });

    return packages;
  } catch (err) {
    console.error("Error reading node_modules:", err);
    return []; // Return empty object string on error.
  }
}

const packagesString = getInstalledPackagesString();

const requiredNativePackages = [
  "puppeteer",
  "puppeteer-core",
  "fluent-ffmpeg",
  "extract-zip",
  "debug",
  "ms",
  "get-stream",
  "pump",
  "@puppeteer/browsers",
  "semver",
  "proxy-agent",
  "lru-cache",
  "agent-base",
  "proxy-from-env",
  "progress",
  "yargs",
];

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // asar: {
    // 	unpack: "*.{node,dylib}",
    // 	unpackDir: packagesString,
    // },
  },
  rebuildConfig: {},
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
    /**
     * The call to this hook is mandatory for better-sqlite3 to work once the app built
     * https://stackoverflow.com/a/79445715
     */
    async packageAfterCopy(_forgeConfig, buildPath) {
      // __dirname isn't accessible from here
      const dirnamePath: string = ".";
      const sourceNodeModulesPath = resolve(dirnamePath, "node_modules");
      const destNodeModulesPath = resolve(buildPath, "node_modules");

      // Copy all asked packages in /node_modules directory inside the asar archive
      await Promise.all(
        packagesString.map(async (packageName) => {
          const sourcePath = join(sourceNodeModulesPath, packageName);
          const destPath = join(destNodeModulesPath, packageName);

          await mkdirs(dirname(destPath));
          await copy(sourcePath, destPath, {
            recursive: true,
            preserveTimestamps: true,
          });
        })
      );
    },
  },
};

export default config;
