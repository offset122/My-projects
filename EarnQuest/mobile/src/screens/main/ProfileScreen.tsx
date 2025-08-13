import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../context/AuthContext';
import {showMessage} from 'react-native-flash-message';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {user, logout} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            showMessage({
              message: 'Logged Out',
              description: 'You have been successfully logged out',
              type: 'info',
            });
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toFixed(2)}`;
  };

  const ProfileItem = ({
    icon,
    title,
    value,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <Icon name={icon} size={24} color="#007bff" />
        <Text style={styles.profileItemTitle}>{title}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.profileItemValue}>{value}</Text>}
        {showArrow && onPress && (
          <Icon name="chevron-right" size={24} color="#6c757d" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {/* Verification Status */}
        <View style={styles.verificationContainer}>
          <Icon
            name={user?.is_verified ? 'verified' : 'warning'}
            size={16}
            color={user?.is_verified ? '#28a745' : '#ffc107'}
          />
          <Text style={[
            styles.verificationText,
            {color: user?.is_verified ? '#28a745' : '#ffc107'}
          ]}>
            {user?.is_verified ? 'Verified Account' : 'Unverified Account'}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(user?.total_earnings || 0)}
          </Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {user?.surveys_completed || 0}
          </Text>
          <Text style={styles.statLabel}>Surveys Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCurrency(user?.available_balance || 0)}
          </Text>
          <Text style={styles.statLabel}>Available Balance</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          <ProfileItem
            icon="person"
            title="Personal Information"
            onPress={() => {
              showMessage({
                message: 'Coming Soon',
                description: 'Profile editing will be available soon',
                type: 'info',
              });
            }}
          />
          <ProfileItem
            icon="phone"
            title="Phone Number"
            value={user?.phone}
            showArrow={false}
          />
          <ProfileItem
            icon="security"
            title="Change Password"
            onPress={() => {
              showMessage({
                message: 'Coming Soon',
                description: 'Password change will be available soon',
                type: 'info',
              });
            }}
          />
        </View>
      </View>

      {/* Earnings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.sectionContent}>
          <ProfileItem
            icon="history"
            title="Transaction History"
            onPress={() => {
              showMessage({
                message: 'Coming Soon',
                description: 'Transaction history will be available soon',
                type: 'info',
              });
            }}
          />
          <ProfileItem
            icon="payment"
            title="Payment Methods"
            onPress={() => navigation.navigate('Withdraw')}
          />
          <ProfileItem
            icon="receipt"
            title="Tax Information"
            onPress={() => {
              showMessage({
                message: 'Coming Soon',
                description: 'Tax information will be available soon',
                type: 'info',
              });
            }}
          />
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.sectionContent}>
          <View style={styles.profileItem}>
            <View style={styles.profileItemLeft}>
              <Icon name="notifications" size={24} color="#007bff" />
              <Text style={styles.profileItemTitle}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: '#767577', true: '#007bff'}}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          <ProfileItem
            icon="language"
            title="Language"
            value="English"
            onPress={() => {
              showMessage({
                message: 'Coming Soon',
                description: 'Language selection will be available soon',
                type: 'info',
              });
            }}
          />
          <ProfileItem
            icon="help"
            title="Help & Support"
            onPress={() => {
              showMessage({
                message: 'Need Help?',
                description: 'Contact us at support@earnquest.co.ke',
                type: 'info',
              });
            }}
          />
          <ProfileItem
            icon="info"
            title="About EarnQuest"
            onPress={() => {
              Alert.alert(
                'About EarnQuest',
                'EarnQuest v1.0.0\n\nA Kenyan-based survey and rewards platform that helps you earn real money by sharing your opinions.\n\nMade with ❤️ for Kenya',
                [{text: 'OK'}]
              );
            }}
          />
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#dc3545" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          EarnQuest v1.0.0 • Made for Kenya 🇰🇪
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
    backgroundColor: '#007bff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 12,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 12,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default ProfileScreen;
