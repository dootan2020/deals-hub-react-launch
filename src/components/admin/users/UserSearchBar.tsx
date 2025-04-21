
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface UserSearchBarProps {
  onSearch: (term: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const UserSearchBar = ({ onSearch, onRefresh, loading }: UserSearchBarProps) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <form onSubmit={handleSubmit} className="flex-1 flex relative">
        <Input
          placeholder="Tìm kiếm theo email..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="pr-10"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading}
        className="min-w-[100px]"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Đang tải...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </>
        )}
      </Button>
    </div>
  );
};
