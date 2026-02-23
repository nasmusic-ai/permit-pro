import { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Check,
  FileText,
  CreditCard,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore, useNotificationStore } from '@/store';
import { format } from 'date-fns';
import type { Notification } from '@/types';

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: X,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

const relatedIcons: Record<string, React.ElementType> = {
  application: FileText,
  payment: CreditCard,
  permit: BadgeCheck,
  system: Bell,
};

export function Notifications() {
  const { user } = useAuthStore();
  const {
    markAsRead,
    markAllAsRead,
    getNotificationsByUser,
    getUnreadCount,
  } = useNotificationStore();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const userNotifications = user ? getNotificationsByUser(user.id) : [];
  const unreadNotifications = userNotifications.filter((n) => !n.isRead);
  const readNotifications = userNotifications.filter((n) => n.isRead);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const TypeIcon = typeIcons[notification.type];
    const RelatedIcon = relatedIcons[notification.relatedTo || 'system'];

    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
          notification.isRead ? 'bg-white' : 'bg-[#E3F2FD] border-l-4 border-[#1A237E]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[notification.type]}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-[#1A237E]'}`}>
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-[#FFEB3B] rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-400">
                {format(notification.createdAt, 'MMM d, yyyy h:mm a')}
              </span>
              {notification.relatedTo && (
                <Badge variant="outline" className="text-xs">
                  <RelatedIcon className="w-3 h-3 mr-1" />
                  {notification.relatedTo}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A237E]">Notifications</h1>
          <p className="text-gray-600">
            You have {user ? getUnreadCount(user.id) : 0} unread notifications
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="border-[#1A237E] text-[#1A237E]"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#1A237E] data-[state=active]:text-white">
            All ({userNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-[#1A237E] data-[state=active]:text-white">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="data-[state=active]:bg-[#1A237E] data-[state=active]:text-white">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {userNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            userNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <h3 className="text-lg font-medium text-gray-700">No unread notifications</h3>
                <p className="text-gray-500">You've read all your notifications!</p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-3">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700">No read notifications</h3>
                <p className="text-gray-500">Your read notifications will appear here</p>
              </CardContent>
            </Card>
          ) : (
            readNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1A237E]">Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${typeColors[selectedNotification.type]}`}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeIcons[selectedNotification.type];
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <span className="font-semibold capitalize">{selectedNotification.type}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1A237E]">
                  {selectedNotification.title}
                </h3>
                <p className="text-gray-600 mt-2">{selectedNotification.message}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{format(selectedNotification.createdAt, 'MMM d, yyyy h:mm a')}</span>
                {selectedNotification.relatedTo && (
                  <Badge variant="outline">
                    {(() => {
                      const Icon = relatedIcons[selectedNotification.relatedTo];
                      return <Icon className="w-3 h-3 mr-1" />;
                    })()}
                    {selectedNotification.relatedTo}
                  </Badge>
                )}
              </div>

              {!selectedNotification.isRead && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="w-full bg-[#1A237E] text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
