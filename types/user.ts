export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  stripeCustomerId?: string;
  role?: 'member' | 'moderator' | 'admin';
}
