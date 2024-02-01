 import React, { useEffect, useCallback } from 'react';
 import { View, LogBox, Image, Dimensions, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
 import { 
   NavigationContainer, 
   DefaultTheme as NavigationDefaultTheme,
   DarkTheme as NavigationDarkTheme
 } from '@react-navigation/native';
//  import { Text } from 'react-native-paper';
 import { Provider } from 'react-redux';
//  import * as Notifications from 'expo-notifications';
 import { createDrawerNavigator } from '@react-navigation/drawer';
 import Constants from 'expo-constants';
//  import * as Facebook from 'expo-facebook';
 import { StatusBar } from 'expo-status-bar';
 import * as AppleAuthentication from 'expo-apple-authentication';
//  import * as Google from 'expo-google-app-auth';
 import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
 import { ModalPortal } from 'react-native-modals';
//  import * as GoogleSignIn from 'expo-google-sign-in';
import { Asset } from 'expo-asset';
// import uuid from 'uuid-v4';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

 import { 
   Provider as PaperProvider, 
   DefaultTheme as PaperDefaultTheme,
   DarkTheme as PaperDarkTheme 
 } from 'react-native-paper';

import * as Font from 'expo-font';

 import { DrawerContent } from './screens/DrawerContent';
 
 import MainTabScreen from './screens/MainTabScreen';
 import MyFavRestsStackScreen from './screens/MyFavRestsStackScreen';
 import CommentsRatingsScreen from './screens/CommentsRatingsScreen';
 import MyPhotosScreen from './screens/MyPhotosScreen';
 import MyAccountScreen from './screens/MyAccountScreen';
 import MyeGiftsScreen from './screens/MyeGiftsScreen';
 import SettingsScreen from './screens/SettingsScreen';
 import EarnRewardsScreen from './screens/EarnRewardsScreen';
 import MyFavTroFiiScreen from './screens/MyFavTroFiiScreen'; 
 import MyUploadedTroFiiScreen from './screens/MyUploadedTroFiiScreen'; 
 
 import { AuthContext } from './components/context';
 
 import RootStackScreen from './screens/RootStackScreen';
 
 import AsyncStorage from '@react-native-async-storage/async-storage';
//  import * as firebase from 'firebase';
 
import store from './store';

// import * as Facebook from 'expo-auth-session/providers/facebook';
// import { ResponseType } from 'expo-auth-session';

import firebase from 'firebase/app'

// Optionally import the services that you want to use
import "firebase/auth";
import "firebase/database";

//import "firebase/firestore";
//import "firebase/functions";
// import "firebase/storage";

 const width = Dimensions.get('window').width; //full width
 const height = Dimensions.get('window').height; //full heigh

 WebBrowser.maybeCompleteAuthSession();
 const Drawer = createDrawerNavigator();
 
//  const App = () => {
export default function App() {
  SplashScreen.preventAutoHideAsync()
   const [isLoading, setIsLoading] = React.useState(true);
   const [userToken, setUserToken] = React.useState(null); 
   const [data, setData] = React.useState({
    userToken: '',
    isLoading: false
  });
  
	// const [
	// 			requestFacebookAuth,
	// 			responseFacebookAuth,
	// 			promptFacebookAuthAsync,
	// 		] = Facebook.useAuthRequest({
  //   clientId: '307295626459407',
  //   redirectUri: `fb307295626459407//authorize`,
  //   responseType: ResponseType.Code
  // });
LogBox.ignoreLogs([
  // `Could not find image`,
  // `Constants.platform.ios.model has been deprecated in favor of expo-device's`,
  // `Invalid googleServicesFile: data`,
  `Please report: Excessive number of pending callbacks: 501.`,
  `Each child in a list should have a unique "key" prop.`,
  `PayloadTooLargeError: request entity too large`,
  `Attempted to call AuthSession.startAsync multiple times while already active.`,
  `AsyncStorage has been extracted from react-native core and will be removed in a future release.`,
  // `ViewPropTypes will be removed from React Native.`,
  // `EventEmitter.removeListener('url', ...): Method has been deprecated.`,
  // `EventEmitter.removeListener('didUpdate`,
  // `Possible Unhandled Promise`,
  // `TypeError: undefined is not an object (evaluating '_ExponentFacebook.default.initializeAsync')`,
  // `[TypeError: undefined is not an object (evaluating '_ExponentFacebook.default.initializeAsync')]`,
  // 'Your project is accessing the following APIs from a deprecated global rather than a module import: Constants (expo-constants).',
  // `Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.`,
  'VirtualizedLists should never be nested inside plain ScrollViews', 
  // `Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicat`,
  // `[Unhandled promise rejection: FirebaseError: Firebase: Firebase App named '[DEFAULT]' already exists (app/duplicate-app).]`,
  // `VirtualizedList: You have a large list that is slow to update`,
  // `VirtualizedLists should never be nested`,
  // `Accessing the 'state' property of the 'route' object is not supported. If you want to get the focused route name, use the 'getFocusedRouteNameFromRoute' helper instead: https://reactnavigation.org/docs/5.x/screen-options-resolution/#setting-parent-screen-options-based-on-child-navigators-state`, 
  // 'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and',
  ]);

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
       background: '#ffffff',
       text: '#333333'
     }
   }
   
   const CustomDarkTheme = {
     ...NavigationDarkTheme,
     ...PaperDarkTheme,
     colors: {
       ...NavigationDarkTheme.colors,
       ...PaperDarkTheme.colors,
       background: '#333333',
       text: '#ffffff'
     }
   }
 
   const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;
 
   const loginReducer = (prevState: any, action: any) => {
     switch( action.type ) {
       case 'RETRIEVE_TOKEN': 
         return {
           ...prevState,
           userToken: action.token,
          //  isLoading: false,
         };
       case 'LOGIN': 
         return {
           ...prevState,
          //  userName: action.id,
           userToken: action.token,
          //  isLoading: false,
         };
       case 'LOGOUT': 
         return {
           ...prevState,
           userName: null,
           userToken: null,
          //  isLoading: false,
         };
       case 'REGISTER': 
         return {
           ...prevState,
           userName: action.id,
           userToken: action.token,
          //  isLoading: false,
         };
         case 'READY': 
           return {
             ...prevState,
              isLoading: false,
           };
     }
   };
 
   const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);
 
   const authContext = React.useMemo(() => ({
    //  signIn: async() => {
      //  setUserToken('fgkj');
      //  setIsLoading(false);
      //  const userToken = String(foundUser[0].id);
      //  const userName = foundUser[0].username;
      
    // firebase.auth().onAuthStateChanged((user) => {
    //   const { currentUser } = firebase.auth();
    //       if (user !== null) {
    //         console.log(user)
    //       }
    //     })
      //  try {
      //    await AsyncStorage.setItem('userToken', userToken);
      //  } catch(e) {
      //    console.log(e);
      //  }
      //  console.log('user token: ', userToken);
      
      // firebase.auth().onAuthStateChanged(async (user) => {
      // //  let userToken;
      //     if (user !== null) {
      //       // console.log(user.uid)
      //       // if (user.providerData[0].providerId === 'google.com' || user.providerData[0].providerId === 'facebook.com' || user.providerData[0].providerId === 'apple.com') {
      //         await AsyncStorage.setItem('userToken', user.uid);
      //       // }
      //       dispatch({ type: 'LOGIN', token: user.uid });

      //     }
      //   })
    //  },
    signOut: () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? ',
      [
        { text: 'No', onPress: () => {

        }, style: 'cancel' },
        { text: 'Yes', onPress: async () => {
          try {
            // let accessToken = '';
            // let appleUser = '';
            // let appleState = '';
            let appleState = await AsyncStorage.getItem('appleState');
            let appleUser = await AsyncStorage.getItem('appleUser');
            let accessToken = await AsyncStorage.getItem('userToken');
            await firebase.auth().signOut();
            // await Facebook.logOutAsync();
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('appleUser');
            await AsyncStorage.removeItem('appleState');
            await AsyncStorage.removeItem('apple_token');
            await AsyncStorage.removeItem('fb_token');
            await AsyncStorage.removeItem('google_token');
            // await GoogleSignIn.signOutAsync();
            
            // if (Constants.appOwnership === 'standalone') {
            //   const token = await AsyncStorage.getItem('google_token');
            // }
            // if (accessToken !== null) {
            //   await Google.logOutAsync({
            //     accessToken: accessToken,
            //     iosClientId: `513107977432-7aqgll3sjloiv13ppgmpf8jkiuq00f05.apps.googleusercontent.com`,
            //     androidClientId: `513107977432-ievlif60nmc6k0vbdcgmq4fm7ao7c26b.apps.googleusercontent.com`,
            //     iosStandaloneAppClientId: `513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com`,
            //     androidStandaloneAppClientId: `513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com`
            //   })
            // }
            if (Platform.OS === 'ios') {
              await AppleAuthentication.signOutAsync({ 
                state: appleState, 
                user: appleUser
              });
            }
          } catch ({ message }) {
            // alert('Error: ' + message);
          }
            // firebase.auth().signOut().then( async () => {
            //   await AsyncStorage.removeItem('userToken');
            //   dispatch({ type: 'LOGOUT' });
            // }).catch(function(error) {
            //   console.log(error);
            // });
          } 
        },
      ],
      { cancelable: false }
  );

      //  try {
      //       await firebase.auth().signOut().then( async ()=>{
      //         console.log('1');
      //         await AsyncStorage.removeItem('userToken');
      //     }).catch((error) => {
      //       console.log(error.message)
      //     })
      //     console.log('2');
      //     // setUserToken(null);
      //  } catch(e) {
      //     console.log(e);
      //  }
     },
    //  signUp: () => {
       // setUserToken('fgkj');
       // setIsLoading(false);
    //  },
     toggleTheme: () => {
       setIsDarkTheme( isDarkTheme => !isDarkTheme );
     }
   }), []);
 
   async function prepare() {
    try {
      await SplashScreen.preventAutoHideAsync();
      await Font.loadAsync({ 
        'Montserrat': require('./assets/fonts/Montserrat-Medium.ttf'),
        'MontserratReg': require('./assets/fonts/Montserrat-Regular.ttf'),
        'MontserratBold': require('./assets/fonts/Montserrat-Bold.ttf'), 
        'MontserratSemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'), 
        'BerkshireSwash': require('./assets/fonts/BerkshireSwash-Regular.ttf'),
        'Poppins': require('./assets/fonts/Poppins-Medium.ttf')
      });

	    // await Facebook.initializeAsync({ appId: '307295626459407' });
      await new Promise(resolve => setTimeout(resolve, 501));
    } catch (e) {
      console.warn(e);
    } finally {
      // await SplashScreen.preventAutoHideAsync();
      // Tell the application to render
        setTimeout(() => {
          dispatch({ type: 'READY', token: null });
        }, 500);
    }
  }

   useEffect(() => {

    // GoogleSignin.configure({
    //   scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
    //   webClientId:
    //     '513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    //   offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    //   // hostedDomain: '', // specifies a hosted domain restriction
    //   // loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
    //   forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    //   // accountName: '', // [Android] specifies an account name on the device that should be used
    //   // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    //   // googleServicePlistPath: '', // [iOS] optional, if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
    // });
    
    firebase.initializeApp({
      appId: "1:513107977432:ios:fd7ca067c9b8df7c",
      apiKey: 'AIzaSyDAWNLR1joAOuN4WStnpJvr6446Qg0RhWg',
      clientId: "513107977432-01pktott0s803ktn40ll0fib72jtuod0.apps.googleusercontent.com",
      authDomain: 'worests.firebaseapp.com',
      databaseURL: 'https://worests.firebaseio.com',
      projectId: 'worests',
      storageBucket: 'worests.appspot.com',
      messagingSenderId: '513107977432',
      measurementId: "G-CJ1QHSX90M"
    });
    // if (Platform.OS !== 'android') {
    //   Amplitude.initializeAsync('f8972a83e36ba8039e6cdcd5ad76eb24');
    // }
    // setTimeout(async() => {
      // firebase.initializeApp({
      //   appId: "1:513107977432:ios:fd7ca067c9b8df7c",
      //   apiKey: 'AIzaSyDAWNLR1joAOuN4WStnpJvr6446Qg0RhWg',
      //   clientId: "513107977432-4tnskjkkhkj4n4a23k5p7aolph8704kp.apps.googleusercontent.com",
      //   authDomain: 'worests.firebaseapp.com',
      //   databaseURL: 'https://worests.firebaseio.com',
      //   projectId: 'worests',
      //   storageBucket: 'worests.appspot.com',
      //   messagingSenderId: '513107977432',
      //   measurementId: "G-CJ1QHSX90M"
      // });
      // await Font.loadAsync({ 
      //   'Montserrat': require('./assets/fonts/Montserrat-Medium.ttf'),
      //   'MontserratReg': require('./assets/fonts/Montserrat-Regular.ttf'),
      //   'MontserratBold': require('./assets/fonts/Montserrat-Bold.ttf'), 
      //   'MontserratSemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'), 
      //   'BerkshireSwash': require('./assets/fonts/BerkshireSwash-Regular.ttf'),
      //   'Poppins': require('./assets/fonts/Poppins-Medium.ttf')
      // });
      // await prepare();
    // firebase.auth().onAuthStateChanged((user) => {
    //   // const { currentUser } = firebase.auth();
    //   //  let userToken;
      
    //       if (user !== null) {
    //         // console.log(user.uid)
    //         setTimeout(() => {
    //           // await AsyncStorage.setItem('userToken', user.uid);
    //           // userToken = await AsyncStorage.getItem('userToken');
    //           setData({
    //             ...data,
    //             userToken: user.uid,
    //             isLoading: true
    //           });
    //         }, 7000);
    //         dispatch({ type: 'RETRIEVE_TOKEN', token: user.uid });
    //       // console.log(userToken);
    //       } else {
    //         setTimeout(() => {
    //           setData({
    //               ...data,
    //               userToken: '',
    //               isLoading: true
    //           });
    //         }, 7000);
    //         dispatch({ type: 'LOGOUT', token: null });
    //       }
    //     })

      
    // }, 100);

    setTimeout(async() => {
      // firebase.database().ref('/users').once("value").then((snapshot) => {
      //   snapshot.forEach((data) => {
      //       firebase.database().ref(`/users/${data.key}`)
      //         .once('value', (snap) => {
      //               // if(data.key === '9dQ0ZcAKmjMTeRPNBRacNghJFkq2') {
      //           firebase.database().ref(`/users/${data.key}`).update({ userPostId: 0 });  userPostId
      //           console.log(data.key)
      //               // }
      //       });
      //   });
      // });
      
      // firebase.database().ref('/users').once("value").then((snapshot) => {
      //   snapshot.forEach((data) => {
      //     const { currentUser } = firebase.auth();
      //     if (currentUser !== null) {
      //       firebase.database().ref(`/users/${data.key}`).once('value', (snap) => { 
      //         if (snap.val() !== undefined) {
      //           if (snap?.val()?.email !== undefined && snap?.val().email !== null) {
      //             if (snap?.val()?.userPostId === undefined) {
      //               let uid = snap.val().email?.slice(0,snap?.val()?.email?.indexOf('@')).slice(0,10);
      //               if (uid !== undefined && uid !== null && uid !== '') {
      //                 let newUID = uid.concat(uuid().slice(0,10-uid.length));
      //                 firebase.database().ref(`/users/${data.key}`).update({ userPostId: newUID });
      //                 console.log(newUID); 
      //               }
      //             }
      //           }
      //         }
      //       });
      //     }
      //   });
      // });

      await SplashScreen.preventAutoHideAsync();
      await prepare();
      // setTimeout(() => {
        // dispatch({ type: 'READY', token: null });
      // }, 500);
    }, 500);
    //  setTimeout(async() => {
      //  setIsLoading(false);
      //  let userToken;
      //  userToken = null;
      //  try {
      //    userToken = await AsyncStorage.getItem('userToken');
      //  } catch(e) {
      //    console.log(e);
      //  }
      //  console.log('user token: ', userToken);
      //  dispatch({ type: 'RETRIEVE_TOKEN', token: userToken });
    //  }, 1000);
     
   }, []);
   const onLayoutRootView = useCallback(async() => {
  
    await SplashScreen.hideAsync();
    // await SplashScreen.preventAutoHideAsync();
    if (!loginState.isLoading) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      firebase.auth().onAuthStateChanged(async(user) => {
        // const { currentUser } = firebase.auth();
        //  let userToken;
            if (user !== null) {
              setTimeout(() => {
                // await AsyncStorage.setItem('userToken', user.uid);
                // userToken = await AsyncStorage.getItem('userToken');
                setData({
                  ...data,
                  userToken: user.uid,
                  isLoading: true
                }); 
              }, 2600);
              dispatch({ type: 'RETRIEVE_TOKEN', token: user.uid });
              // await SplashScreen.preventAutoHideAsync();
              

              await SplashScreen.hideAsync();
              // authContext.signOut()
            // console.log(userToken);
            } else {
              setTimeout(() => {
                setData({
                    ...data,
                    userToken: '',
                    isLoading: true
                });
              }, 3500);
              dispatch({ type: 'LOGOUT', token: null });
              // await SplashScreen.preventAutoHideAsync();
              await SplashScreen.hideAsync();
              // authContext.signOut()
            }
          })
    }
  }, [loginState.isLoading]);
  
  // const _cacheSplashResourcesAsync = async () => {
  //   const gif = require('./assets/splash_2.png');
  //   return Asset.fromModule(gif).downloadAsync();
  // };

  const _cacheResourcesAsync = async () => {
    // await SplashScreen.preventAutoHideAsync();
    // SplashScreen.hideAsync();
    const images = [
      require('./assets/splash_2.png'),
      require('./assets/Trofii-Splash.gif'),
      require('./assets/images/restaurantpost.png'),
      require('./assets/images/homemadepost.png'),
      require('./assets/blur2.jpg'),
    ];

    const cacheImages = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(cacheImages);
  };

  if(loginState.isLoading) {
    return(
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: loginState.isLoading ? 0 : 1, position: loginState.isLoading ? 'absolute' : 'relative',  zIndex: loginState.isLoading ? 0 : 1 }}>
          <Image
            style={{ "resizeMode": "contain", "backgroundColor": "#ffffff", width, height }}
            source={require('./assets/splash_2.png')}
            onLoad={_cacheResourcesAsync}
            fadeDuration={0}
          />
        </View>
      </SafeAreaView>
     );
   }
   
   return (
    <SafeAreaProvider>
      <View style={{ flex: data.isLoading ? 0 : 1, position: data.isLoading ? 'absolute' : 'relative',  zIndex: data.isLoading ? 0 : 1 }} 
        onLayout={onLayoutRootView}
      >
        <Image
          style={{ "resizeMode": "contain", "backgroundColor": "#ffffff", width, height }}
          source={require('./assets/Trofii-Splash.gif')}
          onLoad={_cacheResourcesAsync}
          fadeDuration={0}
        />
      </View>
      <View style={{ flex: data.isLoading ? 1 : 0, zIndex: data.isLoading ? 1 : 0 }}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                <StatusBar 
                  style='auto'
                  barStyle='dark-content'
                  // barStyle="light-content" 
                  // backgroundColor={ theme.dark ? 'black' : 'white' }
                />
                <NavigationContainer 
                  theme={theme}
                  // linking={{
                  //   config: {
                  //     // Configuration for linking
                  //   },
                  //   async getInitialURL() {
                  //     // First, you may want to do the default deep link handling
                  //     // Check if app was opened from a deep link
                  //     const url = await Linking.getInitialURL();
            
                  //     if (url != null) {
                  //       return url;
                  //     }
                  //     else {
                  //       // Handle URL from expo push notifications
                  //       // const response = await Notifications.getLastNotificationResponseAsync();
                  //       // const url = response?.notification.request.content.data.url;
              
                  //       return url;
                  //     }
                  //   }
                  //   subscribe(listener) {
                  //     const onReceiveURL = ({ url }: { url: string }) => listener(url);
            
                  //     // Listen to incoming links from deep linking
                  //     Linking.addEventListener('url', onReceiveURL);
            
                  //     // Listen to expo push notifications
                  //     const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                  //       const url = response.notification.request.content.data.url;
            
                  //       // Any custom logic to see whether the URL needs to be handled
                  //       //...
            
                  //       // Let React Navigation handle the URL
                  //       listener(url);
                  //     });
            
                  //     return () => {
                  //       // Clean up the event listeners
                  //       Linking.removeEventListener('url', onReceiveURL);
                  //       subscription.remove();
                  //     };
                  //   },
                  // }}
                >
                  { 
                  //  loginState.userToken !== null ? (
                    <Drawer.Navigator 
                      // lazy={data.userToken !== '' ? false : true}
                      drawerStyle={{
                        width: width * 0.80,
                      }}
                      initialRouteName={'HomeDrawer'} 
                      // initialRouteName={ data.userToken !== null ? 'HomeDrawer' : 'LogIn'} 
                      drawerContent={props => <DrawerContent {...props} />}
                      screenOptions={{ 
                        headerShown: false,
                        lazy: data.userToken !== '' ? false : true,
                        swipeEnabled: data.userToken !== '' ? true : false,
                      }}
                    >
                      <Drawer.Screen name="HomeDrawer" component={MainTabScreen}/>
                      <Drawer.Screen name="LogIn" component={RootStackScreen} />
                      <Drawer.Screen name="MyFavRestsStackScreen" component={MyFavRestsStackScreen} />
                      <Drawer.Screen name="CommentsRatingsScreen" component={CommentsRatingsScreen} />
                      <Drawer.Screen name="MyAccountScreen" component={MyAccountScreen} />
                      <Drawer.Screen name="MyPhotosScreen" component={MyPhotosScreen} /> 
                      <Drawer.Screen name="MyeGiftsScreen" component={MyeGiftsScreen} />
                      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
                      <Drawer.Screen name="MyUploadedTroFiiScreen" component={MyUploadedTroFiiScreen} />
                      <Drawer.Screen name="MyFavTroFiiScreen" component={MyFavTroFiiScreen} />
                      <Drawer.Screen name="EarnRewardsScreen" component={EarnRewardsScreen} />
                    </Drawer.Navigator>
                  //  )
                //  :
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
 
//  export default App;
 