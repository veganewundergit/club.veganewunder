import type { ReactNode } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import type { Post } from '@/types/post';
import type { Comment } from '@/types/comment';

interface FeedCardProps {
  post: Post;
  comments?: Comment[];
  children?: ReactNode;
}

export function FeedCard({ post, comments = [], children }: FeedCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        <Avatar name={post.authorName} />
        <div>
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <span className="text-sm text-muted-foreground">{post.authorName}</span>
        </div>
      </header>
      <p className="mb-6 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{post.body}</p>
      <section className="space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-md border border-dashed p-3">
            <h3 className="text-sm font-medium">{comment.authorName}</h3>
            <p className="text-sm text-muted-foreground">{comment.body}</p>
          </article>
        ))}
      </section>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
