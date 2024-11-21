import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { CREDENTIALS } from "./credentials.constant";

export const CREDENTIALS_ENDPOINTS = {
	BASE: CREDENTIALS,
	GET_CREDENTIALS: "",
	GET_CREDENTIAL: `${DYNAMIC_ID}`,
	CREATE_CREDENTIAL: "",
	UPDATE_CREDENTIAL: `${DYNAMIC_ID}`,
	DELETE_CREDENTIAL: `${DYNAMIC_ID}`
};
