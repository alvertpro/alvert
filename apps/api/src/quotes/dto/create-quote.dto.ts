export class CreateQuoteDto {
  companyId!: string;
  customerId!: string;
  title!: string;
  validUntil?: string;
}