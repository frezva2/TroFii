import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  Linking,
  TouchableHighlight,
} from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
  useFocusEffect,
  CommonActions,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import {
  Title,
  Paragraph,
  DefaultTheme,
  useTheme,
  FAB,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "./HomeScreen";
import * as actions from "../actions";
import Constants from "expo-constants";
import { connect } from "react-redux";
import FindRestaurantScreen from "./FindRestaurantScreen";
import PostPictureScreen from "./PostPictureScreen";
import PostHomemadePictureScreen from "./PostHomemadePictureScreen";
import OptionPostScreen from "./OptionPostScreen";
import MenuItemScreen from "./MenuItemScreen";
import RestaurantSearchScreen from "./RestaurantSearchScreen";
import RestaurantInfoScreen from "./RestaurantInfoScreen";
import RequestNewRestScreen from "./RequestNewRestScreen";
import MyAccountScreen from "./MyAccountScreen";
import RestaurantMenuScreen from "./RestaurantMenuScreen";
import RestaurantNotificationsScreen from "./RestaurantNotificationsScreen";
import RestaurantMenuNotificationsScreen from "./RestaurantMenuNotificationsScreen";
import FoodScreen from "./FoodScreen";
import FoodSelectedScreen from "./FoodSelectedScreen";
// import * as Analytics from 'expo-firebase-analytics';
// import Branch from 'expo-branch';
import NotificationsScreen from "./NotificationsScreen";
import Modal from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
// import Branch, { BranchEvent } from 'expo-branch';
// import * as firebase from 'firebase';
// import * as Device from 'expo-device';

import firebase from "firebase/app";

// import { BottomTabBarWrapper, MultiBarButton, MultiBarProvider } from 'react-native-multibar';

// // Optionally import the services that you want to use
import "firebase/auth";
import "firebase/database";

import { AuthContext } from "../components/context";

import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";

// import * as Facebook from 'expo-auth-session/providers/facebook';
// import { ResponseType } from 'expo-auth-session';

const HomeStack = createStackNavigator();
const RestaurantStack = createStackNavigator();
const FoodStack = createStackNavigator();
const NotificationsStack = createStackNavigator();
const PostPictureStack = createStackNavigator();

const Tab = createBottomTabNavigator();

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

// const socialLogin = (props) => {
//   console.log(props)
// const googleLogin = () => {props.googleLogin}
// function  facebookLogin () {props.facebookLogin}
// function  appleLogin () {props.appleLogin}
// }
// socialLogin = connect(null, actions)(socialLogin)
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
  const notificationListener = useRef();
  const responseListener = useRef();
  let routeName = getFocusedRouteNameFromRoute(route);
  const { currentUser } = firebase.auth();
  const insets = useSafeAreaInsets();

  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  const getBadgeNum = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      // // // sendPushNotification(token, title, body, type, image, data, userUID)
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
        // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: null })});
      } else {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              if (snapshot.val()?.Notifications?.tempBadgeNum === 0) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: null }});
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: null })});
                navigation.setParams({ tabBarBadge: null });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: null })
                );
                // this.props.navigation.setParams({ tabBarBadge: null })
              } else if (snapshot.val()?.Notifications?.tempBadgeNum < 10) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: snapshot.val().Notifications.tempBadgeNum }});
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: snapshot?.val()?.Notifications?.tempBadgeNum })});
                navigation.setParams({
                  tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                });
                navigation.dispatch(
                  CommonActions.setParams({
                    tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                  })
                );
                // this.props.navigation.setParams({ tabBarBadge: snapshot.val().Notifications.tempBadgeNum })
              } else if (snapshot.val()?.Notifications?.tempBadgeNum > 9) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: '9+' }});
                // navigation.dispatch(CommonActions.setParams({ tabBarBadge: '9+' }));
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: '9+' })});
                navigation.setParams({ tabBarBadge: "9+" });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: "9+" })
                );
                // this.props.navigation.setParams({ tabBarBadge: '9+' })
              }
            }
          });
      }
    }
  };
  // async function createBranchUniversalObject(id) {
  //   await Branch.createBranchUniversalObject(
  //     `${id}`,
  //     {
  //       title: 'start',
  //       // This metadata can be used to easily navigate back to this screen
  //       // when implementing deep linking with `Branch.subscribe`.
  //       metadata: {
  //         screen: 'articleScreen',
  //         params: JSON.stringify({ articleId: id }),
  //       },
  //     }
  //   );
  //   console.log(id)
  // }

  async function setAnalytics() {
    const { currentUser } = firebase.auth();
    // if (currentUser !== null) {
    //   await Analytics.setUserId(currentUser.uid);
    //   await Analytics.setAnalyticsCollectionEnabled(true);
    // }
    // firebase.auth().onAuthStateChanged(async(user) => {
    //   if (user !== null) {
    //     if (Platform.OS !== 'android') {
    //       await Amplitude.setUserIdAsync(user.uid);
    //       await Amplitude.logEventAsync(user.uid);
    //     }
    //     // await Analytics.setUserId(user.uid);
    //     // await createBranchUniversalObject(user.uid);
    //     // Analytics.logEvent('first_open');
    //   } else {
    //     if (Platform.OS !== 'android') {
    //       await Amplitude.logEventAsync('Unsigned User');
    //     }
    //     // await Analytics.setUserId();
    //     // await createBranchUniversalObject('Unsigned User');
    //     // Analytics.logEvent('first_open');
    //   }
    // })
  }
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

      // notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        // console.log('addNotificationReceivedListener: ',notification);
      });

      // responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigation.navigate("NotificationsSc", {
          date: response?.notification?.date,
        });

        // props.navigation.navigate(
        //   'HomeDrawer',
        // {
        //   screen: 'Notifications',
        //   params: {
        //     screen: 'NotificationsSc',
        //     params: {
        //       date: response?.notification?.date
        //     },
        //   },
        // }
        // );

        // console.log('addNotificationResponseReceivedListener:',response);
      });
    }
    return () => {
      // Notifications.removeNotificationSubscription(notificationListener.current);
      // Notifications.removeNotificationSubscription(responseListener.current);
    };
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
      }}
    >
      {/* <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          // component={connect(null, actions)(HomeStackScreen)}
          // initialParams={{ props: props }}
          // initialParams={{ googleLogin: props.googleLogin, facebookLogin: props.facebookLogin, appleLogin: props.appleLogin }}
          options={{
            tabBarLabel: 'Home',
            tabBarButton: props => <TouchableOpacity {...props} />,
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ marginLeft: routeName === 'Restaurants' ? 0 : focused ? 50 : 40, width: focused ? width * 0.25 : width * 0.15 , marginTop: Platform.OS === 'ios' ? ((height / width) > 1.5 ? -50 : -3) : -48, flexDirection: 'row', backgroundColor: focused ? 'rgba(238, 91, 100, 0.14)' : 'white', borderRadius: 25, padding: 10, height: 40, zIndex: -1, justifyContent: 'center', alignItems: 'center'  }}> 
                <View style={{ marginTop: -5, zIndex: 1 }}>
                  <Icon name="ios-home" color={color} size={size} />
                </View>
                <View style={{ marginTop: -3, marginLeft: 5, zIndex: 1 }}>
                  <Text style={{ color: '#C90611', fontSize: 10, fontFamily: 'Montserrat', marginTop: 1 }}>{focused ? 'Home' : ''}</Text>
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Restaurants"  
          component={RestaurantStackScreen}
          options={{
            tabBarLabel: 'Restaurants',
            tabBarButton: props => <TouchableOpacity {...props} />, 
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ marginLeft: (routeName === 'Food' || routeName === 'Notifications') ? 25 : focused ? 0 : 50, width: focused ? width * 0.31 : width * 0.15 , marginTop: Platform.OS === 'ios' ? ((height / width) > 1.5 ? -50 : -3) : -48, flexDirection: 'row', backgroundColor: focused ? 'rgba(238, 91, 100, 0.14)' : 'white', borderRadius: 25, padding: 10, height: 40, zIndex: -1, justifyContent: 'center', alignItems: 'center' }}> 
                <View style={{ marginTop: -5, zIndex: 1 }}>
                  <Icon name="ios-restaurant" color={color} size={size} />
                </View>
                <View style={{ marginTop: -3, marginLeft: 5, zIndex: 1 }}>
                  <Text style={{ color: '#C90611', fontSize: 10, fontFamily: 'Montserrat', marginTop: 1 }}>{focused ? 'Restaurants' : ''}</Text>
                </View>
              </View>
            ),
          }}
        /> */}
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
              }}
            >
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
                  }}
                >
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
          tabBarIcon: ({ focused, color, size }) => (
              !focused ? 
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
                  }}
                >
                      <MaterialCommunityIcons
                        resizeMode="contain"
                        name="camera-plus"
                        color={"white"}
                        size={size}
                        style={{ marginTop: 12, marginLeft: 12 }}
                      />
                </View>
              : 
              <View style={{ marginTop: -110, zIndex: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("OptionPostScreen");
                    navigation.navigate("Food");
                  }}
                >
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
            // <FAB.Group
            // visible={true}
            // // fabStyle={{ }}
            // // style={{ marginBottom: 27}}
            // open={open}
            // icon={open ? 'calendar-today' : 'plus'}
            // actions={[
            //   { icon: 'plus', onPress: () => console.log('Pressed add') },
            //   {
            //     icon: 'star',
            //     label: 'Star',
            //     onPress: () => console.log('Pressed star'),
            //   },
            //   {
            //     icon: 'email',
            //     label: 'Email',
            //     onPress: () => console.log('Pressed email'),
            //   },
            //   {
            //     icon: 'bell',
            //     label: 'Remind',
            //     onPress: () => console.log('Pressed notifications'),
            //   },
            //   ]}
            //   onStateChange={onStateChange}
            //   onPress={() => {
            //     if (open) {
            //       // do something if the speed dial is open
            //     }
            //   }}
            // />
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
              }}
            >
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
                  }}
                >
                  {focused ? "Notifications " : ""}
                </Text>
              </View>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
  // async function schedulePushNotification() {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "You've got mail! 📬",
  //       body: 'Here is the notification body',
  //       data: { data: 'goes here' },
  //     },
  //     trigger: { seconds: 2 },
  //   });
  // }

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
      // alert('Failed to get push token for push notification!');
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
      // console.log(token);
    }

    return token;
  }
}

