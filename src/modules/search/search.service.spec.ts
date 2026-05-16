/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  });

  it('should define manual mapping for invoices and suppliers', async () => {
    await service.initializeIndex();

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

  describe('search', () => {
    const mockSearchResponse = {
      took: 10,
      hits: {
        total: { value: 1, relation: 'eq' },
        hits: [
          {
            _index: 'showcase-search-v1',
            _id: '1',
            _score: 1.5,
            _source: {
              id: '1',
              type: 'invoice',
              invoiceNumber: 'INV-001',
              description: 'Test invoice',
            },
          },
        ],
      },
    };

    it('should perform a fuzzy multi_match search', async () => {
      const mockSearch = jest.fn().mockResolvedValue(mockSearchResponse);
      // @ts-expect-error - mocking private property or nested method
      mockElasticsearchService.search = mockSearch;

      const result = await service.search('test-query');

      expect(mockSearch).toHaveBeenCalledWith({
        index: expect.any(String),
        query: {
          multi_match: expect.objectContaining({
            query: 'test-query',
            fields: expect.arrayContaining([
              'invoiceNumber^3',
              'name^3',
              'description',
              'supplierName',
            ]),
            fuzziness: 'AUTO',
          }),
        },
      });

      expect(result.hits).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hits[0].invoiceNumber).toBe('INV-001');
    });

    it('should throw error if search fails', async () => {
      const mockSearch = jest
        .fn()
        .mockRejectedValue(new Error('Search failed'));
      // @ts-expect-error - mocking
      mockElasticsearchService.search = mockSearch;

      await expect(service.search('fail')).rejects.toThrow('Search failed');
    });
  });
});
