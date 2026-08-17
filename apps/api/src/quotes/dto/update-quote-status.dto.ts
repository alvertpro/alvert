import type { QuoteStatus } from "../../generated/enums.js";

export class UpdateQuoteStatusDto {
  status!: QuoteStatus;
}