import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Props = {
  id?: string;
  title: string;
  content: string;
  publishedAt?: string;
  readByUser?: boolean;
  targets?: any[];
  onAcknowledge?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const AnnouncementCard: React.FC<Props> = ({ title, content, publishedAt, onAcknowledge, readByUser, targets, onEdit, onDelete }) => {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: content }} />
        {publishedAt && <div className="text-xs text-muted-foreground">Publicado: {new Date(publishedAt).toLocaleString()}</div>}
        {/* read status & targets summary */}
        <div className="flex items-center gap-3 mt-2">
          <span className={`px-2 py-0.5 rounded text-xs ${readByUser ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {readByUser ? 'Leído' : 'No leído'}
          </span>
          {targets && targets.length > 0 && (
            <span className="text-xs text-muted-foreground">Targets: {targets.map((t: any) => t.type).join(', ')}</span>
          )}
        </div>
        {onAcknowledge && (
          <div className="mt-3">
            <button onClick={onAcknowledge} className="px-3 py-1 rounded bg-condo-blue text-white">Marcar como leído</button>
          </div>
        )}
        {/* Edit / Delete actions (rendered by page when allowed via props) */}
        {(onEdit || onDelete) && (
          <div className="mt-3 flex gap-2">
            {onEdit && <button onClick={onEdit} className="px-3 py-1 border rounded">Editar</button>}
            {onDelete && <button onClick={onDelete} className="px-3 py-1 border rounded text-red-600">Eliminar</button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
