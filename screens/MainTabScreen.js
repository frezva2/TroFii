import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  Linking,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import {
  getFocusedRouteNameFromRoute,
  CommonActions,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Title, Paragraph } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "./HomeScreen";
import FindRestaurantScreen from "./FindRestaurantScreen";
import PostPictureScreen from "./PostPictureScreen";
import PostHomemadePictureScreen from "./PostHomemadePictureScreen";
import OptionPostScreen from "./OptionPostScreen";
import MenuItemScreen from "./MenuItemScreen";
import RestaurantSearchScreen from "./RestaurantSearchScreen";
import RestaurantInfoScreen from "./RestaurantInfoScreen";
import RequestNewRestScreen from "./RequestNewRestScreen";
import RestaurantMenuScreen from "./RestaurantMenuScreen";
import RestaurantNotificationsScreen from "./RestaurantNotificationsScreen";
import RestaurantMenuNotificationsScreen from "./RestaurantMenuNotificationsScreen";
import FoodScreen from "./FoodScreen";
import FoodSelectedScreen from "./FoodSelectedScreen";
import NotificationsScreen from "./NotificationsScreen";
import Modal from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import firebase from "firebase/app";

// // Optionally import the services that you want to use
import "firebase/auth";
import "firebase/database";

const HomeStack = createStackNavigator();
const RestaurantStack = createStackNavigator();
const FoodStack = createStackNavigator();
const NotificationsStack = createStackNavigator();
const PostPictureStack = createStackNavigator();

