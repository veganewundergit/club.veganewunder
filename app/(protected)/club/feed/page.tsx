import { FeedCard } from '@/components/feed/FeedCard';
import { CommentBox } from '@/components/feed/CommentBox';
import type { Post } from '@/types/post';
import type { Comment } from '@/types/comment';

const demoComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    authorName: 'Chris',
    body: 'Willkommen in unserer Test-Community!'
  }
];

const demoPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Chris',
    title: 'Vegane Wunder starten hier',
    body: 'Nutze diesen Feed, um Ideen und Rezepte zu teilen. Die echte Datenquelle liefert später Supabase.'
  }
];

export default function ClubFeedPage() {
  return (
    <section className="flex flex-col gap-6">
      {demoPosts.map((post) => (
        <FeedCard key={post.id} post={post} comments={demoComments.filter((c) => c.postId === post.id)}>
          <CommentBox postId={post.id} />
        </FeedCard>
      ))}
    </section>
  );
}
