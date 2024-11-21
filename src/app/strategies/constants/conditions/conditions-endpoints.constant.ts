import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { CONDITIONS } from "./conditions.constant";

export const CONDITIONS_ENDPOINTS = {
	BASE: CONDITIONS,
	GET_CONDITIONS: "",
	GET_CONDITION: `${DYNAMIC_ID}`,
	CREATE_CONDITION: "",
	UPDATE_CONDITION: `${DYNAMIC_ID}`,
	DELETE_CONDITION: `${DYNAMIC_ID}`
};