// function mapStateToProps({ auth }) {
// 	return { token: auth.token };
// }

// export default connect(null, actions)(MainTabScreen);
export default MainTabScreen;

function HomeStackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // const { signOut } = React.useContext(AuthContext);
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  // if (data.tempDataCame !== route?.state?.routes[0]?.params?.dataCame) {
  //   if (route?.state?.routes[0]?.params?.dataCame !== undefined) {
  //     setData({ ...data, dataCame: route?.state?.routes[0]?.params?.dataCame, tempDataCame: route?.state?.routes[0]?.params?.dataCame });
  //     console.log(route?.state?.routes[0]?.params?.dataCame, ', ', data.dataCame, ', ', data.tempDataCame);
  //   }
  // }
  React.useEffect(() => {
    // console.log(insets)
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
                // this.props.navigation.setParams({ tabBarBadge: null })
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
      // navigation.navigate('Restaurants');
      navigation.navigate("Camera");
      navigation.navigate("Food");
      navigation.navigate("Notifications");
      // navigation.navigate('Home');
    });
    return () => {
      // console.log('unmounting...');
      // setData({ ...data, userIcon: '' })
    };
  }, [data.isLogin]);
  // }, [data.isLogin, route?.state?.routes[0]?.params?.dataCame]);
  // console.log(route.state.routeNames);
  // const login = (type) => {
  //   if (type === 'facebook') {
  //     route.params.facebookLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   else if (type === 'google') {
  //     // route.params.googleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   if (type === 'apple') {
  //     route.params.appleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  // }
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
      }}
    >
      <StatusBar style="auto" StatusBarStyle="dark" />
      <HomeStack.Navigator
        headerMode={"none"}
        // screenOptions={{
        //   headerTitle:
        //     <Text style={{ color: '#C90611', fontSize: 30, textAlign: 'center', flex: 1, fontFamily: 'BerkshireSwash'}}>TroFii</Text>,
        //     // headerStyle: {
        //     //   backgroundColor: '#white',
        //     //   height: 55
        //     // }
        // }}
      >
        <HomeStack.Screen
          name="HomeSc"
          component={HomeScreen}
          // initialParams={{ userToken: route?.params?.props?.route?.params?.userToken }}
          // options={{
          //   headerTitleAlign: 'center',
          //   headerRight: () => (
          //     <TouchableOpacity style={{flex: 1, marginLeft: 20 }}
          //       // onPress={() => {
          //         // const auth = getAuth();
          //         // console.log(auth)
          //         // signOut().then( async () => {
          //           // await AsyncStorage.removeItem('userToken');
          //         // //   // Sign-out successful.
          //         // }).catch((error) => {
          //         // //   // An error happened.
          //         //   console.log(error)
          //         // });
          //         // firebase.auth().signOut();
          //       //   signOut()
          //       // }}
          //       >
          //       <Image
          //         style={{ flex: 1, width: 45, marginTop: 5, marginRight: 15, marginBottom: data.userIcon === '' ? 0 : 5, borderRadius: 5 }}
          //         source={{ uri: data.userIcon === '' ? Image.resolveAssetSource(require('../assets/icons/user2.png')).uri : data.userIcon, cache: 'force-cache' }}
          //         fadeDuration={1}
          //       />
          //     </TouchableOpacity>
          //       // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
          //   ),
          //   headerLeft: () => (
          //       data.userIcon !== '' ?
          //         <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => { canDrawerOpen(); Keyboard.dismiss(); }} >
          //           <Image
          //             style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
          //             source={require('../assets/icons/menu.png')}
          //             fadeDuration={100}
          //           />
          //         </TouchableOpacity>
          //       :
          //         <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => {}} disabled={true}>
          //           <Image
          //             style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
          //             source={require('../assets/icons/menu_dis.png')}
          //             fadeDuration={100}
          //           />
          //         </TouchableOpacity>
          //     )
          //       // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>

          //   }}
        />
        {/* <HomeStack.Screen name="FindRestaurant" component={FindRestaurantScreen} options={{
                headerTitleAlign: 'center',
                headerTitle: <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', flex: 1, fontFamily: 'MontserratSemiBold'}}>Locations</Text>,
                headerRight: () => (
                  <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => { navigation.navigate('HomeSc') }} >
                    <Text style={{ color: 'black', fontSize: 14, fontFamily: 'Montserrat', marginRight: 20 }}>Cancel</Text>
                  </TouchableOpacity>
                    // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
                ),
                headerLeft: () => (
                  <View style={{flex: 1, marginLeft: 0 }} >
                    <Image
                      style={{ resizeMode: "contain", flex: 1, marginLeft: 10, width: 25 , height: 25, marginTop: 5, marginLeft: 20 }}
                      source={require('../assets/icons/loc_map.png')}
                      fadeDuration={100}
                    />
                  </View>
                    // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
                )
                }} 
              />
              <HomeStack.Screen name="MenuItem" component={MenuItemScreen} options={{
                headerTitleAlign: 'center',
                headerTitle: <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', flex: 1, fontFamily: 'MontserratSemiBold'}}>{route?.state?.routes[2]?.params?.restaurantName}</Text>,
                headerLeft: () => (
                  <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => { navigation.navigate('FindRestaurant') }}>
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
              <HomeStack.Screen name="RequestNewRestHome" component={RequestNewRestScreen}/> */}
        {/* <HomeStack.Screen name="SignInScreen" component={SignInScreen}/>
              <HomeStack.Screen name="SignUpScreen" component={SignUpScreen}/> */}
      </HomeStack.Navigator>
      {/* <Modal  
            isVisible={data.isLogin}
            animationInTiming={550}
            animationOutTiming={550} 
            propagateSwipe
            onModalHide={() => { setData({ ...data, isLogin: false }); }}
            onModalShow={() => { setData({ ...data, isLogin: true }); }}
            // onBackdropPress={() => { setData({ ...data, isLogin: false }); }} 
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={0.3}
            hideModalContentWhileAnimating
            onRequestClose={() => { setData({ ...data, isLogin: false }); }} 
            style={{
                borderTopLeftRadius: 35,
                borderTopRightRadius: 35,
                borderBottomLeftRadius: 35,
                borderBottomRightRadius: 35,
                overflow: 'hidden',
                padding: -5,
                backgroundColor: 'transparent'
            }}
        >
          <ScrollView style={{ backgroundColor: 'white' }}>
                <View>
                  <TouchableOpacity
                      onPress={() => { setData({ ...data, isLogin: false }); }}
                      style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}
                    >
                      <Feather 
                          name="x"
                          color="gray"
                          size={30}
                      />
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ marginTop: 10 }}>
                      <Image
                      style={{ width: 54.03, height: 47.49, marginTop: 0 }}
                      source={require('../assets/icons/danger.png')}
                      fadeDuration={100}
                      />
                  </View>
                  <View>
                      <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 10 }}>Guest User Alert</Title>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                              <Paragraph 
                                style={styles.searchDescStyle}
                              >You are not signed into an account, which means you won’t be able to use 100% of the apps functionalities. </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                              <Paragraph 
                                style={styles.searchDescStyle}
                              >As a Guest User you can: </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                          <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                              <Image
                              style={{ width: 9, height: 9, marginTop: 0 }}
                              source={require('../assets/icons/circle.png')}
                              fadeDuration={100}
                              />
                          </View>              
                          <View style={{ width: width * 0.70 }}>
                              <Paragraph 
                                style={styles.searchDescStyle2}
                              >Search for your favorite food or restaurants in your area. </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                          <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                              <Image
                              style={{ width: 9, height: 9, marginTop: 0 }}
                              source={require('../assets/icons/circle.png')}
                              fadeDuration={100}
                              />
                          </View>              
                          <View style={{ width: width * 0.70 }}>
                              <Paragraph 
                                style={styles.searchDescStyle2}
                              >Look at item ratings and comments. </Paragraph>
                          </View>
                      </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                  //  navigation.navigate({name:'SignUpScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); 
                    setData({ ...data, isLogin: false });
                    navigation.navigate(
                      'LogIn', 
                    {
                      screen: 'SignUpScreen',
                    }
                  );
                  }} 
                >
                    <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient colors={['#fb8389', '#f70814', '#C90611']} 
                        style={styles.linearGradient}
                        >
                            <Text 
                            style={styles.buttonText}
                            >Sign Up</Text>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>  
                <TouchableOpacity 
                  onPress={() => { 
                    // navigation.navigate({name:'SignInScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false }); }} style={{ marginBottom: 10 }}
                    navigation.navigate(
                      'LogIn', 
                        {
                          screen: 'SignInScreen'
                        }
                    );
                    setData({ ...data, isLogin: false });
                  }}
                  >
                    <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient colors={['#fff', '#fff', '#fff']} 
                        style={styles.linearGradient2}
                        >
                            <Text 
                            style={styles.buttonText2}
                            >Sign In</Text>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>
                <View style={styles.button} >
                    <TouchableOpacity 
                        onPress={() =>{ login('facebook')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                            <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                <Text style={styles.buttonTextBlack}>Sign In With Facebook</Text>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/fb.png')}
                                />
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.button} >
                    <TouchableOpacity 
                    onPress={() =>{ login('google')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                            <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                <Text style={styles.buttonTextBlack}>Sign In With Google</Text>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/google.png')}
                                />
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                {
                  Platform.OS === 'ios' ? 
                      <View style={styles.button} >
                          <TouchableOpacity 
                          onPress={() =>{ login('apple')}}
                          >
                              <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                                  <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                      <Text style={styles.buttonTextBlack}>Sign In With Apple</Text>
                                      <Image
                                          style={{ marginLeft: 0, marginTop: 0, width: 20, height: 25 }}
                                          source={require('../assets/icons/apple.png')}
                                      />
                                  </LinearGradient>
                              </View>
                          </TouchableOpacity>
                      </View>
                  : null
                }
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => { setData({ ...data, isLogin: false }); }}>
                        <Text style={{ fontSize: 12, justifyContent: 'center', alignItems: 'center', color: '#EE5B64', fontFamily: 'MontserratSemiBold' }}>CONTINUE AS A GUEST</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90 }}>
                    <View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center',  marginBottom: 5, backgroundColor: 'white' }}>               
                        <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 0 }}>
                            <Paragraph 
                              style={styles.searchDescStyle3}
                            >NOTE: Your email address will be used to create an account to store and keep track of your Reward Points earned and redeemed as well as your saved restaurants.</Paragraph>
                        </View>
                    </View>
                </View>
                <View style={styles.textPrivate}>
                    <Text style={styles.color_textPrivate}>
                        By signing up you agree to our
                    </Text>
                    <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
                    <Text style={styles.color_textPrivate}>{" "}and</Text>
                    <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Terms And Conditions</Text>
                </View>
          </ScrollView>
        </Modal> */}
    </SafeAreaView>
  );
}

