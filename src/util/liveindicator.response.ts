export type LiveIndicatorResponse = {
  indicator: {
    indicatorType: 'stock';
    symbol?: string; // 종목 단축코드 (srtnCd)
    name?: string; // 종목명 (itmsNm)
    currency?: string; // 통화
    exchange?: string; // 거래소(mrktCtg)
  } | null;
  totalCount: number;
  values: { date: string; value: number }[];
  // date는 YYYY-MM-DD
  // value는 종가(clpr)
};
