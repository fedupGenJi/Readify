import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { MOCK_SUGGESTED_READERS } from '../lib/mockFeedData';
import { FeedItemCard } from '../components/feed/FeedItemCard';
import { NewEntryModal } from '../components/feed/NewEntryModal';
import { PlusIcon } from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import type { CreateEntryPayload, FeedComment, FeedItem } from '../types/feed';
import apiClient from '../lib/api';

interface BackendUser {
  userId: number;
  name: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
}

interface ProfileResponse {
  user: BackendUser;
  isOwnProfile: boolean;
  relationship: 'self' | 'friend' | 'stranger';
  followersCount: number;
  followingCount: number;
}

interface BackendPost {
  postId: number;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'JUST_ME';
  createdAt: string;
  likeCount: number;
  book: { bookId: number; title: string; author: string } | null;
}

interface BackendQuote {
  quoteId: number;
  quote: string;
}

function toFeedItem(post: BackendPost, profile: BackendUser): FeedItem {
  return {
    id: String(post.postId),
    type: 'post',
    author: {
      id: String(profile.userId),
      name: profile.name,
      username: profile.username,
      avatarUrl: profile.profilePicture ?? undefined,
    },
    book: post.book
      ? { id: String(post.book.bookId), title: post.book.title, author: post.book.author, rating: 0 }
      : undefined,
    content: post.caption,
    createdAt: post.createdAt,
    visibility: post.visibility === 'JUST_ME' ? 'only_me' : (post.visibility.toLowerCase() as 'public' | 'private'),
    likeCount: post.likeCount,
    commentCount: 0,
    repostCount: 0,
    likedByMe: false,
    bookmarkedByMe: false,
    repostedByMe: false,
    comments: [],
  };
}

