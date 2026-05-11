/**
 * ATDD Fixtures for API Key Security testing.
 * These will be expanded during the implementation (Green Phase).
 */

export const mockAdminToken = 'atdd-mock-admin-jwt-token';

export const testApiKeyPayload = {
  name: 'Test Service',
  scopes: ['read:revenue', 'write:revenue'],
};

export const mockCreatedApiKey = {
  id: '7f9e8a1b-3c4d-5e6f-a1b2-c3d4e5f6a7b8',
  key: 'atdd_test_key_abc_123',
  name: 'Test Service',
  isActive: true,
};
