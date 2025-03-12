
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { itemService } from '@/services/itemService';
import { Item } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ItemForm from '@/components/ItemForm';
import ItemCard from '@/components/ItemCard';
import Navbar from '@/components/Navbar';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await itemService.getItems();
      
      if (error) {
        throw error;
      }
      
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching items',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (formData: { title: string; description: string }) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await itemService.createItem(formData);
      
      if (error) {
        throw error;
      }
      
      setItems([data!, ...items]);
      setIsCreateDialogOpen(false);
      toast({
        title: 'Item created',
        description: 'Your item has been created successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error creating item',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (formData: { title: string; description: string }) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await itemService.updateItem(selectedItem.id, formData);
      
      if (error) {
        throw error;
      }
      
      setItems(items.map(item => item.id === selectedItem.id ? data! : item));
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: 'Item updated',
        description: 'Your item has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating item',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await itemService.deleteItem(selectedItem.id);
      
      if (error) {
        throw error;
      }
      
      setItems(items.filter(item => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: 'Item deleted',
        description: 'Your item has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setSelectedItem(item);
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Items</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center text-gray-500">Loading items...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900">No items found</h3>
            <p className="mb-4 text-gray-500">Get started by creating a new item.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={openEditDialog} 
                onDelete={openDeleteDialog} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <ItemForm 
            onSubmit={handleCreateItem}
            isLoading={isSubmitting}
            submitLabel="Create Item"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ItemForm 
              initialData={{
                title: selectedItem.title,
                description: selectedItem.description,
              }}
              onSubmit={handleEditItem}
              isLoading={isSubmitting}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              "{selectedItem?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem} 
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
