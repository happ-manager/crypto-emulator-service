import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { TRANSACTIONS } from "./transactions.constant";

export const TRANSACTIONS_ENDPOINTS = {
	BASE: TRANSACTIONS,
	GET_TRANSACTIONS: "",
	GET_TRANSACTION: `${DYNAMIC_ID}`,
	CREATE_TRANSACTION: "",
	UPDATE_TRANSACTION: `${DYNAMIC_ID}`,
	DELETE_TRANSACTION: `${DYNAMIC_ID}`
};
