import { Module } from '@nestjs/common';
import { StockServerModule } from './stock-server/stock-server.module';

@Module({
  imports: [StockServerModule],
})
export class AppModule {}

