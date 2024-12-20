import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { WALLETS } from "./wallets.constant";

export const WALLETS_ENDPOINTS = {
	BASE: WALLETS,
	GET_WALLETS: "",
	GET_WALLET: `${DYNAMIC_ID}`,
	CREATE_WALLET: "",
	UPDATE_WALLET: `${DYNAMIC_ID}`,
	DELETE_WALLET: `${DYNAMIC_ID}`,
	WRAP_SOLANA: `${DYNAMIC_ID}/wrap-solana`
};
