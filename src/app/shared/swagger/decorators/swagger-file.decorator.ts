import { ApiBody, ApiConsumes } from "@nestjs/swagger";

export const SwaggerFile =
	(fileName: string = "file"): MethodDecorator =>
	(target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		ApiConsumes("multipart/form-data")(target, propertyKey, descriptor);
		ApiBody({
			description: "File to upload",
			required: true,
			type: "multipart/form-data",
			schema: {
				type: "object",
				properties: {
					[fileName]: {
						type: "string",
						format: "binary"
					}
				}
			}
		})(target, propertyKey, descriptor);
	};
