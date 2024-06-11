import React, { useState, useRef, useEffect } from "react";
// import Config from "react-native-config";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
} from "react-native";
// import { OPENAI_API_KEY } from '@env';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ChatBot = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [botMessage, setBotMessage] = useState("");
  const [typingInterrupted, setTypingInterrupted] = useState(false);
  const [partialBotMessage, setPartialBotMessage] = useState("");
  const [firstBotMessage, setFirstBotMessage] = useState(false);

  const scrollViewRef = useRef();
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    if (!firstBotMessage) {
      handleBotResponse(
        "Emma is having an ongoing panic attack. She is alone & needs to talk to someone. Please have a comforting conversation with Emma now."
      );
      setFirstBotMessage(true);
    } else {
      return;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (!botTyping) {
      if (inputText.trim() === "") {
        alert("Please enter something!");
        return;
      }
    }

    if (botTyping) {
      clearInterval(typingIntervalRef.current);
      setTypingInterrupted(true);
      setBotTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: partialBotMessage, sender: "bot", timestamp: new Date() },
      ]);
      setBotMessage("");
      setPartialBotMessage("");
      return;
    }

    const userMessage = {
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setInputText("");
    setBotMessage("");
    handleBotResponse(userMessage.text);
  };

  const handleBotResponse = async (userText) => {
    try {
      setBotTyping(true);
      setTypingInterrupted(false);
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userText },
        ],
        model: "gpt-4-turbo",
      });

      const botMessageContent = completion.choices[0].message.content.trim();
      typeBotMessage(botMessageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      setBotTyping(false);
    }
  };

  const typeBotMessage = (fullBotMessage) => {
    let index = 0;
    setBotMessage("");
    setTypingInterrupted(false);

    clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      setBotMessage((prev) => {
        const newMessage = prev + fullBotMessage[index];
        setPartialBotMessage(newMessage);
        return newMessage;
      });
      index++;
      if (index === fullBotMessage.length && fullBotMessage.length !== 0) {
        clearInterval(typingIntervalRef.current);
        setMessages((prev) => [
          ...prev,
          { text: fullBotMessage, sender: "bot", timestamp: new Date() },
        ]);
        setBotTyping(false);
        setTypingInterrupted(false);
        setBotMessage("");
        setPartialBotMessage("");
      }
    }, 50);
  };

  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start" }}
        onContentSizeChange={scrollToBottom}
      >
        <View style={styles.flexContainer}>
          <View style={styles.shadowContainer}>
            <Image
              source={require("../assets/images/MindGinie_Original.jpg")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.heading}>Mindginie : Your Friend</Text>
          <View style={{ flexDirection: "row", opacity: 0.4 }}>
            <Text
              style={{ marginRight: 10, marginBottom: 15 }}
              onPress={() => Linking.openURL("https://www.mindginie.com/")}
            >
              By mindginie.com
            </Text>
            <Image
              source={require("../assets/images/www.png")}
              style={{ height: 12, width: 12, marginTop: 4 }}
            />
          </View>
        </View>
        {messages.map((message, index) => (
          <View
            key={index}
            style={
              message.sender === "user" ? styles.userMessage : styles.botMessage
            }
          >
            <Text>{message.text}</Text>
            <View style={{ paddingBottom: 18 }}>
              <Text style={styles.timestamp}>
                {formatTime(new Date(message.timestamp))}
              </Text>
            </View>
          </View>
        ))}
        {botTyping && (
          <View style={styles.botMessageContainer}>
            <Text style={styles.botMessage}>{botMessage}</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message Mindginie..."
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../assets/images/up-arrow.png")}
              style={
                botTyping
                  ? [styles.btn, { backgroundColor: "red" }]
                  : styles.btn
              }
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  logo: {
    height: 80,
    width: 80,
    borderRadius: 100,
    marginTop: 50,
  },
  shadowContainer: {
    shadowColor: "#F3F7EC",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 53,
    borderRadius: 100,
  },
  heading: {
    fontSize: 25,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 3,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 50,
    marginHorizontal: 40,
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#E2E2E2",
    padding: 10,
    paddingBottom: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginVertical: 5,
    width: "75%",
    position: "relative",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#25A184",
    padding: 10,
    paddingBottom: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginVertical: 5,
    maxWidth: "75%",
    position: "relative",
  },
  timestamp: {
    position: "absolute",
    bottom: 0.5,
    right: 5,
    fontSize: 10,
  },
  bottomContainer: {
    marginHorizontal: 5,
    marginBottom: 5,
    flexDirection: "row",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "85%",
    borderRadius: 20,
    backgroundColor: "#ededeb",
  },
  btn: {
    width: 45,
    height: 45,
    marginLeft: 5,
    marginRight: 10,
    borderRadius: 20,
    opacity: 0.3,
  },
  flexContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    color: "red",
    fontWeight: "bold",
    marginLeft: 10,
    paddingTop: 10,
  },
});

export default ChatBot;
