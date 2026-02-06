import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, Wand2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { submissionService } from '@/lib/services/submissionService';
import { blogService } from '@/lib/services/blogService';
import { aiService } from '@/lib/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  _id: string;
  schoolId: {
    _id: string;
    name: string;
    city?: string;
  };
  title: string;
  description: string;
  category: string;
  attachments: string[];
  status: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  submissionId: string;
  title: string;
  status: string;
}

export default function WriterDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionsRes, blogsRes] = await Promise.all([
        submissionService.getAll(),
        blogService.getAll(),
      ]);
      setSubmissions(submissionsRes?.data?.submissions || []);
      setBlogs(blogsRes?.data?.blogs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
      setSubmissions([]);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async (submission: Submission) => {
    try {
      setGeneratingId(submission._id);

      // Generate AI draft - this creates the blog in the backend
      await aiService.generateDraft(submission._id);

      toast({
        title: 'Success',
        description: 'Blog draft generated successfully!',
      });

      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to generate draft',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted_school');
  const inProgressBlogs = blogs.filter(b => b.status === 'draft_writer');
  const completedBlogs = blogs.filter(b => ['approved_school', 'published_wp'].includes(b.status));

  const stats = [
    { label: 'Pending Review', value: pendingSubmissions.length.toString(), icon: Clock, color: 'text-orange-500' },
    { label: 'In Progress', value: inProgressBlogs.length.toString(), icon: FileText, color: 'text-blue-500' },
    { label: 'Completed', value: completedBlogs.length.toString(), icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Writer Dashboard</h1>
        <p className="text-xs md:text-base text-muted-foreground max-w-lg">
          Transform school submissions into engaging blog posts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-3 md:p-6 bg-card border-white/[0.05] shadow-medium">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1 truncate">{stat.label}</p>
                  <p className="text-xl md:text-3xl font-extrabold text-white">{stat.value}</p>
                </div>
                <div className={`p-1.5 md:p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 ${stat.color}`}>
                  <stat.icon className="h-4 w-4 md:h-6 md:w-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Submissions Queue */}
      <Card className="p-5 md:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold">Pending Submissions</h2>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>

        {pendingSubmissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending submissions</p>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.map((submission, index) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl border border-border hover:border-primary/50 transition-smooth bg-card"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-white text-base md:text-lg leading-tight uppercase tracking-tight">{submission.title}</h3>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20 shrink-0">
                        {submission.category.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-3">
                      {submission.schoolId.name} • {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                      {submission.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <Button
                    size="sm"
                    className="gap-2 flex-1 md:flex-none font-bold bg-primary hover:bg-primary-light"
                    onClick={() => handleGenerateDraft(submission)}
                    disabled={generatingId === submission._id}
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>{generatingId === submission._id ? 'Generating...' : 'Generate AI Draft'}</span>
                  </Button>
                  {submission.attachments.length > 0 && (
                    <Badge variant="outline" className="text-[10px] font-bold border-white/10 bg-white/5 whitespace-nowrap">
                      {submission.attachments.length} {submission.attachments.length > 1 ? 'Files' : 'File'}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* In Progress Blogs */}
      {inProgressBlogs.length > 0 && (
        <Card className="p-5 md:p-6 shadow-soft">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Drafts in Progress</h2>
          <div className="space-y-3">
            {inProgressBlogs.map((blog) => (
              <div
                key={blog._id}
                className="p-4 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-medium">{blog.title}</h3>
                  <Badge variant="outline" className="mt-1">Draft</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto justify-center"
                  onClick={() => navigate(`/dashboard/blogs/${blog._id}/edit`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
