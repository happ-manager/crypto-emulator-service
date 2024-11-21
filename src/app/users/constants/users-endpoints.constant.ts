import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { USERS } from "./users.constant";

export const USERS_ENDPOINTS = {
	BASE: USERS,
	GET_USERS: "",
	GET_USER: `${DYNAMIC_ID}`,
	CREATE_USER: "",
	UPDATE_USER: `${DYNAMIC_ID}`,
	DELETE_USER: `${DYNAMIC_ID}`
};
