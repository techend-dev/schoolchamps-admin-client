import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, FileText, Send, Eye, ExternalLink, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/adminService';
import { wordpressService } from '@/lib/services/wordpressService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Blog {
    _id: string;
    title: string;
    status: string;
    content: string;
    slug: string;
    featuredImage?: string;
    createdAt: string;
    updatedAt: string;
    assignedSchool?: {
        _id: string;
        name: string;
        city?: string;
    };
    createdBy?: {
        name: string;
        email: string;
    };
    wordpressUrl?: string;
}

export default function Approvals() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingBlogs();
    }, []);

    const fetchPendingBlogs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllBlogs();
            // Filter for blogs pending admin approval or newly created drafts
            const pendingBlogs = (res.data.blogs || []).filter(
                (b: Blog) => b.status === 'approved_school' || b.status === 'draft_created'
            );
            setBlogs(pendingBlogs);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load pending approvals',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (blogId: string) => {
        try {
            setPublishingId(blogId);
            await wordpressService.publishBlog(blogId);
            toast({
                title: 'Success',
                description: 'Blog published to WordPress successfully!',
            });
            fetchPendingBlogs();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to publish blog',
                variant: 'destructive',
            });
        } finally {
            setPublishingId(null);
        }
    };

    const handleReject = async (blogId: string) => {
        try {
            setRejectingId(blogId);
            await adminService.updateBlogStatus(blogId, 'draft_writer');
            toast({
                title: 'Sent for Revision',
                description: 'Blog sent back to writer for revision',
            });
            fetchPendingBlogs();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update status',
                variant: 'destructive',
            });
        } finally {
            setRejectingId(null);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}/${path.replace(/\\/g, '/')}`;
    };

    const stats = [
        { label: 'Pending Approval', value: blogs.length, icon: Clock },
    ];

    return (
        <div className="space-y-6 md:space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 uppercase">Review & Approvals</h1>
                <p className="text-xs md:text-lg text-muted-foreground">
                    Review, edit, and publish school stories
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={cn(
                    "p-4 md:p-6 bg-card border-white/[0.05] shadow-medium",
                    blogs.length > 0 ? "border-primary/30" : ""
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl border",
                            blogs.length > 0 ? "bg-primary/10 border-primary/20" : "bg-muted border-white/5"
                        )}>
                            <Clock className={cn("h-5 w-5", blogs.length > 0 ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Action</p>
                            <p className={cn("text-2xl font-extrabold", blogs.length > 0 ? "text-white" : "text-muted-foreground")}>
                                {blogs.length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Approvals List */}
            <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium">
                <div className="flex items-center justify-between mb-6 md:mb-8 text-center sm:text-left">
                    <div className="mx-auto sm:mx-0">
                        <h2 className="text-lg md:text-2xl font-bold text-white mb-1">Items Awaiting Action</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">Drafts and school-approved posts</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchPendingBlogs}
                        className="hidden sm:flex hover:bg-white/5"
                    >
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/[0.05] rounded-3xl">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground font-medium">All caught up! No items to review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {blogs.map((blog) => (
                            <div
                                key={blog._id}
                                className="p-4 md:p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
                            >
                                <div className="flex flex-col xl:flex-row gap-6">
                                    {/* Image Preview */}
                                    {blog.featuredImage && (
                                        <div className="xl:w-64 h-48 xl:h-auto overflow-hidden rounded-2xl shrink-0 border border-white/10">
                                            <img
                                                src={getImageUrl(blog.featuredImage)}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <h3 className="font-bold text-white text-base md:text-xl leading-snug">{blog.title}</h3>
                                            <Badge className={cn(
                                                "text-[9px] md:text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-lg",
                                                blog.status === 'draft_created'
                                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            )}>
                                                {blog.status === 'draft_created' ? 'NEW DRAFT' : 'SCHOOL APPROVED'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] md:text-sm text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10">
                                                <FileText className="h-3.5 w-3.5 text-primary" />
                                                {blog.assignedSchool?.name || 'Unknown School'}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(blog.updatedAt).toLocaleDateString()}
                                            </span>
                                            {blog.createdBy && (
                                                <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">By: {blog.createdBy.name}</span>
                                            )}
                                        </div>

                                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6">
                                            {blog.content?.replace(/<[^>]*>/g, '').slice(0, 250)}...
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                onClick={() => navigate(`/dashboard/blogs/${blog._id}/edit`)}
                                                className="bg-white text-black hover:bg-white/90 font-bold gap-2 px-6 h-10 md:h-12 flex-1 sm:flex-none"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit Content
                                            </Button>

                                            {(user?.role === 'admin' || user?.role === 'writer') && (
                                                <Button
                                                    onClick={() => handlePublish(blog._id)}
                                                    disabled={publishingId === blog._id || rejectingId === blog._id}
                                                    className="bg-primary hover:bg-primary-light font-bold gap-2 px-6 h-10 md:h-12 shadow-glow flex-1 sm:flex-none"
                                                >
                                                    {publishingId === blog._id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Publishing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4" />
                                                            Publish to WordPress
                                                        </>
                                                    )}
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(blog._id)}
                                                disabled={publishingId === blog._id || rejectingId === blog._id}
                                                className="border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold gap-2 px-6 h-10 md:h-12 flex-1 sm:flex-none"
                                            >
                                                {rejectingId === blog._id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4" />
                                                        Request Revision
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
