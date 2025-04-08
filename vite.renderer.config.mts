import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const ReactCompilerConfig = {};

export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
			},
		}),
	],
	resolve: {
		preserveSymlinks: true,
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
