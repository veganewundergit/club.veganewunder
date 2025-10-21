import { notFound } from 'next/navigation';
import { FeedCard } from '@/components/feed/FeedCard';
import { CommentBox } from '@/components/feed/CommentBox';
import type { Post } from '@/types/post';
import type { Comment } from '@/types/comment';

interface PostPageProps {
  params: { id: string };
}

const fallbackPost: Post = {
  id: 'fallback',
  authorId: 'user-1',
  authorName: 'Chris',
  title: 'Beitrag in Arbeit',
  body: 'Hier werden die Inhalte eines einzelnen Beitrags geladen, sobald Supabase angebunden ist.'
};

const fallbackComments: Comment[] = [
  {
    id: 'fallback-comment',
    postId: 'fallback',
    authorId: 'user-2',
    authorName: 'Guest',
    body: 'Kommentare erscheinen hier, sobald die Datenbank bereit ist.'
  }
];

export default function PostDetailPage({ params }: PostPageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  const post: Post = { ...fallbackPost, id };
  const comments = fallbackComments.map((comment) => ({ ...comment, postId: id }));

  return (
    <article className="flex flex-col gap-6">
      <FeedCard post={post} comments={comments} />
      <CommentBox postId={id} />
    </article>
  );
}
