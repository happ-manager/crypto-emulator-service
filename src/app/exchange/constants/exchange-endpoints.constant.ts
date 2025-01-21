import { DYNAMIC_ID } from "../../shared/constants/prefix.constant";
import { EXCHANGE } from "./exchange.constant";

export const EXCHANGE_ENDPOINTS = {
	BASE: EXCHANGE,
	BUY: `${DYNAMIC_ID}/buy`,
	SELL: `${DYNAMIC_ID}/sell`
};
