import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Wand2,
    FileText,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    Copy,
    Check,
    ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { aiService } from '@/lib/services/aiService';
import { blogService, Blog } from '@/lib/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/layout/Loader';

export default function AITools() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<string>('');
    const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'twitter' | 'facebook'>('instagram');
    const [generatedCaption, setGeneratedCaption] = useState<string>('');
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Content improvement
    const [contentToImprove, setContentToImprove] = useState('');
    const [instruction, setInstruction] = useState('');
    const [improvedContent, setImprovedContent] = useState('');
    const [improving, setImproving] = useState(false);

    const { toast } = useToast();

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getAll({ status: 'published_wp' });
            setBlogs(response.data.blogs || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useState(() => {
        fetchBlogs();
    });

    const handleGenerateSocialPost = async () => {
        if (!selectedBlog) {
            toast({
                title: 'Error',
                description: 'Please select a blog first',
                variant: 'destructive',
            });
            return;
        }

        try {
            setGenerating(true);
            const response = await aiService.generateSocialPost(selectedBlog, platform);
            const data = response.data.socialPost;
            setGeneratedCaption(data.caption);
            setGeneratedHashtags(data.hashtags || []);
            toast({
                title: 'Success',
                description: 'Social media post generated!',
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to generate social post',
                variant: 'destructive',
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleImproveContent = async () => {
        if (!contentToImprove || !instruction) {
            toast({
                title: 'Error',
                description: 'Please provide content and instructions',
                variant: 'destructive',
            });
            return;
        }

        try {
            setImproving(true);
            const response = await aiService.improveContent(contentToImprove, instruction);
            setImprovedContent(response.data.improvedContent);
            toast({
                title: 'Success',
                description: 'Content improved!',
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to improve content',
                variant: 'destructive',
            });
        } finally {
            setImproving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: 'Copied!',
            description: 'Content copied to clipboard',
        });
    };

    const getPlatformIcon = (p: string) => {
        switch (p) {
            case 'instagram': return <Instagram className="h-5 w-5" />;
            case 'linkedin': return <Linkedin className="h-5 w-5" />;
            case 'twitter': return <Twitter className="h-5 w-5" />;
            case 'facebook': return <Facebook className="h-5 w-5" />;
            default: return null;
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Sparkles className="h-10 w-10 text-primary" />
                    AI Tools
                </h1>
                <p className="text-muted-foreground">
                    Generate social media posts and improve your content with AI
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Media Generator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                                <Wand2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Social Media Generator</h2>
                                <p className="text-sm text-muted-foreground">Create platform-specific captions</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Published Blog</Label>
                                <Select value={selectedBlog} onValueChange={setSelectedBlog}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a blog..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {blogs.map((blog) => (
                                            <SelectItem key={blog._id} value={blog._id}>
                                                {blog.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['instagram', 'linkedin', 'twitter', 'facebook'] as const).map((p) => (
                                        <Button
                                            key={p}
                                            variant={platform === p ? 'default' : 'outline'}
                                            className="flex flex-col gap-1 h-auto py-3"
                                            onClick={() => setPlatform(p)}
                                        >
                                            {getPlatformIcon(p)}
                                            <span className="text-xs capitalize">{p}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full gap-2"
                                onClick={handleGenerateSocialPost}
                                disabled={generating || !selectedBlog}
                            >
                                {generating ? (
                                    <>Generating...</>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate Caption
                                    </>
                                )}
                            </Button>

                            {generatedCaption && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <Label>Generated Caption</Label>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(generatedCaption + '\n\n' + generatedHashtags.join(' '))}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="whitespace-pre-wrap">{generatedCaption}</p>
                                        {generatedHashtags.length > 0 && (
                                            <p className="mt-3 text-primary">
                                                {generatedHashtags.join(' ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Content Improver */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Content Improver</h2>
                                <p className="text-sm text-muted-foreground">Enhance your writing with AI</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Content to Improve</Label>
                                <Textarea
                                    value={contentToImprove}
                                    onChange={(e) => setContentToImprove(e.target.value)}
                                    placeholder="Paste your content here..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Improvement Instructions</Label>
                                <Textarea
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    placeholder="e.g., Make it more engaging, Fix grammar, Shorten to 100 words..."
                                    rows={2}
                                />
                            </div>

                            <Button
                                className="w-full gap-2"
                                onClick={handleImproveContent}
                                disabled={improving || !contentToImprove || !instruction}
                            >
                                {improving ? (
                                    <>Improving...</>
                                ) : (
                                    <>
                                        <ArrowRight className="h-4 w-4" />
                                        Improve Content
                                    </>
                                )}
                            </Button>

                            {improvedContent && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <Label>Improved Content</Label>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(improvedContent)}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="whitespace-pre-wrap">{improvedContent}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Tips Section */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
                <h3 className="text-lg font-semibold mb-4">💡 Tips for Better Results</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li>• For social media posts, published blogs with rich content generate better captions</li>
                    <li>• Use specific instructions for content improvement (e.g., "make it formal" or "add more emotional appeal")</li>
                    <li>• Each platform has optimal post lengths - Instagram captions can be longer, Twitter needs to be concise</li>
                    <li>• Review and personalize AI-generated content before posting</li>
                </ul>
            </Card>
        </div>
    );
}
