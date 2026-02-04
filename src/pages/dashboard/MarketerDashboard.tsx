import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Wand2, TrendingUp, Eye, Heart, Copy, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blogService } from '@/lib/services/blogService';
import { aiService } from '@/lib/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/layout/Loader';

interface Blog {
  _id: string;
  title: string;
  content: string;
  schoolId?: {
    name: string;
  };
  status: string;
  createdAt: string;
}

const stats = [
  { label: 'Total Reach', value: '12.5K', icon: Eye, color: 'text-blue-500' },
  { label: 'Engagement', value: '8.3%', icon: Heart, color: 'text-pink-500' },
  { label: 'Growth', value: '+24%', icon: TrendingUp, color: 'text-green-500' },
];

export default function MarketerDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'linkedin' | ''>('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchPublishedBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getAll({ status: 'published_wp' });
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load published blogs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedBlogId || !selectedPlatform) {
      toast({
        title: 'Error',
        description: 'Please select a blog and platform',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);

      const response = await aiService.generateSocialPost(selectedBlogId, selectedPlatform);

      const socialPost = response.data.socialPost;
      setGeneratedCaption(socialPost.caption + '\n\n' + socialPost.hashtags.join(' '));
      toast({
        title: 'Success',
        description: 'Caption generated successfully!',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to generate caption',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Caption copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Marketer Dashboard</h1>
        <p className="text-muted-foreground">
          Amplify your content across social platforms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 shadow-soft">
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

      {/* AI Caption Generator */}
      <Card className="p-6 shadow-soft">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Caption Generator
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Published Blog
            </label>
            <Select value={selectedBlogId} onValueChange={setSelectedBlogId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a blog post..." />
              </SelectTrigger>
              <SelectContent>
                {blogs.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No published blogs available</div>
                ) : (
                  blogs.map((blog) => (
                    <SelectItem key={blog._id} value={blog._id}>
                      {blog.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Platform</label>
            <div className="flex gap-3">
              <Button
                variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setSelectedPlatform('instagram')}
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </Button>
              <Button
                variant={selectedPlatform === 'linkedin' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setSelectedPlatform('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>

          <Button 
            className="gap-2" 
            onClick={handleGenerateCaption}
            disabled={generating || !selectedBlogId || !selectedPlatform}
          >
            <Wand2 className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Caption'}
          </Button>

          {generatedCaption && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium block">
                  Generated Caption
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleCopyCaption}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={generatedCaption}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                className="min-h-32"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Recent Campaigns */}
      <Card className="p-6 shadow-soft">
        <h2 className="text-2xl font-semibold mb-6">Published Blogs</h2>
        {blogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No published blogs yet</p>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {blog.schoolId?.name} • Published {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="default">Published</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
