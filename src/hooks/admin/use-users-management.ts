
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRolesRow, UserStatsData } from '@/integrations/supabase/types-extension';
import { UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

export const useUsersManagement = () => {
  const [users, setUsers] = useState<UserWithRolesRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRolesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<UserStatsData>({
    total_users: 0,
    new_users_week: 0,
    new_users_month: 0,
    inactive_users: 0
  });
  const itemsPerPage = 10;

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabase as any)
        .from('users_with_roles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Không thể tải danh sách người dùng');
        return;
      }

      const usersData = data as UserWithRolesRow[] || [];
      setUsers(usersData);
      applyFilters(usersData, searchTerm);
      calculateStats(usersData);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('Có lỗi khi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Apply filters and pagination
  const applyFilters = useCallback((usersData: UserWithRolesRow[], search: string) => {
    let filtered = usersData;
    
    if (search) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, []);

  // Calculate user statistics
  const calculateStats = useCallback((usersData: UserWithRolesRow[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const stats: UserStatsData = {
      total_users: usersData.length,
      new_users_week: usersData.filter(u => new Date(u.created_at) >= oneWeekAgo).length,
      new_users_month: usersData.filter(u => new Date(u.created_at) >= oneMonthAgo).length,
      inactive_users: usersData.filter(u => u.is_active === false || !u.confirmed_at).length
    };
    
    setStats(stats);
  }, []);

  // Assign role to user
  const assignRole = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await (supabase as any).rpc('assign_role', {
        user_id_param: userId,
        role_param: role
      });
      
      if (error) {
        toast.error(`Lỗi khi thêm vai trò: ${error.message}`);
        return false;
      }
      
      toast.success(`Đã thêm vai trò ${role} cho người dùng`);
      await fetchUsers();
      return true;
    } catch (error: any) {
      toast.error(`Lỗi khi thêm vai trò: ${error.message}`);
      return false;
    }
  };

  // Remove role from user
  const removeRole = async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      const { error } = await (supabase as any).rpc('remove_role', {
        user_id_param: userId,
        role_param: role
      });
      
      if (error) {
        toast.error(`Lỗi khi xóa vai trò: ${error.message}`);
        return false;
      }
      
      toast.success(`Đã xóa vai trò ${role} khỏi người dùng`);
      await fetchUsers();
      return true;
    } catch (error: any) {
      toast.error(`Lỗi khi xóa vai trò: ${error.message}`);
      return false;
    }
  };

  // Toggle user active status (mock implementation - would need to be replaced with actual Supabase function)
  const toggleUserActiveStatus = async (userId: string, currentStatus?: boolean): Promise<boolean> => {
    const newStatus = !currentStatus;
    
    // This is a mock implementation - replace with actual Supabase admin SDK call
    try {
      toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      
      // Update local state to reflect change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: newStatus } : user
        )
      );
      
      applyFilters(users.map(user => 
        user.id === userId ? { ...user, is_active: newStatus } : user
      ), searchTerm);
      
      return true;
    } catch (error: any) {
      toast.error(`Lỗi khi cập nhật trạng thái: ${error.message}`);
      return false;
    }
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
    applyFilters(users, term);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page data
  const getCurrentPageData = (): UserWithRolesRow[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: getCurrentPageData(),
    allUsers: filteredUsers,
    loading,
    stats,
    searchTerm,
    currentPage,
    totalPages,
    itemsPerPage,
    handleSearch,
    handlePageChange,
    fetchUsers,
    assignRole,
    removeRole,
    toggleUserActiveStatus
  };
};
