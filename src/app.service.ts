import { BadRequestException, Injectable } from '@nestjs/common';
import { LiveIndicatorResponse } from './util/liveindicator.response';
import { HttpService } from '@nestjs/axios';
import { Params } from './util/param';

@Injectable()
export class AppService {
  private readonly baseUrl =
    'http://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
  private readonly serviceKey =
    'b8fA2MsI6ZAQBn6Y7j79wrnPYa9ppmB8QLmNS10fberkk8H+VDBwucwnQD5J5y/E+KKiDJ7Vc/5Z174D0/8zAQ==';

  constructor(private readonly httpService: HttpService) {}

  async getStockPriceInfo(params: Params): Promise<LiveIndicatorResponse> {
    // 컨트롤러에서 YYYY-MM-DD로 들어온다고 가정
    const beginBasDt: string = this.dateToBasicIso(new Date(params.startDate));
    const endBasDt: string = this.dateToBasicIso(new Date(params.endDate));

    const query = {
      serviceKey: this.serviceKey,
      resultType: 'json',
      likeSrtnCd: params.indicatorId,
      beginBasDt,
      endBasDt,
    };
    //totalCount 호출: numOfRows=0, pageNo=0
    const resqCount = await this.httpService.axiosRef.get(this.baseUrl, {
    params: { ...query, numOfRows: 0, pageNo: 0 },
    });

    const countBody: any = resqCount.data.response.body;
    const totalCount = Number(countBody?.totalCount) || 0;

    if (totalCount <= 0) {
      throw new BadRequestException({
      error: '[ERROR] 받아온 주식 데이터가 존재하지 않습니다.',
      message: '받아온 주식 데이터가 존재하지 않습니다.',
      });
    }

    //totalCount만큼 요청
    const resp = await this.httpService.axiosRef.get(this.baseUrl, {
    params: { ...query, numOfRows: totalCount, pageNo: 1 },
    });

    const body: any = resp.data.response.body;

    const list: any[] = body?.items?.item;
    const head = list[0];
    const indicator = {
      indicatorType: 'stock' as const,
      symbol: head.srtnCd,
      name: head.itmsNm,
      currency: 'KRW',
      exchange: head.mrktCtg,
    };

    const values = list.map((it) => ({
      date: this.basicIsoToDate(it.basDt).toISOString().split('T')[0],
      value: Number(it.clpr) || 0,
    }));

    values.sort((a, b) => a.date.localeCompare(b.date));
    return { indicator, totalCount, values };
  }

  // YYYYMMDD -> YYYY-MM-DD
  private basicIsoToDate(d: string): Date {
    return new Date([d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].join('-'));
  }

  //YYYY-MM-DD -> YYYYMMDD
  private dateToBasicIso(d: Date): string {
    return (
      d.getFullYear().toString() +
      (d.getMonth() + 1).toString().padStart(2, '0') +
      d.getDate().toString().padStart(2, '0')
    );
  }
}
