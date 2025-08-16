export type Params = {
  // 컨트롤러에서 받는 6개 쿼리
  indicatorId: string; // 지표/종목 ID (UUID)
  interval?: string;
  dataAggregation?: string;
  indicatorType?: string;
  startDate: string;
  endDate: string;
};
