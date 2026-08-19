import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRole } from "../generated/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        email: dto.companyEmail,
        phone: dto.companyPhone,
        users: {
          create: {
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            role: UserRole.OWNER,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
      },
      user: company.users[0],
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}