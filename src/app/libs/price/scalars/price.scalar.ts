import { BadRequestException, Injectable } from "@nestjs/common";
import type { CustomScalar } from "@nestjs/graphql";
import { Scalar } from "@nestjs/graphql";
import Big from "big.js";
import type { ValueNode } from "graphql";
import { Kind } from "graphql";

@Scalar("IPrice")
@Injectable()
export class PriceScalar implements CustomScalar<string, Big> {
	description = "Custom scalar for prices using Big.js";

	serialize(value: Big | string): string {
		const price = new Big(value);
		return price.toString(); // Преобразуем в строку
	}

	parseValue(value: string): Big {
		try {
			return new Big(value);
		} catch {
			throw new BadRequestException("Invalid price format");
		}
	}

	parseLiteral(ast: ValueNode): Big {
		if (ast.kind === Kind.STRING) {
			try {
				return new Big(ast.value);
			} catch {
				throw new BadRequestException("Invalid price format in AST");
			}
		}
		throw new BadRequestException("Invalid price literal type");
	}
}
