import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../../services/apiService';
import {showMessage} from 'react-native-flash-message';

interface SurveyDetailScreenProps {
  navigation: any;
  route: any;
}

const SurveyDetailScreen: React.FC<SurveyDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {survey} = route.params;
  const [isStarting, setIsStarting] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');

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

  const handleStartSurvey = async () => {
    Alert.alert(
      'Start Survey',
      'Are you ready to start this survey? Make sure you have enough time to complete it.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start',
          onPress: async () => {
            setIsStarting(true);
            try {
              const response = await apiService.post(`/surveys/start/${survey.id}`);
              if (response.success) {
                setSurveyUrl(response.data.redirect_url);
                setShowWebView(true);
                showMessage({
                  message: 'Survey Started',
                  description: 'Complete the survey to earn your reward!',
                  type: 'success',
                });
              } else {
                showMessage({
                  message: 'Error',
                  description: response.error || 'Failed to start survey',
                  type: 'danger',
                });
              }
            } catch (error) {
              showMessage({
                message: 'Error',
                description: 'Something went wrong. Please try again.',
                type: 'danger',
              });
            } finally {
              setIsStarting(false);
            }
          },
        },
      ]
    );
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    // Check if survey is completed based on URL or other indicators
    if (navState.url.includes('survey-complete') || navState.url.includes('thank-you')) {
      handleSurveyComplete();
    }
  };

  const handleSurveyComplete = async () => {
    try {
      const response = await apiService.post(`/surveys/complete/${survey.id}`);
      if (response.success) {
        Alert.alert(
          'Survey Completed! 🎉',
          `Congratulations! You've earned ${formatCurrency(response.data.reward.amount)}. Your new balance is ${formatCurrency(response.data.new_balance)}.`,
          [
            {
              text: 'Great!',
              onPress: () => {
                setShowWebView(false);
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Survey completion error:', error);
    }
  };

  const handleWebViewError = () => {
    Alert.alert(
      'Connection Error',
      'There was a problem loading the survey. Please check your internet connection and try again.',
      [
        {text: 'Retry', onPress: () => setShowWebView(false)},
        {text: 'Cancel', onPress: () => navigation.goBack()},
      ]
    );
  };

  if (showWebView) {
    return (
      <View style={styles.webViewContainer}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                'Exit Survey',
                'Are you sure you want to exit? Your progress may not be saved.',
                [
                  {text: 'Continue Survey', style: 'cancel'},
                  {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => {
                      setShowWebView(false);
                      navigation.goBack();
                    },
                  },
                ]
              );
            }}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Survey in Progress</Text>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleSurveyComplete}>
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{uri: surveyUrl}}
          style={styles.webView}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.webViewLoadingText}>Loading survey...</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Survey Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Icon
            name={getCategoryIcon(survey.category)}
            size={32}
            color={getCategoryColor(survey.category)}
          />
          <Text style={[styles.categoryText, {color: getCategoryColor(survey.category)}]}>
            {survey.category}
          </Text>
        </View>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>
            {formatCurrency(survey.reward)}
          </Text>
        </View>
      </View>

      {/* Survey Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{survey.title}</Text>
        <Text style={styles.description}>{survey.description}</Text>

        {/* Survey Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="schedule" size={20} color="#6c757d" />
            <Text style={styles.detailText}>
              Estimated Time: ~{survey.estimated_time} minutes
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="monetization-on" size={20} color="#6c757d" />
            <Text style={styles.detailText}>
              Reward: {formatCurrency(survey.reward)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="category" size={20} color="#6c757d" />
            <Text style={styles.detailText}>
              Category: {survey.category}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 Instructions</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              • Answer all questions honestly and completely
            </Text>
            <Text style={styles.instructionItem}>
              • Do not refresh or close the survey page
            </Text>
            <Text style={styles.instructionItem}>
              • Complete the survey in one session
            </Text>
            <Text style={styles.instructionItem}>
              • Your responses are confidential and anonymous
            </Text>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>✅ Requirements</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>
              • Stable internet connection
            </Text>
            <Text style={styles.requirementItem}>
              • {survey.estimated_time} minutes of uninterrupted time
            </Text>
            <Text style={styles.requirementItem}>
              • Honest and thoughtful responses
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>⚠️ Important Notes</Text>
          <Text style={styles.termsText}>
            • Rewards are credited after successful survey completion
          </Text>
          <Text style={styles.termsText}>
            • Incomplete or low-quality responses may not be rewarded
          </Text>
          <Text style={styles.termsText}>
            • Each survey can only be completed once per user
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, isStarting && styles.disabledButton]}
          onPress={handleStartSurvey}
          disabled={isStarting}>
          {isStarting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="play-arrow" size={24} color="#ffffff" />
              <Text style={styles.startButtonText}>Start Survey</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          By starting this survey, you agree to provide honest responses and 
          understand that rewards are subject to quality verification.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  rewardBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rewardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  instructionsList: {
    marginLeft: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  requirementsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  requirementsList: {
    marginLeft: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  termsContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webViewHeader: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44, // Account for status bar
  },
  backButton: {
    padding: 8,
  },
  webViewTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default SurveyDetailScreen;
