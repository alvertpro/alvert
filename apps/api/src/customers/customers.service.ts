import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { UpdateCustomerDto } from "./dto/update-customer.dto.js";

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

  async findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: "desc",
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

  async update(
    companyId: string,
    id: string,
    dto: UpdateCustomerDto,
  ) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
  }

  async remove(
    companyId: string,
    id: string,
  ) {
    await this.findOne(companyId, id);

    await this.prisma.customer.delete({
      where: {
        id,
      },
    });

    return {
      deleted: true,
      customerId: id,
    };
  }
}