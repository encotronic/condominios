const validateCondoOverride = require('../src/shared/middlewares/validateCondoOverride');

describe('validateCondoOverride middleware', () => {
  test('elimina query.condominiumId inválido', () => {
    const req = { query: { condominiumId: 'not-a-uuid' }, body: {} };
    const next = jest.fn();
    validateCondoOverride(req, null, next);
    expect(req.query.condominiumId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  test('mantiene query.condominiumId válido', () => {
    const req = { query: { condominiumId: '5074d155-ba23-4ca2-9659-b585060d4632' }, body: {} };
    const next = jest.fn();
    validateCondoOverride(req, null, next);
    expect(req.query.condominiumId).toBe('5074d155-ba23-4ca2-9659-b585060d4632');
    expect(next).toHaveBeenCalled();
  });
});
