import { Controller, Get, Query } from '@nestjs/common';
import { StockServerService } from './stock-server.service';

@Controller('stock-server')
export class StockServerController {
    constructor(private readonly stockService: StockServerService) {}

  @Get('price')
  async getStockPrice(
    @Query('indicatorId') indicatorId: string,
    @Query('interval') interval: string,
    @Query('dataAggregation') dataAggregation: string,
    @Query('indicatorType') indicatorType: string,
    @Query('startDate') startDate: string, 
    @Query('endDate') endDate: string,     
  ) {
    return this.stockService.getStockPriceInfo({
      indicatorId,
      interval,
      dataAggregation,
      indicatorType,
      startDate,
      endDate,
    });

  }
}
