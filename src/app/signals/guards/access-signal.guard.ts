import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccessSignalGuard implements CanActivate {
	async canActivate(_context: ExecutionContext) {
		return true;
	}
}