// HomeStackScreen = connect(null, actions)(HomeStackScreen)

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
      // console.log('checkIsFollow')
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
    return () => {
      // console.log('unmounting...');
    };
  }, [route]);
  // React.useEffect( () => {
  //   firebase.auth().onAuthStateChanged((user) => {
  //     if (user !== null) {
  //       firebase.database().ref(`/users/${user.uid}`).once('value').then((snapshot) => {
  //         if (snapshot.val() !== null) {
  //           setData({ ...data, userIcon: snapshot.val().image, isLogin: false});
  //           checkIsFollow(snapshot.val().image, false);
  //         }
  //       })
  //     } else {
  //       setData({ ...data, userIcon: '' })
  //     }
  //   })
  //   return () => {
  //     // console.log('unmounting...');
  //     // setData({ ...data, userIcon: '' })
  //   }
  // }, [data.isLogin, route?.state?.routes[2]?.params]);

  // const canDrawerOpen = async () => {
  //   const userToken = await AsyncStorage.getItem('userToken');
  //   if (userToken !== null) {
  //     navigation.openDrawer();
  //   } else {
  //     setData({ ...data, isLogin: true });
  //   }
  // }
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
  // const followingFunc2 = () => {
  //   const { currentUser } = firebase.auth();
  //   let userRef;
  //   if (currentUser !== null) {
  //     userRef = firebase.database().ref(`/users/${currentUser.uid}`);
  //     const restListRef = firebase.database().ref(`/restsList/${route?.state?.routes[2]?.params?.objectID}`);
  //     const restRef = firebase.database().ref(`/users/${route?.state?.routes[2]?.params?.restaurantUid}`);
  //     let restFollowersList = [];
  //     let idxOfFollowerList = [];
  //     restRef.once('value', (snapFirst) => {
  //       restFollowersList = snapFirst.val().followersList;
  //       if (data.cardIcon === 'heart-o') {
  //         userRef.once('value', (snapshot) => {
  //         if (snapshot !== null && restFollowersList !== undefined && restFollowersList !== null) {
  //             const ListOfRests = snapshot.val().restsList;
  //             ListOfRests.push(route?.state?.routes[2]?.params?.restaurantUid);
  //             userRef.update({ restsList: ListOfRests, followerNum: (snapshot.val().followerNum + 1) });
  //             restListRef.update({ RestNumFollowers: (data.cardRestNumFollowers + 1) });
  //             restRef.update({ followerNum: (data.cardRestNumFollowers + 1), followersList: restFollowersList.concat(`${currentUser.uid}`) });
  //             return (
  //               setData({ ...data, cardIcon: 'heart', isLiked: true, cardRestNumFollowers: data.cardRestNumFollowers + 1 })
  //             );
  //           }
  //         });
  //       }
  //       if (data.cardIcon === 'heart' && data.cardRestNumFollowers !== 0) {
  //           userRef.once('value', (snapshot) => {
  //             if (snapshot !== null) {
  //               const ListOfRests = snapshot .val().restsList;
  //               const idx = ListOfRests.indexOf(route?.state?.routes[2]?.params?.restaurantUid);
  //               if (restFollowersList !== undefined) {
  //                 idxOfFollowerList = restFollowersList.indexOf(`${currentUser.uid}`);
  //                 restFollowersList.splice(idxOfFollowerList, 1);
  //                 if (idx !== -1) {
  //                   ListOfRests.splice(idx, 1);
  //                   if (ListOfRests.length === 0) {
  //                     if (restFollowersList.length === 0) {
  //                       userRef.update({ restsList: { 0: '_' }, followerNum: 0 });
  //                       restRef.update({ followerNum: 0, followersList: { 0: '_' } });
  //                       restListRef.update({ RestNumFollowers: 0 });
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: data.cardRestNumFollowers - 1 })
  //                       );
  //                     }
  //                     else {
  //                       userRef.update({ restsList: { 0: '_' }, followerNum: 0 });
  //                       restRef.update({ followerNum: (data.cardRestNumFollowers - 1), followersList: restFollowersList });
  //                       restListRef.update({ RestNumFollowers: (data.cardRestNumFollowers - 1) });
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: data.cardRestNumFollowers - 1 })
  //                       );
  //                     }
  //                   }
  //                   else {
  //                       if (restFollowersList.length === 0) {
  //                         userRef.update({ restsList: ListOfRests, followerNum: (data.cardRestNumFollowers - 1) });
  //                         restListRef.update({ RestNumFollowers: 0 });
  //                         restRef.update({ followerNum: 0, followersList: { 0: '_' } });
  //                         return (
  //                             setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: data.cardRestNumFollowers - 1 })
  //                         );
  //                       }
  //                     else {
  //                       userRef.update({ restsList: ListOfRests, followerNum: (data.cardRestNumFollowers - 1) });
  //                       restRef.update({ followerNum: (data.cardRestNumFollowers - 1), followersList: restFollowersList });
  //                       restListRef.update({ RestNumFollowers: (data.cardRestNumFollowers - 1) });
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: data.cardRestNumFollowers - 1 })
  //                       );
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           });
  //         }
  //       });
  //     }
  //     else {
  //         setData({ ...data, isLogin: true });
  //       }
  //   }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}
    >
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
              }}
            >
              TroFii
            </Text>
          ),
          // headerStyle: {
          //   backgroundColor: '#white',
          //   height: 55
          // }
        }}
      >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}
                >
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
                  disabled={true}
                >
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
                }}
              >
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
                }}
              >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerRight: () => (
              <TouchableOpacity
                style={{ flex: 1, marginRight: 25 }}
                onPress={() => {
                  //  await isOpen(props.route.params.finalResults.restName)
                  followingFunc();
                }}
              >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
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
        // onBackdropPress={() => { setData({ ...data, isLogin: false }); }}
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
        }}
      >
        <ScrollView style={{ backgroundColor: "white" }}>
          <View>
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLogin: false });
              }}
              style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}
            >
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
                }}
              >
                Guest User Alert
              </Title>
            </View>
            <View
              style={{
                marginTop: 0,
                marginLeft: 0,
                width: width * 0.9,
                borderRadius: 35,
              }}
            >
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                }}
              >
                <View
                  style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}
                >
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
              }}
            >
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                }}
              >
                <View
                  style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}
                >
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
              }}
            >
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                  flexDirection: "row",
                }}
              >
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
              }}
            >
              <View
                style={{
                  marginTop: 5,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginBottom: 5,
                  backgroundColor: "white",
                  flexDirection: "row",
                }}
              >
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
              // props.navigation.navigate({name:'SignUpScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false });
              setData({ ...data, isLogin: false });
              props.navigation.navigate("LogIn", {
                screen: "SignUpScreen",
                // params: {
                //   screen: 'SignUpScreen',
                // params: {
                //   screen: 'Media',
                // },
                // },
              });
            }}
          >
            <View
              style={{
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <LinearGradient
                colors={["#fb8389", "#f70814", "#C90611"]}
                style={styles.linearGradient}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // props.navigation.navigate({name:'SignInScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false });
              setData({ ...data, isLogin: false });
              props.navigation.navigate("LogIn", {
                screen: "SignInScreen",
              });
            }}
            style={{ marginBottom: 10 }}
          >
            <View
              style={{
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <LinearGradient
                colors={["#fff", "#fff", "#fff"]}
                style={styles.linearGradient2}
              >
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
                }}
              >
                <View
                  style={{
                    marginTop: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <LinearGradient
                    colors={
                      Platform.OS === "ios"
                        ? ["#fff", "#fff", "#fff"]
                        : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                    }
                    style={styles.linearGradientSocial}
                  >
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
              }}
            >
              <View
                style={{
                  marginTop: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <LinearGradient
                  colors={
                    Platform.OS === "ios"
                      ? ["#fff", "#fff", "#fff"]
                      : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                  }
                  style={styles.linearGradientSocial}
                >
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
                }}
              >
                <View
                  style={{
                    marginTop: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <LinearGradient
                    colors={
                      Platform.OS === "ios"
                        ? ["#fff", "#fff", "#fff"]
                        : ["#f2f2f2", "#f2f2f2", "#e6e6e6"]
                    }
                    style={styles.linearGradientSocial}
                  >
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
          {/* {
                  Platform.OS === 'ios' ? 
                  <View style={styles.button} >
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                        cornerRadius={20}
                        style={{ width: (width * 0.75), height: 50, marginTop: 5 }}
                        onPress={() =>{ login('apple')}}
                      /> 
                  </View>
                  : <View />
                } */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLogin: false });
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#EE5B64",
                  fontFamily: "MontserratSemiBold",
                }}
              >
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
              }}
            >
              <View
                style={{ width: width * 0.75, marginTop: 0, marginLeft: 0 }}
              >
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
              }}
            >
              <Text
                style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}
              >
                {" "}
                Privacy policy
              </Text>
            </TouchableOpacity>
            <Text style={styles.color_textPrivate}> and</Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(data.TermsConditions);
              }}
            >
              <Text
                style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}
              >
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
  // const { signOut } = React.useContext(AuthContext);
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  // if (data.tempDataCame !== route?.state?.routes[0]?.params?.dataCame) {
  //   if (route?.state?.routes[0]?.params?.dataCame !== undefined) {
  //     setData({ ...data, dataCame: route?.state?.routes[0]?.params?.dataCame, tempDataCame: route?.state?.routes[0]?.params?.dataCame });
  //     console.log(route?.state?.routes[0]?.params?.dataCame, ', ', data.dataCame, ', ', data.tempDataCame);
  //   }
  // }
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
    // return () => {
    //   // console.log('unmounting...');
    //   // setData({ ...data, userIcon: '' })
    // };
  }, [data.isLogin]);
  // }, [data.isLogin, route?.state?.routes[0]?.params?.dataCame]);
  // console.log(route.state.routeNames);
  // const login = (type) => {
  //   if (type === 'facebook') {
  //     route.params.facebookLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   else if (type === 'google') {
  //     // route.params.googleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   if (type === 'apple') {
  //     route.params.appleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  // }
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
              }}
            >
              TroFii
            </Text>
          ),
          // headerStyle: {
          //   backgroundColor: '#white',
          //   height: 55
          // }
        }}
      >
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
          // options={{
          //   headerTitleAlign: 'center',
          //   headerRight: () => (
          //     <TouchableOpacity style={{flex: 1, marginLeft: 20 }}>
          //       <Image
          //         style={{ flex: 1, width: 45 , marginTop: 5, marginRight: 15, marginBottom: data.userIcon === '' ? 0 : 5, borderRadius: 5 }}
          //         source={{ uri: data.userIcon === '' ? Image.resolveAssetSource(require('../assets/icons/user2.png')).uri : data.userIcon, cache: 'force-cache' }}
          //         fadeDuration={1}
          //       />
          //     </TouchableOpacity>
          //       // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
          //   ),
          //   headerLeft: () => (
          //       data.userIcon !== '' ?
          //         <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => { canDrawerOpen(); Keyboard.dismiss(); }} >
          //           <Image
          //             style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
          //             source={require('../assets/icons/menu.png')}
          //             fadeDuration={100}
          //           />
          //         </TouchableOpacity>
          //       :
          //         <TouchableOpacity style={{flex: 1, marginLeft: 0 }} onPress={() => {}} disabled={true}>
          //           <Image
          //             style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
          //             source={require('../assets/icons/menu_dis.png')}
          //             fadeDuration={100}
          //           />
          //         </TouchableOpacity>
          //     )
          //       // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>

          //   }}
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
                }}
              >
                {route?.state?.routes[2]?.params?.restaurantName}
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 0 }}
                onPress={() => {
                  navigation.navigate("FindRestaurant");
                }}
              >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
          }}
        />
        <PostPictureStack.Screen
          name="RequestNewRestHome"
          component={RequestNewRestScreen}
        />
        {/* <PostPictureStack.Screen name="SignInScreen" component={SignInScreen}/>
              <PostPictureStack.Screen name="SignUpScreen" component={SignUpScreen}/> */}
      </PostPictureStack.Navigator>
      {/* <Modal  
            isVisible={data.isLogin}
            animationInTiming={550}
            animationOutTiming={550} 
            propagateSwipe
            onModalHide={() => { setData({ ...data, isLogin: false }); }}
            onModalShow={() => { setData({ ...data, isLogin: true }); }}
            // onBackdropPress={() => { setData({ ...data, isLogin: false }); }} 
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={0.3}
            hideModalContentWhileAnimating
            onRequestClose={() => { setData({ ...data, isLogin: false }); }} 
            style={{
                borderTopLeftRadius: 35,
                borderTopRightRadius: 35,
                borderBottomLeftRadius: 35,
                borderBottomRightRadius: 35,
                overflow: 'hidden',
                padding: -5,
                backgroundColor: 'transparent'
            }}
        >
          <ScrollView style={{ backgroundColor: 'white' }}>
                <View>
                  <TouchableOpacity
                      onPress={() => { setData({ ...data, isLogin: false }); }}
                      style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}
                    >
                      <Feather 
                          name="x"
                          color="gray"
                          size={30}
                      />
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ marginTop: 10 }}>
                      <Image
                      style={{ width: 54.03, height: 47.49, marginTop: 0 }}
                      source={require('../assets/icons/danger.png')}
                      fadeDuration={100}
                      />
                  </View>
                  <View>
                      <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 10 }}>Guest User Alert</Title>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                              <Paragraph 
                                style={styles.searchDescStyle}
                              >You are not signed into an account, which means you won’t be able to use 100% of the apps functionalities. </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                              <Paragraph 
                                style={styles.searchDescStyle}
                              >As a Guest User you can: </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                          <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                              <Image
                              style={{ width: 9, height: 9, marginTop: 0 }}
                              source={require('../assets/icons/circle.png')}
                              fadeDuration={100}
                              />
                          </View>              
                          <View style={{ width: width * 0.70 }}>
                              <Paragraph 
                                style={styles.searchDescStyle2}
                              >Search for your favorite food or restaurants in your area. </Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                          <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                              <Image
                              style={{ width: 9, height: 9, marginTop: 0 }}
                              source={require('../assets/icons/circle.png')}
                              fadeDuration={100}
                              />
                          </View>              
                          <View style={{ width: width * 0.70 }}>
                              <Paragraph 
                                style={styles.searchDescStyle2}
                              >Look at item ratings and comments. </Paragraph>
                          </View>
                      </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                  //  navigation.navigate({name:'SignUpScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); 
                    setData({ ...data, isLogin: false });
                    navigation.navigate(
                      'LogIn', 
                    {
                      screen: 'SignUpScreen',
                    }
                  );
                  }} 
                >
                    <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient colors={['#fb8389', '#f70814', '#C90611']} 
                        style={styles.linearGradient}
                        >
                            <Text 
                            style={styles.buttonText}
                            >Sign Up</Text>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>  
                <TouchableOpacity 
                  onPress={() => { 
                    // navigation.navigate({name:'SignInScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false }); }} style={{ marginBottom: 10 }}
                    navigation.navigate(
                      'LogIn', 
                        {
                          screen: 'SignInScreen'
                        }
                    );
                    setData({ ...data, isLogin: false });
                  }}
                  >
                    <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient colors={['#fff', '#fff', '#fff']} 
                        style={styles.linearGradient2}
                        >
                            <Text 
                            style={styles.buttonText2}
                            >Sign In</Text>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>
                <View style={styles.button} >
                    <TouchableOpacity 
                        onPress={() =>{ login('facebook')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                            <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                <Text style={styles.buttonTextBlack}>Sign In With Facebook</Text>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/fb.png')}
                                />
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.button} >
                    <TouchableOpacity 
                    onPress={() =>{ login('google')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                            <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                <Text style={styles.buttonTextBlack}>Sign In With Google</Text>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/google.png')}
                                />
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                {
                  Platform.OS === 'ios' ? 
                      <View style={styles.button} >
                          <TouchableOpacity 
                          onPress={() =>{ login('apple')}}
                          >
                              <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                                  <LinearGradient colors={['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                      <Text style={styles.buttonTextBlack}>Sign In With Apple</Text>
                                      <Image
                                          style={{ marginLeft: 0, marginTop: 0, width: 20, height: 25 }}
                                          source={require('../assets/icons/apple.png')}
                                      />
                                  </LinearGradient>
                              </View>
                          </TouchableOpacity>
                      </View>
                  : null
                }
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => { setData({ ...data, isLogin: false }); }}>
                        <Text style={{ fontSize: 12, justifyContent: 'center', alignItems: 'center', color: '#EE5B64', fontFamily: 'MontserratSemiBold' }}>CONTINUE AS A GUEST</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90 }}>
                    <View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center',  marginBottom: 5, backgroundColor: 'white' }}>               
                        <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 0 }}>
                            <Paragraph 
                              style={styles.searchDescStyle3}
                            >NOTE: Your email address will be used to create an account to store and keep track of your Reward Points earned and redeemed as well as your saved restaurants.</Paragraph>
                        </View>
                    </View>
                </View>
                <View style={styles.textPrivate}>
                    <Text style={styles.color_textPrivate}>
                        By signing up you agree to our
                    </Text>
                    <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
                    <Text style={styles.color_textPrivate}>{" "}and</Text>
                    <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Terms And Conditions</Text>
                </View>
          </ScrollView>
        </Modal> */}
    </SafeAreaView>
  );
}

