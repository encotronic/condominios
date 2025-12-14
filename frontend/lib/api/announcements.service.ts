import { api } from './axios-config';
import { snakeToCamel, camelToSnake } from './normalize';

export type Announcement = {
  id: string;
  title: string;
  content: string;
  status: string;
  visibility?: string;
  pinned?: boolean;
  publishedAt?: string;
  targets?: any[];
  readByUser?: boolean;
};

export const announcementsService = {
  async list(options?: { condominiumId?: string; params?: Record<string, any> }): Promise<Announcement[]> {
    const { condominiumId, params } = options || {};
    const query: Record<string, any> = { ...(params || {}) };
    if (condominiumId) query.condominiumId = condominiumId;
    const res = await api.get('/announcements', { params: query });
    const data = res.data || [];
    return Array.isArray(data) ? data.map((d: any) => snakeToCamel<Announcement>(d)) : [];
  },

  async get(id: string): Promise<Announcement> {
    const res = await api.get(`/announcements/${id}`);
    return snakeToCamel<Announcement>(res.data);
  },

  async create(payload: Partial<Announcement> & { condominiumId?: string }): Promise<Announcement> {
    // Si se provee condominiumId, incluirlo en el body para casos especiales
    const body: any = { ...(payload || {}) };
    if (payload.condominiumId) body.condominiumId = payload.condominiumId;
    const res = await api.post('/announcements', body);
    return snakeToCamel<Announcement>(res.data);
  },

  async ack(id: string): Promise<void> {
    await api.post(`/announcements/${id}/ack`);
  },

  async update(id: string, payload: Partial<Announcement> & { condominiumId?: string }): Promise<Announcement> {
    const body: any = { ...(payload || {}) };
    if ((payload as any).condominiumId) body.condominiumId = (payload as any).condominiumId;
    const res = await api.put(`/announcements/${id}`, body);
    return snakeToCamel<Announcement>(res.data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/announcements/${id}`);
  },
};
