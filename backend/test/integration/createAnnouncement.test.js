const request = require('supertest');

// Mock the announcement model to avoid real DB operations
jest.mock('../../src/modules/announcements/models/announcement.model', () => ({
  insert: jest.fn(async (obj) => ({ id: 'mock-id', condominium_id: obj.condominiumId || null, author_id: obj.authorId || null, title: obj.title, content: obj.content, visibility: obj.visibility || 'BUILDING', status: obj.status || 'PUBLISHED', start_at: obj.startAt || null, expires_at: obj.expiresAt || null, pinned: obj.pinned || false, published_at: new Date().toISOString() })),
  findAll: jest.fn(async () => []),
  findById: jest.fn(async () => null),
  insertReadReceipt: jest.fn(async () => true),
  update: jest.fn(async () => ({ })),
  remove: jest.fn(async () => ({ })),
}));

const app = require('../../src/app');

describe('Integration: create announcement via real endpoint', () => {
  test('creates announcement using override when ADMIN and valid UUID', async () => {
    const uuid = '5074d155-ba23-4ca2-9659-b585060d4632';
    const res = await request(app)
      .post('/api/announcements')
      .send({
        title: 'Test',
        content: 'Contenido',
        condominiumId: uuid,
        user: { id: 'u1', role: 'ADMIN', condoId: 'orig' }
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 'mock-id');
    expect(res.body).toHaveProperty('condominium_id', uuid);
  });

  test('ignores invalid override and uses user.condoId', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .send({
        title: 'Test2',
        content: 'Contenido2',
        condominiumId: '123',
        user: { id: 'u2', role: 'ADMIN', condoId: 'orig-uuid-0001' }
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('condominium_id', 'orig-uuid-0001');
  });
});