export default function ProfilePage() {
  const { username: viewedUsername } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [viewer, setViewer] = useState<BackendUser | null>(null);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [profilePictureDraft, setProfilePictureDraft] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Modal state for followers/following lists
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError('');
      try {
        const viewerResponse = await apiClient.get<{ user: BackendUser }>('/auth/me');
        const currentViewer = viewerResponse.data.user;
        const username = viewedUsername ?? currentViewer.username;
        const [profileResponse, postsResponse, quotesResponse] = await Promise.all([
          apiClient.get<ProfileResponse>(`/users/${encodeURIComponent(username)}`),
          apiClient.get<{ posts: BackendPost[] }>(`/users/${encodeURIComponent(username)}/posts`, {
            params: { limit: 30, offset: 0 },
          }),
          apiClient.get<{ quotes: BackendQuote[] }>(`/users/${encodeURIComponent(username)}/quotes`, {
            params: { limit: 20 },
          }),
        ]);

        if (!isCurrentRequest) return;
        setViewer(currentViewer);
        setProfile(profileResponse.data);
        setPosts(postsResponse.data.posts.map((post) => toFeedItem(post, profileResponse.data.user)));
        setQuotes(quotesResponse.data.quotes.map((quote) => quote.quote));
        setBioDraft(profileResponse.data.user.bio ?? '');
        setProfilePictureDraft(profileResponse.data.user.profilePicture ?? '');
      } catch {
        if (!isCurrentRequest) return;
        setLoadError('Unable to load this profile. Please try again.');
        setProfile(null);
        setPosts([]);
        setQuotes([]);
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }

    void loadProfile();
    return () => {
      isCurrentRequest = false;
    };
  }, [viewedUsername]);

  const currentUserName = viewer?.name ?? profile?.user.name ?? '';
  const isOwnProfile = profile?.isOwnProfile ?? false;

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!isOwnProfile || isSavingProfile) return;

    setIsSavingProfile(true);
    try {
      const response = await apiClient.put<{ user: BackendUser }>('/users/me/profile', {
        bio: bioDraft,
        profilePicture: profilePictureDraft,
      });
      setProfile((current) => (current ? { ...current, user: response.data.user } : current));
      setIsEditingProfile(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Unable to update your profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!isOwnProfile) return;
    // TODO: Backend Integration - API call to delete post from database
    // await api.delete(`/api/posts/${id}`);
    setPosts((current) => current.filter((item) => item.id !== id));
    toast.success('Post removed from profile');
  };

  const handleToggleLike = (id: string) => {
    // TODO: Backend Integration - API call to toggle like status in DB
    // await api.post(`/api/posts/${id}/like`);
    setPosts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              likedByMe: !item.likedByMe,
              likeCount: item.likedByMe ? item.likeCount - 1 : item.likeCount + 1,
            }
          : item
      )
    );
  };

  const handleToggleBookmark = (id: string) => {
    // TODO: Backend Integration - API call to toggle bookmark in DB
    // await api.post(`/api/posts/${id}/bookmark`);
    setPosts((current) =>
      current.map((item) => (item.id === id ? { ...item, bookmarkedByMe: !item.bookmarkedByMe } : item))
    );
  };

  const handleToggleRepost = (id: string) => {
    // TODO: Backend Integration - API call to toggle repost in DB
    // await api.post(`/api/posts/${id}/repost`);
    setPosts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              repostedByMe: !item.repostedByMe,
              repostCount: item.repostedByMe ? item.repostCount - 1 : item.repostCount + 1,
            }
          : item
      )
    );
  };

  const handleAddComment = (itemId: string, _parentCommentId: string | null, content: string) => {
    // TODO: Backend Integration - API call to store comment in DB
    // await api.post(`/api/posts/${itemId}/comments`, { content, parentCommentId: _parentCommentId });
    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      author: { id: String(viewer?.userId ?? ''), name: currentUserName, username: viewer?.username ?? '' },
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setPosts((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              comments: [...item.comments, newComment],
              commentCount: item.commentCount + 1,
            }
          : item
      )
    );
  };

  const handleCreateEntry = async (payload: CreateEntryPayload) => {
    // TODO: Backend Integration - API call to create a new post/review entry in DB
    // const response = await api.post('/api/posts', payload);
    if (!viewer || !isOwnProfile) return;
    const author = { id: String(viewer.userId), name: viewer.name, username: viewer.username };
    const book = {
      id: `book-${Date.now()}`,
      title: payload.bookTitle,
      author: payload.bookAuthor,
      rating: payload.rating,
    };
    const base = {
      id: `${payload.isReview ? 'review' : 'post'}-${Date.now()}`,
      author,
      book,
      content: payload.content,
      createdAt: new Date().toISOString(),
      visibility: payload.visibility,
      likeCount: 0,
      commentCount: 0,
      repostCount: 0,
      likedByMe: false,
      bookmarkedByMe: false,
      repostedByMe: false,
      comments: [] as FeedComment[],
    };

    const newItem: FeedItem = payload.isReview ? { ...base, type: 'review' } : { ...base, type: 'post' };

    setPosts((current) => [newItem, ...current]);
    toast.success(payload.isReview ? 'Review published!' : 'Posted!');
  };

  const handleAddQuote = (e: FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    // TODO: Backend Integration - API call to persist quote in DB
    // await api.post('/api/users/quotes', { text: newQuoteText.trim() });
    setQuotes([...quotes, newQuoteText.trim()]);
    setNewQuoteText('');
    toast.success('Quote added!');
  };

  // TODO: Backend Integration - Handler for following/unfollowing database relations in modal
  const handleToggleFollowUser = (_targetUserId: string) => {
    // e.g., await api.post(`/api/users/${_targetUserId}/toggle-follow`);
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {isLoading && <p className="text-sm text-textSecondary">Loading profile...</p>}
      {!isLoading && loadError && <p className="text-sm text-error">{loadError}</p>}
      {!isLoading && !profile && !loadError && <p className="text-sm text-textSecondary">Profile not found.</p>}

      {!isLoading && profile && (
        <>
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <Avatar name={profile.user.name} src={profile.user.profilePicture ?? undefined} size="lg" className="h-24 w-24 border-2 border-white text-2xl shadow-md" />
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{profile.user.name}</h1>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile((current) => !current)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-textSecondary hover:bg-gray-50"
              >
                {isEditingProfile ? 'Cancel' : 'Edit profile'}
              </button>
            )}
          </div>
          <p className="text-sm text-textSecondary">@{profile.user.username}</p>
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="max-w-lg space-y-2 pt-2">
              <textarea
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                maxLength={500}
                placeholder="Tell readers about yourself..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
              <input
                type="url"
                value={profilePictureDraft}
                onChange={(event) => setProfilePictureDraft(event.target.value)}
                placeholder="Profile picture URL"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          ) : (
            <p className="pt-1 text-sm text-text leading-relaxed max-w-lg">{profile.user.bio ?? ''}</p>
          )}
          {!profile.isOwnProfile && (
            <p className="pt-1 text-xs font-medium capitalize text-primary">{profile.relationship}</p>
          )}
          <div className="flex gap-8 pt-3 text-sm">
            <button
              type="button"
              // TODO: Backend Integration - Fetch user's followers list from GET /api/users/${CURRENT_USER.id}/followers
              onClick={() => setActiveModal('followers')}
              className="hover:opacity-80 transition-opacity text-left"
            >
              <span className="font-bold text-text">{profile.followersCount}</span>{' '}
              <span className="text-textSecondary">Followers</span>
            </button>
            <button
              type="button"
              // TODO: Backend Integration - Fetch user's following list from GET /api/users/${CURRENT_USER.id}/following
              onClick={() => setActiveModal('following')}
              className="hover:opacity-80 transition-opacity text-left"
            >
              <span className="font-bold text-text">{profile.followingCount}</span>{' '}
              <span className="text-textSecondary">Following</span>
            </button>
            <div>
              <span className="font-bold text-text">{posts.length}</span>{' '}
              <span className="text-textSecondary">Posts</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Posts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text pb-2 border-b-2 border-primary">Posts</h2>
            {isOwnProfile && <button
              type="button"
              onClick={() => setIsEntryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-primary/90"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New Post
            </button>}
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts.map((item) => (
                <FeedItemCard
                  key={item.id}
                  item={item}
                  currentUserName={currentUserName}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleRepost={handleToggleRepost}
                  onAddComment={handleAddComment}
                  onDelete={handleDeleteItem}
                />
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-card p-10 text-center">
                <p className="text-sm font-medium text-text">No posts published yet.</p>
                {isOwnProfile && <p className="mt-1 text-sm text-textSecondary">Click "New Post" to share what you're reading.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quotes Section */}
        {(quotes.length > 0 || isOwnProfile) && <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-card p-6 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text flex items-center gap-2">
                <span>🎉</span> Quotes
              </h3>
              <span className="text-xs text-textSecondary">{quotes.length} saved</span>
            </div>

            <ul className="space-y-3 text-sm text-text">
              {quotes.map((quote, index) => (
                <li key={index} className="flex items-start gap-2 text-xs leading-relaxed border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="italic text-textSecondary font-medium">"{quote}"</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddQuote} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Add a quote..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-text hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>}
      </div>

      {/* Followers / Following Instagram-Style Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-card border border-gray-100 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="font-bold text-text capitalize">
                  {activeModal} ({activeModal === 'followers' ? '3' : '3'})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-textSecondary hover:text-text font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              {/* TODO: Backend Integration - Map over database-fetched users instead of MOCK_SUGGESTED_READERS */}
              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {MOCK_SUGGESTED_READERS.map((reader) => (
                  <div key={reader.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {reader.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{reader.name}</p>
                        <p className="text-xs text-textSecondary">@{reader.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFollowUser(reader.id)}
                      className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      {activeModal === 'following' ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEntryModalOpen && (
          <NewEntryModal key="entry-modal" onClose={() => setIsEntryModalOpen(false)} onSubmit={handleCreateEntry} />
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}