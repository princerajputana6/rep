/**
 * Enhanced Resource Approvals with Comments and Discussion
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  User,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  isInternal: boolean; // Internal vs visible to requester
}

interface ApprovalRequest {
  id: string;
  requestId: string;
  type: 'allocation' | 'borrow' | 'budget';
  title: string;
  requester: string;
  requesterAgency: string;
  details: {
    resource?: string;
    role?: string;
    project?: string;
    duration?: string;
    hours?: number;
    cost?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs-info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: string;
  dueDate: string;
  comments: Comment[];
  approvers: string[];
  currentApprover: string;
}

const mockApprovals: ApprovalRequest[] = [
  {
    id: 'APR-001',
    requestId: 'BR-001',
    type: 'borrow',
    title: 'Senior Developer for Digital Transformation',
    requester: 'John Smith',
    requesterAgency: 'Acme Digital',
    details: {
      role: 'Senior Developer',
      project: 'Digital Transformation Initiative',
      duration: '3 months',
      hours: 480,
      cost: '$72,000',
    },
    status: 'pending',
    priority: 'high',
    submittedDate: '2026-02-10',
    dueDate: '2026-02-15',
    comments: [
      {
        id: 'comment_1',
        author: 'Sarah Manager',
        authorRole: 'Resource Manager',
        content: 'This looks reasonable. We have capacity available in the coming quarter.',
        timestamp: '2026-02-11T10:30:00Z',
        isInternal: true,
      },
      {
        id: 'comment_2',
        author: 'Mike Director',
        authorRole: 'Operations Director',
        content: 'Can we confirm the tech stack requirements? Need to ensure skill match.',
        timestamp: '2026-02-11T14:20:00Z',
        isInternal: false,
      },
    ],
    approvers: ['Sarah Manager', 'Mike Director'],
    currentApprover: 'Sarah Manager',
  },
  {
    id: 'APR-002',
    requestId: 'BR-002',
    type: 'borrow',
    title: 'UX Designer for Mobile App Redesign',
    requester: 'Sarah Johnson',
    requesterAgency: 'TechVentures',
    details: {
      role: 'UX Designer',
      project: 'Mobile App Redesign',
      duration: '2 months',
      hours: 320,
      cost: '$32,000',
    },
    status: 'approved',
    priority: 'medium',
    submittedDate: '2026-02-08',
    dueDate: '2026-02-12',
    comments: [
      {
        id: 'comment_3',
        author: 'Linda Approver',
        authorRole: 'Design Lead',
        content: 'Approved. We have a perfect match with Jane from our design team.',
        timestamp: '2026-02-09T09:00:00Z',
        isInternal: false,
      },
    ],
    approvers: ['Linda Approver'],
    currentApprover: 'Linda Approver',
  },
  {
    id: 'APR-003',
    requestId: 'BR-003',
    type: 'borrow',
    title: 'Data Analyst for Analytics Platform',
    requester: 'Michael Chen',
    requesterAgency: 'CreativeCo',
    details: {
      role: 'Data Analyst',
      project: 'Data Analytics Platform',
      duration: '4 months',
      hours: 640,
      cost: '$54,400',
    },
    status: 'needs-info',
    priority: 'medium',
    submittedDate: '2026-02-05',
    dueDate: '2026-02-10',
    comments: [
      {
        id: 'comment_4',
        author: 'Tom Reviewer',
        authorRole: 'Technical Lead',
        content: 'Need more details about specific analytics tools and data sources.',
        timestamp: '2026-02-06T11:00:00Z',
        isInternal: false,
      },
      {
        id: 'comment_5',
        author: 'Michael Chen',
        authorRole: 'Project Manager',
        content: 'Will be using Tableau and PowerBI. Data sources are PostgreSQL and MongoDB.',
        timestamp: '2026-02-06T15:30:00Z',
        isInternal: false,
      },
    ],
    approvers: ['Tom Reviewer'],
    currentApprover: 'Tom Reviewer',
  },
];

export function EnhancedResourceApprovals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'request-info'>('approve');

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    needsInfo: approvals.filter(a => a.status === 'needs-info').length,
  };

  const getStatusColor = (status: ApprovalRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'needs-info': return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: ApprovalRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = () => {
    if (!selectedApproval || !commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: 'Current User',
      authorRole: 'Approver',
      content: commentText,
      timestamp: new Date().toISOString(),
      isInternal: isInternalComment,
    };

    const updatedApprovals = approvals.map(approval =>
      approval.id === selectedApproval.id
        ? { ...approval, comments: [...approval.comments, newComment] }
        : approval
    );

    setApprovals(updatedApprovals);
    setSelectedApproval({
      ...selectedApproval,
      comments: [...selectedApproval.comments, newComment],
    });
    setCommentText('');
    setIsInternalComment(false);
    setShowCommentDialog(false);
    toast.success('Comment added successfully');
  };

  const handleApprovalAction = () => {
    if (!selectedApproval) return;

    let newStatus: ApprovalRequest['status'];
    let message: string;

    switch (approvalAction) {
      case 'approve':
        newStatus = 'approved';
        message = 'Request approved successfully';
        break;
      case 'reject':
        newStatus = 'rejected';
        message = 'Request rejected';
        break;
      case 'request-info':
        newStatus = 'needs-info';
        message = 'Additional information requested';
        break;
    }

    // Add approval comment
    if (approvalComment.trim()) {
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        author: 'Current User',
        authorRole: 'Approver',
        content: approvalComment,
        timestamp: new Date().toISOString(),
        isInternal: false,
      };

      const updatedApprovals = approvals.map(approval =>
        approval.id === selectedApproval.id
          ? {
              ...approval,
              status: newStatus,
              comments: [...approval.comments, newComment],
            }
          : approval
      );

      setApprovals(updatedApprovals);
    } else {
      const updatedApprovals = approvals.map(approval =>
        approval.id === selectedApproval.id
          ? { ...approval, status: newStatus }
          : approval
      );
      setApprovals(updatedApprovals);
    }

    setShowApprovalDialog(false);
    setApprovalComment('');
    setSelectedApproval(null);
    toast.success(message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Resource Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve resource allocation requests with comments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">{stats.needsInfo}</p>
              <p className="text-sm text-gray-600">Needs Info</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map(approval => (
          <Card key={approval.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{approval.id}</h3>
                    <Badge className={getStatusColor(approval.status)}>
                      {approval.status}
                    </Badge>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {approval.priority}
                    </Badge>
                    <Badge variant="secondary">
                      {approval.type}
                    </Badge>
                    {approval.comments.length > 0 && (
                      <Badge variant="secondary">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {approval.comments.length} comments
                      </Badge>
                    )}
                  </div>

                  <p className="text-base font-medium text-gray-900 mb-3">{approval.title}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Requester</p>
                      <p className="text-sm font-medium text-gray-900">{approval.requester}</p>
                      <p className="text-xs text-gray-600">{approval.requesterAgency}</p>
                    </div>
                    {approval.details.project && (
                      <div>
                        <p className="text-xs text-gray-600">Project</p>
                        <p className="text-sm font-medium text-gray-900">{approval.details.project}</p>
                      </div>
                    )}
                    {approval.details.role && (
                      <div>
                        <p className="text-xs text-gray-600">Role</p>
                        <p className="text-sm font-medium text-gray-900">{approval.details.role}</p>
                      </div>
                    )}
                    {approval.details.duration && (
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{approval.details.duration}</p>
                      </div>
                    )}
                    {approval.details.hours && (
                      <div>
                        <p className="text-xs text-gray-600">Hours</p>
                        <p className="text-sm font-medium text-gray-900">{approval.details.hours}h</p>
                      </div>
                    )}
                    {approval.details.cost && (
                      <div>
                        <p className="text-xs text-gray-600">Estimated Cost</p>
                        <p className="text-sm font-medium text-gray-900">{approval.details.cost}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Due: {new Date(approval.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Current: {approval.currentApprover}</span>
                    </div>
                  </div>

                  {/* Recent Comments Preview */}
                  {approval.comments.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-900">Latest Comment</p>
                      </div>
                      {approval.comments.slice(-1).map(comment => (
                        <div key={comment.id}>
                          <p className="text-xs text-gray-600 mb-1">
                            {comment.author} • {new Date(comment.timestamp).toLocaleString()}
                            {comment.isInternal && (
                              <Badge variant="secondary" className="ml-2 text-xs">Internal</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                      {approval.comments.length > 1 && (
                        <button
                          className="text-xs text-blue-600 hover:underline mt-2"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowCommentDialog(true);
                          }}
                        >
                          View all {approval.comments.length} comments
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  {approval.status === 'pending' || approval.status === 'needs-info' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setApprovalAction('approve');
                          setShowApprovalDialog(true);
                        }}
                        className="w-full lg:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setApprovalAction('reject');
                          setShowApprovalDialog(true);
                        }}
                        className="w-full lg:w-auto text-red-600 hover:text-red-700"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setApprovalAction('request-info');
                          setShowApprovalDialog(true);
                        }}
                        className="w-full lg:w-auto"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Request Info
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowCommentDialog(true);
                        }}
                        className="w-full lg:w-auto"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApproval(approval);
                        setShowCommentDialog(true);
                      }}
                      className="w-full lg:w-auto"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Action Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' && 'Approve Request'}
              {approvalAction === 'reject' && 'Reject Request'}
              {approvalAction === 'request-info' && 'Request Additional Information'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval && `${selectedApproval.id} - ${selectedApproval.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Comment (Optional but recommended)</Label>
              <Textarea
                placeholder={
                  approvalAction === 'approve'
                    ? 'Provide any feedback or next steps...'
                    : approvalAction === 'reject'
                    ? 'Please explain the reason for rejection...'
                    : 'What additional information is needed?'
                }
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-600 mt-1">
                This comment will be visible to the requester
              </p>
            </div>

            {approvalAction === 'approve' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Ready to approve</p>
                    <p className="text-xs text-green-700 mt-1">
                      The requester will be notified and can proceed with resource allocation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {approvalAction === 'reject' && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Rejecting request</p>
                    <p className="text-xs text-red-700 mt-1">
                      Please provide a clear reason to help the requester understand the decision
                    </p>
                  </div>
                </div>
              </div>
            )}

            {approvalAction === 'request-info' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Requesting more information</p>
                    <p className="text-xs text-blue-700 mt-1">
                      The requester will be asked to provide additional details
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprovalAction}
              className={
                approvalAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : approvalAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {approvalAction === 'approve' && 'Confirm Approval'}
              {approvalAction === 'reject' && 'Confirm Rejection'}
              {approvalAction === 'request-info' && 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments & Discussion</DialogTitle>
            <DialogDescription>
              {selectedApproval && `${selectedApproval.id} - ${selectedApproval.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Comments Thread */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedApproval?.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Be the first to add a comment</p>
                </div>
              ) : (
                selectedApproval?.comments.map(comment => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{comment.author}</p>
                          <span className="text-xs text-gray-600">{comment.authorRole}</span>
                          {comment.isInternal && (
                            <Badge variant="secondary" className="text-xs">Internal Only</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{comment.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            {(selectedApproval?.status === 'pending' || selectedApproval?.status === 'needs-info') && (
              <div className="border-t pt-4">
                <Label>Add Comment</Label>
                <Textarea
                  placeholder="Type your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="internal" className="text-sm text-gray-700">
                      Internal comment (not visible to requester)
                    </label>
                  </div>
                  <Button onClick={handleAddComment} size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
