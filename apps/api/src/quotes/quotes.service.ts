import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { QuoteStatus } from "../generated/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { UpdateQuoteItemDto } from "./dto/update-quote-item.dto.js";
import { UpdateQuoteDto } from "./dto/update-quote.dto.js";

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    dto: CreateQuoteDto,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        companyId,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const quoteNumber = `TEK-${Date.now()}`;

    return this.prisma.quote.create({
      data: {
        quoteNumber,
        title: dto.title,
        companyId,
        customerId: dto.customerId,
        validUntil: dto.validUntil
          ? new Date(dto.validUntil)
          : undefined,
      },
    });
  }

  async findOne(
    companyId: string,
    id: string,
  ) {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id,
        companyId,
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

  async findAll(companyId: string) {
    return this.prisma.quote.findMany({
      where: {
        companyId,
      },
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

  async updateStatus(
    companyId: string,
    id: string,
    status: QuoteStatus,
  ) {
    await this.requireQuote(companyId, id);

    return this.prisma.quote.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateQuoteDto,
  ) {
    const quote = await this.requireQuote(companyId, id);

    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: {
          id: dto.customerId,
          companyId,
        },
      });

      if (!customer) {
        throw new NotFoundException("Customer not found");
      }
    }

    return this.prisma.quote.update({
      where: {
        id: quote.id,
      },
      data: {
        title: dto.title,
        customerId: dto.customerId,
        validUntil: dto.validUntil
          ? new Date(dto.validUntil)
          : undefined,
      },
    });
  }

  async remove(
    companyId: string,
    id: string,
  ) {
    await this.requireQuote(companyId, id);

    await this.prisma.quote.delete({
      where: {
        id,
      },
    });

    return {
      deleted: true,
      quoteId: id,
    };
  } 

 async updateDiscount(
    companyId: string,
    id: string,
    discount: number,
  ) {
    const quote = await this.requireQuote(
      companyId,
      id,
    );

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

    return this.prisma.quote.update({
      where: {
        id,
      },
      data: {
        discount,
        total: subtotal - discount,
      },
    });
  }

  async addItem(
    companyId: string,
    quoteId: string,
    dto: CreateQuoteItemDto,
  ) {
    await this.requireQuote(companyId, quoteId);

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

    await this.recalculateQuote(
      companyId,
      quoteId,
    );

    return item;
  }

  async updateItem(
    companyId: string,
    quoteId: string,
    itemId: string,
    dto: UpdateQuoteItemDto,
  ) {
    await this.requireQuote(companyId, quoteId);

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
        description:
          dto.description ?? item.description,
        quantity,
        unit: dto.unit ?? item.unit,
        unitPrice,
        total,
      },
    });

    await this.recalculateQuote(
      companyId,
      quoteId,
    );

    return updatedItem;
  }

  async removeItem(
    companyId: string,
    quoteId: string,
    itemId: string,
  ) {
    await this.requireQuote(companyId, quoteId);

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

    await this.recalculateQuote(
      companyId,
      quoteId,
    );

    return {
      deleted: true,
      itemId,
    };
  }

  private async requireQuote(
    companyId: string,
    quoteId: string,
  ) {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        companyId,
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return quote;
  }

  private async recalculateQuote(
    companyId: string,
    quoteId: string,
  ) {
    const quote = await this.requireQuote(
      companyId,
      quoteId,
    );

    const items = await this.prisma.quoteItem.findMany({
      where: {
        quoteId,
      },
    });

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

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