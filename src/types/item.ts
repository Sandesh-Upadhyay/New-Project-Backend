
export interface Item {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
}

export interface UpdateItemPayload {
  title?: string;
  description?: string;
}
