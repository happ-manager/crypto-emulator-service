import type { ValidationOptions } from "class-validator";
import { registerDecorator } from "class-validator";

import { CryptoJs } from "../../libs/crypto/crypto-js.class";
import { ErrorsEnum } from "../enums/errors.enum";

const crypto = new CryptoJs("");

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
