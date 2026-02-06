import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Send,
    Sparkles,
    Image as ImageIcon,
    Tag,
    FileText,
    Layout,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { blogService, Blog } from '@/lib/services/blogService';
import { aiService } from '@/lib/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function BlogEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [improving, setImproving] = useState(false);
    const [blog, setBlog] = useState<Partial<Blog>>({
        title: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        tags: [],
        category: '',
        seoKeywords: []
    });

    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

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
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (statusOverride?: Blog['status']) => {
        if (!id) return;

        try {
            setSaving(true);
            const dataToUpdate = {
                ...blog,
                status: statusOverride || blog.status
            };
            await blogService.update(id, dataToUpdate);
            toast({
                title: 'Success',
                description: statusOverride === 'review'
                    ? 'Blog submitted for school review!'
                    : 'Changes saved successfully!',
            });
            if (statusOverride === 'review') {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            toast({
                title: 'Error',
                description: 'Failed to save changes',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleImproveContent = async () => {
        if (!blog.content) return;

        try {
            setImproving(true);
            const response = await aiService.improveContent(
                blog.content,
                "Make it more engaging, fix grammar, and ensure it flows well as a blog post."
            );
            setBlog({ ...blog, content: response.data.improvedContent });
            toast({
                title: 'Success',
                description: 'Content improved with AI!',
            });
        } catch (error) {
            console.error('Error improving content:', error);
            toast({
                title: 'Error',
                description: 'Failed to improve content',
                variant: 'destructive',
            });
        } finally {
            setImproving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !blog.tags?.includes(tagInput.trim())) {
            setBlog({ ...blog, tags: [...(blog.tags || []), tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setBlog({ ...blog, tags: blog.tags?.filter(t => t !== tag) });
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !blog.seoKeywords?.includes(keywordInput.trim())) {
            setBlog({ ...blog, seoKeywords: [...(blog.seoKeywords || []), keywordInput.trim()] });
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setBlog({ ...blog, seoKeywords: blog.seoKeywords?.filter(k => k !== keyword) });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5 h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">Edit Blog</h1>
                        <p className="text-xs md:text-base text-muted-foreground font-medium uppercase tracking-wider">Refine your AI draft</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="gap-2 flex-1 md:flex-none h-11 border-white/10 font-bold" onClick={() => handleSave()} disabled={saving}>
                        <Save className="h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button className="gap-2 flex-1 md:flex-none h-11 bg-primary hover:bg-primary-light font-bold shadow-glow" onClick={() => handleSave('review')} disabled={saving}>
                        <Send className="h-4 w-4" />
                        Submit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-4 md:p-8 bg-card border-white/[0.05] shadow-medium space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Blog Title</Label>
                            <Input
                                id="title"
                                value={blog.title}
                                onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                                className="text-xl md:text-2xl font-bold bg-white/5 border-white/10 h-14"
                                placeholder="Enter a catchy title..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <Label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Editor</Label>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2 text-[10px] uppercase font-bold h-9 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                    onClick={handleImproveContent}
                                    disabled={improving}
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {improving ? 'Improving...' : 'Improve with AI'}
                                </Button>
                            </div>
                            <Textarea
                                id="content"
                                value={blog.content}
                                onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                                placeholder="Write your blog content here..."
                                className="min-h-[400px] md:min-h-[600px] bg-white/5 border-white/10 leading-relaxed p-4"
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            SEO & Metadata
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">SEO Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={blog.metaTitle}
                                    onChange={(e) => setBlog({ ...blog, metaTitle: e.target.value })}
                                    placeholder="Title for search engines..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={blog.metaDescription}
                                    onChange={(e) => setBlog({ ...blog, metaDescription: e.target.value })}
                                    placeholder="Brief summary for search results..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className="p-4 md:p-6 bg-card border-white/[0.05] shadow-medium space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Post Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-muted-foreground font-medium">Status</span>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase text-[10px]">
                                        {blog.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                    <Input
                                        id="category"
                                        value={blog.category}
                                        onChange={(e) => setBlog({ ...blog, category: e.target.value })}
                                        className="bg-white/5 border-white/10"
                                        placeholder="e.g. Sports, Academic..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="readingTime" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reading Time (min)</Label>
                                    <Input
                                        id="readingTime"
                                        type="number"
                                        value={blog.readingTime}
                                        onChange={(e) => setBlog({ ...blog, readingTime: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Featured Image */}
                        <Card className="p-4 md:p-6 bg-card border-white/[0.05] shadow-medium space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Featured Image
                            </h3>
                            {blog.featuredImage ? (
                                <div className="relative group rounded-xl overflow-hidden border border-white/10">
                                    <img
                                        src={blog.featuredImage}
                                        alt="Featured"
                                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label htmlFor="featuredImageUpload" className="cursor-pointer">
                                            <Button variant="secondary" size="sm" className="font-bold pointer-events-none">
                                                Change Image
                                            </Button>
                                        </Label>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-white/5 hover:bg-white/10 transition-colors">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">No image set</span>
                                    <Label htmlFor="featuredImageUpload" className="text-primary font-bold cursor-pointer hover:underline mt-2">
                                        Upload Image
                                    </Label>
                                    <input
                                        id="featuredImageUpload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    setSaving(true);
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    const res = await blogService.uploadImage(id!, formData);
                                                    setBlog({ ...blog, featuredImage: res.data.url });
                                                    toast({ title: 'Success', description: 'Image uploaded successfully' });
                                                } catch (err) {
                                                    toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </Card>

                        {/* Tags */}
                        <Card className="p-4 md:p-6 bg-card border-white/[0.05] shadow-medium space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags & Keywords
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Add tag..."
                                            className="bg-white/5 border-white/10 text-xs"
                                        />
                                        <Button size="icon" variant="secondary" onClick={addTag} className="shrink-0 h-10 w-10">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {blog.tags?.map(tag => (
                                            <Badge key={tag} variant="outline" className="gap-1 bg-white/5 border-white/10 text-[10px] font-bold py-1">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-1">×</button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SEO Keywords</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                            placeholder="Add keyword..."
                                            className="bg-white/5 border-white/10 text-xs"
                                        />
                                        <Button size="icon" variant="secondary" onClick={addKeyword} className="shrink-0 h-10 w-10">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {blog.seoKeywords?.map(keyword => (
                                            <Badge key={keyword} variant="outline" className="gap-1 bg-primary/5 border-primary/20 text-primary text-[10px] font-bold py-1">
                                                {keyword}
                                                <button onClick={() => removeKeyword(keyword)} className="hover:text-destructive ml-1">×</button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
