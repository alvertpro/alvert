import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { UserRole } from "../generated/enums.js";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto.js";
import { UsersService } from "./users.service.js";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    companyId: string;
    role: UserRole;
  };
};

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.findAllByCompany(
      request.user.companyId,
    );
  }

  @Post()
  createTeamMember(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTeamMemberDto,
  ) {
    return this.usersService.createTeamMember(
      request.user.companyId,
      dto,
    );
  }
}