import * as CryptoJS from "crypto-js";

export class CryptoJs {
	constructor(private readonly _secret: string) {}

	// Password Crypting
	check(data: string) {
		return CryptoJS.AES.decrypt(data, this._secret).toString(CryptoJS.enc.Utf8).length > 0;
	}

	encrypt(data: string) {
		return CryptoJS.AES.encrypt(JSON.stringify(data), this._secret, { mode: CryptoJS.mode.ECB }).toString();
	}

	decrypt(data: string) {
		return CryptoJS.AES.decrypt(data, this._secret).toString(CryptoJS.enc.Utf8);
	}
}
