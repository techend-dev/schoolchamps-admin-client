import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    Trash2,
    Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { submissionService, Submission } from '@/lib/services/submissionService';
import { aiService } from '@/lib/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/layout/Loader';
import { useAuth } from '@/context/AuthContext';

export default function Submissions() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [generatingDraft, setGeneratingDraft] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'news' as const,
    });

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await submissionService.getAll();
            setSubmissions(response.data.submissions || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast({
                title: 'Error',
                description: 'Failed to load submissions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('category', formData.category);

            await submissionService.create(formDataObj);
            toast({
                title: 'Success',
                description: 'Submission created successfully!',
            });
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', category: 'news' });
            fetchSubmissions();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to create submission',
                variant: 'destructive',
            });
        }
    };

    const handleGenerateDraft = async (submissionId: string) => {
        try {
            setGeneratingDraft(submissionId);
            await aiService.generateDraft(submissionId);
            toast({
                title: 'Success',
                description: 'AI draft generated successfully! Check the Blogs page.',
            });
            fetchSubmissions();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to generate draft',
                variant: 'destructive',
            });
        } finally {
            setGeneratingDraft(null);
        }
    };

    const handleDeleteSubmission = async (id: string) => {
        if (!confirm('Are you sure you want to delete this submission?')) return;

        try {
            await submissionService.delete(id);
            toast({
                title: 'Success',
                description: 'Submission deleted successfully!',
            });
            fetchSubmissions();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to delete submission',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted_school':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'draft_created':
                return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Draft Created</Badge>;
            case 'review':
                return <Badge className="bg-orange-500"><AlertCircle className="h-3 w-3 mr-1" />In Review</Badge>;
            case 'published_wp':
                return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            news: 'bg-blue-100 text-blue-800',
            achievement: 'bg-yellow-100 text-yellow-800',
            event: 'bg-purple-100 text-purple-800',
            announcement: 'bg-green-100 text-green-800',
            other: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || colors.other}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
        );
    };

    if (loading) {
        return <Loader />;
    }

    const canCreateSubmission = user?.role === 'school' || user?.role === 'admin';
    const canGenerateDraft = user?.role === 'writer' || user?.role === 'admin';
    const canDelete = user?.role === 'admin';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Submissions</h1>
                    <p className="text-muted-foreground">
                        Manage school story submissions and generate AI blog drafts
                    </p>
                </div>

                {canCreateSubmission && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Submission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Submission</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmission} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter story title"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the story in detail..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="news">News</SelectItem>
                                            <SelectItem value="achievement">Achievement</SelectItem>
                                            <SelectItem value="event">Event</SelectItem>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Submission</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{submissions.length}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {submissions.filter(s => s.status === 'submitted_school').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {submissions.filter(s => s.status === 'draft_created').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Drafts</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {submissions.filter(s => s.status === 'published_wp').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Published</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground mb-4">
                        {canCreateSubmission
                            ? 'Create your first submission to get started.'
                            : 'Waiting for schools to submit stories.'}
                    </p>
                    {canCreateSubmission && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Submission
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {submissions.map((submission, index) => (
                        <motion.div
                            key={submission._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{submission.title}</h3>
                                            {getCategoryBadge(submission.category)}
                                            {getStatusBadge(submission.status)}
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2 mb-3">
                                            {submission.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Created: {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedSubmission(submission)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {canGenerateDraft && submission.status === 'submitted_school' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleGenerateDraft(submission._id)}
                                                disabled={generatingDraft === submission._id}
                                                className="gap-1"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                {generatingDraft === submission._id ? 'Generating...' : 'Generate Draft'}
                                            </Button>
                                        )}

                                        {canDelete && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteSubmission(submission._id)}
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

            {/* View Submission Modal */}
            {selectedSubmission && (
                <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{selectedSubmission.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="flex gap-2">
                                {getCategoryBadge(selectedSubmission.category)}
                                {getStatusBadge(selectedSubmission.status)}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="mt-1">{selectedSubmission.description}</p>
                            </div>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <div>
                                    <span className="font-medium">Created:</span>{' '}
                                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium">Updated:</span>{' '}
                                    {new Date(selectedSubmission.updatedAt).toLocaleString()}
                                </div>
                            </div>
                            {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground">Attachments</Label>
                                    <div className="flex gap-2 mt-1">
                                        {selectedSubmission.attachments.map((attachment, i) => (
                                            <a
                                                key={i}
                                                href={attachment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                Attachment {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
