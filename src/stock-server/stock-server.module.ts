import { Module } from '@nestjs/common';
import { StockServerController } from './stock-server.controller';
import { StockServerService } from './stock-server.service';

@Module({
  controllers: [StockServerController],
  providers: [StockServerService]
})
export class StockServerModule {}
