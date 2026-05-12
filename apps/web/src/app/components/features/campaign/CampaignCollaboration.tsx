import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { MessageSquare, Send, AtSign, ThumbsUp, Reply, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  likes: string[];
  replies?: Comment[];
}

interface CampaignCollaborationProps {
  campaignId: string;
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  onAddComment: (content: string, mentions: string[]) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
}

export function CampaignCollaboration({
  campaignId,
  comments,
  currentUser,
  onAddComment,
  onLikeComment,
  onReplyComment,
}: CampaignCollaborationProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  // Mock team members for mentions
  const teamMembers = [
    { id: '1', name: 'John Smith', email: 'john@example.com' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    // Extract mentions from comment
    const mentionPattern = /@(\w+)/g;
    const mentions = [...newComment.matchAll(mentionPattern)].map(match => match[1]);

    onAddComment(newComment, mentions);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    onReplyComment(commentId, replyContent);
    setReplyingTo(null);
    setReplyContent('');
    toast.success('Reply added');
  };

  const handleMention = (userName: string) => {
    setNewComment(newComment + `@${userName} `);
    setShowMentions(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12' : ''}`}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar>
              <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm">{comment.userName}</div>
                  <div className="text-xs text-gray-600">{formatTimestamp(comment.timestamp)}</div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Comment Text */}
              <div className="text-sm text-gray-900 mb-3 whitespace-pre-wrap">
                {comment.content.split(/(@\w+)/g).map((part, i) =>
                  part.startsWith('@') ? (
                    <span key={i} className="text-blue-600 font-medium">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </div>

              {/* Mentions Badge */}
              {comment.mentions && comment.mentions.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {comment.mentions.map((mention, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      @{mention}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLikeComment(comment.id)}
                  className="gap-1 text-xs"
                >
                  <ThumbsUp
                    className={`w-3 h-3 ${
                      comment.likes.includes(currentUser.id) ? 'fill-blue-500 text-blue-500' : ''
                    }`}
                  />
                  {comment.likes.length > 0 && comment.likes.length}
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="gap-1 text-xs"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleReply(comment.id)}>
                      Send Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 space-y-3 mb-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Comments & Collaboration</h3>
        <Badge variant="secondary">{comments.length}</Badge>
      </div>

      {/* New Comment */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment... Use @name to mention team members"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
                rows={3}
              />
              
              {/* Mention Suggestions */}
              {showMentions && (
                <div className="mb-2 p-2 bg-white border rounded-lg shadow-lg">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Mention someone:</div>
                  {teamMembers.map(member => (
                    <Button
                      key={member.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMention(member.name.split(' ')[0])}
                      className="w-full justify-start"
                    >
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={handleAddComment} className="gap-2">
                  <Send className="w-4 h-4" />
                  Comment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMentions(!showMentions)}
                  className="gap-1"
                >
                  <AtSign className="w-4 h-4" />
                  Mention
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="font-medium text-gray-900 mb-1">No comments yet</div>
              <div className="text-sm text-gray-600">
                Be the first to comment on this campaign
              </div>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
