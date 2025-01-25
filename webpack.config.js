const path = require("path");
const webpack = require("webpack");

module.exports = function (options, webpack) {
	return {
		...options,
		entry: {
			main: "./src/main.ts", // Основной файл приложения
			checkedSignalsWorker: "./src/workers/checked-signals.worker.ts", // Файл воркера
			transactionsWorker: "./src/workers/transactions.worker.ts" // Файл воркера
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
