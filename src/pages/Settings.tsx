import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Key,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile settings
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    // Password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        submissionAlerts: true,
        publishedAlerts: true,
        weeklyDigest: false,
    });

    const handleSaveProfile = async () => {
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been saved successfully.',
            });
            setSaving(false);
        }, 1000);
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: 'Password Changed',
                description: 'Your password has been updated successfully.',
            });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setSaving(false);
        }, 1000);
    };

    const handleSaveNotifications = () => {
        toast({
            title: 'Preferences Saved',
            description: 'Your notification preferences have been updated.',
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <SettingsIcon className="h-10 w-10 text-primary" />
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Alerts
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                            <div className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                </div>

                                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Key className="h-6 w-6 text-primary" />
                                <h2 className="text-xl font-semibold">Change Password</h2>
                            </div>

                            <div className="space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <Button onClick={handleChangePassword} disabled={saving} className="gap-2">
                                    <Shield className="h-4 w-4" />
                                    {saving ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

                            <div className="space-y-6 max-w-md">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive email updates about your account
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.emailNotifications}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, emailNotifications: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Submission Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when new submissions are created
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.submissionAlerts}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, submissionAlerts: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Published Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when blogs are published
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.publishedAlerts}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, publishedAlerts: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Weekly Digest</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive a weekly summary of activity
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.weeklyDigest}
                                        onCheckedChange={(checked) =>
                                            setNotifications({ ...notifications, weeklyDigest: checked })
                                        }
                                    />
                                </div>

                                <Button onClick={handleSaveNotifications} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Preferences
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
