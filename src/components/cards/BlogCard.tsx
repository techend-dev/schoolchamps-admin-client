import { motion } from 'framer-motion';
import { Calendar, Clock, User, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  title: string;
  description: string;
  author: string;
  category: string;
  readTime: string;
  publishedAt: string;
  imageUrl?: string;
  status?: 'draft' | 'published' | 'pending';
  onClick?: () => void;
  className?: string;
}

export const BlogCard = ({
  title,
  description,
  author,
  category,
  readTime,
  publishedAt,
  imageUrl,
  status = 'published',
  onClick,
  className,
}: BlogCardProps) => {
  const statusColors = {
    draft: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    published: 'bg-green-500/10 text-green-700 dark:text-green-400',
    pending: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn('cursor-pointer', className)}
    >
      <Card className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth border-border/50">
        {/* Image */}
        {imageUrl && (
          <div className="relative h-48 overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-smooth hover:scale-105"
            />
            <Badge className={cn('absolute top-4 right-4', statusColors[status])}>
              {status}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <Badge variant="secondary" className="mb-3">
            {category}
          </Badge>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-quick">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{publishedAt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
