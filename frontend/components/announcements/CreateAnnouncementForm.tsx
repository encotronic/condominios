"use client";

import React, { useState } from 'react';
import { Announcement, announcementsService } from '@/lib/api/announcements.service';
import { useCondominiumContext } from '@/components/providers/condominium-provider';

type Props = {
  onCreated?: (announcement: Announcement) => void;
  onCancel?: () => void;
  announcement?: Announcement | null;
  onUpdated?: (announcement: Announcement) => void;
};

const CreateAnnouncementForm: React.FC<Props> = ({ onCreated, onCancel, announcement = null, onUpdated }) => {
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [visibility, setVisibility] = useState(announcement?.visibility || 'BUILDING');
  const [pinned, setPinned] = useState(announcement?.pinned || false);
  const [loading, setLoading] = useState(false);
  const { currentCondominiumId } = useCondominiumContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('Title and content required');
    setLoading(true);
    try {
      if (announcement && announcement.id) {
        const updated = await announcementsService.update(announcement.id, { title, content, visibility, pinned, condominiumId: currentCondominiumId || undefined });
        onUpdated?.(updated);
      } else {
        const created = await announcementsService.create({ title, content, visibility, pinned, condominiumId: currentCondominiumId || undefined });
        onCreated?.(created);
        setTitle(''); setContent(''); setVisibility('BUILDING'); setPinned(false);
      }
    } catch (err: any) {
      console.error('create announcement error', err);
      alert(err?.response?.data?.message || err?.message || 'Error creating announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white">
      <div className="mb-2">
        <label className="block text-sm font-medium">Título</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Contenido (HTML permitido)</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div className="flex items-center gap-4 mb-2">
        <div>
          <label className="block text-sm">Visibilidad</label>
          <select value={visibility} onChange={e => setVisibility(e.target.value)} className="mt-1 p-2 border rounded">
            <option value="BUILDING">BUILDING</option>
            <option value="UNIT">UNIT</option>
            <option value="PUBLIC">PUBLIC</option>
          </select>
        </div>
        <div className="flex items-center">
          <input id="pinned" type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="mr-2" />
          <label htmlFor="pinned" className="text-sm">Fijado</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-3 py-1 bg-condo-blue text-white rounded">{loading ? (announcement ? 'Actualizando...' : 'Creando...') : (announcement ? 'Actualizar anuncio' : 'Crear anuncio')}</button>
        <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancelar</button>
      </div>
    </form>
  );
};

export default CreateAnnouncementForm;
