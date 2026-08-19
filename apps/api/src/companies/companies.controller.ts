import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { UserRole } from "../generated/enums.js";
import { CompaniesService } from "./companies.service.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    companyId: string;
    role: UserRole;
  };
};

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@Controller("companies")
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @Get("me")
  findMyCompany(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.findById(
      request.user.companyId,
    );
  }

  @Patch("me")
  updateMyCompany(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(
      request.user.companyId,
      dto,
    );
  }
}