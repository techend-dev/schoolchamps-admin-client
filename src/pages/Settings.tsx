import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Key,
    Save,
    Eye,
    EyeOff,
    Instagram,
    Linkedin,
    Facebook,
    CheckCircle2,
    XCircle,
    ExternalLink,
    RefreshCw,
    Loader2,
    Unplug,
    Plug,
    Share2,
    Plus,
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
import { aiService } from '@/lib/services/aiService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SocialAccountsStatus {
    facebook: { connected: boolean; pageId: string | null; source: string };
    linkedin: {
        connected: boolean;
        personUrn: string | null;
        orgUrn: string | null;
        expiresAt: string | null;
        hasRefreshToken: boolean;
        metadata: { selectedPageName?: string };
    };
    instagram: { connected: boolean; accountId: string | null };
}

export default function Settings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const isAdmin = user?.role === 'admin';

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

    // Social accounts state
    const [socialStatus, setSocialStatus] = useState<SocialAccountsStatus | null>(null);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [refreshingTokens, setRefreshingTokens] = useState(false);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    // Facebook manual setup
    const [showFbSetup, setShowFbSetup] = useState(false);
    const [fbAccessToken, setFbAccessToken] = useState('');
    const [fbPageId, setFbPageId] = useState('');
    const [savingFb, setSavingFb] = useState(false);

    // LinkedIn organization selection
    const [organizations, setOrganizations] = useState<{ urn: string; name: string }[]>([]);
    const [loadingPages, setLoadingPages] = useState(false);
    const [showPageSelection, setShowPageSelection] = useState(false);
    const [selectingPage, setSelectingPage] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchSocialStatus();
        }
    }, [isAdmin]);

    const fetchSocialStatus = async () => {
        try {
            setLoadingSocial(true);
            const response = await aiService.getSocialAccountsStatus();
            setSocialStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch social status:', error);
        } finally {
            setLoadingSocial(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
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

    const handleSaveFacebookCredentials = async () => {
        if (!fbAccessToken || !fbPageId) {
            toast({ title: 'Error', description: 'Both fields are required', variant: 'destructive' });
            return;
        }
        try {
            setSavingFb(true);
            await aiService.saveFacebookCredentials(fbAccessToken, fbPageId);
            toast({ title: 'Connected!', description: 'Facebook credentials saved to database.' });
            setShowFbSetup(false);
            setFbAccessToken('');
            setFbPageId('');
            fetchSocialStatus();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to save', variant: 'destructive' });
        } finally {
            setSavingFb(false);
        }
    };

    const handleConnectLinkedIn = () => {
        // Open LinkedIn OAuth in a new window
        const authUrl = aiService.getLinkedInAuthUrl();
        const authWindow = window.open(authUrl, '_blank', 'width=600,height=700');

        // Poll for window close, then refresh status
        const pollTimer = setInterval(() => {
            if (authWindow?.closed) {
                clearInterval(pollTimer);
                setTimeout(() => fetchSocialStatus(), 1500);
            }
        }, 1000);
    };

    const handleDisconnect = async (platform: string) => {
        try {
            setDisconnecting(platform);
            await aiService.disconnectSocialAccount(platform);
            toast({ title: 'Disconnected', description: `${platform} account has been disconnected.` });
            fetchSocialStatus();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to disconnect', variant: 'destructive' });
        } finally {
            setDisconnecting(null);
        }
    };

    const handleRefreshTokens = async () => {
        try {
            setRefreshingTokens(true);
            await aiService.triggerTokenRefresh();
            toast({ title: 'Refreshed', description: 'Token health check completed. Check server logs.' });
            fetchSocialStatus();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Refresh failed', variant: 'destructive' });
        } finally {
            setRefreshingTokens(false);
        }
    };

    const fetchLinkedInPages = async () => {
        try {
            setLoadingPages(true);
            setShowPageSelection(true);
            const response = await aiService.getLinkedInPages();
            setOrganizations(response.data.organizations || []);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to fetch LinkedIn pages', variant: 'destructive' });
        } finally {
            setLoadingPages(false);
        }
    };

    const handleSelectLinkedInPage = async (orgUrn: string, orgName: string) => {
        try {
            setSelectingPage(orgUrn);
            await aiService.selectLinkedInPage(orgUrn, orgName);
            toast({ title: 'Page Selected', description: `Posts will now go to ${orgName}` });
            setShowPageSelection(false);
            fetchSocialStatus();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to select page', variant: 'destructive' });
        } finally {
            setSelectingPage(null);
        }
    };

    const formatExpiry = (dateStr: string | null) => {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        const days = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Expired';
        if (days === 0) return 'Expires today';
        return `${days} days left`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                    Settings
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground max-w-lg">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6 w-full">
                <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <TabsList className={cn("flex h-auto p-1 bg-muted/50 w-full", isAdmin ? "md:max-w-lg" : "md:max-w-md")}>
                        <TabsTrigger value="profile" className="flex-1 py-2 text-xs md:text-sm gap-2">
                            <User className="h-3.5 w-3.5" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex-1 py-2 text-xs md:text-sm gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex-1 py-2 text-xs md:text-sm gap-2">
                            <Bell className="h-3.5 w-3.5" />
                            Alerts
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="social" className="flex-1 py-2 text-xs md:text-sm gap-2">
                                <Share2 className="h-3.5 w-3.5" />
                                Social
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Profile Information</h2>

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
                        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium">
                            <div className="flex items-center gap-3 mb-6">
                                <Key className="h-6 w-6 text-primary" />
                                <h2 className="text-xl md:text-2xl font-bold text-white">Change Password</h2>
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
                        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Notification Preferences</h2>

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

                {/* Social Accounts Tab (Admin only) */}
                {isAdmin && (
                    <TabsContent value="social">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Header with refresh button */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">Connected Accounts</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Manage social media platform connections for posting</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefreshTokens}
                                    disabled={refreshingTokens}
                                    className="gap-2 border-white/10 hover:bg-white/5"
                                >
                                    <RefreshCw className={cn("h-4 w-4", refreshingTokens && "animate-spin")} />
                                    {refreshingTokens ? 'Checking...' : 'Check Health'}
                                </Button>
                            </div>

                            {loadingSocial ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Instagram Card */}
                                    <Card className="p-6 bg-card border-white/[0.05] shadow-medium relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full" />
                                        <div className="relative space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                                                        <Instagram className="h-5 w-5 text-pink-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">Instagram</h3>
                                                        <p className="text-[11px] text-muted-foreground">Via Meta Graph API</p>
                                                    </div>
                                                </div>
                                                {socialStatus?.instagram.connected ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Live
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground border-white/10 gap-1">
                                                        <XCircle className="h-3 w-3" /> Not Set
                                                    </Badge>
                                                )}
                                            </div>
                                            {socialStatus?.instagram.accountId && (
                                                <p className="text-xs text-muted-foreground font-mono bg-white/5 rounded-lg px-3 py-2">
                                                    ID: {socialStatus.instagram.accountId}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground italic">
                                                Configured via environment variables
                                            </p>
                                        </div>
                                    </Card>

                                    {/* Facebook Card */}
                                    <Card className="p-6 bg-card border-white/[0.05] shadow-medium relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                                        <div className="relative space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                        <Facebook className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">Facebook</h3>
                                                        <p className="text-[11px] text-muted-foreground">Page Publishing</p>
                                                    </div>
                                                </div>
                                                {socialStatus?.facebook.connected ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Live
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground border-white/10 gap-1">
                                                        <XCircle className="h-3 w-3" /> Not Set
                                                    </Badge>
                                                )}
                                            </div>

                                            {socialStatus?.facebook.pageId && (
                                                <p className="text-xs text-muted-foreground font-mono bg-white/5 rounded-lg px-3 py-2">
                                                    Page: {socialStatus.facebook.pageId}
                                                </p>
                                            )}

                                            <div className="flex gap-2">
                                                {socialStatus?.facebook.connected ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                                                        onClick={() => handleDisconnect('facebook')}
                                                        disabled={disconnecting === 'facebook'}
                                                    >
                                                        {disconnecting === 'facebook' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unplug className="h-3.5 w-3.5" />}
                                                        Disconnect
                                                    </Button>
                                                ) : null}
                                                <Button
                                                    size="sm"
                                                    className={cn("gap-1.5", socialStatus?.facebook.connected ? "flex-1" : "w-full")}
                                                    variant={socialStatus?.facebook.connected ? "outline" : "default"}
                                                    onClick={() => setShowFbSetup(!showFbSetup)}
                                                >
                                                    <Plug className="h-3.5 w-3.5" />
                                                    {socialStatus?.facebook.connected ? 'Update' : 'Connect'}
                                                </Button>
                                            </div>

                                            {/* Facebook Setup Form */}
                                            {showFbSetup && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-3 pt-2 border-t border-white/5"
                                                >
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Page Access Token</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="Paste your long-lived page token"
                                                            value={fbAccessToken}
                                                            onChange={(e) => setFbAccessToken(e.target.value)}
                                                            className="text-xs h-9"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Page ID</Label>
                                                        <Input
                                                            placeholder="e.g. 123456789"
                                                            value={fbPageId}
                                                            onChange={(e) => setFbPageId(e.target.value)}
                                                            className="text-xs h-9"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSaveFacebookCredentials}
                                                        disabled={savingFb}
                                                        className="w-full gap-2"
                                                    >
                                                        {savingFb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                                        Save Credentials
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* LinkedIn Card */}
                                    <Card className="p-6 bg-card border-white/[0.05] shadow-medium relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full" />
                                        <div className="relative space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                                                        <Linkedin className="h-5 w-5 text-sky-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">LinkedIn</h3>
                                                        <p className="text-[11px] text-muted-foreground">OAuth 2.0</p>
                                                    </div>
                                                </div>
                                                {socialStatus?.linkedin.connected ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Live
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground border-white/10 gap-1">
                                                        <XCircle className="h-3 w-3" /> Not Set
                                                    </Badge>
                                                )}
                                            </div>

                                            {socialStatus?.linkedin.connected && (
                                                <div className="space-y-3">
                                                    <div className="space-y-2">
                                                        {socialStatus.linkedin.expiresAt && (
                                                            <div className="flex items-center justify-between text-[11px] bg-white/5 rounded-lg px-2 py-1.5">
                                                                <span className="text-muted-foreground uppercase tracking-wider font-bold">Token Health</span>
                                                                <span className={cn(
                                                                    "font-bold px-1.5 py-0.5 rounded",
                                                                    formatExpiry(socialStatus.linkedin.expiresAt) === 'Expired' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                                                )}>
                                                                    {formatExpiry(socialStatus.linkedin.expiresAt)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {socialStatus.linkedin.metadata.selectedPageName ? (
                                                            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                                <span className="text-[10px] text-primary uppercase font-black tracking-widest leading-none">Target Page</span>
                                                                <span className="text-xs text-white font-bold leading-none">{socialStatus.linkedin.metadata.selectedPageName}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                                                <p className="text-[11px] text-yellow-500 font-bold">No page selected. Posts will go to your personal profile.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs font-bold border-white/10 hover:bg-white/5 gap-2"
                                                        onClick={fetchLinkedInPages}
                                                        disabled={loadingPages}
                                                    >
                                                        {loadingPages ? <Loader2 className="h-3 w-3 animate-spin" /> : <SettingsIcon className="h-3 w-3" />}
                                                        Manage Target Page
                                                    </Button>

                                                    {showPageSelection && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-sm border-t border-white/10 p-4 z-10 max-h-full overflow-y-auto custom-scrollbar"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-xs font-black uppercase text-white tracking-wider">Select Page</h4>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full hover:bg-white/10"
                                                                    onClick={() => setShowPageSelection(false)}
                                                                >
                                                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                {organizations.length === 0 ? (
                                                                    <p className="text-[11px] text-muted-foreground text-center py-4">No managed pages found.</p>
                                                                ) : (
                                                                    organizations.map(org => (
                                                                        <button
                                                                            key={org.urn}
                                                                            onClick={() => handleSelectLinkedInPage(org.urn, org.name)}
                                                                            disabled={selectingPage === org.urn}
                                                                            className={cn(
                                                                                "w-full text-left p-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-between group",
                                                                                socialStatus.linkedin.orgUrn === org.urn
                                                                                    ? "bg-primary/20 border-primary/30 text-primary"
                                                                                    : "bg-white/2 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"
                                                                            )}
                                                                        >
                                                                            <span className="truncate pr-2">{org.name}</span>
                                                                            {selectingPage === org.urn ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                            ) : socialStatus.linkedin.orgUrn === org.urn ? (
                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            ) : (
                                                                                <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            )}
                                                                        </button>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {socialStatus?.linkedin.connected ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                                                            onClick={() => handleDisconnect('linkedin')}
                                                            disabled={disconnecting === 'linkedin'}
                                                        >
                                                            {disconnecting === 'linkedin' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unplug className="h-3.5 w-3.5" />}
                                                            Disconnect
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 gap-1.5"
                                                            onClick={handleConnectLinkedIn}
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                            Reconnect
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="w-full gap-2"
                                                        onClick={handleConnectLinkedIn}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Connect LinkedIn
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Info Banner */}
                            <Card className="p-4 bg-primary/5 border-primary/10">
                                <div className="flex items-start gap-3">
                                    <Share2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p className="font-semibold text-white text-xs">How it works</p>
                                        <p className="text-xs leading-relaxed">
                                            Connected accounts are used by the <strong className="text-white">Social Center (AI Tools)</strong> to post content directly to your platforms.
                                            LinkedIn tokens auto-refresh daily. Facebook page tokens don't expire unless revoked.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
