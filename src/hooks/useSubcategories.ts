
import { useState, useEffect } from 'react';

export const useSubcategories = (categoryId: string) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Just a stub implementation to prevent errors
    setLoading(false);
    setSubcategories([]);
  }, [categoryId]);

  return { subcategories, loading, error };
};
