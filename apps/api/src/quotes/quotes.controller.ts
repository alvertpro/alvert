import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard.js";
import { QuotesService } from "./quotes.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteItemDto } from "./dto/create-quote-item.dto.js";
import { UpdateQuoteStatusDto } from "./dto/update-quote-status.dto.js";
import { UpdateQuoteDiscountDto } from "./dto/update-quote-discount.dto.js";
import { UpdateQuoteItemDto } from "./dto/update-quote-item.dto.js";
import { UpdateQuoteDto } from "./dto/update-quote.dto.js";

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    companyId: string;
    role: string;
  };
};

@UseGuards(AuthGuard)
@Controller("quotes")
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.create(
      request.user.companyId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotesService.findAll(
      request.user.companyId,
    );
  }

  @Get(":id")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.quotesService.findOne(
      request.user.companyId,
      id,
    );
  }

  @Patch(":id")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(
      request.user.companyId,
      id,
      dto,
    );
  }

  @Delete(":id")
  remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.quotesService.remove(
      request.user.companyId,
      id,
    );
  }

  @Patch(":id/status")
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(
      request.user.companyId,
      id,
      dto.status,
    );
  }

  @Post(":id/items")
  addItem(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: CreateQuoteItemDto,
  ) {
    return this.quotesService.addItem(
      request.user.companyId,
      id,
      dto,
    );
  }

  @Patch(":quoteId/items/:itemId")
  updateItem(
    @Req() request: AuthenticatedRequest,
    @Param("quoteId") quoteId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateQuoteItemDto,
  ) {
    return this.quotesService.updateItem(
      request.user.companyId,
      quoteId,
      itemId,
      dto,
    );
  }

  @Delete(":quoteId/items/:itemId")
  removeItem(
    @Req() request: AuthenticatedRequest,
    @Param("quoteId") quoteId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.quotesService.removeItem(
      request.user.companyId,
      quoteId,
      itemId,
    );
  }

  @Patch(":id/discount")
  updateDiscount(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdateQuoteDiscountDto,
  ) {
    return this.quotesService.updateDiscount(
      request.user.companyId,
      id,
      dto.discount,
    );
  }
}