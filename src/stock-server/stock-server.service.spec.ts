import { Test, TestingModule } from '@nestjs/testing';
import { StockServerService } from './stock-server.service';

describe('StockServerService', () => {
  let service: StockServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockServerService],
    }).compile();

    service = module.get<StockServerService>(StockServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
