
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useUsersManagement } from '@/hooks/admin/use-users-management';
import { UserStatsCards } from '@/components/admin/users/UserStatsCards';
import { UserSearchBar } from '@/components/admin/users/UserSearchBar';
import { UsersTable } from '@/components/admin/users/UsersTable';

export default function UsersManagementPage() {
  const {
    users,
    loading,
    stats,
    currentPage,
    totalPages,
    handleSearch,
    handlePageChange,
    fetchUsers,
    assignRole,
    removeRole,
    toggleUserActiveStatus
  } = useUsersManagement();

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="space-y-6">
        {/* Stats Cards */}
        <UserStatsCards stats={stats} loading={loading} onRefresh={fetchUsers} />
        
        {/* Search and actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
          
          <UserSearchBar 
            onSearch={handleSearch} 
            onRefresh={fetchUsers}
            loading={loading}
          />
          
          <UsersTable
            users={users}
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            onPageChange={handlePageChange}
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
            onToggleStatus={toggleUserActiveStatus}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
