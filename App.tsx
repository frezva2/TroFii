import React, { useEffect, useCallback } from "react";
import {
  View,
  Image,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { Provider } from "react-redux";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StatusBar } from "expo-status-bar";
import * as AppleAuthentication from "expo-apple-authentication";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { ModalPortal } from "react-native-modals";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";

import {
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
} from "react-native-paper";

import * as Font from "expo-font";

import { DrawerContent } from "./screens/DrawerContent";

import MainTabScreen from "./screens/MainTabScreen";
import MyFavRestsStackScreen from "./screens/MyFavRestsStackScreen";
import CommentsRatingsScreen from "./screens/CommentsRatingsScreen";
import MyPhotosScreen from "./screens/MyPhotosScreen";
import MyAccountScreen from "./screens/MyAccountScreen";
import MyeGiftsScreen from "./screens/MyeGiftsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import EarnRewardsScreen from "./screens/EarnRewardsScreen";
import MyFavTroFiiScreen from "./screens/MyFavTroFiiScreen";
import MyUploadedTroFiiScreen from "./screens/MyUploadedTroFiiScreen";

import { AuthContext } from "./components/context";

import RootStackScreen from "./screens/RootStackScreen";

import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "./store";

import firebase from "firebase/app";

import "firebase/auth";
import "firebase/database";

const width = Dimensions.get("window").width; //full width
const height = Dimensions.get("window").height; //full heigh

WebBrowser.maybeCompleteAuthSession();
const Drawer = createDrawerNavigator();

