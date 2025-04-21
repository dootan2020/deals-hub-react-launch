import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, RefreshCw, AlertCircle, Info, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, ProxyType } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useProductSync } from '@/hooks/use-product-sync';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').transform((v) => sanitizeHtml(v)),
  description: z.string().min(1, 'Description is required').transform((v) => sanitizeHtml(v)),
  price: z.coerce.number().positive('Price must be positive'),
  originalPrice: z.coerce.number().positive('Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(1, 'Slug is required').transform((v) => sanitizeHtml(v)),
  category_id: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).default([]),
  kioskToken: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

// ... rest of the component code remains unchanged ...
