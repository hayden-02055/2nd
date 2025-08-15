import { Injectable } from '@nestjs/common';
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

  async getStockPriceInfo(params: Params): Promise<any> {
    try {
      // 컨트롤러에서 YYYY-MM-DD로 들어온다고 가정
      const beginBasDt: string = this.formatDate2(params.startDate);
      const endBasDt: string = this.formatDate2(params.endDate);

      const query = {
        serviceKey: this.serviceKey,
        resultType: 'json',
        likeSrtnCd: params.indicatorId,
        beginBasDt,
        endBasDt,
      };

      const resp = await this.httpService.axiosRef.get(this.baseUrl, {
        params: query,
      });

      const body: any = resp.data?.body;
      const totalCount = Number(body?.totalCount ?? 0);

      const list : any[] = ([] as any[]).concat(body?.items?.item ?? []);

      const head = list[0];
      const indicator = head
        ? {
            indicatorType: 'stock' as const,
            symbol: head.srtnCd,
            name: head.itmsNm,
            currency: 'KRW',
            exchange: head.mrktCtg,
          }
        : null;

      const values = list.map((it) => ({
        date: this.formatDate1(it.basDt), 
        value: Number(it.clpr) || 0,
      }));

      values.sort((a, b) => a.date.localeCompare(b.date));

      const response: LiveIndicatorResponse = { indicator, totalCount, values };
      console.log(response);
      return response;
    } catch (error: any) {
      throw new Error(`API 호출 실패: ${error?.message ?? error}`);
    }
  }

  // YYYYMMDD -> YYYY-MM-DD 
  private formatDate1(d?: string): string {
    return d ? [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].join('-') : '';
  }

  //YYYY-MM-DD -> YYYYMMDD
  private formatDate2(d? : string) : string {
    if (!d) return '';
    let out = '';
    for (let i = 0; i < d.length && out.length < 8; i++){
      const c = d.charCodeAt(i);
      if (c >= 48 && c <= 57) out += d[i];
    }
    return out.length === 8 ? out : '';
  } 
}