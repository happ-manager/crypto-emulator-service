import type { ExecutionContext } from "@nestjs/common";
import { BadRequestException, createParamDecorator } from "@nestjs/common";

export const TokenAddress = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
	const request = ctx.switchToHttp().getRequest();
	const { tokenAddress } = request.params;

	// Пример валидации для Solana-адресов (длина 44 символа)
	if (!tokenAddress || tokenAddress.length !== 44) {
		throw new BadRequestException("Invalid token address format");
	}

	return tokenAddress;
});
