// src/app.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { LiveIndicatorResponse } from './util/liveindicator.response';

@Controller('stock-server')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('price')
  async getStockPrice(
    @Query('indicatorId') indicatorId: string,
    @Query('interval') interval: string,
    @Query('dataAggregation') dataAggregation: string,
    @Query('indicatorType') indicatorType: string,
    @Query('startDate') startDate: string, // YYYY-MM-DD
    @Query('endDate') endDate: string,     // YYYY-MM-DD
  ): Promise<LiveIndicatorResponse> {
    return this.appService.getStockPriceInfo({
      indicatorId,
      interval,
      dataAggregation,
      indicatorType,
      startDate,
      endDate,
    });
  }
}
