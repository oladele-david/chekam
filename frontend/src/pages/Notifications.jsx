import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import NotificationCard from '../components/reusable/NotificationCard';
import StatCard from '../components/reusable/StatCard';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import ApiClient from '../api/ApiClient';
import NotificationsEndpoint from '../api/NotificationsEndpoint';

export default function Notifications() {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [includeLowPriority, setIncludeLowPriority] = useState(true);

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const notificationsEndpoint = new NotificationsEndpoint(apiClient);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, includeLowPriority]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const [notificationsData, summaryData] = await Promise.all([
        notificationsEndpoint.getAllNotifications(user.id, includeLowPriority),
        notificationsEndpoint.getNotificationSummary(user.id)
      ]);

      setNotifications(notificationsData.notifications || []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    if (selectedFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.priority === selectedFilter);
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customBlue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-customGray4">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Budget alerts, spending notifications, and financial insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={includeLowPriority}
                onChange={(e) => setIncludeLowPriority(e.target.checked)}
                className="rounded border-gray-300 text-customBlue focus:ring-customBlue"
              />
              Include low priority
            </label>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Notifications"
              value={summary.total_notifications}
              icon={<Bell className="h-6 w-6" />}
              color="blue"
            />
            <StatCard
              label="Urgent"
              value={summary.by_priority.urgent}
              icon={<AlertTriangle className="h-6 w-6" />}
              color="red"
            />
            <StatCard
              label="High Priority"
              value={summary.by_priority.high}
              icon={<AlertCircle className="h-6 w-6" />}
              color="yellow"
            />
            <StatCard
              label="Medium & Low"
              value={summary.by_priority.medium + summary.by_priority.low}
              icon={<Info className="h-6 w-6" />}
              color="gray"
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-customBlue text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.label}
              {summary && filter.value !== 'all' && summary.by_priority[filter.value] > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {summary.by_priority[filter.value]}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-gray-500">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No notifications</p>
                  <p className="text-sm">
                    {selectedFilter === 'all'
                      ? "You're all caught up! No alerts at this time."
                      : `No ${selectedFilter} priority notifications.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <NotificationCard key={index} notification={notification} />
            ))
          )}
        </div>

        {/* Notification Types Summary */}
        {summary && summary.by_type && Object.keys(summary.by_type).length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-customGray4">
                Notifications by Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(summary.by_type).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
