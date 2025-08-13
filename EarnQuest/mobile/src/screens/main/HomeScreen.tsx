import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../context/AuthContext';
import {apiService} from '../../services/apiService';
import {showMessage} from 'react-native-flash-message';
import {formatCurrency} from '../../utils';

const {width} = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

interface DashboardStats {
  total_earnings: number;
  available_balance: number;
  surveys_completed: number;
  monthly_earnings: number;
}

interface RecentReward {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {user, updateUser} = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRewards, setRecentRewards] = useState<RecentReward[]>([]);
  const [availableSurveys, setAvailableSurveys] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load rewards dashboard
      const rewardsResponse = await apiService.get('/rewards/dashboard');
      if (rewardsResponse.success) {
        setStats(rewardsResponse.data.user_stats);
        setRecentRewards(rewardsResponse.data.recent_rewards.slice(0, 3));
        
        // Update user context with latest stats
        updateUser({
          total_earnings: rewardsResponse.data.user_stats.total_earnings,
          available_balance: rewardsResponse.data.user_stats.available_balance,
          surveys_completed: rewardsResponse.data.user_stats.surveys_completed,
        });
      }

      // Load available surveys count
      const surveysResponse = await apiService.get('/surveys/available');
      if (surveysResponse.success) {
        setAvailableSurveys(surveysResponse.data.total_available);
      }

      // Try to claim daily bonus
      await claimDailyBonus();
      
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const response = await apiService.post('/rewards/bonus');
      if (response.success) {
        showMessage({
          message: 'Daily Bonus!',
          description: `You earned KES ${response.data.reward.amount} for logging in today!`,
          type: 'success',
        });
        // Reload dashboard to reflect new balance
        setTimeout(() => loadDashboardData(), 1000);
      }
    } catch (error) {
      // Silently fail - user might have already claimed today
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'survey_completion':
        return 'assignment-turned-in';
      case 'bonus':
        return 'card-giftcard';
      case 'referral':
        return 'people';
      default:
        return 'monetization-on';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.first_name}! 👋
        </Text>
        <Text style={styles.subtitleText}>
          Ready to earn some money today?
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Icon name="account-balance-wallet" size={24} color="#ffffff" />
            <Text style={styles.statValue}>
              {formatCurrency(stats?.available_balance || 0)}
            </Text>
            <Text style={styles.statLabel}>Available Balance</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#28a745" />
            <Text style={styles.statValue}>
              {formatCurrency(stats?.total_earnings || 0)}
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="assignment-turned-in" size={24} color="#007bff" />
            <Text style={styles.statValue}>
              {stats?.surveys_completed || 0}
            </Text>
            <Text style={styles.statLabel}>Surveys Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="calendar-today" size={24} color="#ffc107" />
            <Text style={styles.statValue}>
              {formatCurrency(stats?.monthly_earnings || 0)}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Surveys')}>
            <Icon name="assignment" size={32} color="#007bff" />
            <Text style={styles.actionText}>Take Surveys</Text>
            <Text style={styles.actionSubtext}>
              {availableSurveys} available
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw')}>
            <Icon name="payment" size={32} color="#28a745" />
            <Text style={styles.actionText}>Withdraw</Text>
            <Text style={styles.actionSubtext}>
              M-PESA & PayPal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Rewards')}>
            <Icon name="card-giftcard" size={32} color="#ffc107" />
            <Text style={styles.actionText}>My Rewards</Text>
            <Text style={styles.actionSubtext}>
              View history
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentRewards.length > 0 ? (
          <View style={styles.activityContainer}>
            {recentRewards.map((reward) => (
              <View key={reward.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon
                    name={getRewardIcon(reward.type)}
                    size={20}
                    color="#007bff"
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {reward.description}
                  </Text>
                  <Text style={styles.activityDate}>
                    {formatDate(reward.created_at)}
                  </Text>
                </View>
                <Text style={styles.activityAmount}>
                  +{formatCurrency(reward.amount)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="history" size={48} color="#dee2e6" />
            <Text style={styles.emptyStateText}>
              No recent activity yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Complete your first survey to get started!
            </Text>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Earning Tips</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Complete your profile to get more targeted surveys
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Check back daily for new survey opportunities
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Refer friends to earn bonus rewards
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  statsContainer: {
    padding: 16,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: '#007bff',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 56) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});

export default HomeScreen;
