import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    dto: CreateCustomerDto,
  ) {
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        companyId,
      },
    });
  }

  async findOne(
    companyId: string,
    id: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }
}