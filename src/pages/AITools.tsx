import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Wand2,
    FileText,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    Check,
    Send,
    LayoutGrid,
    Search,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { aiService } from '@/lib/services/aiService';
import { blogService, Blog } from '@/lib/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AITools() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection & Generation State
    const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter', 'linkedin', 'facebook']);
    const [generatedCaption, setGeneratedCaption] = useState<string>('');
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [posting, setPosting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getAll({ status: 'published_wp' });
            setBlogs(response.data.blogs || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast({ title: 'Error', description: 'Failed to load published blogs', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handlePlatformToggle = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleGenerate = async () => {
        if (!activeBlog) return;

        try {
            setGenerating(true);
            const response = await aiService.generateUnifiedSocialPost(activeBlog._id);
            const data = response.data.socialPost;
            setGeneratedCaption(data.caption);
            setGeneratedHashtags(data.hashtags || []);
            toast({ title: 'Generated!', description: 'Content is ready for your review.' });
        } catch (error: any) {
            toast({ title: 'Error', description: 'Generation failed', variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    const handlePost = async () => {
        if (!activeBlog || !generatedCaption || selectedPlatforms.length === 0) return;

        try {
            setPosting(true);
            await aiService.postToSocial({
                blogId: activeBlog._id,
                caption: generatedCaption,
                hashtags: generatedHashtags,
                platforms: selectedPlatforms
            });
            toast({ title: 'Success', description: `Post shared to ${selectedPlatforms.join(', ')}!` });

            // Reset states
            setGeneratedCaption('');
            setGeneratedHashtags([]);
            setActiveBlog(null);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Posting failed', variant: 'destructive' });
        } finally {
            setPosting(false);
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter italic">Social Center</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Amplify your published stories
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search published blogs..."
                        className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Blog Selection List */}
                <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto no-scrollbar pr-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Choose a Blog</p>
                    <AnimatePresence mode="popLayout">
                        {filteredBlogs.map((blog) => (
                            <motion.div
                                key={blog._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card
                                    className={cn(
                                        "p-4 cursor-pointer transition-all duration-300 border-white/[0.05] hover:border-primary/30 group",
                                        activeBlog?._id === blog._id ? "bg-primary/10 border-primary shadow-glow" : "bg-card hover:bg-white/[0.02]"
                                    )}
                                    onClick={() => {
                                        setActiveBlog(blog);
                                        setGeneratedCaption('');
                                        setGeneratedHashtags([]);
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/10">
                                            {blog.featuredImage ? (
                                                <img src={blog.featuredImage} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            ) : (
                                                <FileText className="w-full h-full p-4 text-muted-foreground opacity-20" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase mb-1 border-primary/20 text-primary">Published</Badge>
                                            <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{blog.title}</h3>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-1 italic">
                                                {new Date(blog.publishedAt!).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Editor Panel */}
                <div className="lg:col-span-8">
                    {activeBlog ? (
                        <Card className="p-8 bg-card border-white/[0.05] shadow-medium sticky top-8">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white italic mb-2">{activeBlog.title}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                                            <Instagram className="h-4 w-4" />
                                            <Twitter className="h-4 w-4" />
                                            <Linkedin className="h-4 w-4" />
                                            <Facebook className="h-4 w-4" />
                                        </div>
                                        <div className="h-4 w-px bg-white/10" />
                                        <p className="text-xs text-muted-foreground font-medium">Auto-generate content for all platforms</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="bg-primary hover:bg-primary-light shadow-glow font-bold gap-2"
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                    Generate
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Platforms</Label>
                                    <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        {[
                                            { id: 'instagram', icon: Instagram, label: 'Instagram' },
                                            { id: 'twitter', icon: Twitter, label: 'Twitter' },
                                            { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                                            { id: 'facebook', icon: Facebook, label: 'Facebook' },
                                        ].map((p) => (
                                            <div key={p.id} className="flex items-center gap-2 group cursor-pointer" onClick={() => handlePlatformToggle(p.id)}>
                                                <Checkbox
                                                    id={p.id}
                                                    checked={selectedPlatforms.includes(p.id)}
                                                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <Label htmlFor={p.id} className="flex items-center gap-2 text-xs font-bold text-white/70 group-hover:text-white transition-colors cursor-pointer">
                                                    <p.icon className={cn("h-4 w-4", selectedPlatforms.includes(p.id) ? "text-primary" : "text-muted-foreground")} />
                                                    {p.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Smart Caption</Label>
                                    <Textarea
                                        className="min-h-[160px] bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm leading-relaxed font-medium transition-all"
                                        placeholder="Generate or write your caption here..."
                                        value={generatedCaption}
                                        onChange={(e) => setGeneratedCaption(e.target.value)}
                                    />
                                    {generatedHashtags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {generatedHashtags.map(tag => (
                                                <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 font-bold lowercase">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex gap-4">
                                    <Button
                                        className="flex-1 h-14 bg-primary hover:bg-primary-light shadow-glow font-black text-lg gap-3"
                                        disabled={!generatedCaption || selectedPlatforms.length === 0 || posting}
                                        onClick={handlePost}
                                    >
                                        {posting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        Post Everywhere
                                        <ChevronRight className="h-5 w-5 opacity-50" />
                                    </Button>
                                    <Button variant="outline" className="h-14 px-8 border-white/10 font-bold hover:bg-white/5" onClick={() => setActiveBlog(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-white/5">
                            <div className="p-6 rounded-3xl bg-white/5 mb-6">
                                <LayoutGrid className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Social Hub Ready</h3>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                Select a published blog from the list to start generating viral social media content.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
