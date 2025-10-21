'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';

interface CommentBoxProps {
  postId: string;
}

export function CommentBox({ postId }: CommentBoxProps) {
  const [comment, setComment] = useState('');

  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
      <textarea
        className="min-h-[120px] rounded-md border border-border bg-background p-3 text-sm"
        placeholder={`Dein Beitrag zum Post ${postId}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Button type="submit" variant="secondary">
        Kommentar speichern (Demomodus)
      </Button>
    </form>
  );
}