const Tab = createBottomTabNavigator();

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function MainTabScreen({ navigation, route }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  let routeName = getFocusedRouteNameFromRoute(route);
  const insets = useSafeAreaInsets();

  const [state, setState] = React.useState({ open: false });

  const getBadgeNum = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      if (routeName === "Notifications") {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              firebase
                .database()
                .ref(`/users/${currentUser.uid}`)
                .update({
                  Notifications: {
                    tempBadgeNum: 0,
                    notificationsList:
                      snapshot.val().Notifications.notificationsList,
                  },
                });
            }
          });
        navigation.setParams({ tabBarBadge: null });
        navigation.dispatch(CommonActions.setParams({ tabBarBadge: null }));
      } else {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              if (snapshot.val()?.Notifications?.tempBadgeNum === 0) {
                navigation.setParams({ tabBarBadge: null });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: null })
                );
              } else if (snapshot.val()?.Notifications?.tempBadgeNum < 10) {
                navigation.setParams({
                  tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                });
                navigation.dispatch(
                  CommonActions.setParams({
                    tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                  })
                );
              } else if (snapshot.val()?.Notifications?.tempBadgeNum > 9) {
                navigation.setParams({ tabBarBadge: "9+" });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: "9+" })
                );
              }
            }
          });
      }
    }
  };

  async function setAnalytics() {}
  const checkAddPic = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      props.navigation.navigate("FindRestaurant");
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  useEffect(() => {
    getBadgeNum();
    setAnalytics();
    if (expoPushToken === "") {
      registerForPushNotificationsAsync().then(async (token) => {
        setExpoPushToken(token);
      });

      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

      Notifications.addNotificationResponseReceivedListener((response) => {
        navigation.navigate("NotificationsSc", {
          date: response?.notification?.date,
        });
      });
    }
    return () => {};
  }, [expoPushToken, routeName]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      lazy={false}
      activeColor={"#C90611"}
      tabBarOptions={{
        style: {
          flex: 1,
          zIndex: 1000,
          position: "absolute",
          bottom: 10,
          height: 55,
          left: 15,
          right: 15,
          elevation: 2,
          backgroundColor: "white",
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        safeAreaInsets: {
          top: insets.bottom,
          bottom: insets.bottom,
          left: 0,
          right: 0,
        },
        showLabel: false,
        activeTintColor: "#C90611",
        labelStyle: {
          marginRight: 20,
          marginLeft: -15,
        },
        tabStyle: {
          flexDirection: "row",
          marginLeft: -20,
        },
      }}>
      <Tab.Screen
        name="Food"
        component={FoodStackScreen}
        options={{
          tabBarLabel: "TroFii",
          tabBarButton: (props) => <TouchableOpacity {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={{
                marginLeft: width * 0.15,
                width: focused ? width * 0.25 : width * 0.15,
                marginTop: -55,
                flexDirection: "row",
                backgroundColor: focused ? "rgba(238, 91, 100, 0.14)" : "white",
                borderRadius: 25,
                padding: 10,
                height: 40,
                zIndex: -1,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <View style={{ marginTop: -5, zIndex: 1 }}>
                <Icon name="fast-food" color={color} size={size} />
              </View>
              <View style={{ marginTop: -3, marginLeft: 5, zIndex: 1 }}>
                <Text
                  style={{
                    color: "#C90611",
                    fontSize: 10,
                    fontFamily: "Montserrat",
                    marginTop: 1,
                  }}>
                  {focused ? "TroFii" : ""}
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={PostPictureStackScreen}
        options={{
          tabBarLabel: "Camera",
          tabBarButton: (props) => <TouchableOpacity {...props} />,
          tabBarIcon: ({ focused, color, size }) =>
            !focused ? (
              <View
                style={{
                  marginTop: -55,
                  marginLeft: 20,
                  backgroundColor: "#C90611",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                }}>
                <MaterialCommunityIcons
                  resizeMode="contain"
                  name="camera-plus"
                  color={"white"}
                  size={size}
                  style={{ marginTop: 12, marginLeft: 12 }}
                />
              </View>
            ) : (
              <View
                style={{
                  marginTop: -110,
                  zIndex: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 20,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("OptionPostScreen");
                    navigation.navigate("Food");
                  }}>
                  <Image
                    style={{
                      width: 50,
                      height: 50,
                      elevation: 5,
                      borderRadius: 10,
                      marginTop: 0,
                    }}
                    source={require("../assets/images/closed.png")}
                  />
                </TouchableOpacity>
              </View>
            ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackScreen}
        options={{
          tabBarButton: (props) => <TouchableOpacity {...props} />,
          title: "Notifications",
          tabBarBadge: route?.params?.tabBarBadge,
          tabBarBadgeStyle: {
            marginTop: height / width > 1.5 ? -20 : -5,
            marginLeft: height / width > 1.5 ? 35 : -15,
          },
          tabBarLabel: "Notifications",
          tabBarIcon: ({ focused, color, size }) => (
            <View
              style={{
                marginLeft:
                  routeName === "Home" || routeName === "Restaurants"
                    ? 0
                    : focused
                    ? -15
                    : -5,
                width: focused ? width * 0.37 : width * 0.15,
                marginTop: -55,
                flexDirection: "row",
                backgroundColor: focused ? "rgba(238, 91, 100, 0.14)" : "white",
                borderRadius: 25,
                padding: 10,
                height: 40,
                zIndex: -1,
                marginRight: 10,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <View style={{ marginTop: -5, zIndex: 1 }}>
                <Icon name="notifications" color={color} size={size} />
              </View>
              <View style={{ marginTop: -3, marginLeft: 5, zIndex: 1 }}>
                <Text
                  style={{
                    color: "#C90611",
                    fontSize: 10,
                    fontFamily: "Montserrat",
                    marginTop: 1,
                  }}>
                  {focused ? "Notifications " : ""}
                </Text>
              </View>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
  async function registerForPushNotificationsAsync() {
    let token;
    const { currentUser } = firebase.auth();
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    } else if (finalStatus === "granted") {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (currentUser !== null) {
      let updates = {};
      updates["/expoToken"] = token;
      await firebase
        .database()
        .ref("/users/" + currentUser.uid)
        .update(updates);
    }

    return token;
  }
}

export default MainTabScreen;

function HomeStackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              if (snapshot.val()?.Notifications?.tempBadgeNum === 0) {
                navigation.dispatch({
                  ...CommonActions.setParams({ tabBarBadge: null }),
                  source: route?.state?.routes[3]?.key,
                });
              } else if (snapshot.val()?.Notifications?.tempBadgeNum < 10) {
                navigation.dispatch({
                  ...CommonActions.setParams({
                    tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                  }),
                  source: route?.state?.routes[3]?.key,
                });
              } else if (snapshot.val()?.Notifications?.tempBadgeNum > 9) {
                navigation.dispatch({
                  ...CommonActions.setParams({ tabBarBadge: "9+" }),
                  source: route?.state?.routes[3]?.key,
                });
              }
            }
          });
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value")
          .then((snapshot) => {
            if (snapshot.val() !== null) {
              setData({
                ...data,
                userIcon: snapshot.val().image,
                isLogin: false,
              });
            }
          });
      } else {
        setData({ ...data, userIcon: "" });
      }
      navigation.navigate("Camera");
      navigation.navigate("Food");
      navigation.navigate("Notifications");
    });
    return () => {};
  }, [data.isLogin]);
  const canDrawerOpen = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  if (routeName !== undefined) {
    if (
      routeName === "FindRestaurant" ||
      routeName === "MenuItem" ||
      routeName === "SignInScreen" ||
      routeName === "SignUpScreen" ||
      routeName === "RequestNewRestHome"
    ) {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: false });
      }, 1);
    } else {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: true });
      }, 1);
    }
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}>
      <StatusBar style="auto" StatusBarStyle="dark" />
      <HomeStack.Navigator headerMode={"none"}>
        <HomeStack.Screen name="HomeSc" component={HomeScreen} />
      </HomeStack.Navigator>
    </SafeAreaView>
  );
}

function RestaurantStackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    cardIcon: "heart-o",
    isLiked: false,
    cardRestNumFollowers: 0,
    userIcon: "",
    PrivacyPolicy: "",
    TermsConditions: "",
  });
  if (routeName !== undefined) {
    if (
      routeName === "RestaurantInfo" ||
      routeName === "RequestNewRest" ||
      routeName === "RestMenu"
    ) {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: false });
      }, 1);
    } else {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: true });
      }, 1);
    }
  }

  React.useEffect(() => {
    setTimeout(() => {
      checkIsFollow();
      firebase
        .database()
        .ref("/worestsLists/")
        .once("value", (snap) => {
          if (snap.val() !== null) {
            setData({
              ...data,
              PrivacyPolicy: snap.val().PrivacyPolicy,
              TermsConditions: snap.val().TermsConditions,
            });
          }
        });
    }, 100);
    return () => {};
  }, [route]);
  const checkIsFollow = (userIcon, isLogin) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value", (snapshot) => {
            if (
              snapshot.val() !== null &&
              snapshot.val()?.restsList !== undefined
            ) {
              if (
                snapshot
                  .val()
                  .restsList.indexOf(
                    route?.state?.routes[2]?.params?.restaurantUid
                  ) !== -1
              ) {
                setData({
                  ...data,
                  cardIcon: "heart",
                  isLiked: true,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[2]?.params?.RestNumFollowers,
                });
              } else if (
                snapshot
                  .val()
                  .restsList.indexOf(
                    route?.state?.routes[2]?.params?.restaurantUid
                  ) === -1
              ) {
                setData({
                  ...data,
                  cardIcon: "heart-o",
                  isLiked: false,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[2]?.params?.RestNumFollowers,
                });
              } else {
                setData({
                  ...data,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[2]?.params?.RestNumFollowers,
                });
              }
            }
          });
      }
    });
  };
  const followingFunc = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
      const restListRef = firebase
        .database()
        .ref(`/restsList/${route?.state?.routes[2]?.params?.objectID}`);
      const restRef = firebase
        .database()
        .ref(`/users/${route?.state?.routes[2]?.params?.restaurantUid}`);

      let ListOfRests = [];
      let ListOfUsers = [];
      let restFollowingNum = 0;
      userRef.once("value", (snapFirst) => {
        if (snapFirst?.val()?.restFollowingNum !== undefined) {
          restFollowingNum = snapFirst?.val()?.restFollowingNum;
          if (data.cardIcon === "heart-o") {
            restRef.once("value", (snapshot) => {
              if (
                snapFirst !== null &&
                snapFirst?.val()?.restsList !== undefined &&
                snapFirst?.val()?.restsList !== null
              ) {
                if (
                  snapshot !== null &&
                  snapshot?.val()?.followersList !== undefined &&
                  snapshot?.val()?.followersList !== null
                ) {
                  ListOfRests = snapFirst?.val()?.restsList;
                  ListOfUsers = snapshot?.val()?.followersList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                } else {
                  ListOfRests = snapFirst?.val()?.restsList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                }
              } else {
                ListOfRests.push(
                  route?.state?.routes[2]?.params?.restaurantUid
                );
                ListOfUsers.push(currentUser.uid);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum + 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum: restFollowingNum + 1,
                });

                return setData({
                  ...data,
                  isLiked: true,
                  cardIcon: "heart",
                  followerNum: restFollowingNum + 1,
                });
              }
            });
          }
          if (data.cardIcon === "heart") {
            restRef.once("value", (snapshot) => {
              if (snapshot !== null) {
                ListOfRests = snapFirst?.val()?.restsList;
                ListOfUsers = snapshot?.val()?.followersList;

                const idxOfListOfRests = ListOfRests.indexOf(
                  `${route?.state?.routes[2]?.params?.restaurantUid}`
                );
                const idxOfListOfUsers = ListOfUsers.indexOf(
                  `${currentUser.uid}`
                );

                ListOfRests.splice(idxOfListOfRests, 1);
                ListOfUsers.splice(idxOfListOfUsers, 1);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum - 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum - 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum:
                    restFollowingNum === 0 ? 0 : restFollowingNum - 1,
                });

                return setData({
                  ...data,
                  isLiked: false,
                  cardIcon: "heart-o",
                  followerNum: restFollowingNum - 1,
                });
              }
            });
          }
        } else {
          if (data.cardIcon === "heart-o") {
            // if not following this page yet
            restRef.once("value", (snapshot) => {
              if (
                snapFirst !== null &&
                snapFirst?.val()?.restsList !== undefined &&
                snapFirst?.val()?.restsList !== null
              ) {
                if (
                  snapshot !== null &&
                  snapshot?.val()?.followersList !== undefined &&
                  snapshot?.val()?.followersList !== null
                ) {
                  ListOfRests = snapFirst?.val()?.restsList;
                  ListOfUsers = snapshot?.val()?.followersList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                } else {
                  ListOfRests = snapFirst?.val()?.restsList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                }
              } else {
                ListOfRests.push(
                  route?.state?.routes[2]?.params?.restaurantUid
                );
                ListOfUsers.push(currentUser.uid);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum + 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum: restFollowingNum + 1,
                });

                return setData({
                  ...data,
                  isLiked: true,
                  cardIcon: "heart",
                  followerNum: restFollowingNum + 1,
                });
              }
            });
          }
          if (data.cardIcon === "heart") {
            restRef.once("value", (snapshot) => {
              if (snapshot !== null) {
                ListOfRests = snapFirst?.val()?.restsList;
                ListOfUsers = snapshot?.val()?.followersList;

                const idxOfListOfRests = ListOfRests.indexOf(
                  `${route?.state?.routes[2]?.params?.restaurantUid}`
                );
                const idxOfListOfUsers = ListOfUsers.indexOf(
                  `${currentUser.uid}`
                );

                ListOfRests.splice(idxOfListOfRests, 1);
                ListOfUsers.splice(idxOfListOfUsers, 1);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum - 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum - 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum:
                    restFollowingNum === 0 ? 0 : restFollowingNum - 1,
                });

                return setData({
                  ...data,
                  isLiked: false,
                  cardIcon: "heart-o",
                  followerNum: restFollowingNum - 1,
                });
              }
            });
          }
        }
      });
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}>
      <StatusBar barStyle={"light-content"} />
      <RestaurantStack.Navigator
        headerMode={routeName === "RestMenu" ? "screen" : "none"}
        screenOptions={{
          headerTitle: (
            <Text
              style={{
                color: "#C90611",
                fontSize: 30,
                textAlign: "center",
                flex: 1,
                fontFamily: "BerkshireSwash",
              }}>
              TroFii
            </Text>
          ),
        }}>
        <RestaurantStack.Screen
          name="RestaurantSearch"
          component={RestaurantSearchScreen}
          options={{
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity style={{ flex: 1, marginLeft: 20 }}>
                <Image
                  style={{
                    flex: 1,
                    width: 45,
                    marginTop: 5,
                    marginRight: 15,
                    marginBottom: data.userIcon === "" ? 0 : 5,
                    borderRadius: 5,
                  }}
                  source={{
                    uri:
                      data.userIcon === ""
                        ? Image.resolveAssetSource(
                            require("../assets/icons/user2.png")
                          ).uri
                        : data.userIcon,
                    cache: "force-cache",
                  }}
                  fadeDuration={1}
                />
              </TouchableOpacity>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {}}
                  disabled={true}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu_dis.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ),
          }}
        />
        <RestaurantStack.Screen
          name="RestaurantInfo"
          component={RestaurantInfoScreen}
          options={{
            safeAreaInsets: {
              top: 0,
              bottom: insets.bottom,
              left: 0,
              right: 0,
            },
          }}
        />
        <RestaurantStack.Screen
          name="RequestNewRest"
          component={RequestNewRestScreen}
        />
        <RestaurantStack.Screen
          name="RestMenu"
          component={RestaurantMenuScreen}
          options={{
            safeAreaInsets: {
              top: insets.top,
              bottom: insets.bottom,
              left: 0,
              right: 0,
            },
            headerTitleAlign: "center",
            headerTitle: (
              <Text
                style={{
                  color: "black",
                  fontSize: 14,
                  textAlign: "center",
                  flex: 1,
                  fontFamily: "MontserratSemiBold",
                }}>
                {route?.state?.routes[2]?.params?.restaurantName}
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 0 }}
                onPress={() => {
                  navigation.navigate("RestaurantInfo", {
                    compCameFrom: "RestMenu",
                    cardRestNumFollowers: data.cardRestNumFollowers,
                  });
                }}>
                <Image
                  style={{
                    resizeMode: "contain",
                    flex: 1,
                    marginLeft: 10,
                    width: 50,
                    height: 50,
                    marginTop: 5,
                    marginLeft: 20,
                  }}
                  source={require("../assets/icons/goback.png")}
                  fadeDuration={100}
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                style={{ flex: 1, marginRight: 25 }}
                onPress={() => {
                  followingFunc();
                }}>
                {data.isLiked === true ? (
                  <Image
                    style={{ flex: 1, width: 40, height: 40 }}
                    source={require("../assets/icons/heart.png")}
                    fadeDuration={100}
                  />
                ) : (
                  <Image
                    style={{ flex: 1, width: 40, height: 40 }}
                    source={require("../assets/icons/un-heart.png")}
                    fadeDuration={100}
                  />
                )}
              </TouchableOpacity>
            ),
          }}
        />
      </RestaurantStack.Navigator>
      <Modal
        isVisible={data.isLogin}
        animationInTiming={550}
        animationOutTiming={550}
        propagateSwipe
        onModalHide={() => {
          setData({ ...data, isLogin: false });
        }}
        onModalShow={() => {
          setData({ ...data, isLogin: true });
        }}
        backdropColor="black"
        useNativeDriver={true}
        backdropOpacity={0.3}
        hideModalContentWhileAnimating
        onRequestClose={() => {
          setData({ ...data, isLogin: false });
        }}
        style={{
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          borderBottomLeftRadius: 35,
          borderBottomRightRadius: 35,
          overflow: "hidden",
          padding: -5,
          backgroundColor: "transparent",
        }}>
        <ScrollView style={{ backgroundColor: "white" }}>
          <View>
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLogin: false });
              }}
              style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}>
              <Feather name="x" color="gray" size={30} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{ marginTop: 10 }}>
              <Image
                style={{ width: 54.03, height: 47.49, marginTop: 0 }}
                source={require("../assets/icons/danger.png")}
                fadeDuration={100}
              />
            </View>
            <View>
              <Title
                style={{
                  color: "black",
                  fontFamily: "MontserratBold",
                  fontSize: 18,
                  marginTop: 10,
                }}>
                Guest User Alert
              </Title>
            </View>
            <View
              style={{
                marginTop: 0,
                marginLeft: 0,
                width: width * 0.9,
                borderRadius: 35,
              }}>
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                }}>
                <View
                  style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                  <Paragraph style={styles.searchDescStyle}>
                    You are not signed into an account, which means you won’t be
                    able to use 100% of the apps functionalities.{" "}
                  </Paragraph>
                </View>
              </View>
            </View>
            <View
              style={{
                marginTop: 0,
                marginLeft: 0,
                width: width * 0.9,
                borderRadius: 35,
              }}>
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                }}>
                <View
                  style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                  <Paragraph style={styles.searchDescStyle}>
                    As a Guest User you can:{" "}
                  </Paragraph>
                </View>
              </View>
            </View>
            <View
              style={{
                marginTop: 0,
                marginLeft: 0,
                width: width * 0.9,
                borderRadius: 35,
              }}>
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                  flexDirection: "row",
                }}>
                <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                  <Image
                    style={{ width: 9, height: 9, marginTop: 0 }}
                    source={require("../assets/icons/circle.png")}
                    fadeDuration={100}
                  />
                </View>
                <View style={{ width: width * 0.7 }}>
                  <Paragraph style={styles.searchDescStyle2}>
                    Search for your favorite food or restaurants in your area.{" "}
                  </Paragraph>
                </View>
              </View>
            </View>
            <View
              style={{
                marginTop: 0,
                marginLeft: 0,
                width: width * 0.9,
                borderRadius: 35,
              }}>
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                  flexDirection: "row",
                }}>
                <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                  <Image
                    style={{ width: 9, height: 9, marginTop: 0 }}
                    source={require("../assets/icons/circle.png")}
                    fadeDuration={100}
                  />
                </View>
                <View style={{ width: width * 0.7 }}>
                  <Paragraph style={styles.searchDescStyle2}>
                    Look at item ratings and comments.{" "}
                  </Paragraph>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setData({ ...data, isLogin: false });
              props.navigation.navigate("LogIn", {
                screen: "SignUpScreen",
              });
            }}>
            <View
              style={{
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 5,
              }}>
              <LinearGradient
                colors={["#fb8389", "#f70814", "#C90611"]}
                style={styles.linearGradient}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setData({ ...data, isLogin: false });
              props.navigation.navigate("LogIn", {
                screen: "SignInScreen",
              });
            }}
            style={{ marginBottom: 10 }}>
            <View
              style={{
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 5,
              }}>
              <LinearGradient
                colors={["#fff", "#fff", "#fff"]}
                style={styles.linearGradient2}>
                <Text style={styles.buttonText2}>Sign In</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          {Platform.OS === "ios" ? (
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  setData({ ...data, isLogin: false });
                  login("facebook");
                }}>
                <View
                  style={{
                    marginTop: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}>
                  <LinearGradient
                    colors={
                      Platform.OS === "ios"
                        ? ["#fff", "#fff", "#fff"]
                        : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                    }
                    style={styles.linearGradientSocial}>
                    <Image
                      style={{
                        marginLeft: 0,
                        marginTop: 0,
                        width: 20,
                        height: 20,
                      }}
                      source={require("../assets/icons/fb.png")}
                    />
                    <Text style={styles.buttonTextBlack}>
                      Sign in with Facebook
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLogin: false });
                login("google");
              }}>
              <View
                style={{
                  marginTop: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 5,
                }}>
                <LinearGradient
                  colors={
                    Platform.OS === "ios"
                      ? ["#fff", "#fff", "#fff"]
                      : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                  }
                  style={styles.linearGradientSocial}>
                  <Image
                    style={{
                      marginLeft: 0,
                      marginTop: 0,
                      width: 20,
                      height: 20,
                    }}
                    source={require("../assets/icons/google.png")}
                  />
                  <Text style={styles.buttonTextBlack}>
                    Sign in with Google
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>
          {Platform.OS === "ios" ? (
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  setData({ ...data, isLogin: false });
                  login("apple");
                }}>
                <View
                  style={{
                    marginTop: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}>
                  <LinearGradient
                    colors={
                      Platform.OS === "ios"
                        ? ["#fff", "#fff", "#fff"]
                        : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                    }
                    style={styles.linearGradientSocial}>
                    <Image
                      style={{
                        marginLeft: 0,
                        marginTop: 0,
                        width: 20,
                        height: 25,
                      }}
                      source={require("../assets/icons/apple.png")}
                    />
                    <Text style={styles.buttonTextBlack}>
                      Sign in With Apple
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLogin: false });
              }}>
              <Text
                style={{
                  fontSize: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#EE5B64",
                  fontFamily: "MontserratSemiBold",
                }}>
                CONTINUE AS A GUEST
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.9 }}>
            <View
              style={{
                marginTop: 5,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 5,
                backgroundColor: "white",
              }}>
              <View
                style={{ width: width * 0.75, marginTop: 0, marginLeft: 0 }}>
                <Paragraph style={styles.searchDescStyle3}>
                  NOTE: Your email address will be used to create an account to
                  store and keep track of your Reward Points earned and redeemed
                  as well as your saved restaurants.
                </Paragraph>
              </View>
            </View>
          </View>
          <View style={styles.textPrivate}>
            <Text style={styles.color_textPrivate}>
              By signing up you agree to our
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(data.PrivacyPolicy);
              }}>
              <Text
                style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}>
                {" "}
                Privacy policy
              </Text>
            </TouchableOpacity>
            <Text style={styles.color_textPrivate}> and</Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(data.TermsConditions);
              }}>
              <Text
                style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}>
                {" "}
                Terms And Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

