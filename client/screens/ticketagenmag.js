import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ route }) => {
  const [chatData, setChatData] = useState([]);
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const ticketNumber = route?.params?.ticketNumber;

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid time';
  
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`${apiUrl}/tickets/TicketNumber`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketNumber }),
        });

        const result = await response.json();

        if (result.status === "success" && result.data.chat) {
          const chat = result.data.chat;
          setChatData(chat);

          const agent = result.data.agentid;
          if(agent){
            setAgentId(agent);
          }
          else{
            console.warn("Agent ID not found!");
          }
        } else {
          setChatData([]);
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [ticketNumber]);

  const renderItem = ({ item }) => {
    const isAgent = item.to === agentId;

    return (
      <View style={[styles.messageContainer, isAgent ? styles.agentMessage : styles.supportMessage]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Ticket Updates</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chatData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.chat}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  header: {
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chat: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
    borderRadius: 15,
    padding: 10,
  },
  agentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e3e5',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});

export default ChatScreen;
