import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submissionService, Submission } from '@/lib/services/submissionService';
import { blogService, Blog } from '@/lib/services/blogService';

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'news' as const,
  });
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [submissionsRes, blogsRes] = await Promise.all([
        submissionService.getAll(),
        blogService.getAll({ status: 'review' }),
      ]);
      setSubmissions(submissionsRes?.data?.submissions || []);
      setBlogs(blogsRes?.data?.blogs || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
      setSubmissions([]);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);

      if (files) {
        Array.from(files).forEach((file) => {
          formDataToSend.append('attachments', file);
        });
      }

      await submissionService.create(formDataToSend);

      toast({
        title: 'Success!',
        description: 'Your submission has been sent successfully.',
      });

      setIsDialogOpen(false);
      setFormData({ title: '', description: '', category: 'news' });
      setFiles(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted_school: { label: 'Submitted', variant: 'secondary' as const },
      draft_created: { label: 'Draft Created', variant: 'default' as const },
      review: { label: 'In Review', variant: 'default' as const },
      published_wp: { label: 'Published', variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted_school;
    return <Badge variant={config.variant} className="w-full sm:w-auto justify-center">{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    totalSubmissions: submissions.length,
    pendingReview: blogs.length,
    published: submissions.filter(s => s.status === 'published_wp').length,
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 uppercase">School Dashboard</h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-lg font-medium">
            Submit stories and manage your school's digital presence
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold bg-primary hover:bg-primary-light shadow-glow transform hover:scale-[1.02] transition-all gap-2 w-full md:w-auto">
              <Plus className="h-5 md:h-6 w-5 md:w-6" />
              Submit Story
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-white/[0.05] backdrop-blur-xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Submit New Story</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Share news, achievements, or events from your school
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground/80 font-medium">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Annual Sports Day Success"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 bg-background/50 border-white/[0.05] focus:ring-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground/80 font-medium">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 bg-background/50 border-white/[0.05]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/[0.05]">
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground/80 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the story..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-background/50 border-white/[0.05] focus:ring-primary/50 resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachments" className="text-foreground/80 font-medium">Attachments (Images/Documents)</Label>
                  <div className="relative">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setFiles(e.target.files)}
                      className="cursor-pointer bg-background/50 border-white/[0.05] h-auto py-3"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 5 files, 5MB each
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-light font-bold px-8">
                  {isSubmitting ? 'Submitting...' : 'Submit Story'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium transition-all hover:border-primary/20">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Submissions</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl md:text-4xl font-extrabold text-white">{stats.totalSubmissions}</p>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10 border border-primary/20">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium transition-all hover:border-primary/20">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Queue</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl md:text-4xl font-extrabold text-white">{stats.pendingReview}</p>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium transition-all hover:border-[#10b981]/20">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Live</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl md:text-4xl font-extrabold text-[#10b981]">{stats.published}</p>
              <div className="p-2 md:p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-[#10b981]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions List */}
        <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Your Submissions</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Track the status of your submitted stories</p>
          </div>
          <div className="flex-1 space-y-4">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/[0.05] rounded-2xl">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No submissions yet</p>
                <Button variant="link" className="text-primary mt-2" onClick={() => setIsDialogOpen(true)}>
                  Click to submit your first story
                </Button>
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">{submission.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {submission.description}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-white/10 bg-white/5">
                          {submission.category}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Blogs for Review */}
        <Card className="p-5 md:p-8 bg-card border-white/[0.05] shadow-medium flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Blogs for Review</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Review and approve drafts from writers</p>
          </div>
          <div className="flex-1 space-y-4">
            {blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/[0.05] rounded-2xl">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No blogs currently in review.</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors">{blog.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {blog.metaDescription}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                          {blog.category}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {blog.readingTime} min read
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 font-bold shrink-0 w-full sm:w-auto"
                      onClick={() => navigate(`/dashboard/blogs/${blog._id}`)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
