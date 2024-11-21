export function getTokenAddress(message: string) {
	try {
		const [tokenAddress] = /[\dA-Za-z]{32,}/.exec(message);

		return tokenAddress;
	} catch {
		return null;
	}
}