function FoodStackScreen({ navigation, route }) {
  // const { signOut } = React.useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    userIcon: "",
  });
  // if (data.tempDataCame !== route?.state?.routes[0]?.params?.dataCame) {
  //   if (route?.state?.routes[0]?.params?.dataCame !== undefined) {
  //     setData({ ...data, dataCame: route?.state?.routes[0]?.params?.dataCame, tempDataCame: route?.state?.routes[0]?.params?.dataCame });
  //     console.log(route?.state?.routes[0]?.params?.dataCame, ', ', data.dataCame, ', ', data.tempDataCame);
  //   }
  // }
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
    return () => {
      // console.log('unmounting...');
      // setData({ ...data, userIcon: '' })
    };
  }, [data.isLogin]);
  // }, [data.isLogin, route?.state?.routes[0]?.params?.dataCame]);
  // console.log(route.state.routeNames);
  // const login = (type) => {
  //   if (type === 'facebook') {
  //     route.params.facebookLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   else if (type === 'google') {
  //     // route.params.googleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   if (type === 'apple') {
  //     route.params.appleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  // }
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
      }}
    >
      <StatusBar barStyle={"light-content"} />
      <FoodStack.Navigator
        // headerMode={(routeName === 'SignInScreen' || routeName === 'SignUpScreen') ? 'none' : 'screen'}
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
              }}
            >
              TroFii
            </Text>
          ),
          // headerStyle: {
          //   backgroundColor: '#white',
          //   height: 55
          // }
        }}
      >
        <FoodStack.Screen
          name="FoodSc"
          component={FoodScreen}
          // initialParams={{ userToken: route?.params?.props?.route?.params?.userToken }}
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}
                >
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
                  disabled={true}
                >
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
            // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
          }}
        />
        <FoodStack.Screen
          name="FoodSelected"
          component={FoodSelectedScreen}
          // initialParams={{ userToken: route?.params?.props?.route?.params?.userToken }}
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}
                >
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
                  disabled={true}
                >
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
            // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
          }}
        />
      </FoodStack.Navigator>
    </SafeAreaView>
  );
}

