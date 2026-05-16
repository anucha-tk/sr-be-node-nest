export const SEARCH_INDEX_NAME = 'showcase-search-v1';

export const SEARCH_INDEX_SETTINGS = {
  analysis: {
    analyzer: {
      autocomplete: {
        tokenizer: 'autocomplete',
        filter: ['lowercase'],
      },
    },
    tokenizer: {
      autocomplete: {
        type: 'edge_ngram',
        min_gram: 1,
        max_gram: 20,
        token_chars: ['letter', 'digit'],
      },
    },
  },
} as const;

export const SEARCH_INDEX_MAPPING = {
  properties: {
    id: { type: 'keyword' },
    type: { type: 'keyword' }, // 'invoice', 'supplier', etc.
    // Invoice fields
    invoiceNumber: {
      type: 'text',
      analyzer: 'autocomplete',
      search_analyzer: 'standard',
    },
    description: {
      type: 'text',
      analyzer: 'autocomplete',
      search_analyzer: 'standard',
    },
    // Supplier fields
    name: {
      type: 'text',
      analyzer: 'autocomplete',
      search_analyzer: 'standard',
    },
    supplierName: {
      // duplicated for unified search across entities
      type: 'text',
      analyzer: 'autocomplete',
      search_analyzer: 'standard',
    },
    code: { type: 'keyword' },
    status: { type: 'keyword' },
    amount: { type: 'double' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
} as const;
