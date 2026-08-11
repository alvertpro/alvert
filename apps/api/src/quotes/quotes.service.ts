import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuoteDto) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: dto.companyId,
      },
    });

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: dto.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    if (customer.companyId !== company.id) {
      throw new NotFoundException(
        "Customer does not belong to this company",
      );
    }

    const quoteNumber = `TEK-${Date.now()}`;

    return this.prisma.quote.create({
      data: {
        quoteNumber,
        title: dto.title,
        companyId: dto.companyId,
        customerId: dto.customerId,
        validUntil: dto.validUntil
          ? new Date(dto.validUntil)
          : undefined,
      },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
        customer: true,
        items: true,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return quote;
  }

  async addItem(
    quoteId: string,
    dto: CreateQuoteItemDto,
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: {
        id: quoteId,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    const quantity = dto.quantity;
    const unitPrice = dto.unitPrice;
    const itemTotal = quantity * unitPrice;

    const item = await this.prisma.quoteItem.create({
      data: {
        description: dto.description,
        quantity,
        unit: dto.unit ?? "adet",
        unitPrice,
        total: itemTotal,
        quoteId,
      },
    });

    await this.recalculateQuote(quoteId);

    return item;
  }

  private async recalculateQuote(quoteId: string) {
    const items = await this.prisma.quoteItem.findMany({
      where: {
        quoteId,
      },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

    const quote = await this.prisma.quote.findUnique({
      where: {
        id: quoteId,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    const discount = Number(quote.discount);
    const total = subtotal - discount;

    await this.prisma.quote.update({
      where: {
        id: quoteId,
      },
      data: {
        subtotal,
        total,
      },
    });
  }
}