function PostPictureStackScreen({ navigation, route }) {
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value")
          .then((snapshot) => {
            if (snapshot.val() !== null) {
              setData({
                ...data,
                userIcon: snapshot.val().image,
                isLogin: false,
              });
            }
          });
      } else {
        setData({ ...data, userIcon: "" });
      }
    });
  }, [data.isLogin]);
  const canDrawerOpen = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  if (routeName !== undefined) {
    if (
      routeName === "FindRestaurant" ||
      routeName === "MenuItem" ||
      routeName === "SignInScreen" ||
      routeName === "SignUpScreen" ||
      routeName === "RequestNewRestHome"
    ) {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: false });
      }, 1);
    } else {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: true });
      }, 1);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, marginTop: 0, zIndex: -1 }}>
      <StatusBar barStyle={"light-content"} />
      <PostPictureStack.Navigator
        headerMode={"none"}
        screenOptions={{
          headerTitle: (
            <Text
              style={{
                color: "#C90611",
                fontSize: 30,
                textAlign: "center",
                flex: 1,
                fontFamily: "BerkshireSwash",
              }}>
              TroFii
            </Text>
          ),
        }}>
        <PostPictureStack.Screen
          name="OptionPostScreen"
          component={OptionPostScreen}
        />
        <PostPictureStack.Screen
          name="PostPictureScreen"
          component={PostPictureScreen}
        />
        <PostPictureStack.Screen
          name="PostHomemadePictureScreen"
          component={PostHomemadePictureScreen}
        />
        <PostPictureStack.Screen
          name="FindRestaurant"
          component={FindRestaurantScreen}
        />
        <PostPictureStack.Screen
          name="MenuItem"
          component={MenuItemScreen}
          options={{
            headerTitleAlign: "center",
            headerTitle: (
              <Text
                style={{
                  color: "black",
                  fontSize: 14,
                  textAlign: "center",
                  flex: 1,
                  fontFamily: "MontserratSemiBold",
                }}>
                {route?.state?.routes[2]?.params?.restaurantName}
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 0 }}
                onPress={() => {
                  navigation.navigate("FindRestaurant");
                }}>
                <Image
                  style={{
                    resizeMode: "contain",
                    flex: 1,
                    marginLeft: 10,
                    width: 50,
                    height: 50,
                    marginTop: 5,
                    marginLeft: 20,
                  }}
                  source={require("../assets/icons/goback.png")}
                  fadeDuration={100}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <PostPictureStack.Screen
          name="RequestNewRestHome"
          component={RequestNewRestScreen}
        />
      </PostPictureStack.Navigator>
    </SafeAreaView>
  );
}

function FoodStackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value")
          .then((snapshot) => {
            if (snapshot.val() !== null) {
              setData({
                ...data,
                userIcon: snapshot.val().image,
                isLogin: false,
              });
            }
          });
      } else {
        setData({ ...data, userIcon: "" });
      }
    });
    return () => {};
  }, [data.isLogin]);
  const canDrawerOpen = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  if (routeName !== undefined) {
    if (
      routeName === "FindRestaurant" ||
      routeName === "MenuItem" ||
      routeName === "SignInScreen" ||
      routeName === "SignUpScreen"
    ) {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: false });
      }, 1);
    } else {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: true });
      }, 1);
    }
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}>
      <StatusBar barStyle={"light-content"} />
      <FoodStack.Navigator
        headerMode={"none"}
        screenOptions={{
          headerTitle: (
            <Text
              style={{
                color: "#C90611",
                fontSize: 30,
                textAlign: "center",
                flex: 1,
                fontFamily: "BerkshireSwash",
              }}>
              TroFii
            </Text>
          ),
        }}>
        <FoodStack.Screen
          name="FoodSc"
          component={FoodScreen}
          options={{
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity style={{ flex: 1, marginLeft: 20 }}>
                <Image
                  style={{
                    flex: 1,
                    width: 45,
                    marginTop: 5,
                    marginRight: 15,
                    marginBottom: data.userIcon === "" ? 0 : 5,
                    borderRadius: 5,
                  }}
                  source={{
                    uri:
                      data.userIcon === ""
                        ? Image.resolveAssetSource(
                            require("../assets/icons/user2.png")
                          ).uri
                        : data.userIcon,
                    cache: "force-cache",
                  }}
                  fadeDuration={1}
                />
              </TouchableOpacity>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {}}
                  disabled={true}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu_dis.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ),
          }}
        />
        <FoodStack.Screen
          name="FoodSelected"
          component={FoodSelectedScreen}
          options={{
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity style={{ flex: 1, marginLeft: 20 }}>
                <Image
                  style={{
                    flex: 1,
                    width: 45,
                    marginTop: 5,
                    marginRight: 15,
                    marginBottom: data.userIcon === "" ? 0 : 5,
                    borderRadius: 5,
                  }}
                  source={{
                    uri:
                      data.userIcon === ""
                        ? Image.resolveAssetSource(
                            require("../assets/icons/user2.png")
                          ).uri
                        : data.userIcon,
                    cache: "force-cache",
                  }}
                  fadeDuration={1}
                />
              </TouchableOpacity>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {}}
                  disabled={true}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu_dis.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ),
          }}
        />
      </FoodStack.Navigator>
    </SafeAreaView>
  );
}

function NotificationsStackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    cardIcon: "heart-o",
    isLiked: false,
    cardRestNumFollowers: 0,
    userIcon: "",
  });

  const getBadgeNum = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      if (routeName === "Notifications") {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              firebase
                .database()
                .ref(`/users/${currentUser.uid}`)
                .update({
                  Notifications: {
                    tempBadgeNum: 0,
                    notificationsList:
                      snapshot.val().Notifications.notificationsList,
                  },
                });
            }
          });
        navigation.dispatch(CommonActions.setParams({ tabBarBadge: null }));
      } else {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              if (snapshot.val()?.Notifications?.tempBadgeNum === 0) {
                navigation.setParams({ tabBarBadge: null });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: null })
                );
              } else if (snapshot.val()?.Notifications?.tempBadgeNum < 10) {
                navigation.setParams({
                  tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                });
                navigation.dispatch(
                  CommonActions.setParams({
                    tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                  })
                );
              } else if (snapshot.val()?.Notifications?.tempBadgeNum > 9) {
                navigation.setParams({ tabBarBadge: "9+" });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: "9+" })
                );
              }
            }
          });
      }
    }
  };
  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      getBadgeNum();
      if (user !== null) {
        checkIsFollow(data.userIcon, data.isLogin);
      } else {
        setData({ ...data, userIcon: "", isLogin: false });
      }
    });
  }, []);
  const canDrawerOpen = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  if (routeName !== undefined) {
    if (
      routeName === "FindRestaurant" ||
      routeName === "MenuItem" ||
      routeName === "SignInScreen" ||
      routeName === "SignUpScreen" ||
      routeName === "RestaurantNotificationsTab" ||
      routeName === "SeeMenuNotificationsTab"
    ) {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: false });
      }, 1);
    } else {
      setTimeout(() => {
        navigation.setOptions({ tabBarVisible: true });
      }, 1);
    }
  }
  const checkIsFollow = (userIcon, isLogin) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value", (snapshot) => {
            if (
              snapshot.val() !== null &&
              snapshot.val()?.restsList !== undefined
            ) {
              if (
                snapshot
                  .val()
                  .restsList.indexOf(
                    route?.state?.routes[1]?.params?.restaurantUid
                  ) !== -1
              ) {
                setData({
                  ...data,
                  cardIcon: "heart",
                  isLiked: true,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[1]?.params?.RestNumFollowers,
                });
              } else if (
                snapshot
                  .val()
                  .restsList.indexOf(
                    route?.state?.routes[1]?.params?.restaurantUid
                  ) === -1
              ) {
                setData({
                  ...data,
                  cardIcon: "heart-o",
                  isLiked: false,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[1]?.params?.RestNumFollowers,
                });
              } else {
                setData({
                  ...data,
                  userIcon,
                  isLogin,
                  cardRestNumFollowers:
                    route?.state?.routes[1]?.params?.RestNumFollowers,
                });
              }
            }
          });
      }
    });
  };
  const followingFunc = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
      const restListRef = firebase
        .database()
        .ref(`/restsList/${route?.state?.routes[2]?.params?.objectID}`);
      const restRef = firebase
        .database()
        .ref(`/users/${route?.state?.routes[2]?.params?.restaurantUid}`);

      let ListOfRests = [];
      let ListOfUsers = [];
      let restFollowingNum = 0;
      userRef.once("value", (snapFirst) => {
        if (snapFirst?.val()?.restFollowingNum !== undefined) {
          restFollowingNum = snapFirst?.val()?.restFollowingNum;
          if (data.cardIcon === "heart-o") {
            // if not following this page yet
            restRef.once("value", (snapshot) => {
              if (
                snapFirst !== null &&
                snapFirst?.val()?.restsList !== undefined &&
                snapFirst?.val()?.restsList !== null
              ) {
                if (
                  snapshot !== null &&
                  snapshot?.val()?.followersList !== undefined &&
                  snapshot?.val()?.followersList !== null
                ) {
                  ListOfRests = snapFirst?.val()?.restsList;
                  ListOfUsers = snapshot?.val()?.followersList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                } else {
                  ListOfRests = snapFirst?.val()?.restsList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                }
              } else {
                ListOfRests.push(
                  route?.state?.routes[2]?.params?.restaurantUid
                );
                ListOfUsers.push(currentUser.uid);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum + 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum: restFollowingNum + 1,
                });

                return setData({
                  ...data,
                  isLiked: true,
                  cardIcon: "heart",
                  followerNum: restFollowingNum + 1,
                });
              }
            });
          }
          if (data.cardIcon === "heart") {
            restRef.once("value", (snapshot) => {
              if (snapshot !== null) {
                ListOfRests = snapFirst?.val()?.restsList;
                ListOfUsers = snapshot?.val()?.followersList;

                const idxOfListOfRests = ListOfRests.indexOf(
                  `${route?.state?.routes[2]?.params?.restaurantUid}`
                );
                const idxOfListOfUsers = ListOfUsers.indexOf(
                  `${currentUser.uid}`
                );

                ListOfRests.splice(idxOfListOfRests, 1);
                ListOfUsers.splice(idxOfListOfUsers, 1);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum - 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum - 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum:
                    restFollowingNum === 0 ? 0 : restFollowingNum - 1,
                });

                return setData({
                  ...data,
                  isLiked: false,
                  cardIcon: "heart-o",
                  followerNum: restFollowingNum - 1,
                });
              }
            });
          }
        } else {
          if (data.cardIcon === "heart-o") {
            // if not following this page yet
            restRef.once("value", (snapshot) => {
              if (
                snapFirst !== null &&
                snapFirst?.val()?.restsList !== undefined &&
                snapFirst?.val()?.restsList !== null
              ) {
                if (
                  snapshot !== null &&
                  snapshot?.val()?.followersList !== undefined &&
                  snapshot?.val()?.followersList !== null
                ) {
                  ListOfRests = snapFirst?.val()?.restsList;
                  ListOfUsers = snapshot?.val()?.followersList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                } else {
                  ListOfRests = snapFirst?.val()?.restsList;

                  ListOfRests.push(
                    route?.state?.routes[2]?.params?.restaurantUid
                  );
                  ListOfUsers.push(currentUser.uid);

                  restListRef.update({
                    RestNumFollowers: snapshot?.val()?.followerNum + 1,
                  });
                  restRef.update({
                    followersList: ListOfUsers,
                    followerNum: snapshot?.val()?.followerNum + 1,
                  });
                  userRef.update({
                    restsList: ListOfRests,
                    restFollowingNum: restFollowingNum + 1,
                  });

                  return setData({
                    ...data,
                    isLiked: true,
                    cardIcon: "heart",
                    followerNum: restFollowingNum + 1,
                  });
                }
              } else {
                ListOfRests.push(
                  route?.state?.routes[2]?.params?.restaurantUid
                );
                ListOfUsers.push(currentUser.uid);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum + 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum: restFollowingNum + 1,
                });

                return setData({
                  ...data,
                  isLiked: true,
                  cardIcon: "heart",
                  followerNum: restFollowingNum + 1,
                });
              }
            });
          }
          if (data.cardIcon === "heart") {
            restRef.once("value", (snapshot) => {
              if (snapshot !== null) {
                ListOfRests = snapFirst?.val()?.restsList;
                ListOfUsers = snapshot?.val()?.followersList;

                const idxOfListOfRests = ListOfRests.indexOf(
                  `${route?.state?.routes[2]?.params?.restaurantUid}`
                );
                const idxOfListOfUsers = ListOfUsers.indexOf(
                  `${currentUser.uid}`
                );

                ListOfRests.splice(idxOfListOfRests, 1);
                ListOfUsers.splice(idxOfListOfUsers, 1);

                restListRef.update({
                  RestNumFollowers: snapshot?.val()?.followerNum - 1,
                });
                restRef.update({
                  followersList: ListOfUsers,
                  followerNum: snapshot?.val()?.followerNum - 1,
                });
                userRef.update({
                  restsList: ListOfRests,
                  restFollowingNum:
                    restFollowingNum === 0 ? 0 : restFollowingNum - 1,
                });

                return setData({
                  ...data,
                  isLiked: false,
                  cardIcon: "heart-o",
                  followerNum: restFollowingNum - 1,
                });
              }
            });
          }
        }
      });
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}>
      <StatusBar barStyle={"light-content"} />
      <NotificationsStack.Navigator
        headerMode={routeName === "SeeMenuNotificationsTab" ? "screen" : "none"}
        screenOptions={{
          headerTitle: (
            <Text
              style={{
                color: "#C90611",
                fontSize: 30,
                textAlign: "center",
                flex: 1,
                fontFamily: "BerkshireSwash",
              }}>
              TroFii
            </Text>
          ),
        }}>
        <NotificationsStack.Screen
          name="NotificationsSc"
          component={NotificationsScreen}
          options={{
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity style={{ flex: 1, marginLeft: 20 }}>
                <Image
                  style={{
                    flex: 1,
                    width: 50,
                    marginTop: 5,
                    marginRight: 15,
                    marginBottom: data.userIcon === "" ? 0 : 5,
                  }}
                  source={{
                    uri: Image.resolveAssetSource(
                      require("../assets/icons/settings.png")
                    ).uri,
                  }}
                  fadeDuration={1}
                />
              </TouchableOpacity>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {}}
                  disabled={true}>
                  <Image
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      width: 50,
                      height: 5,
                      marginTop: 5,
                    }}
                    source={require("../assets/icons/menu_dis.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              ),
          }}
        />
        <NotificationsStack.Screen
          name="RestaurantNotificationsTab"
          component={RestaurantNotificationsScreen}
        />
        <NotificationsStack.Screen
          name="SeeMenuNotificationsTab"
          component={RestaurantMenuNotificationsScreen}
          options={{
            headerTitleAlign: "center",
            headerTitle: (
              <Text
                style={{
                  color: "black",
                  fontSize: 14,
                  textAlign: "center",
                  flex: 1,
                  fontFamily: "MontserratSemiBold",
                }}>
                {route?.state?.routes[1]?.params?.restaurantName}
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 0 }}
                onPress={() => {
                  navigation.navigate(
                    route?.state?.routes[route?.state?.routes?.length - 2]?.name
                  );
                }}>
                <Image
                  style={{
                    resizeMode: "contain",
                    flex: 1,
                    marginLeft: 10,
                    width: 50,
                    height: 50,
                    marginTop: 5,
                    marginLeft: 20,
                  }}
                  source={require("../assets/icons/goback.png")}
                  fadeDuration={100}
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View>
                <TouchableOpacity
                  style={{ flex: 1, marginRight: 25 }}
                  onPress={() => {
                    followingFunc();
                  }}>
                  {data.isLiked === true ? (
                    <Image
                      style={{ flex: 1, width: 40, height: 40 }}
                      source={require("../assets/icons/heart.png")}
                      fadeDuration={100}
                    />
                  ) : (
                    <Image
                      style={{ flex: 1, width: 40, height: 40 }}
                      source={require("../assets/icons/un-heart.png")}
                      fadeDuration={100}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ),
          }}
        />
      </NotificationsStack.Navigator>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  searchDescStyle: {
    textAlign: "left",
    fontSize: 14,
    marginLeft: 15,
    width: width * 0.75,
    borderRadius: 40,
    fontFamily: "MontserratReg",
    color: "rgba(0, 0, 0, 0.39)",
  },
  color_textPrivateBold: {
    color: "#C90611",
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
  },
  color_textPrivate: {
    color: "grey",
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
  },
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 40,
    marginBottom: 30,
    width: width * 0.75,
  },
  searchDescStyle2: {
    textAlign: "left",
    fontSize: 12,
    marginLeft: 15,
    width: width * 0.7,
    borderRadius: 40,
    fontFamily: "Poppins",
    color: "black",
  },
  searchDescStyle3: {
    textAlign: "center",
    fontSize: 12,
    marginLeft: 15,
    width: width * 0.7,
    borderRadius: 40,
    fontFamily: "Poppins",
    color: "rgba(0, 0, 0, 0.39)",
  },
  linearGradientSocial: {
    flexDirection: "row",
    height: 50,
    borderWidth: 1,
    borderColor: Platform.OS === "ios" ? "black" : "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    width: width * 0.75,
  },
  buttonTextBlack: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#000",
    backgroundColor: "transparent",
  },
  linearGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.75,
  },
  button: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  buttonText2: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#C90611",
    backgroundColor: "transparent",
  },
  linearGradient2: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.75,
    borderColor: "#C90611",
    borderWidth: 1,
  },
});