function NotificationsStackScreen({ navigation, route }) {
  // const { signOut } = React.useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const routeName = getFocusedRouteNameFromRoute(route);
  const [data, setData] = React.useState({
    isLogin: false,
    cardIcon: "heart-o",
    isLiked: false,
    cardRestNumFollowers: 0,
    userIcon: "",
  });
  // if (data.tempDataCame !== route?.state?.routes[0]?.params?.dataCame) {
  //   if (route?.state?.routes[0]?.params?.dataCame !== undefined) {
  //     setData({ ...data, dataCame: route?.state?.routes[0]?.params?.dataCame, tempDataCame: route?.state?.routes[0]?.params?.dataCame });
  //     console.log(route?.state?.routes[0]?.params?.dataCame, ', ', data.dataCame, ', ', data.tempDataCame);
  //   }
  // }

  const getBadgeNum = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      // // // sendPushNotification(token, title, body, type, image, data, userUID)
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
        // navigation.setParams({ tabBarBadge: null });
        navigation.dispatch(CommonActions.setParams({ tabBarBadge: null }));
        // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: null })});
      } else {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              if (snapshot.val()?.Notifications?.tempBadgeNum === 0) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: null }});
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: null })});
                navigation.setParams({ tabBarBadge: null });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: null })
                );
                // this.props.navigation.setParams({ tabBarBadge: null })
              } else if (snapshot.val()?.Notifications?.tempBadgeNum < 10) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: snapshot.val().Notifications.tempBadgeNum }});
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: snapshot?.val()?.Notifications?.tempBadgeNum })});
                navigation.setParams({
                  tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                });
                navigation.dispatch(
                  CommonActions.setParams({
                    tabBarBadge: snapshot.val().Notifications.tempBadgeNum,
                  })
                );
                // console.log(snapshot.val()?.Notifications?.tempBadgeNum)
                // this.props.navigation.setParams({ tabBarBadge: snapshot.val().Notifications.tempBadgeNum })
              } else if (snapshot.val()?.Notifications?.tempBadgeNum > 9) {
                // this.props.navigation.navigate('Notifications', { params: { tabBarBadge: '9+' }});
                // navigation.dispatch(CommonActions.setParams({ tabBarBadge: '9+' }));
                // navigation.dispatch({...CommonActions.setParams({ tabBarBadge: '9+' })});
                navigation.setParams({ tabBarBadge: "9+" });
                navigation.dispatch(
                  CommonActions.setParams({ tabBarBadge: "9+" })
                );
                // this.props.navigation.setParams({ tabBarBadge: '9+' })
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
        //   firebase.database().ref(`/users/${user.uid}`).once('value', (snapshot) => {
        //     if (snapshot.val() !== null && snapshot.val()?.restsList !== undefined ) {
        //         if (snapshot.val().restsList.indexOf(route?.state?.routes[2]?.params?.restaurantUid) !== -1) {
        //             setData({ ...data, cardIcon: 'heart', isLiked: true, userIcon: snapshot.val().image, isLogin: true, cardRestNumFollowers: route?.state?.routes[2]?.params?.RestNumFollowers });
        //         }
        //         else if (snapshot.val().restsList.indexOf(route?.state?.routes[2]?.params?.restaurantUid) === -1) {
        //             setData({ ...data, cardIcon: 'heart-o', isLiked: false, userIcon: snapshot.val().image, isLogin: true, cardRestNumFollowers: route?.state?.routes[2]?.params?.RestNumFollowers });
        //         }
        //         else {
        //           setData({ ...data, userIcon: snapshot.val().image, isLogin: true, cardRestNumFollowers: route?.state?.routes[2]?.params?.RestNumFollowers });
        //         }
        //     }
        // })
      } else {
        setData({ ...data, userIcon: "", isLogin: false });
      }
    });
    // return () => {
    // console.log('unmounting...');
    // setData({ ...data, userIcon: '' })
    // }
  }, []);
  // }, [data.isLogin, route?.state?.routes[0]?.params?.dataCame]);
  // console.log(route.state.routeNames);
  // const login = (type) => {
  //   if (type === 'facebook') {
  //     route.params.facebookLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   else if (type === 'google') {
  //     // route.params.googleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  //   if (type === 'apple') {
  //     route.params.appleLogin();
  //     setData({ ...data, isLogin: false });
  //   }
  // }
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
  // const followingFunc = () => {
  //   const { currentUser } = firebase.auth();
  //   let userRef;
  //   if (currentUser !== null) {
  //     userRef = firebase.database().ref(`/users/${currentUser.uid}`);
  //     const restListRef = firebase.database().ref(`/restsList/${route?.state?.routes[1]?.params?.objectID}`);
  //     const restRef = firebase.database().ref(`/users/${route?.state?.routes[1]?.params?.restaurantUid}`);
  //     let restFollowersList = [];
  //     let idxOfFollowerList = [];
  //     restRef.once('value', (snapFirst) => {
  //       restFollowersList = snapFirst?.val()?.followersList;
  //       if (data.cardIcon === 'heart-o') {
  //         userRef.once('value', (snapshot) => {
  //         if (snapshot !== null && restFollowersList !== undefined && restFollowersList !== null) {
  //             // console.log(snapFirst?.val()?.followerNum)
  //             const ListOfRests = snapshot.val().restsList;
  //             ListOfRests.push(route?.state?.routes[1]?.params?.restaurantUid);
  //             userRef.update({ restsList: ListOfRests, followerNum: (snapshot.val().followerNum + 1) });
  //             restListRef.update({ RestNumFollowers: (snapFirst?.val()?.followerNum + 1) });
  //             restRef.update({ followerNum: (snapFirst?.val()?.followerNum + 1), followersList: restFollowersList.concat(`${currentUser.uid}`) });
  //             return (
  //               setData({ ...data, cardIcon: 'heart', isLiked: true, cardRestNumFollowers: snapFirst?.val()?.followerNum + 1 })
  //             );
  //           } else {
  //             const ListOfRests = snapshot.val().restsList;
  //             ListOfRests.push(route?.state?.routes[1]?.params?.restaurantUid);
  //             userRef.update({ restsList: ListOfRests, followerNum: (snapshot.val().followerNum + 1) });
  //             restListRef.update({ RestNumFollowers: (snapFirst?.val()?.followerNum + 1) });
  //             restRef.update({ followerNum: (snapFirst?.val()?.followerNum + 1), followersList: restFollowersList.concat(`${currentUser.uid}`) });
  //             return (
  //               setData({ ...data, cardIcon: 'heart', isLiked: true, cardRestNumFollowers: snapFirst?.val()?.followerNum + 1 })
  //             );

  //           }
  //         });
  //       }
  //       if (data.cardIcon === 'heart' && snapFirst?.val()?.followerNum !== 0) {
  //           userRef.once('value', (snapshot) => {
  //             if (snapshot !== null) {
  //               const ListOfRests = snapshot.val().restsList;
  //               const idx = ListOfRests.indexOf(route?.state?.routes[1]?.params?.restaurantUid);
  //               if (restFollowersList !== undefined) {
  //                 idxOfFollowerList = restFollowersList.indexOf(`${currentUser.uid}`);
  //                 restFollowersList.splice(idxOfFollowerList, 1);
  //                 if (idx !== -1) {
  //                   ListOfRests.splice(idx, 1);
  //                   if (ListOfRests.length === 0) {
  //                     if (restFollowersList.length === 0) {
  //                       userRef.update({ restsList: { 0: '_' }, followerNum: 0 });
  //                       restRef.update({ followerNum: 0, followersList: { 0: '_' } });
  //                       restListRef.update({ RestNumFollowers: 0 });
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: snapFirst?.val()?.followerNum - 1 })
  //                       );
  //                     }
  //                     else {
  //                       userRef.update({ restsList: { 0: '_' }, followerNum: 0 });
  //                       restRef.update({ followerNum: (snapFirst?.val()?.followerNum - 1), followersList: restFollowersList });
  //                       restListRef.update({ RestNumFollowers: (snapFirst?.val()?.followerNum - 1) });
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: snapFirst?.val()?.followerNum - 1 })
  //                       );
  //                     }
  //                   }
  //                   else {
  //                       if (restFollowersList.length === 0) {
  //                         userRef.update({ restsList: ListOfRests, followerNum: (snapFirst?.val()?.followerNum - 1) });
  //                         restListRef.update({ RestNumFollowers: 0 });
  //                         restRef.update({ followerNum: 0, followersList: { 0: '_' } });
  //                         return (
  //                             setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: snapFirst?.val()?.followerNum - 1 })
  //                         );
  //                       }
  //                     else {
  //                       userRef.update({ restsList: ListOfRests, followerNum: (snapFirst?.val()?.followerNum - 1) });
  //                       restRef.update({ followerNum: (snapFirst?.val()?.followerNum - 1), followersList: restFollowersList });
  //                       restListRef.update({ RestNumFollowers: (snapFirst?.val()?.followerNum - 1) });
  //                       // console.log(snapFirst?.val()?.followerNum)
  //                       return (
  //                         setData({ ...data, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: snapFirst?.val()?.followerNum - 1 })
  //                       );
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //         setData({ ...data, isLogin: true });}
  //   }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -(insets.top * 1.1),
        marginBottom: -(insets.top * 2),
      }}
    >
      <StatusBar barStyle={"light-content"} />
      <NotificationsStack.Navigator
        // headerMode={(routeName === 'SignInScreen' || routeName === 'SignUpScreen') ? 'none' : 'screen'}
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
              }}
            >
              TroFii
            </Text>
          ),
          // headerStyle: {
          //   backgroundColor: '#white',
          //   height: 55
          // }
        }}
      >
        <NotificationsStack.Screen
          name="NotificationsSc"
          component={NotificationsScreen}
          // initialParams={{ userToken: route?.params?.props?.route?.params?.userToken }}
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerLeft: () =>
              data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    canDrawerOpen();
                    Keyboard.dismiss();
                  }}
                >
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
                  disabled={true}
                >
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
            // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
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
                }}
              >
                {route?.state?.routes[1]?.params?.restaurantName}
              </Text>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 0 }}
                onPress={() => {
                  // console.log(route?.state?.routes[route?.state?.routes?.length - 2])
                  // console.log(route?.state?.routes[route?.state?.routes?.length - 2]?.name)
                  navigation.navigate(
                    route?.state?.routes[route?.state?.routes?.length - 2]?.name
                    // , {
                    //   compCameFrom: 'SeeMenuNotificationsTab',
                    //   cardRestNumFollowers: data.cardRestNumFollowers
                    // }
                  );
                }}
              >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
            ),
            headerRight: () => (
              <View>
                <TouchableOpacity
                  style={{ flex: 1, marginRight: 25 }}
                  onPress={() => {
                    //  await isOpen(props.route.params.finalResults.restName)
                    followingFunc();
                  }}
                >
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
              // <Icon.Button name="grid" size={20} backgroundColor="white" color="#C90611" onPress={() => navigation.openDrawer()}></Icon.Button>
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
