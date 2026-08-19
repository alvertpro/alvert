import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyPhone?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}