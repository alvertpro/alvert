import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { UserRole } from "../generated/enums.js";
import { ROLES_KEY } from "./roles.decorator.js";

type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    email: string;
    companyId: string;
    role: UserRole;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException();
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        "Insufficient role",
      );
    }

    return true;
  }
}