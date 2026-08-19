import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
  }) {
    return this.prisma.company.create({
      data,
    });
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return company;
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
  ) {
    await this.findById(id);

    return this.prisma.company.update({
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
}