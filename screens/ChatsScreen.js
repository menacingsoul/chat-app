import { StyleSheet,ScrollView, Pressable,ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useLayoutEffect } from "react";
import { UserType } from "../UserContext";
import { Text,View } from "react-native";
import { useRef } from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import io from 'socket.io-client';

const ChatScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const socket = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 25, fontWeight: "600", color: "#838FE2" }}>
          ChatterBox
        </Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AntDesign
            name="find"
            onPress={() => navigation.navigate("Home")}
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Requests")}
            name="people-outline"
            size={24}
            color="black"
          />
          <FontAwesome5
            name="user-circle"
            onPress={() => navigation.navigate("Profile")}
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    socket.current = io('https://chatterbox-backend-asgm.onrender.com');

    socket.current.on('connect', () => {
        socket.current.emit('setUser', userId);
    });

    const acceptedFriendsList = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://chatterbox-backend-asgm.onrender.com/accepted-friends/${userId}`
            );
            const data = await response.json();

            if (response.ok) {
                setAcceptedFriends(data);
            }
        } catch (error) {
            console.log("error showing the accepted friends", error);
        }finally{
            setIsLoading(false);
        }
    };

    acceptedFriendsList(); // Initial fetch

    // Listen for the 'friendRequestAccepted' event
    socket.current.on('friendRequestAccepted', async (data) => {
        // Check if the current user is either the sender or receiver
        if (data.senderId === userId || data.recipientId === userId) {
            await acceptedFriendsList(); // Re-fetch the accepted friends list
        }
    });

    return () => {
        socket.current.disconnect();
    };
}, [userId]); // Dependency on userId

  console.log("friends", acceptedFriends);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isLoading?( <ActivityIndicator size="large" color="black" />) : 
      (
        <TouchableOpacity>
        {acceptedFriends.map((item, index) => (
          <UserChat key={index} item={item} />
        ))}
      </TouchableOpacity>
      )
      }
      
    </ScrollView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
