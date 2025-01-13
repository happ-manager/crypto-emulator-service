import type { ValidationOptions } from "class-validator";
import { registerDecorator } from "class-validator";

import { environment } from "../../../environments/environment";
import { ErrorsEnum } from "../enums/errors.enum";
import { CryptoJs } from "../utils/crypto-js.util";

const crypto = new CryptoJs(environment.crypto.secret);

export function IsCryptedLength(length: number, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "IsCryptedLength",
			target: object.constructor,
			propertyName,
			constraints: [propertyName],
			options: { message: ErrorsEnum.InvalidEncryptionLength, ...validationOptions },
			validator: {
				validate(value: string) {
					return crypto.decrypt(value).length > length;
				}
			}
		});
	};
}
