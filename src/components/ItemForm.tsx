
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateItemPayload, UpdateItemPayload } from '@/types/item';

interface ItemFormProps {
  initialData?: {
    title: string;
    description: string;
  };
  onSubmit: (data: CreateItemPayload | UpdateItemPayload) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({
  initialData = { title: '', description: '' },
  onSubmit,
  isLoading,
  submitLabel,
  cancelLabel,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
          rows={4}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel || 'Cancel'}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
