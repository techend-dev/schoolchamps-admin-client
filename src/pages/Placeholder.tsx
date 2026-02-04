import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="p-12 text-center shadow-soft">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Under Construction</h2>
          <p className="text-muted-foreground max-w-md">
            We're working hard to bring you this feature. Check back soon!
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
