import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { CONDITIONS_GROUPS } from "./conditions-groups.constant";

export const CONDITIONS_GROUPS_ENDPOINTS = {
	BASE: CONDITIONS_GROUPS,
	GET_CONDITIONS_GROUPS: "",
	GET_CONDITION_GROUP: `${DYNAMIC_ID}`,
	CREATE_CONDITION_GROUP: "",
	UPDATE_CONDITION_GROUP: `${DYNAMIC_ID}`,
	DELETE_CONDITION_GROUP: `${DYNAMIC_ID}`
};
