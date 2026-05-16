import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

describe('SearchService', () => {
  let service: SearchService;

  const mockElasticsearchService = {
    indices: {
      create: jest.fn().mockResolvedValue({}),
      exists: jest.fn().mockResolvedValue(false),
      putMapping: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create index with edge_ngram analyzer', async () => {
    await service.initializeIndex();

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    expect(mockElasticsearchService.indices.create).toHaveBeenCalledWith(
      expect.objectContaining({
        index: expect.any(String),
        settings: expect.objectContaining({
          analysis: expect.objectContaining({
            analyzer: expect.objectContaining({
              autocomplete: expect.objectContaining({
                tokenizer: 'autocomplete',
                filter: ['lowercase'],
              }),
            }),
            tokenizer: expect.objectContaining({
              autocomplete: expect.objectContaining({
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 20,
                token_chars: ['letter', 'digit'],
              }),
            }),
          }),
        }),
      }),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  });

  it('should define manual mapping for invoices and suppliers', async () => {
    await service.initializeIndex();

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    expect(mockElasticsearchService.indices.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: expect.objectContaining({
          properties: expect.objectContaining({
            type: { type: 'keyword' },
            invoiceNumber: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'standard',
            },
            supplierName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'standard',
            },
            name: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'standard',
            },
          }),
        }),
      }),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  });

  it('should log if index already exists', async () => {
    mockElasticsearchService.indices.exists.mockResolvedValueOnce(true);
    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await service.initializeIndex();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    );
  });

  it('should log error if initialization fails', async () => {
    mockElasticsearchService.indices.exists.mockRejectedValueOnce(
      new Error('Connection failed'),
    );
    const loggerSpy = jest.spyOn(service['logger'], 'error');

    await service.initializeIndex();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error initializing Elasticsearch index'),
    );
  });
});
