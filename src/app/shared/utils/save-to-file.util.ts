import * as fs from "fs";
import * as path from "path";

export function appendToFile(relativeFilePath: string, data: string): void {
	const filePath = path.join("src/assets", relativeFilePath);
	try {
		fs.appendFileSync(filePath, data, "utf-8");
	} catch (error) {
		console.error(error, "appendToFile");
	}
}
