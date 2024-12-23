import { struct, u8, u64 } from "@raydium-io/raydium-sdk";

export const CREATE_POOL_STRUCT = struct([
	u8("instruction"), // 1 байт: тип инструкции
	u8("nonce"), // 1 байт: nonce
	u64("openTime"), // 8 байт: время в формате Little Endian
	u64("coinAmount"), // 8 байт: количество монет
	u64("pcAmount") // 8 байт: количество PC токенов
]);
