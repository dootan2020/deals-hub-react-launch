
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle, 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Loader2, Eye, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers } from '@/utils/security';

interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
  balance: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use the new secure function to get all users
      const users = await getAllUsers();
      
      if (!users) {
        throw new Error('Failed to fetch users');
      }
      
      // Then get all profiles with balances
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, balance');
      
      if (profilesError) throw profilesError;
      
      // Merge the data
      const mergedUsers = users.map(user => {
        const profile = profiles.find(p => p.id === user.id);
        return {
          ...user,
          display_name: user.display_name || user.email.split('@')[0],
          balance: profile?.balance || 0
        };
      });
      
      setUsers(mergedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (userId: string, amount: number) => {
    if (!amount) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc(
        'update_user_balance',
        { 
          user_id_param: userId, 
          amount_param: amount 
        }
      );
      
      if (error) throw error;
      
      // Update the user balance in local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, balance: user.balance + amount };
        }
        return user;
      }));
      
      // Update current user if viewing
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          balance: currentUser.balance + amount
        });
      }
      
      // Create a transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: amount > 0 ? 'deposit' : 'withdrawal',
          status: 'completed',
          payment_method: 'manual',
        });
      
      toast.success(`${amount > 0 ? 'Nạp' : 'Rút'} tiền thành công`);
      setBalanceAmount('');
      setIsBalanceDialogOpen(false);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Không thể cập nhật số dư');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = (user: User) => {
    setCurrentUser(user);
    setIsViewDialogOpen(true);
  };

  const handleOpenBalanceDialog = (user: User) => {
    setCurrentUser(user);
    setBalanceAmount('');
    setIsBalanceDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý tất cả người dùng trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tên hiển thị</TableHead>
                    <TableHead>Số dư</TableHead>
                    <TableHead>Quyền</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.display_name || 'N/A'}</TableCell>
                        <TableCell>${user.balance}</TableCell>
                        <TableCell>
                          {user.roles && user.roles.includes('admin') ? (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {user.email_confirmed_at ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Đã xác thực
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Chưa xác thực
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenBalanceDialog(user)}
                              className="text-xs"
                            >
                              Nạp tiền
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Không có người dùng nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogDescription>
              Xem chi tiết thông tin người dùng.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-full p-3">
                  <UserCircle className="h-10 w-10 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold">{currentUser.display_name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Số dư</p>
                  <p className="text-lg font-bold">${currentUser.balance}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Quyền</p>
                  <div className="flex gap-1 mt-1">
                    {currentUser.roles && currentUser.roles.map(role => (
                      <Badge key={role} variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Ngày đăng ký</p>
                  <p>{formatDate(currentUser.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Đăng nhập cuối</p>
                  <p>{formatDate(currentUser.last_sign_in_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Trạng thái Email</p>
                <p>{currentUser.email_confirmed_at ? 'Đã xác thực' : 'Chưa xác thực'}</p>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenBalanceDialog(currentUser);
                  }}
                >
                  Nạp tiền
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nạp/rút tiền</DialogTitle>
            <DialogDescription>
              {currentUser?.email && (
                <>Cập nhật số dư cho <span className="font-medium">{currentUser.email}</span>.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="balance">Số tiền (USD)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Nhập số dương để nạp tiền, số âm để rút tiền
              </p>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Nhập số tiền"
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                disabled={isSubmitting || !balanceAmount}
                onClick={() => currentUser && updateUserBalance(currentUser.id, parseFloat(balanceAmount))}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật số dư
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
