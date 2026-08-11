import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { QuotesService } from "./quotes.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";

@Controller("quotes")
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.quotesService.findOne(id);
  }

  @Post(":id/items")
  addItem(
    @Param("id") id: string,
    @Body() dto: CreateQuoteItemDto,
  ) {
    return this.quotesService.addItem(id, dto);
  }
}