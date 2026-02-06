import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users as UsersIcon,
    Plus,
    Search,
    Shield,
    Mail,
    Calendar,
    MoreVertical,
    Key,
    Ban,
    CheckCircle,
    Eye,
    EyeOff,
    UserPlus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { adminService } from '@/lib/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    schoolId?: {
        name: string;
    };
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'writer'
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createUser(formData);
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
            setIsCreateOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'writer' });
            fetchUsers();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create user',
                variant: 'destructive',
            });
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            await adminService.resetPassword(selectedUser._id, newPassword);
            toast({
                title: 'Success',
                description: 'Password reset successfully',
            });
            setIsResetOpen(false);
            setNewPassword('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to reset password',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await adminService.toggleUserActive(user._id);
            toast({
                title: 'Success',
                description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
            });
            fetchUsers();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user status',
                variant: 'destructive',
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
            case 'school': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">School</Badge>;
            case 'writer': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Writer</Badge>;
            case 'marketer': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Marketer</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
        }
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password: pass });
        setShowPassword(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
                        User Management
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-lg">
                        Manage roles, create new accounts, and monitor user activity
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:bg-primary-light h-12 px-6">
                            <UserPlus className="h-5 w-5" />
                            Create New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateUser}>
                            <DialogHeader>
                                <DialogTitle>Create New Account</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="writer">Content Writer</SelectItem>
                                            <SelectItem value="marketer">Digital Marketer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-8"
                                                onClick={generatePassword}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full">Create User</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, color: 'text-primary' },
                    { label: 'Writers', value: users.filter(u => u.role === 'writer').length, color: 'text-purple-500' },
                    { label: 'Marketers', value: users.filter(u => u.role === 'marketer').length, color: 'text-green-500' },
                    { label: 'Schools', value: users.filter(u => u.role === 'school').length, color: 'text-blue-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="p-4 md:p-6 hover:border-primary/50 transition-colors">
                        <p className="text-[12px] md:text-sm text-muted-foreground mb-1 font-semibold uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Search & Table */}
            <Card className="p-4 md:p-6">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name, email or role..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="pb-4 font-semibold text-sm">User</th>
                                <th className="pb-4 font-semibold text-sm">Role</th>
                                <th className="pb-4 font-semibold text-sm">Status</th>
                                <th className="pb-4 font-semibold text-sm">Joined</th>
                                <th className="pb-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="group hover:bg-muted/50 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">{getRoleBadge(user.role)}</td>
                                    <td className="py-4">
                                        {user.isActive ? (
                                            <span className="flex items-center gap-1 text-xs text-green-500">
                                                <CheckCircle className="h-3 w-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-red-500">
                                                <Ban className="h-3 w-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="gap-2"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsResetOpen(true);
                                                    }}
                                                >
                                                    <Key className="h-4 w-4" /> Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className={`gap-2 ${user.isActive ? 'text-red-500' : 'text-green-500'}`}
                                                    onClick={() => handleToggleActive(user)}
                                                >
                                                    {user.isActive ? (
                                                        <><Ban className="h-4 w-4" /> Deactivate</>
                                                    ) : (
                                                        <><CheckCircle className="h-4 w-4" /> Activate</>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredUsers.map((user) => (
                        <div key={user._id} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsResetOpen(true);
                                            }}
                                        >
                                            <Key className="h-4 w-4" /> Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`gap-2 ${user.isActive ? 'text-red-500' : 'text-green-500'}`}
                                            onClick={() => handleToggleActive(user)}
                                        >
                                            {user.isActive ? (
                                                <><Ban className="h-4 w-4" /> Deactivate</>
                                            ) : (
                                                <><CheckCircle className="h-4 w-4" /> Activate</>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                                    {user.isActive ? (
                                        <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                                            <CheckCircle className="h-3 w-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                                            <Ban className="h-3 w-3" /> Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Role</p>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] text-muted-foreground/60 block">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        No users found matching your search.
                    </div>
                )}
            </Card>

            {/* Password Reset Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleResetPassword}>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Set a new password for <span className="text-foreground font-medium">{selectedUser?.name}</span>
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">Reset Password</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
