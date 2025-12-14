"use client";

import React, { useEffect, useState } from 'react';
import { useCondominiumContext } from '@/components/providers/condominium-provider';
import { announcementsService, type Announcement } from '@/lib/api/announcements.service';

export default function AnnouncementsPage() {
  const { currentCondominiumId } = useCondominiumContext();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await announcementsService.list({ condominiumId: currentCondominiumId });
        if (mounted) setItems(data);
      } catch (err) {
        console.error('Error cargando anuncios', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [currentCondominiumId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await announcementsService.create({ title, content, condominiumId: currentCondominiumId || undefined });
      setItems((s) => [created, ...s]);
      setTitle('');
      setContent('');
      setShowForm(false);
    } catch (err) {
      console.error('Error creando anuncio', err);
      alert('Error creando anuncio');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Cartelera</h1>
        <div>
          <button onClick={() => setShowForm(!showForm)} className="px-3 py-1 bg-condo-blue text-white rounded-md text-sm">Nuevo anuncio</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 border rounded-md bg-white dark:bg-gray-800">
          <div className="mb-2">
            <label className="block text-sm">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Contenido</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-condo-teal text-white rounded-md">Crear</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 border rounded-md">Cancelar</button>
          </div>
        </form>
      )}

      {loading && (
        <div className="text-gray-500">Cargando anuncios...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-gray-500">No hay anuncios para este condominio.</div>
      )}

      <div className="space-y-4">
        {items.map((a) => (
          <article key={a.id} className="p-4 border rounded-md bg-white dark:bg-gray-800">
            <h2 className="text-lg font-medium">{a.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{a.content}</p>
            <div className="mt-2 text-xs text-gray-500">Estado: {a.status}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from 'react';
import { announcementsService, Announcement } from '@/lib/api/announcements.service';
import { useCondominiumContext } from '@/components/providers/condominium-provider';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import CreateAnnouncementForm from '@/components/announcements/CreateAnnouncementForm';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const { currentCondominiumId } = useCondominiumContext();

  useEffect(() => {
    (async () => {
      const list = await announcementsService.list({ condominiumId: currentCondominiumId || undefined });
      setItems(list);
    })();
  }, [currentCondominiumId]);

  const refresh = async () => {
    const list = await announcementsService.list({ condominiumId: currentCondominiumId || undefined });
    setItems(list);
  };

  const handleAck = async (id: string) => {
    try {
      await announcementsService.ack(id);
      // optimistic UI: mark as read
      setItems(prev => prev.map(i => i.id === id ? { ...i, readByUser: true } : i));
    } catch (err) {
      console.error('ack error', err);
      alert('Error marcando como leído');
    }
  };

  const handleCreated = (a: Announcement) => {
    // Insert at top and hide form
    setItems(prev => [a, ...prev]);
    setShowForm(false);
  };

  const handleUpdated = (a: Announcement) => {
    setItems(prev => prev.map(i => i.id === a.id ? a : i));
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (a: Announcement) => {
    setEditing(a);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este anuncio? Esta acción no se puede deshacer.')) return;
    try {
      await announcementsService.remove(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('delete error', err);
      alert('Error eliminando el anuncio');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cartelera</h1>
      <div>
        <button onClick={() => setShowForm(s => !s)} className="px-3 py-1 rounded bg-condo-blue text-white mb-3">{showForm ? 'Cerrar' : 'Crear anuncio'}</button>
      </div>
      {showForm && (
        <CreateAnnouncementForm announcement={editing} onCreated={handleCreated} onUpdated={handleUpdated} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <AnnouncementCard
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content}
            publishedAt={item.publishedAt}
            readByUser={item.readByUser}
            targets={item.targets}
            onAcknowledge={() => handleAck(item.id)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
