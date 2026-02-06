import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Tag,
    Calendar,
    ExternalLink,
    Image as ImageIcon,
    Globe,
    Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { blogService, Blog } from '@/lib/services/blogService';
import { wordpressService } from '@/lib/services/wordpressService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function BlogDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
    }, [id]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await blogService.getById(id!);
            setBlog(response.data.blog);
        } catch (error) {
            console.error('Error fetching blog:', error);
            toast({
                title: 'Error',
                description: 'Failed to load blog',
                variant: 'destructive',
            });
            navigate('/dashboard/blogs');
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToWordPress = async () => {
        if (!blog) return;

        try {
            setPublishing(true);
            await wordpressService.publishBlog(blog._id);
            toast({
                title: 'Success',
                description: 'Blog published to WordPress successfully!',
            });
            fetchBlog(); // Refresh to get updated status
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to publish to WordPress',
                variant: 'destructive',
            });
        } finally {
            setPublishing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft_created':
                return <Badge variant="secondary" className="text-base px-3 py-1">Draft</Badge>;
            case 'review':
                return <Badge className="bg-orange-500 text-base px-3 py-1">In Review</Badge>;
            case 'approved_school':
                return <Badge className="bg-blue-500 text-base px-3 py-1">Approved</Badge>;
            case 'published_wp':
                return (
                    <Badge className="bg-green-500 text-base px-3 py-1 gap-1">
                        <Globe className="h-3 w-3" />
                        Published to WordPress
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-base px-3 py-1">{status}</Badge>;
        }
    };

    const getImageUrl = (path: string) => {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}/${path}`;
    };

    const canPublish = (user?.role === 'admin' || user?.role === 'school') && blog?.status !== 'published_wp';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold">Blog not found</h2>
                <Button onClick={() => navigate('/dashboard/blogs')} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const submission = typeof blog.submissionId === 'object' ? blog.submissionId : null;
    const school = typeof blog.assignedSchool === 'object' ? blog.assignedSchool : null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/dashboard/blogs')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blogs
                </Button>

                {/* Publish Button */}
                {canPublish && (
                    <Button
                        onClick={handlePublishToWordPress}
                        disabled={publishing}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        {publishing ? 'Publishing...' : 'Publish to WordPress'}
                    </Button>
                )}
            </div>

            {/* WordPress Published Indicator */}
            {blog.status === 'published_wp' && blog.wordpressUrl && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-full">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-green-800 dark:text-green-200">Published to WordPress</p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        This blog is live on your WordPress site
                                    </p>
                                </div>
                            </div>
                            <a
                                href={blog.wordpressUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="gap-2 border-green-300">
                                    <ExternalLink className="h-4 w-4" />
                                    View Live
                                </Button>
                            </a>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">{blog.title}</h1>
                    <div className="w-fit">
                        {getStatusBadge(blog.status)}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {blog.readingTime || 5} min read
                    </span>
                    <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {blog.category || 'General'}
                    </span>
                    {school && (
                        <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">School: {school.name}</span>
                    )}
                </div>
            </motion.div>

            {/* Featured Image */}
            {blog.featuredImage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-64 md:h-96 object-cover rounded-xl"
                    />
                </motion.div>
            )}

            {/* School Uploaded Images */}
            {submission?.attachments && submission.attachments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            School Uploaded Images ({submission.attachments.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {submission.attachments.map((attachment, index) => (
                                <a
                                    key={index}
                                    href={getImageUrl(attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                >
                                    <img
                                        src={getImageUrl(attachment)}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border group-hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Meta Description */}
            {blog.metaDescription && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-6 bg-muted/30">
                        <p className="text-lg italic text-muted-foreground">
                            {blog.metaDescription}
                        </p>
                    </Card>
                </motion.div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-2"
                >
                    {blog.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="px-3 py-1">
                            {tag}
                        </Badge>
                    ))}
                </motion.div>
            )}

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="p-5 md:p-10 bg-card border-white/[0.05] shadow-medium">
                    <div
                        className="prose prose-sm md:prose-lg max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:text-white"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </Card>
            </motion.div>

            {/* SEO Keywords */}
            {blog.seoKeywords && blog.seoKeywords.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">SEO Keywords</h3>
                        <p className="text-sm">{blog.seoKeywords.join(', ')}</p>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
