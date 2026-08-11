import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module.js";
import { HealthController } from "./health/health.controller.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { CustomersModule } from "./customers/customers.module.js";
import { QuotesModule } from "./quotes/quotes.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CompaniesModule,
    CustomersModule,
    QuotesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}