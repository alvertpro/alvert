import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { QuotesService } from "./quotes.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";
import { UpdateQuoteStatusDto } from "./dto/update-quote-status.dto.js";
import { UpdateQuoteDiscountDto } from "./dto/update-quote-discount.dto.js";
import { UpdateQuoteItemDto } from "./dto/update-quote-item.dto.js";

@Controller("quotes")
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }
  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, dto.status);
  }

  @Post(":id/items")
  addItem(
    @Param("id") id: string,
    @Body() dto: CreateQuoteItemDto,
  ) {
    return this.quotesService.addItem(id, dto);
  }

  @Patch(":quoteId/items/:itemId")
  updateItem(
    @Param("quoteId") quoteId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateQuoteItemDto,
  ) {
    return this.quotesService.updateItem(
      quoteId,
      itemId,
      dto,
    );
  }

  @Delete(":quoteId/items/:itemId")
  removeItem(
    @Param("quoteId") quoteId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.quotesService.removeItem(
      quoteId,
      itemId,
    );
  }

  @Patch(":id/discount")
  updateDiscount(
    @Param("id") id: string,
    @Body() dto: UpdateQuoteDiscountDto,
  ) {
    return this.quotesService.updateDiscount(
      id,
      dto.discount,
    );
  }
}