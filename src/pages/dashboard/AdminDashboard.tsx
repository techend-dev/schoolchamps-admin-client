import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, TrendingUp, School } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/services/adminService';
import { wordpressService } from '@/lib/services/wordpressService';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/layout/Loader';

interface Overview {
  totalSchools: number;
  totalSubmissions: number;
  totalPublished: number;
  draftsPending: number;
  blogsInReview: number;
}

interface Blog {
  _id: string;
  title: string;
  status: string;
  schoolId?: {
    name: string;
  };
  assignedSchool?: {
    name: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, blogsRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getAllBlogs(),
      ]);
      setOverview(overviewRes.data.overview);
      setBlogs(blogsRes.data.blogs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToWordPress = async (blogId: string) => {
    try {
      setPublishingId(blogId);
      await wordpressService.publishBlog(blogId);
      toast({
        title: 'Success',
        description: 'Blog published to WordPress successfully!',
      });
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to publish blog',
        variant: 'destructive',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleUpdateBlogStatus = async (blogId: string, status: string) => {
    try {
      await adminService.updateBlogStatus(blogId, status);
      toast({
        title: 'Success',
        description: 'Blog status updated successfully!',
      });
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update blog status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Loader />;
  }

  const stats = [
    { label: 'Total Schools', value: String(overview?.totalSchools ?? 0), icon: School, color: 'text-blue-500' },
    { label: 'Total Posts', value: String(overview?.totalPublished ?? 0), icon: FileText, color: 'text-green-500' },
    { label: 'Drafts', value: String(overview?.draftsPending ?? 0), icon: CheckCircle, color: 'text-purple-500' },
    { label: 'In Review', value: String(overview?.blogsInReview ?? 0), icon: Clock, color: 'text-orange-500' },
  ];

  const pendingBlogs = blogs.filter(b => b.status === 'approved_school');
  const recentBlogs = blogs.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage schools, users, and content across the platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending Approval */}
      {pendingBlogs.length > 0 && (
        <Card className="p-6 shadow-soft">
          <h2 className="text-2xl font-semibold mb-6">Pending Approval</h2>
          <div className="space-y-4">
            {pendingBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {blog.schoolId?.name} • {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">Approved by School</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePublishToWordPress(blog._id)}
                    disabled={publishingId === blog._id}
                  >
                    {publishingId === blog._id ? 'Publishing...' : 'Publish to WordPress'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateBlogStatus(blog._id, 'draft_writer')}
                  >
                    Send Back
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Recent Blogs
          </h2>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {recentBlogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-smooth"
            >
              <div>
                <p className="font-medium">{blog.title}</p>
                <p className="text-sm text-muted-foreground">
                  {blog.schoolId?.name || 'Unknown'} • {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={blog.status === 'published_wp' ? 'default' : 'secondary'}>
                {blog.status.replace('_', ' ')}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
