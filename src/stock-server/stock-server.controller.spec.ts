import { Test, TestingModule } from '@nestjs/testing';
import { StockServerController } from './stock-server.controller';

describe('StockServerController', () => {
  let controller: StockServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockServerController],
    }).compile();

    controller = module.get<StockServerController>(StockServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