export default function App() {
  SplashScreen.preventAutoHideAsync();
  const [data, setData] = React.useState({
    userToken: "",
    isLoading: false,
  });
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
  };

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: "#ffffff",
      text: "#333333",
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: "#333333",
      text: "#ffffff",
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const loginReducer = (prevState: any, action: any) => {
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
        };
      case "LOGIN":
        return {
          ...prevState,
          userToken: action.token,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userName: null,
          userToken: null,
        };
      case "REGISTER":
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
        };
      case "READY":
        return {
          ...prevState,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState
  );

  const authContext = React.useMemo(
    () => ({
      signOut: () => {
        Alert.alert(
          "Logout",
          "Are you sure you want to logout? ",
          [
            { text: "No", onPress: () => {}, style: "cancel" },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  let appleState = await AsyncStorage.getItem("appleState");
                  let appleUser = await AsyncStorage.getItem("appleUser");
                  let accessToken = await AsyncStorage.getItem("userToken");
                  await firebase.auth().signOut();
                  await AsyncStorage.removeItem("userToken");
                  await AsyncStorage.removeItem("appleUser");
                  await AsyncStorage.removeItem("appleState");
                  await AsyncStorage.removeItem("apple_token");
                  await AsyncStorage.removeItem("fb_token");
                  await AsyncStorage.removeItem("google_token");

                  if (Platform.OS === "ios") {
                    await AppleAuthentication.signOutAsync({
                      state: appleState,
                      user: appleUser,
                    });
                  }
                } catch ({ message }) {
                  alert("Error: " + message);
                }
              },
            },
          ],
          { cancelable: false }
        );
      },
      toggleTheme: () => {
        setIsDarkTheme((isDarkTheme) => !isDarkTheme);
      },
    }),
    []
  );

  async function prepare() {
    try {
      await SplashScreen.preventAutoHideAsync();
      await Font.loadAsync({
        Montserrat: require("./assets/fonts/Montserrat-Medium.ttf"),
        MontserratReg: require("./assets/fonts/Montserrat-Regular.ttf"),
        MontserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
        MontserratSemiBold: require("./assets/fonts/Montserrat-SemiBold.ttf"),
        BerkshireSwash: require("./assets/fonts/BerkshireSwash-Regular.ttf"),
        Poppins: require("./assets/fonts/Poppins-Medium.ttf"),
      });

      await new Promise((resolve) => setTimeout(resolve, 501));
    } catch (e) {
      console.warn(e);
    } finally {
      setTimeout(() => {
        dispatch({ type: "READY", token: null });
      }, 500);
    }
  }

  useEffect(() => {
    firebase.initializeApp({
      appId: "",
      apiKey: "",
      clientId: "",
      authDomain: "",
      databaseURL: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      measurementId: "",
    });

    setTimeout(async () => {
      await SplashScreen.preventAutoHideAsync();
      await prepare();
    }, 500);
  }, []);
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
    if (!loginState.isLoading) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user !== null) {
          setTimeout(() => {
            setData({
              ...data,
              userToken: user.uid,
              isLoading: true,
            });
          }, 2600);
          dispatch({ type: "RETRIEVE_TOKEN", token: user.uid });
          await SplashScreen.hideAsync();
        } else {
          setTimeout(() => {
            setData({
              ...data,
              userToken: "",
              isLoading: true,
            });
          }, 3500);
          dispatch({ type: "LOGOUT", token: null });
          await SplashScreen.hideAsync();
        }
      });
    }
  }, [loginState.isLoading]);

  const _cacheResourcesAsync = async () => {
    const images = [
      require("./assets/splash_2.png"),
      require("./assets/Trofii-Splash.gif"),
      require("./assets/images/restaurantpost.png"),
      require("./assets/images/homemadepost.png"),
      require("./assets/blur2.jpg"),
    ];

    const cacheImages = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(cacheImages);
  };

  if (loginState.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: loginState.isLoading ? 0 : 1,
            position: loginState.isLoading ? "absolute" : "relative",
            zIndex: loginState.isLoading ? 0 : 1,
          }}>
          <Image
            style={{
              resizeMode: "contain",
              backgroundColor: "#ffffff",
              width,
              height,
            }}
            source={require("./assets/splash_2.png")}
            onLoad={_cacheResourcesAsync}
            fadeDuration={0}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: data.isLoading ? 0 : 1,
          position: data.isLoading ? "absolute" : "relative",
          zIndex: data.isLoading ? 0 : 1,
        }}
        onLayout={onLayoutRootView}>
        <Image
          style={{
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            width,
            height,
          }}
          source={require("./assets/Trofii-Splash.gif")}
          onLoad={_cacheResourcesAsync}
          fadeDuration={0}
        />
      </View>
      <View
        style={{
          flex: data.isLoading ? 1 : 0,
          zIndex: data.isLoading ? 1 : 0,
        }}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
              <StatusBar style="auto" barStyle="dark-content" />
              <NavigationContainer theme={theme}>
                {
                  <Drawer.Navigator
                    drawerStyle={{
                      width: width * 0.8,
                    }}
                    initialRouteName={"HomeDrawer"}
                    drawerContent={(props) => <DrawerContent {...props} />}
                    screenOptions={{
                      headerShown: false,
                      lazy: data.userToken !== "" ? false : true,
                      swipeEnabled: data.userToken !== "" ? true : false,
                    }}>
                    <Drawer.Screen
                      name="HomeDrawer"
                      component={MainTabScreen}
                    />
                    <Drawer.Screen name="LogIn" component={RootStackScreen} />
                    <Drawer.Screen
                      name="MyFavRestsStackScreen"
                      component={MyFavRestsStackScreen}
                    />
                    <Drawer.Screen
                      name="CommentsRatingsScreen"
                      component={CommentsRatingsScreen}
                    />
                    <Drawer.Screen
                      name="MyAccountScreen"
                      component={MyAccountScreen}
                    />
                    <Drawer.Screen
                      name="MyPhotosScreen"
                      component={MyPhotosScreen}
                    />
                    <Drawer.Screen
                      name="MyeGiftsScreen"
                      component={MyeGiftsScreen}
                    />
                    <Drawer.Screen
                      name="SettingsScreen"
                      component={SettingsScreen}
                    />
                    <Drawer.Screen
                      name="MyUploadedTroFiiScreen"
                      component={MyUploadedTroFiiScreen}
                    />
                    <Drawer.Screen
                      name="MyFavTroFiiScreen"
                      component={MyFavTroFiiScreen}
                    />
                    <Drawer.Screen
                      name="EarnRewardsScreen"
                      component={EarnRewardsScreen}
                    />
                  </Drawer.Navigator>
                }
              </NavigationContainer>
              <ModalPortal />
            </AuthContext.Provider>
          </PaperProvider>
        </Provider>
      </View>
    </SafeAreaProvider>
  );
}
