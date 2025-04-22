
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductFormActionsProps {
  isLoading: boolean;
  productId?: string;
  onReset: () => void;
  formDirty: boolean;
  showResetDialog: boolean;
  setShowResetDialog: (show: boolean) => void;
}

export function ProductFormActions({
  isLoading,
  productId,
  onReset,
  formDirty,
  showResetDialog,
  setShowResetDialog
}: ProductFormActionsProps) {
  return (
    <>
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => formDirty ? setShowResetDialog(true) : onReset()}
          disabled={isLoading}
          className="border-gray-300"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Form
        </Button>
        
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? 'Update Product' : 'Create Product'}
        </Button>
      </div>

      <AlertDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form fields and unsaved changes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
