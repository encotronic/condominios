const getTargetCondoId = require('../src/shared/utils/getTargetCondoId');
const fs = require('fs');

describe('getTargetCondoId', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('devuelve user.condoId cuando no hay override', () => {
    const req = { user: { condoId: 'user-condo-123', id: 'u1', role: 'USER' } };
    const out = getTargetCondoId(req);
    expect(out).toBe('user-condo-123');
  });

  test('devuelve override cuando user es ADMIN y override es UUID válido', () => {
    const uuid = '5074d155-ba23-4ca2-9659-b585060d4632';
    const req = { query: { condominiumId: uuid }, user: { id: 'u1', role: 'ADMIN', condoId: 'user-condo-123' }, originalUrl: '/api/billing', method: 'GET' };
    // evitar escritura real en disco
    jest.spyOn(fs, 'appendFile').mockImplementation((p, d, cb) => cb && cb(null));

    const out = getTargetCondoId(req);
    expect(out).toBe(uuid);
  });

  test('ignora override inválido y devuelve user.condoId', () => {
    const req = { query: { condominiumId: '123' }, user: { condoId: 'user-condo-123', id: 'u1', role: 'ADMIN' } };
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const out = getTargetCondoId(req);
    expect(out).toBe('user-condo-123');
    expect(warnSpy).toHaveBeenCalled();
  });
});
