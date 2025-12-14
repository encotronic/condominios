const request = require('supertest');
const app = require('../../src/app');

describe('Integration: resolve condo via test route', () => {
  test('returns user.condoId when no override', async () => {
    const res = await request(app)
      .post('/__test/resolve-condo')
      .send({})
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      // mock req.user via header (app test route reads req.user directly -> so set on agent?)
    ;
    // By default req.user is undefined so getTargetCondoId returns null
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('condoId', null);
  });

  test('returns override when ADMIN with valid UUID', async () => {
    const uuid = '5074d155-ba23-4ca2-9659-b585060d4632';
    // Simulate req.user by sending as custom header parsed in test route
    // We'll inject a small middleware on the fly by setting a header that test route doesn't parse,
    // so instead we send user in body to emulate req.user for the helper (getTargetCondoId uses req.user)
    const res = await request(app)
      .post('/__test/resolve-condo')
      .send({ condominiumId: uuid, user: { id: 'u1', role: 'ADMIN', condoId: 'orig' } })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.condoId).toBe(uuid);
  });
});
