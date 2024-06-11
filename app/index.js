import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ChatbotPage from "../components/ChatBot.js";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Chatbot"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Chatbot" component={ChatbotPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
