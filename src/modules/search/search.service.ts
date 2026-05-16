import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  SEARCH_INDEX_NAME,
  SEARCH_INDEX_SETTINGS,
  SEARCH_INDEX_MAPPING,
} from './definitions/search.index';

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
        // Optional: Update mapping if needed
      }
    } catch (error) {
      this.logger.error(
        `Error initializing Elasticsearch index: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw error here to allow application to start even if Elastic is down
      // but in production we might want to fail fast
    }
  }
}
