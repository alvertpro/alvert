import { IsEnum } from "class-validator";
import { QuoteStatus } from "../../generated/enums.js";

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status!: QuoteStatus;
}