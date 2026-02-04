import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Clock, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: {
    title: string;
    content: string;
    author: string;
    category: string;
    publishedAt: string;
    readTime: string;
    imageUrl?: string;
  };
}

export const BlogDetailModal = ({ isOpen, onClose, blog }: BlogDetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Image */}
          {blog.imageUrl && (
            <div className="relative h-72 overflow-hidden">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Category Badge */}
            <Badge variant="secondary" className="mb-4">
              <Tag className="h-3 w-3 mr-1" />
              {blog.category}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{blog.publishedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </p>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
