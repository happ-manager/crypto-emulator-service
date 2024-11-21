import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { CHANNELS } from "./channels.constant";

export const CHANNELS_ENDPOINTS = {
	BASE: CHANNELS,
	GET_CHANNELS: "",
	GET_CHANNEL: `${DYNAMIC_ID}`,
	CREATE_CHANNEL: "",
	UPDATE_CHANNEL: `${DYNAMIC_ID}`,
	DELETE_CHANNEL: `${DYNAMIC_ID}`
};
