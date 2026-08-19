import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { UpdateCustomerDto } from "./dto/update-customer.dto.js";
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

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.customersService.findAll(
      request.user.companyId,
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

  @Patch(":id")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
      request.user.companyId,
      id,
      dto,
    );
  }

  @Delete(":id")
  remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.customersService.remove(
      request.user.companyId,
      id,
    );
  }
}