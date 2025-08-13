import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {apiService} from '../../services/apiService';
import {useAuth} from '../../context/AuthContext';
import {showMessage} from 'react-native-flash-message';
import {formatCurrency} from '../../utils';

interface WithdrawScreenProps {
  navigation: any;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  processing_time: string;
  available: boolean;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({navigation}) => {
  const {user, updateUser} = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await apiService.get('/payments/methods');
      if (response.success) {
        setPaymentMethods(response.data.payment_methods);
      }
    } catch (error) {
      console.error('Load payment methods error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const validateWithdrawal = () => {
    if (!selectedMethod) {
      showMessage({
        message: 'Error',
        description: 'Please select a payment method',
        type: 'danger',
      });
      return false;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      showMessage({
        message: 'Error',
        description: 'Please enter a valid amount',
        type: 'danger',
      });
      return false;
    }

    if (withdrawAmount > (user?.available_balance || 0)) {
      showMessage({
        message: 'Error',
        description: 'Insufficient balance',
        type: 'danger',
      });
      return false;
    }

    if (withdrawAmount < selectedMethod.min_amount || withdrawAmount > selectedMethod.max_amount) {
      showMessage({
        message: 'Error',
        description: `Amount must be between ${formatCurrency(selectedMethod.min_amount)} and ${formatCurrency(selectedMethod.max_amount)}`,
        type: 'danger',
      });
      return false;
    }

    if (selectedMethod.id === 'mpesa' && !phoneNumber) {
      showMessage({
        message: 'Error',
        description: 'Please enter your M-PESA phone number',
        type: 'danger',
      });
      return false;
    }

    if (selectedMethod.id === 'paypal' && !email) {
      showMessage({
        message: 'Error',
        description: 'Please enter your PayPal email',
        type: 'danger',
      });
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    const withdrawAmount = parseFloat(amount);
    const methodName = selectedMethod?.name;

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${formatCurrency(withdrawAmount)} to your ${methodName} account?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const withdrawalData: any = {
                method: selectedMethod?.id,
                amount: withdrawAmount,
              };

              if (selectedMethod?.id === 'mpesa') {
                withdrawalData.phone_number = phoneNumber;
              } else if (selectedMethod?.id === 'paypal') {
                withdrawalData.email = email;
              }

              const response = await apiService.post('/payments/withdraw', withdrawalData);
              
              if (response.success) {
                // Update user balance
                updateUser({
                  available_balance: response.data.new_balance,
                });

                Alert.alert(
                  'Withdrawal Successful! 🎉',
                  `Your withdrawal of ${formatCurrency(withdrawAmount)} has been processed. You should receive your payment within ${selectedMethod?.processing_time}.`,
                  [
                    {
                      text: 'Great!',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                showMessage({
                  message: 'Withdrawal Failed',
                  description: response.error || 'Please try again later',
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
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod?.id === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedMethod(method)}
      disabled={!method.available}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodInfo}>
          <Icon
            name={method.id === 'mpesa' ? 'phone-android' : 'payment'}
            size={24}
            color={method.available ? '#007bff' : '#6c757d'}
          />
          <View style={styles.paymentMethodText}>
            <Text style={[
              styles.paymentMethodName,
              !method.available && styles.disabledText
            ]}>
              {method.name}
            </Text>
            <Text style={[
              styles.paymentMethodDescription,
              !method.available && styles.disabledText
            ]}>
              {method.description}
            </Text>
          </View>
        </View>
        {selectedMethod?.id === method.id && (
          <Icon name="check-circle" size={24} color="#28a745" />
        )}
      </View>
      
      <View style={styles.paymentMethodDetails}>
        <Text style={styles.paymentMethodDetail}>
          Min: {formatCurrency(method.min_amount)} • Max: {formatCurrency(method.max_amount)}
        </Text>
        <Text style={styles.paymentMethodDetail}>
          Processing: {method.processing_time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Balance Header */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(user?.available_balance || 0)}
        </Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {paymentMethods.map(renderPaymentMethod)}
      </View>

      {/* Amount Input */}
      {selectedMethod && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>KES</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              maxLength={8}
            />
          </View>
          <Text style={styles.amountHint}>
            Min: {formatCurrency(selectedMethod.min_amount)} • 
            Max: {formatCurrency(selectedMethod.max_amount)}
          </Text>
        </View>
      )}

      {/* Payment Details */}
      {selectedMethod && amount && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          {selectedMethod.id === 'mpesa' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>M-PESA Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="0712345678 or +254712345678"
                keyboardType="phone-pad"
              />
            </View>
          )}
          
          {selectedMethod.id === 'paypal' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PayPal Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        </View>
      )}

      {/* Summary */}
      {selectedMethod && amount && (
        <View style={styles.section}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(parseFloat(amount) || 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Method:</Text>
              <Text style={styles.summaryValue}>{selectedMethod.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Time:</Text>
              <Text style={styles.summaryValue}>{selectedMethod.processing_time}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>New Balance:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency((user?.available_balance || 0) - (parseFloat(amount) || 0))}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Withdraw Button */}
      {selectedMethod && amount && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.withdrawButton, isProcessing && styles.disabledButton]}
            onPress={handleWithdraw}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="send" size={20} color="#ffffff" />
                <Text style={styles.withdrawButtonText}>
                  Withdraw {formatCurrency(parseFloat(amount) || 0)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Important Notes */}
      <View style={styles.section}>
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>📝 Important Notes</Text>
          <Text style={styles.noteItem}>
            • Withdrawals are processed within the specified time frame
          </Text>
          <Text style={styles.noteItem}>
            • Ensure your payment details are correct before confirming
          </Text>
          <Text style={styles.noteItem}>
            • Minimum withdrawal amounts apply for each payment method
          </Text>
          <Text style={styles.noteItem}>
            • Contact support if you don't receive your payment within the expected time
          </Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  balanceContainer: {
    backgroundColor: '#007bff',
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPaymentMethod: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  disabledText: {
    color: '#adb5bd',
  },
  paymentMethodDetails: {
    marginTop: 8,
  },
  paymentMethodDetail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    paddingVertical: 16,
  },
  amountHint: {
    fontSize: 12,
    color: '#6c757d',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  withdrawButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default WithdrawScreen;
