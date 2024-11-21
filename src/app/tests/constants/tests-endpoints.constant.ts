import { PAIR_ID } from "../../shared/constants/pair-id.constant";
import { TESTS } from "./tests.constant";

export const TESTS_ENDPOINTS = {
	BASE: TESTS,
	GET_CANDLES: `${PAIR_ID}/get-candles`,
	GET_FORMATED_CANDLES: `${PAIR_ID}/get-formated-candles`
};
