import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

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
    return this.prisma.company.findUnique({
      where: { id },
    });
  }
}