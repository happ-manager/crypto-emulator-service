import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { POOLS } from "./pools.constant";

export const POOLS_ENDPOINTS = {
	BASE: POOLS,
	GET_POOLS: "",
	GET_POOL: `${DYNAMIC_ID}`,
	CREATE_POOL: "",
	UPDATE_POOL: `${DYNAMIC_ID}`,
	DELETE_POOL: `${DYNAMIC_ID}`
};
