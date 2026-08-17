import {
  BadRequestException,  
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";
import type { QuoteStatus } from "../generated/enums.js";
import { UpdateQuoteItemDto } from "./dto/update-quote-item.dto.js";

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

  async findAll() {
    return this.prisma.quote.findMany({
      include: {
        company: true,
        customer: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStatus(id: string, status: QuoteStatus) {
    const quote = await this.prisma.quote.findUnique({
      where: {
        id,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return this.prisma.quote.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async updateDiscount(id: string, discount: number) {
    const quote = await this.prisma.quote.findUnique({
      where: {
        id,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    if (discount < 0) {
      throw new BadRequestException(
        "Discount cannot be negative",
      );
    }

    const subtotal = Number(quote.subtotal);

    if (discount > subtotal) {
      throw new BadRequestException(
        "Discount cannot be greater than subtotal",
      );
    }

    const total = subtotal - discount;

    return this.prisma.quote.update({
      where: {
        id,
      },
      data: {
        discount,
        total,
      },
    });
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

  async updateItem(
    quoteId: string,
    itemId: string,
    dto: UpdateQuoteItemDto,
  ) {
    const item = await this.prisma.quoteItem.findFirst({
      where: {
        id: itemId,
        quoteId,
      },
    });

    if (!item) {
      throw new NotFoundException("Quote item not found");
    }

    const quantity =
      dto.quantity ?? Number(item.quantity);

    const unitPrice =
      dto.unitPrice ?? Number(item.unitPrice);

    const total = quantity * unitPrice;

    const updatedItem = await this.prisma.quoteItem.update({
      where: {
        id: itemId,
      },
      data: {
        description: dto.description ?? item.description,
        quantity,
        unit: dto.unit ?? item.unit,
        unitPrice,
        total,
      },
    });

    await this.recalculateQuote(quoteId);

    return updatedItem;
  }

  async removeItem(
    quoteId: string,
    itemId: string,
  ) {
    const item = await this.prisma.quoteItem.findFirst({
      where: {
        id: itemId,
        quoteId,
      },
    });

    if (!item) {
      throw new NotFoundException("Quote item not found");
    }

    await this.prisma.quoteItem.delete({
      where: {
        id: itemId,
      },
    });

    await this.recalculateQuote(quoteId);

    return {
      deleted: true,
      itemId,
    };
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