import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('stock-server')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('price')
  async getStockPrice(
    @Query('indicatorId') indicatorId: string,
    @Query('interval') interval: string,
    @Query('dataAggregation') dataAggregation: string,
    @Query('indicatorType') indicatorType: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return await this.appService.getStockPriceInfo({
      indicatorId,
      interval,
      dataAggregation,
      indicatorType,
      startDate,
      endDate,
    });
  }
}
