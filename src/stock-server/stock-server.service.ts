import { Injectable } from '@nestjs/common';
import axios from 'axios';

type LiveIndicatorResponse = {
  indicator: {
    indicatorType: 'stock';   
    symbol?: string;          // 종목 단축코드 (srtnCd)
    name?: string;            // 종목명 (itmsNm)
    currency?: string;        // 통화 
    exchange?: string;        // 거래소(mrktCtg)
  } | null;                   
  totalCount: number;         
  values: { date: string; value: number }[]; 
  // date는 YYYY-MM-DD
  // value는 종가(clpr)
};

@Injectable()
export class StockServerService {
  private readonly baseUrl = 'http://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
  private readonly serviceKey = 'b8fA2MsI6ZAQBn6Y7j79wrnPYa9ppmB8QLmNS10fberkk8H+VDBwucwnQD5J5y/E+KKiDJ7Vc/5Z174D0/8zAQ==';

  //날짜 성형
  private Date(d?: string) {
    if (!d || d.length !== 8) return d ?? '';
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }

  async getStockPriceInfo(params: {
    // 기존(공공데이터 표준) 파라미터(혹시 몰라병)
    numOfRows?: number;     
    pageNo?: number;        
    resultType?: string;    
    likeSrtnCd?: string;    // 종목 단축코드 
    basDt?: string;         // 기준일자 (YYYYMMDD)

    // 컨트롤러에서 받는 6개 쿼리 
    indicatorId?: string;   // 지표/종목 ID (UUID)
    interval?: string;     
    dataAggregation?: string; 
    indicatorType?: string; 
    startDate?: string;     
    endDate?: string;       
  }): Promise<LiveIndicatorResponse | any> {
    try {
      
      const useNewSpec = !!params.indicatorId;

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
        : {
            // 기존 공공데이터 방식: 인증키 포함해서 보냄
            serviceKey: this.serviceKey,            
            numOfRows: params.numOfRows ?? 10,      
            pageNo: params.pageNo ?? 1,             
            resultType: params.resultType ?? 'json',
            likeSrtnCd: params.likeSrtnCd,
            basDt: params.basDt,                    // 기준일자
          };

      // 실제 HTTP 요청 보내기(axios 사용)
      const resp = await axios.get(this.baseUrl, { params: query });

      if (useNewSpec) {
        return resp.data;
      }
                     
      // -------------------------------------------------------------------

      const body = resp.data?.response?.body;
      const totalCount = Number(body?.totalCount ?? 0); // 총 개수 

      const raw = body?.items?.item;
      const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

      // indicator(추가 가능)
      const head = list[0];
      const indicator =
        head
          ? {
              indicatorType: 'stock' as const, 
              symbol: head.srtnCd,   // 단축코드 
              name: head.itmsNm,     // 종목명 
              currency: 'KRW',       
              exchange: head.mrktCtg // 거래소
            }
          : null;

      // values: 날짜와 값(종가)만 뽑아서 새 배열 만들기
      // - 날짜: basDt(YYYYMMDD)를 예쁘게 'YYYY-MM-DD'로 바꿈
      // - 값: clpr(종가)를 숫자로 변환(없으면 0)
      const values = list.map((it) => ({
        date: this.Date(it.basDt),        // 예: '20250811' → '2025-08-11'
        value: Number(it.clpr) || 0,      // 문자열 → 숫자. 실패하면 0.
      }));

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
}
