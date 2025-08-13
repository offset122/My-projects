import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../../services/apiService';
import {useAuth} from '../../context/AuthContext';

interface RewardsScreenProps {
  navigation: any;
}

interface Reward {
  id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

interface RewardBreakdown {
  type: string;
  total_amount: number;
  count: number;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({navigation}) => {
  const {user} = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [breakdown, setBreakdown] = useState<RewardBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRewards();
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await apiService.get('/rewards/dashboard');
      if (response.success) {
        setBreakdown(response.data.reward_breakdown);
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
    }
  };

  const loadRewards = async (pageNum = 1, append = false) => {
    try {
      const response = await apiService.get('/rewards/history', {
        page: pageNum,
        per_page: 20,
      });
      
      if (response.success) {
        const newRewards = response.data.rewards;
        if (append) {
          setRewards(prev => [...prev, ...newRewards]);
        } else {
          setRewards(newRewards);
        }
        setHasMore(pageNum < response.data.pages);
      }
    } catch (error) {
      console.error('Load rewards error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadRewards(1, false);
    loadDashboard();
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadRewards(nextPage, true);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'survey_completion':
        return '#007bff';
      case 'bonus':
        return '#ffc107';
      case 'referral':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'paid':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  const renderBreakdownItem = ({item}: {item: RewardBreakdown}) => (
    <View style={styles.breakdownCard}>
      <View style={styles.breakdownHeader}>
        <Icon
          name={getRewardIcon(item.type)}
          size={24}
          color={getRewardColor(item.type)}
        />
        <Text style={styles.breakdownType}>
          {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
      </View>
      <Text style={styles.breakdownAmount}>
        {formatCurrency(item.total_amount)}
      </Text>
      <Text style={styles.breakdownCount}>
        {item.count} reward{item.count !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderRewardItem = ({item}: {item: Reward}) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View style={styles.rewardIconContainer}>
          <Icon
            name={getRewardIcon(item.type)}
            size={20}
            color={getRewardColor(item.type)}
          />
        </View>
        <View style={styles.rewardContent}>
          <Text style={styles.rewardDescription}>
            {item.description}
          </Text>
          <Text style={styles.rewardDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.rewardAmount}>
          <Text style={styles.rewardAmountText}>
            +{formatCurrency(item.amount)}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Balance Summary */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(user?.available_balance || 0)}
          </Text>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate('Withdraw')}>
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Earned</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(user?.total_earnings || 0)}
          </Text>
          <Text style={styles.balanceSubtext}>
            {user?.surveys_completed || 0} surveys completed
          </Text>
        </View>
      </View>

      {/* Reward Breakdown */}
      {breakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <FlatList
            data={breakdown}
            renderItem={renderBreakdownItem}
            keyExtractor={(item) => item.type}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.breakdownList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reward History</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  };

  if (isLoading && rewards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rewards}
        renderItem={renderRewardItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    paddingBottom: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 10,
    color: '#adb5bd',
  },
  withdrawButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  breakdownList: {
    paddingRight: 16,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#495057',
    marginTop: 4,
    textAlign: 'center',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  breakdownCount: {
    fontSize: 10,
    color: '#6c757d',
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardContent: {
    flex: 1,
  },
  rewardDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  rewardDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  rewardAmount: {
    alignItems: 'flex-end',
  },
  rewardAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default RewardsScreen;
