import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  SEARCH_INDEX_NAME,
  SEARCH_INDEX_SETTINGS,
  SEARCH_INDEX_MAPPING,
} from './definitions/search.index';

interface SearchHit {
  id: string;
  type: string;
  invoiceNumber?: string;
  description?: string;
  name?: string;
  supplierName?: string;
  [key: string]: any;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    await this.initializeIndex();
  }

  async initializeIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: SEARCH_INDEX_NAME,
      });

      if (!indexExists) {
        this.logger.log(`Creating index ${SEARCH_INDEX_NAME}...`);

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        await this.elasticsearchService.indices.create({
          index: SEARCH_INDEX_NAME,
          settings: SEARCH_INDEX_SETTINGS as any,
          mappings: SEARCH_INDEX_MAPPING,
        });
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        this.logger.log(`Index ${SEARCH_INDEX_NAME} created successfully.`);
      } else {
        this.logger.log(`Index ${SEARCH_INDEX_NAME} already exists.`);
      }
    } catch (error) {
      this.logger.error(
        `Error initializing Elasticsearch index: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async indexInvoice(invoice: {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    amount: number;
    status: string;
    createdAt: string | Date;
    paidAt?: string | Date | null;
  }) {
    await this.elasticsearchService.index({
      index: SEARCH_INDEX_NAME,
      id: invoice.id,
      document: {
        id: invoice.id,
        type: 'invoice',
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        amount: invoice.amount,
        supplierName: `Supplier (${invoice.supplierId})`,
        createdAt:
          typeof invoice.createdAt === 'string'
            ? invoice.createdAt
            : invoice.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    this.logger.log(`Indexed invoice ${invoice.id} in Elasticsearch.`);
  }

  async deleteInvoice(id: string) {
    await this.elasticsearchService.delete({
      index: SEARCH_INDEX_NAME,
      id,
    });
    this.logger.log(`Deleted invoice ${id} from Elasticsearch.`);
  }

  async search(query: string) {
    const result = await this.elasticsearchService.search({
      index: SEARCH_INDEX_NAME,
      query: {
        multi_match: {
          query,
          fields: ['invoiceNumber^3', 'name^3', 'description', 'supplierName'],
          fuzziness: 'AUTO',
          prefix_length: 2,
        },
      },
    });

    return {
      hits: result.hits.hits.map((hit) => ({
        ...(hit._source as SearchHit),
        _score: hit._score,
      })) as any[],
      total:
        typeof result.hits.total === 'object'
          ? result.hits.total.value
          : result.hits.total,
      took: result.took,
    };
  }
}
