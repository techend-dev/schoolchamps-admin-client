import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileText, Eye, Trash2, RefreshCw, Globe, Upload, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { blogService, Blog } from '@/lib/services/blogService';
import { wordpressService } from '@/lib/services/wordpressService';
import { Loader } from '@/components/layout/Loader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  status: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface MixedBlog {
  _id: string;
  title: string;
  description: string;
  category: string;
  readingTime: number;
  createdAt: string;
  status: string;
  wordpressUrl?: string;
  isWordPressOnly: boolean;
}

export default function Blogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformBlogs, setPlatformBlogs] = useState<Blog[]>([]);
  const [wpPosts, setWpPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  const fetchAllBlogs = async () => {
    try {
      setLoading(true);

      // Fetch both platform blogs and WordPress posts
      const [blogsResponse, wpResponse] = await Promise.all([
        blogService.getAll(),
        wordpressService.getAllPosts().catch(() => ({ posts: [] }))
      ]);

      setPlatformBlogs(blogsResponse.data.blogs || []);
      setWpPosts(wpResponse.posts || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blogs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await blogService.delete(id);
      toast({
        title: 'Success',
        description: 'Blog deleted successfully',
      });
      fetchAllBlogs();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete blog',
        variant: 'destructive',
      });
    }
  };

  const handlePublishToWordPress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setPublishingId(id);
      await wordpressService.publishBlog(id);
      toast({
        title: 'Success',
        description: 'Blog published to WordPress successfully!',
      });
      fetchAllBlogs();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to publish to WordPress',
        variant: 'destructive',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const getStatusBadge = (status: string, isWpOnly: boolean) => {
    if (isWpOnly) {
      return (
        <Badge className="bg-purple-500 gap-1">
          <Globe className="h-3 w-3" />
          WordPress Only
        </Badge>
      );
    }

    switch (status) {
      case 'draft_created':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge className="bg-orange-500">In Review</Badge>;
      case 'approved_school':
        return <Badge className="bg-blue-500">Approved</Badge>;
      case 'published_wp':
        return (
          <Badge className="bg-green-500 gap-1">
            <Globe className="h-3 w-3" />
            Published
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get WordPress post IDs that are already linked to platform blogs
  const linkedWpIds = new Set(
    platformBlogs
      .filter(b => b.wordpressPostId)
      .map(b => b.wordpressPostId)
  );

  // WordPress-only posts (not created through platform)
  const wpOnlyPosts: MixedBlog[] = wpPosts
    .filter(wp => !linkedWpIds.has(wp.id))
    .map(wp => ({
      _id: `wp-${wp.id}`,
      title: wp.title.rendered.replace(/&#8217;/g, "'").replace(/&amp;/g, "&"),
      description: wp.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 150),
      category: 'WordPress',
      readingTime: 5,
      createdAt: wp.date,
      status: 'published_wp',
      wordpressUrl: wp.link,
      isWordPressOnly: true,
    }));

  // Platform blogs
  const platformBlogsFormatted: MixedBlog[] = platformBlogs.map(blog => ({
    _id: blog._id,
    title: blog.title,
    description: blog.metaDescription || '',
    category: blog.category || 'General',
    readingTime: blog.readingTime || 5,
    createdAt: blog.createdAt,
    status: blog.status,
    wordpressUrl: blog.wordpressUrl,
    isWordPressOnly: false,
  }));

  // Merge and sort by date
  const allBlogs = [...platformBlogsFormatted, ...wpOnlyPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredBlogs = allBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'drafts') return matchesSearch && blog.status === 'draft_created';
    if (activeTab === 'review') return matchesSearch && (blog.status === 'review' || blog.status === 'approved_school');
    if (activeTab === 'published') return matchesSearch && (blog.status === 'published_wp' || blog.isWordPressOnly);
    return matchesSearch;
  });

  const draftsCount = platformBlogs.filter(b => b.status === 'draft_created').length;
  const reviewCount = platformBlogs.filter(b => b.status === 'review' || b.status === 'approved_school').length;
  const publishedCount = platformBlogs.filter(b => b.status === 'published_wp').length + wpOnlyPosts.length;

  const canDelete = user?.role === 'admin';
  const canPublish = user?.role === 'admin' || user?.role === 'school';

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Blogs</h1>
        <p className="text-muted-foreground">
          View and manage all blog posts across different stages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold">{allBlogs.length}</p>
          <p className="text-sm text-muted-foreground">Total Blogs</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{draftsCount}</p>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-orange-600">{reviewCount}</p>
          <p className="text-sm text-muted-foreground">In Review</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchAllBlogs}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({allBlogs.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftsCount})</TabsTrigger>
          <TabsTrigger value="review">In Review ({reviewCount})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No blogs match your search criteria.'
                  : 'There are no blogs in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-6 hover:shadow-md transition-shadow ${blog.isWordPressOnly ? '' : 'cursor-pointer'}`}
                    onClick={() => !blog.isWordPressOnly && navigate(`/dashboard/blogs/${blog._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{blog.title}</h3>
                          {getStatusBadge(blog.status, blog.isWordPressOnly)}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {blog.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Category: {blog.category}</span>
                          <span>•</span>
                          <span>{blog.readingTime} min read</span>
                          <span>•</span>
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {/* Publish Button - for platform blogs only */}
                        {canPublish && !blog.isWordPressOnly && blog.status !== 'published_wp' && (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={(e) => handlePublishToWordPress(blog._id, e)}
                            disabled={publishingId === blog._id}
                          >
                            <Upload className="h-4 w-4" />
                            {publishingId === blog._id ? 'Publishing...' : 'Publish'}
                          </Button>
                        )}

                        {/* View on WordPress - for published blogs */}
                        {blog.wordpressUrl && (
                          <a
                            href={blog.wordpressUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="outline" className="gap-1">
                              <ExternalLink className="h-4 w-4" />
                              View
                            </Button>
                          </a>
                        )}

                        {/* View Details - for platform blogs only */}
                        {!blog.isWordPressOnly && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/blogs/${blog._id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}

                        {canDelete && !blog.isWordPressOnly && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => handleDeleteBlog(blog._id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
