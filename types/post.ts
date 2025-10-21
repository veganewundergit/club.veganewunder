export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}
