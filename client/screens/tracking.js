import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function TrackingScreen() {
  const route = useRoute();
  const { parcelNumber } = route.params;
  const [trackingData, setTrackingData] = useState(null);
  // const [showHistory, setShowHistory] = useState(true);
  const navigation = useNavigation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchTrackingDetails();
  }, []);

  const fetchTrackingDetails = async () => {
    try {
      const response = await fetch(apiUrl + `/tracking/parcelNumber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelNumber }),
      });
      const data = await response.json();
      // console.log("data",data)
      if (data.status === 'success') {
        setTrackingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching tracking details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.navbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Tracking Details" titleStyle={styles.navbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          source={{
            uri: 'https://t4.ftcdn.net/jpg/12/45/75/37/240_F_1245753723_VW1QFC7aG8m3v1pYDWI5pEqY7v2VCDmJ.jpg',
          }}
          style={styles.topImage}
          resizeMode="cover"
        />

        {trackingData ? (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>Parcel Number: {trackingData.parcelNumber}</Text>
                <Text style={styles.info}>Current Status: {trackingData.currentStatus}</Text>
                <Text style={styles.info}>Current Location: {trackingData.currentLocation}</Text>
              </Card.Content>
            </Card>

            <Text style={styles.timelineHeader}>Expected Delivery</Text>
            <Text style={styles.timelineDate}>
              {new Date(trackingData.expectedDelivery).toLocaleString()}
            </Text>

            <View style={styles.timelineContainer}>
              {trackingData.trackingHistory.map((entry, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.iconWrapper}>
                    <View style={styles.timelineCircle}>
                      <FontAwesome name="check" size={12} color="white" />
                    </View>
                    {index !== trackingData.trackingHistory.length - 1 && (
                      <View style={styles.verticalLine} />
                    )}
                  </View>

                  <View style={styles.timelineTextWrapper}>
                    <Text style={styles.timelineStatus}>{entry.status}</Text>
                    <Text style={styles.timelineLocation}>{entry.location}</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.loading}>Loading tracking details...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  navbar: {
    backgroundColor: '#333',
    alignItems: 'center',
  },
  navbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  timelineHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  timelineDate: {
    fontSize: 15,
    color: '#007bff',
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    position: 'relative',
  },
  iconWrapper: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    position: 'absolute',
    top: 20,
    width: 2,
    height: '100%',
    backgroundColor: '#007bff',
    zIndex: 1,
  },
  timelineTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  loading: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
});
