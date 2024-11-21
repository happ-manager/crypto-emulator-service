import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { CANDLES } from "./candles.constant";

export const CANDLES_ENDPOINTS = {
	BASE: CANDLES,
	GET_CANDLES: "",
	GET_CANDLE: `${DYNAMIC_ID}`,
	CREATE_CANDLE: "",
	UPDATE_CANDLE: `${DYNAMIC_ID}`,
	DELETE_CANDLE: `${DYNAMIC_ID}`
};
