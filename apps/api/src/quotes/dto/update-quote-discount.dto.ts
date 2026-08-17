import { IsNumber, Min } from "class-validator";

export class UpdateQuoteDiscountDto {
  @IsNumber()
  @Min(0)
  discount!: number;
}