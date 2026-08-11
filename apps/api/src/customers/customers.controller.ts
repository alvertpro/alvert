import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CustomersService } from "./customers.service.js";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
      companyId: string;
    },
  ) {
    return this.customersService.create(body);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }
}