import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { SIGNALS } from "./signals.constant";

export const SIGNALS_ENDPOINTS = {
	BASE: SIGNALS,
	GET_SIGNALS: "",
	GET_SIGNAL: `${DYNAMIC_ID}`,
	CREATE_SIGNAL: "",
	UPDATE_SIGNAL: `${DYNAMIC_ID}`,
	DELETE_SIGNAL: `${DYNAMIC_ID}`,
	PROCESS_NEW_SIGNALS: `process-new-signals`
};
