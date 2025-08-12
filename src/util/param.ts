export type Params = {
  // 기존(공공데이터 표준) 파라미터(혹시 몰라병)
  numOfRows?: number;
  pageNo?: number;
  resultType?: string;
  likeSrtnCd?: string; // 종목 단축코드
  basDt?: string; // 기준일자 (YYYYMMDD)

  // 컨트롤러에서 받는 6개 쿼리
  indicatorId?: string; // 지표/종목 ID (UUID)
  interval?: string;
  dataAggregation?: string;
  indicatorType?: string;
  startDate?: string;
  endDate?: string;
};
