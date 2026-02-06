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
import { cn } from '@/lib/utils';

export default function AITools() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<string>('');
    const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'twitter' | 'facebook'>('instagram');
    const [generatedCaption, setGeneratedCaption] = useState<string>('');
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                    AI Tools
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground max-w-lg">
                    Generate social media posts from your published blogs
                </p>
            </div>

            {/* Social Media Generator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-glow">
                            <Wand2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">Social Media Generator</h2>
                            <p className="text-xs md:text-sm text-muted-foreground">Create platform-specific captions</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Published Blog</Label>
                            <Select value={selectedBlog} onValueChange={setSelectedBlog}>
                                <SelectTrigger className="h-12 bg-white/5 border-white/10">
                                    <SelectValue placeholder="Choose a blog..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                    {blogs.map((blog) => (
                                        <SelectItem key={blog._id} value={blog._id}>
                                            {blog.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Platform</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(['instagram', 'linkedin', 'twitter', 'facebook'] as const).map((p) => (
                                    <Button
                                        key={p}
                                        variant={platform === p ? 'default' : 'outline'}
                                        className={cn(
                                            "flex flex-col gap-1.5 h-auto py-3 border-white/10 transition-all",
                                            platform === p ? "bg-primary shadow-glow" : "bg-white/5 hover:bg-white/10"
                                        )}
                                        onClick={() => setPlatform(p)}
                                    >
                                        <div className={cn(platform === p ? "text-white" : "text-primary")}>
                                            {getPlatformIcon(p)}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{p}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary-light shadow-glow gap-2"
                            onClick={handleGenerateSocialPost}
                            disabled={generating || !selectedBlog}
                        >
                            {generating ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Caption
                                </>
                            )}
                        </Button>

                        {generatedCaption && (
                            <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Generated Caption</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-2 text-[10px] uppercase font-bold hover:bg-white/5"
                                        onClick={() => copyToClipboard(generatedCaption + '\n\n' + generatedHashtags.join(' '))}
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{generatedCaption}</p>
                                    {generatedHashtags.length > 0 && (
                                        <p className="mt-4 text-primary font-medium flex flex-wrap gap-2">
                                            {generatedHashtags.map(tag => (
                                                <span key={tag}>{tag}</span>
                                            ))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Tips Section */}
            <Card className="p-6 md:p-8 bg-card border-white/[0.05] shadow-medium">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="p-1.5 bg-yellow-500/10 rounded-lg">💡</span>
                    Tips for Better Results
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "Published blogs with rich content generate better captions",
                        "Each platform has optimal post lengths for higher engagement",
                        "Instagram and LinkedIn posts benefit from longer descriptions",
                        "Always review and personalize AI-generated content before posting"
                    ].map((tip, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                            <span className="text-primary font-bold">{i + 1}.</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
