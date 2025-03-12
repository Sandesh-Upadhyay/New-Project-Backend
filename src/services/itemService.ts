
import { supabase } from '@/lib/supabase';
import { CreateItemPayload, Item, UpdateItemPayload } from '@/types/item';

export const itemService = {
  getItems: async (): Promise<{ data: Item[] | null; error: any }> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createItem: async (payload: CreateItemPayload): Promise<{ data: Item | null; error: any }> => {
    const { data, error } = await supabase
      .from('items')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  },

  updateItem: async (id: string, payload: UpdateItemPayload): Promise<{ data: Item | null; error: any }> => {
    const { data, error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteItem: async (id: string): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    return { error };
  },

  getItemById: async (id: string): Promise<{ data: Item | null; error: any }> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};
