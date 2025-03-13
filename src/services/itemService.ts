
import { supabase } from '@/integrations/supabase/client';
import { CreateItemPayload, Item, UpdateItemPayload } from '@/types/item';

export const itemService = {
  getItems: async (): Promise<{ data: Item[] | null; error: any }> => {
    console.log('Fetching items from Supabase...');
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Items fetched:', data);
    console.log('Fetch error:', error);
    
    return { data, error };
  },

  createItem: async (payload: CreateItemPayload): Promise<{ data: Item | null; error: any }> => {
    console.log('Creating item:', payload);
    const { data, error } = await supabase
      .from('items')
      .insert(payload)
      .select()
      .single();
    
    console.log('Item created:', data);
    console.log('Create error:', error);
    
    return { data, error };
  },

  updateItem: async (id: string, payload: UpdateItemPayload): Promise<{ data: Item | null; error: any }> => {
    console.log('Updating item:', id, payload);
    const { data, error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Item updated:', data);
    console.log('Update error:', error);
    
    return { data, error };
  },

  deleteItem: async (id: string): Promise<{ error: any }> => {
    console.log('Deleting item:', id);
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    console.log('Delete error:', error);
    
    return { error };
  },

  getItemById: async (id: string): Promise<{ data: Item | null; error: any }> => {
    console.log('Fetching item by ID:', id);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    
    console.log('Item fetched:', data);
    console.log('Fetch by ID error:', error);
    
    return { data, error };
  },
};
