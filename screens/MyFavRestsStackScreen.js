import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {  Avatar, Button, Card, Title, Paragraph, Text, DefaultTheme } from 'react-native-paper';
import MyFavRestsScreen from './MyFavRestsScreen';
import MyFavRestaurantMenuScreen from './MyFavRestaurantMenuScreen';

const FavRestsStack = createStackNavigator();

const MyFavRestsStackScreen = ({navigation, route}) => {
    return (
        <View style={{ flex: 1, marginTop: Platform.OS === 'ios' ? -10 : 0 }}>
            {/* <StatusBar barStyle={"light-content"}/> */}
            <FavRestsStack.Navigator
            headerMode='screen'
            screenOptions={{
            headerTitle: 
              <Text style={{ fontSize: 14, textAlign: 'center', flex: 1, fontFamily: 'MontserratSemiBold'}}>My Favorite Restaurants</Text>,
            }}
            >
                <FavRestsStack.Screen 
                    name="MyFavRests" 
                    component={MyFavRestsScreen}
                    options={{
                        headerTitleAlign: 'center',
                        headerLeft: () => (
                            <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => { navigation.openDrawer(); }} >
                                <Image
                                style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 0 }}
                                source={require('../assets/icons/menu.png')}
                                fadeDuration={100}
                                />
                            </TouchableOpacity>
                        )
                    }}
                />
                <FavRestsStack.Screen name="FavRestMenu" component={MyFavRestaurantMenuScreen} 
                  options={{
                    headerTitleAlign: 'center',
                    headerTitle: <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', flex: 1, fontFamily: 'MontserratSemiBold'}}>{route?.state?.routes[1]?.params?.restaurantName}</Text>,
                    headerLeft: () => (
                      <TouchableOpacity style={{ marginLeft: 0 }} onPress={() => { navigation.navigate('MyFavRests') 
                      }}>
                        <Image
                          style={{ resizeMode: "contain", flex: 1, marginLeft: 10, width: 50 , height: 50, marginTop: 5, marginLeft: 20 }}
                          source={require('../assets/icons/goback.png')}
                          fadeDuration={100}
                        />
                      </TouchableOpacity>
                        // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
                    )
                  }} 
                />
            </FavRestsStack.Navigator>
        </View>
    )
};

export default MyFavRestsStackScreen;