import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TESTS } from "../constants/tests.constant";
import { TESTS_ENDPOINTS } from "../constants/tests-endpoints.constant";

@ApiTags(TESTS)
@Controller(TESTS_ENDPOINTS.BASE)
export class TestsController {}
