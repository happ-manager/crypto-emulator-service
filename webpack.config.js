const path = require("path");
const webpack = require("webpack");

module.exports = function (options, webpack) {
	return {
		...options,
		entry: {
			main: "./src/main.ts",
			analyticsWorker: "./src/workers/analytics.worker.ts",
			transactionsWorker: "./src/workers/transactions.worker.ts"
		},
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "[name].js" // Создаёт main.js и analyticsWorker.js
		},
		target: "node",
		plugins: [
			...options.plugins,
			new webpack.NormalModuleReplacementPlugin(
				/src[\\\/]environments[\\\/]environment.ts/,
				`./environment${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}.ts`
			)
		],
		resolve: {
			extensions: [".ts", ".js"]
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: "ts-loader",
					exclude: /node_modules/
				}
			]
		}
	};
};
