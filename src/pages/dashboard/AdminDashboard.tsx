import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, TrendingUp, School } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/services/adminService';
import { wordpressService } from '@/lib/services/wordpressService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Super Admin Dashboard</h1>
        <p className="text-xs md:text-lg text-muted-foreground max-w-lg">
          System-wide analytics and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl md:text-4xl font-extrabold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blogs */}
        <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Recent Blogs</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Latest content across all schools</p>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchData} className="hover:bg-white/5">
              Refresh
            </Button>
          </div>
          <div className="space-y-4">
            {recentBlogs.map((blog, index) => (
              <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-white truncate group-hover:text-primary transition-colors text-sm md:text-base">{blog.title}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-medium">
                    {blog.schoolId?.name || 'Unknown School'} • {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={cn(
                  "shrink-0 font-bold text-[10px] md:text-xs",
                  blog.status === 'published_wp' ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {blog.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approval Section (Simplified/Redesigned) */}
        <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-8">Pending Approval</h2>
          {pendingBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/[0.05] rounded-2xl">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-sm text-muted-foreground font-medium">All caught up! No pending approvals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBlogs.map((blog, index) => (
                <div
                  key={blog._id}
                  className="p-4 md:p-6 rounded-2xl bg-primary/5 border border-primary/10"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-base md:text-lg">{blog.title}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                      {blog.schoolId?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-light font-bold flex-1 sm:flex-none"
                      onClick={() => handlePublishToWordPress(blog._id)}
                      disabled={publishingId === blog._id}
                    >
                      {publishingId === blog._id ? 'Publishing...' : 'Publish Now'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 font-bold flex-1 sm:flex-none"
                      onClick={() => handleUpdateBlogStatus(blog._id, 'draft_writer')}
                    >
                      Revision
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
