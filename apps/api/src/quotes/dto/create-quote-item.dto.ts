export class CreateQuoteItemDto {
  description!: string;
  quantity!: number;
  unit?: string;
  unitPrice!: number;
}