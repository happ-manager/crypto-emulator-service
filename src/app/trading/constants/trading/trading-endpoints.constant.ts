import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { TRADING } from "./trading.constant";

export const TRADING_ENDPOINTS = {
	BASE: TRADING,
	BUY: `${DYNAMIC_ID}/buy`,
	SELL: `${DYNAMIC_ID}/sell`,
	START: `${DYNAMIC_ID}/start`,
	STOP: `${DYNAMIC_ID}/stop`
};
