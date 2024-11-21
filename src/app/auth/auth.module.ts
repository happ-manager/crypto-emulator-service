import { Module } from "@nestjs/common";

import { CryptoModule } from "../libs/crypto";
import { JwtModule } from "../libs/jwt";
import { UsersModule } from "../users/users.module";
import { AUTH_MIDDLEWARES } from "./middlewares";
import { AUTH_RESOLVERS } from "./resolvers";
import { AUTH_SERVICES } from "./services";

@Module({
	imports: [JwtModule.forChild(), CryptoModule.forChild(), UsersModule],
	providers: [...AUTH_SERVICES, ...AUTH_MIDDLEWARES, ...AUTH_RESOLVERS],
	exports: AUTH_SERVICES
})
export class AuthModule {}
