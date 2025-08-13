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
import {showMessage} from 'react-native-flash-message';

interface SurveysScreenProps {
  navigation: any;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  reward: number;
  estimated_time: number;
  category: string;
}

const SurveysScreen: React.FC<SurveysScreenProps> = ({navigation}) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await apiService.get('/surveys/available');
      if (response.success) {
        setSurveys(response.data.surveys);
      } else {
        showMessage({
          message: 'Error',
          description: 'Failed to load surveys',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Load surveys error:', error);
      showMessage({
        message: 'Error',
        description: 'Something went wrong',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSurveys();
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return 'shopping-cart';
      case 'finance':
        return 'account-balance';
      case 'food & dining':
        return 'restaurant';
      case 'technology':
        return 'computer';
      case 'healthcare':
        return 'local-hospital';
      default:
        return 'assignment';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return '#e91e63';
      case 'finance':
        return '#2196f3';
      case 'food & dining':
        return '#ff9800';
      case 'technology':
        return '#9c27b0';
      case 'healthcare':
        return '#4caf50';
      default:
        return '#607d8b';
    }
  };

  const renderSurveyItem = ({item}: {item: Survey}) => (
    <TouchableOpacity
      style={styles.surveyCard}
      onPress={() => navigation.navigate('SurveyDetail', {survey: item})}>
      <View style={styles.surveyHeader}>
        <View style={styles.categoryContainer}>
          <Icon
            name={getCategoryIcon(item.category)}
            size={16}
            color={getCategoryColor(item.category)}
          />
          <Text style={[styles.categoryText, {color: getCategoryColor(item.category)}]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardAmount}>
            {formatCurrency(item.reward)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.surveyTitle}>{item.title}</Text>
      <Text style={styles.surveyDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.surveyFooter}>
        <View style={styles.timeContainer}>
          <Icon name="schedule" size={16} color="#6c757d" />
          <Text style={styles.timeText}>
            ~{item.estimated_time} min
          </Text>
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Survey</Text>
          <Icon name="arrow-forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="assignment" size={64} color="#dee2e6" />
      <Text style={styles.emptyStateTitle}>No Surveys Available</Text>
      <Text style={styles.emptyStateText}>
        Check back later for new survey opportunities!
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadSurveys}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading surveys...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Surveys</Text>
        <Text style={styles.headerSubtitle}>
          {surveys.length} survey{surveys.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
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
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  listContainer: {
    padding: 16,
  },
  surveyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rewardContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  surveyDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  surveyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SurveysScreen;
