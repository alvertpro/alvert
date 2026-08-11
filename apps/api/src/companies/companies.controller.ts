import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CompaniesService } from "./companies.service.js";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
    },
  ) {
    return this.companiesService.create(body);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.companiesService.findById(id);
  }
}