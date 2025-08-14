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
      const useNewSpec = !!params.indicatorId;

      const beginBasDt = 
        params.beginBasDt ?? this.toYYYYMMDD(params.startDate);
      const endBasDt = 
        params.endBasDt ?? this.toYYYYMMDD(params.endDate);

      const query = useNewSpec
        ? {
            // 새 포맷: 6개 쿼리를 그대로 보냄
            indicatorId: params.indicatorId!,
            interval: params.interval!,
            dataAggregation: params.dataAggregation!,
            indicatorType: params.indicatorType!,
            startDate: params.startDate!,
            endDate: params.endDate!,
          }
        

      // 실제 HTTP 요청 보내기(axios 사용)
      const resp = await this.httpService.axiosRef.get(this.baseUrl, {
        params: query,
      });

      if (useNewSpec) {
        return resp.data;
      }

      // -------------------------------------------------------------------
      
      //수정
      const body: any = resp.data?.body ?? resp.data?.response?.body;
      const totalCount = Number(body?.totalCount ?? 0); // 총 개수

      const raw = body?.items?.item;
      const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

      // indicator(추가 가능)
      const head = list[0];
      const indicator = head
        ? {
            indicatorType: 'stock' as const,
            symbol: head.srtnCd, // 단축코드
            name: head.itmsNm, // 종목명
            currency: 'KRW',
            exchange: head.mrktCtg, // 거래소
          }
        : null;

      // values: 날짜와 값(종가)만 뽑아서 새 배열 만들기
      // - 날짜: basDt(YYYYMMDD)를 예쁘게 'YYYY-MM-DD'로 바꿈
      // - 값: clpr(종가)를 숫자로 변환(없으면 0)
      const values = list.map((it) => ({
        date: this.Date(it.basDt), // 예: '20250811' → '2025-08-11'
        value: Number(it.clpr) || 0, // 문자열 → 숫자. 실패하면 0.
      }));

      values.sort((a, b) => a.date.localeCompare(b.date));

      // 최종 결과를 정해진 모양으로 조립
      const response: LiveIndicatorResponse = { indicator, totalCount, values };

      console.log(response);

      //결과 돌려주기
      return response;
    } 
    
    catch (error: any) {
      throw new Error(`API 호출 실패: ${error?.message ?? error}`);
    }
  }

  //날짜 성형
  private Date(d?: string) {
    if (!d || d.length !== 8) return d ?? '';
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }
  private toYYYYMMDD(d?: string) {
    if (!d) return undefined;
    const s = d.replaceAll('-', '');
    return /^\d{8}$/.test(s) ? s : undefined;
  }
}
