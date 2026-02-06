import { useState, useEffect } from 'react';
import { Bell, Send, Users, CheckCircle, Clock, FileText, Eye, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';

interface Blog {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    assignedSchool?: {
        _id: string;
        name: string;
    };
    createdBy?: {
        name: string;
    };
}

interface NotificationItem {
    id: string;
    type: 'approval' | 'review' | 'published' | 'submission';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    blogId?: string;
}

export default function Notifications() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        inReview: 0,
        published: 0,
        total: 0
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const [overviewRes, blogsRes] = await Promise.all([
                adminService.getOverview(),
                adminService.getAllBlogs()
            ]);

            const blogs = blogsRes.data.blogs || [];
            const overview = overviewRes.data.overview;

            // Set stats
            setStats({
                pending: blogs.filter((b: Blog) => b.status === 'approved_school').length,
                inReview: overview.blogsInReview || 0,
                published: overview.totalPublished || 0,
                total: blogs.length
            });

            // Generate notifications from blog activities
            const generatedNotifications: NotificationItem[] = blogs
                .slice(0, 15)
                .map((blog: Blog) => {
                    let type: NotificationItem['type'] = 'submission';
                    let message = '';

                    switch (blog.status) {
                        case 'approved_school':
                            type = 'approval';
                            message = `${blog.assignedSchool?.name || 'School'} approved "${blog.title}" for publishing`;
                            break;
                        case 'review':
                            type = 'review';
                            message = `"${blog.title}" is pending school review`;
                            break;
                        case 'published_wp':
                            type = 'published';
                            message = `"${blog.title}" was published to WordPress`;
                            break;
                        default:
                            message = `New submission: "${blog.title}"`;
                    }

                    return {
                        id: blog._id,
                        type,
                        title: getNotificationTitle(blog.status),
                        message,
                        timestamp: blog.updatedAt || blog.createdAt,
                        read: blog.status === 'published_wp',
                        blogId: blog._id
                    };
                });

            setNotifications(generatedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationTitle = (status: string) => {
        switch (status) {
            case 'approved_school': return 'Pending Approval';
            case 'review': return 'In Review';
            case 'published_wp': return 'Published';
            default: return 'New Submission';
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'approval':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'published':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'review':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'approval': return AlertCircle;
            case 'published': return CheckCircle;
            case 'review': return Eye;
            default: return FileText;
        }
    };

    const statCards = [
        { label: 'Pending Approval', value: stats.pending, icon: Clock, highlight: stats.pending > 0 },
        { label: 'In Review', value: stats.inReview, icon: Eye, highlight: false },
        { label: 'Published', value: stats.published, icon: CheckCircle, highlight: false },
        { label: 'Total Posts', value: stats.total, icon: FileText, highlight: false },
    ];

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Notifications</h1>
                <p className="text-sm md:text-lg text-muted-foreground max-w-lg">
                    Track blog approvals and publishing activity
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {statCards.map((stat) => (
                    <Card
                        key={stat.label}
                        className={cn(
                            "p-3 md:p-6 bg-card border-white/[0.05] shadow-medium transition-all hover:border-primary/20",
                            stat.highlight && "border-yellow-500/30 bg-yellow-500/5"
                        )}
                    >
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className={cn(
                                "p-2 rounded-xl border shrink-0",
                                stat.highlight
                                    ? "bg-yellow-500/10 border-yellow-500/20"
                                    : "bg-primary/10 border-primary/20"
                            )}>
                                <stat.icon className={cn(
                                    "h-4 w-4 md:h-5 md:w-5",
                                    stat.highlight ? "text-yellow-500" : "text-primary"
                                )} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">{stat.label}</p>
                                <p className={cn(
                                    "text-lg md:text-2xl font-extrabold",
                                    stat.highlight ? "text-yellow-500" : "text-white"
                                )}>{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Notifications List */}
            <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold text-white mb-1">Recent Activity</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">Blog workflow updates</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/[0.05] rounded-2xl">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-sm text-muted-foreground font-medium">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const Icon = getTypeIcon(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 md:p-5 rounded-2xl border transition-all",
                                        notification.type === 'approval' && !notification.read
                                            ? "bg-yellow-500/5 border-yellow-500/20"
                                            : "bg-white/[0.02] border-white/[0.05]"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl border shrink-0",
                                            getTypeStyles(notification.type)
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5 sm:mb-1">
                                                <h3 className="font-bold text-white text-sm md:text-base truncate">{notification.title}</h3>
                                                <Badge className={cn("text-[8px] md:text-[10px] font-bold w-fit", getTypeStyles(notification.type))}>
                                                    {notification.type.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{notification.message}</p>
                                            <p className="text-[10px] md:text-xs text-muted-foreground/50 mt-2 font-medium">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
