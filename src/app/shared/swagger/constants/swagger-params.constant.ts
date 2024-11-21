import { PAIR_ID } from "../../constants/pair-id.constant";
import { TOKEN_ADDRESS } from "../../constants/token-address.constant";

export const TOKEN_ADDRESS_PARAM = {
	name: TOKEN_ADDRESS.replace(":", ""),
	required: false,
	type: String,
	description: "Адрес кошелька",
	example: "56S29mZ3wqvw8hATuUUFqKhGcSGYFASRRFNT38W8q7G3"
};

export const PAIR_ID_PARAM = {
	name: PAIR_ID.replace(":", ""),
	required: false,
	type: String,
	description: "Айди пары",
	example: "56S29mZ3wqvw8hATuUUFqKhGcSGYFASRRFNT38W8q7G3"
};
