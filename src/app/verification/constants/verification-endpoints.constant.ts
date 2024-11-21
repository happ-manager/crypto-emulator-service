import { TOKEN_ADDRESS } from "../../shared/constants/token-address.constant";
import { VERIFICATION } from "./verification.constant";

export const VERIFICATION_ENDPOINTS = {
	BASE: VERIFICATION,
	CHECK: `${TOKEN_ADDRESS}/check`
};
