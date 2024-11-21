import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { MILESTONES } from "./milestones.constant";

export const MILESTONES_ENDPOINTS = {
	BASE: MILESTONES,
	GET_MILESTONES: "",
	GET_MILESTONE: `${DYNAMIC_ID}`,
	CREATE_MILESTONE: "",
	UPDATE_MILESTONE: `${DYNAMIC_ID}`,
	DELETE_MILESTONE: `${DYNAMIC_ID}`
};
