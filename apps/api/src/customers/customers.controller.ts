import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { CustomersService } from "./customers.service.js";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    companyId: string;
    role: string;
  };
};

@UseGuards(AuthGuard)
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(
      request.user.companyId,
      dto,
    );
  }

  @Get(":id")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.customersService.findOne(
      request.user.companyId,
      id,
    );
  }
}