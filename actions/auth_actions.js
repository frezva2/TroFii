import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import SettingInfo from "../screens/SettingInfo";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
} from "expo-tracking-transparency";

import firebase from "firebase/app";

// // Optionally import the services that you want to use
import "firebase/auth";
import "firebase/database";

import {
  FACEBOOK_LOGIN_SUCCESS,
  FACEBOOK_LOGIN_FAIL,
  APPLE_LOGIN_SUCCESS,
  APPLE_LOGIN_FAIL,
  GOOGLE_LOGIN_SUCCESS,
  GOOGLE_LOGIN_FAIL,
} from "./types";
import * as WebBrowser from "expo-web-browser";
const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

const createdDate = year * 10000 + month * 100 + day;
var Buffer = require("buffer/").Buffer;

WebBrowser.maybeCompleteAuthSession();
export const appleLogin = () => async (dispatch) => {
  const token = await AsyncStorage.getItem("apple_token");
  const { status } = await requestTrackingPermissionsAsync();
  const { granted } = await getTrackingPermissionsAsync();
  try {
    const csrf = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );
    if (granted || status === "granted") {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        state: csrf,
        nonce: hashedNonce,
      });
      const { identityToken, email, user } = appleCredential;
      await AsyncStorage.setItem("appleUser", user);
      await AsyncStorage.setItem("appleState", csrf);
      const loginAvailable = await AppleAuthentication.isAvailableAsync();
      dispatch({ type: APPLE_LOGIN_SUCCESS, payload: identityToken });
      await AsyncStorage.setItem("apple_token", hashedNonce);
      fetchDataAPPLE(identityToken, nonce);
      // }
      // }
    } else {
      Alert.alert(
        "Login Error: ",
        "Your Name and Email address will be use to avoid froud and duplication account also it will help us to know who upload which picture in case of volition and froud. TroFii will NOT sell your data to any third party nor use in any AD.",
        [{ text: "OK", onPress: () => {}, style: "cancel" }],
        { cancelable: false }
      );
    }
  } catch (e) {
    if (e.code === "ERR_CANCELED") {
      dispatch({ type: APPLE_LOGIN_FAIL });
      // handle that the user canceled the sign-in flow
    } else {
      // handle other errors
    }
  }
};

export const facebookLogin = (response) => async (dispatch) => {
  const token = await AsyncStorage.getItem("fb_token");
  const fbToken = response?.params?.access_token;
  const fbType = response?.type;
  if (response?.params !== undefined) {
    try {
      if (token) {
        requestAsync(token, dispatch);
        dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
      } else {
        doFacebookLogin(fbToken, fbType, dispatch);
      }
    } catch ({ message }) {
      console.log(`Facebook Login Error: ${message}`);
    }
  }
};

const doFacebookLogin = async (token, type, dispatch) => {
  if (type === "success") {
    requestAsync(token, dispatch);
    dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
  } else if (type === "cancel") {
    dispatch({ type: FACEBOOK_LOGIN_FAIL });
  }
};

function requestAsync(token, dispatch) {
  if (token) {
    setTimeout(async () => {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`
      );
      const body = await response.json();
      if (body?.email !== undefined) {
        fetchDataFB(token);
        await AsyncStorage.setItem("fb_token", token);
        dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
      } else {
        console.log("FACEBOOK_LOGIN_FAIL");
        Alert.alert(
          "Facebook Login Error",
          "Your Facebook account does not have an email address. You will need to login with valid email address.",
          [
            {
              text: "OK",
              onPress: () => {
                AsyncStorage.removeItem("fb_token");
                dispatch({ type: FACEBOOK_LOGIN_FAIL });
              },
            },
          ]
        );
      }
    }, 100);
  }
}

const signInAsync = async () => {
  try {
    await GoogleSignIn.askForPlayServicesAsync();
    const { type, user } = await GoogleSignIn.signInAsync();
    alert("user: " + user);
  } catch ({ message }) {
    alert("Error: " + message);
  }
};
function checkSignIn(request, response) {
  if (response === null) {
    alert("response is null");
  }
}
export const googleLogin = (response) => async (dispatch) => {
  if (response?.type === "success") {
    //   if (isSignedIn) {
    fetchDataGoogle(response?.params?.id_token);
    await AsyncStorage.setItem("google_token", response?.params?.id_token);
    dispatch({
      type: GOOGLE_LOGIN_SUCCESS,
      payload: response?.params?.id_token,
    });
    //   }
  } else {
    // some other error happened
    if (response?.error !== undefined) {
      alert("login: Error:" + response.error);
    }
  }
};
export const googleLogin2 = () => async (dispatch) => {
  const token = await AsyncStorage.getItem("google_token");
  if (Platform.OS === "ios") {
    await GoogleSignIn.initAsync({
      clientId: "",
    });
    signInAsync();
  } else {
    await GoogleSignIn.initAsync({
      scopes: ["profile", "email"],
      webClientId: "",
    });
    signInAsync();
  }
};

export const googleLogin3 = () => async (dispatch) => {
  const token = await AsyncStorage.getItem("google_token");
  GoogleSignin.configure({
    webClientId: "apps.googleusercontent.com", // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true,
  });

  try {
    const userInfo = await GoogleSignin.signIn();

    alert("userInfo: " + userInfo);
  } catch (error) {
    alert("login: " + error);
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      alert("login: Error:" + "User cancels the sign in flow");
      return dispatch({ type: GOOGLE_LOGIN_FAIL });
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (e.g. sign in) is in progress already
      const userInfo = await GoogleSignin.signInSilently();
      const isSignedIn = await GoogleSignin.isSignedIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (isSignedIn) {
        fetchDataGoogle(idToken);
        await AsyncStorage.setItem("google_token", idToken);
        dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
      }
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
      alert(
        "login: Error:" +
          "Play services are not available or outdated, this can only happen on Android"
      );
    } else {
      if (error !== undefined) {
        alert("login: Error:" + error);
      }
    }
  }
};

const fetchDataGoogle = async (idToken) => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  const googleCredential = provider.credential(idToken);
  firebase
    .auth()
    .signInWithCredential(googleCredential)
    .then((resp) => {
      const fullname = resp.user.displayName;
      const stringArray = fullname.split(" ");
      const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
      refrence.once("value").then(async (snapshot) => {
        if (snapshot.val() === null) {
          await AsyncStorage.setItem("userToken", idToken);
          refrence.update({
            email: resp.user.email,
            firstname: fullname === null ? "First" : stringArray[0],
            lastname: fullname === null ? "Last" : stringArray[1],
            image:
              "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e",
            points: 0,
            isRestActive: false,
            yourLocation: " ",
            restName: "",
            tempHours: 0,
            followingNum: 0,
            restFollowingNum: 0,
            egiftEarned: 0,
            username: "",
            redeemedPoints: 0,
            restMaxPercentage: 0,
            aroundRadius: 40234,
            phoneNum: "",
            isRecommended: false,
            code: 0,
            userTotalRate: 0,
            expoToken: "",
            tokenPass: "",
            restAddress: "",
            restWebsite: "",
            restDesc: "",
            restOrderWeb: "",
            restHours: "",
            followerNum: 0,
            createdAt: createdDate,
            Drink: 0,
            Appetizer: 0,
            Entrée: 0,
            Dessert: 0,
            eGiftChoiceDate: 202012,
            egiftChoice: "grub",
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            Notifications: { tempBadgeNum: 0, notificationsList: { 0: "_" } },
            boolToken: true,
            iseGiftRequested: false,
          });
          SettingInfo.InfoPusher({
            email: resp.user.email,
            firstname: fullname === null ? "First" : stringArray[0],
            lastname: fullname === null ? "Last" : stringArray[1],
            image:
              "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e",
            points: 0,
            Drink: 0,
            Appetizer: 0,
            userTotalRate: 0,
            redeemedPoints: 0,
            followingNum: 0,
            restFollowingNum: 0,
            egiftEarned: 0,
            aroundRadius: 40234,
            isRecommended: false,
            tempHours: 0,
            expoToken: "",
            restDesc: "",
            restHours: "",
            code: 0,
            Entrée: 0,
            phoneNum: "",
            Dessert: 0,
            restName: "",
            restMaxPercentage: 0,
            username: "",
            tokenPass: "",
            createdAt: createdDate,
            restAddress: "",
            restWebsite: "",
            restOrderWeb: "",
            isRestActive: false,
            yourLocation: " ",
            followerNum: 0,
            eGiftChoiceDate: 202012,
            egiftChoice: "grub",
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            Notifications: { tempBadgeNum: 0, notificationsList: { 0: "_" } },
            boolToken: true,
            iseGiftRequested: false,
          });
        } else {
          await AsyncStorage.setItem("userToken", idToken);
          SettingInfo.InfoPusher({
            email: snapshot.val().email,
            username: snapshot.val().username,
            tokenPass: snapshot.val().tokenPass,
            firstname: snapshot.val().firstname,
            aroundRadius: snapshot.val().aroundRadius,
            lastname: snapshot.val().lastname,
            tempHours: snapshot.val().tempHours,
            isRecommended: false,
            egiftEarned: snapshot.val().egiftEarned,
            code: snapshot.val().code,
            phoneNum: snapshot.val().phoneNum,
            restHours: snapshot.val().restHours,
            userTotalRate: snapshot.val().userTotalRate,
            restDesc: snapshot.val().restDesc,
            image: snapshot.val().image,
            restFollowingNum: snapshot.val().restFollowingNum,
            redeemedPoints: snapshot.val().redeemedPoints,
            points: snapshot.val().points,
            restMaxPercentage: snapshot.val().restMaxPercentage,
            expoToken: snapshot.val().expoToken,
            Drink: snapshot.val().Drink,
            followingNum: snapshot.val().followingNum,
            Appetizer: snapshot.val().Appetizer,
            Entrée: snapshot.val().Entrée,
            Dessert: snapshot.val().Dessert,
            createdAt: snapshot.val().createdAt,
            isRestActive: snapshot.val().isRestActive,
            yourLocation: snapshot.val().yourLocation,
            restName: snapshot.val().restName,
            restAddress: snapshot.val().restAddress,
            restWebsite: snapshot.val().restWebsite,
            restOrderWeb: snapshot.val().restOrderWeb,
            followerNum: snapshot.val().followerNum,
            restsList: snapshot.val().restsList,
            followersList: snapshot.val().followersList,
            followingList: snapshot.val().followersList,
            egiftChoice: snapshot.val().egiftChoice,
            eGiftChoiceDate: snapshot.val().eGiftChoiceDate,
            Notifications: snapshot.val().Notifications,
            boolToken: snapshot.val().boolToken,
            iseGiftRequested: snapshot.val().iseGiftRequested,
          });
        }
      });
    });
};

const fetchDataAPPLE = async (token, nonce) => {
  const provider = new firebase.auth.OAuthProvider("apple.com");
  const appleCredential = provider.credential({
    idToken: token,
    rawNonce: nonce,
  });
  firebase
    .auth()
    .signInWithCredential(appleCredential)
    .then((resp) => {
      const fullname = resp.user.displayName;
      let stringArray = "";
      if (fullname !== null) {
        stringArray = fullname.split(" ");
      }
      const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
      refrence.once("value").then(async (snapshot) => {
        if (snapshot.val() === null) {
          await AsyncStorage.setItem("userToken", token);
          refrence.update({
            email: resp.user.email,
            firstname: fullname === null ? "First" : stringArray[0],
            lastname: fullname === null ? "Last" : stringArray[1],
            image:
              "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e",
            points: 0,
            isRestActive: false,
            yourLocation: " ",
            restName: "",
            tempHours: 0,
            egiftEarned: 0,
            restFollowingNum: 0,
            username: "",
            redeemedPoints: 0,
            restMaxPercentage: 0,
            aroundRadius: 40234,
            phoneNum: "",
            isRecommended: false,
            code: 0,
            userTotalRate: 0,
            followingNum: 0,
            expoToken: "",
            tokenPass: "",
            restAddress: "",
            restWebsite: "",
            restDesc: "",
            restOrderWeb: "",
            restHours: "",
            followerNum: 0,
            createdAt: createdDate,
            Drink: 0,
            Appetizer: 0,
            Entrée: 0,
            Dessert: 0,
            egiftChoice: "grub",
            eGiftChoiceDate: 202012,
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            Notifications: { tempBadgeNum: 0, notificationsList: { 0: "_" } },
            boolToken: true,
            iseGiftRequested: false,
          });
          SettingInfo.InfoPusher({
            email: resp.user.email,
            firstname: fullname === null ? "First" : stringArray[0],
            lastname: fullname === null ? "Last" : stringArray[1],
            image:
              "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e",
            points: 0,
            Drink: 0,
            Appetizer: 0,
            userTotalRate: 0,
            redeemedPoints: 0,
            egiftEarned: 0,
            aroundRadius: 40234,
            isRecommended: false,
            tempHours: 0,
            followingNum: 0,
            restFollowingNum: 0,
            expoToken: "",
            restDesc: "",
            restHours: "",
            code: 0,
            Entrée: 0,
            phoneNum: "",
            Dessert: 0,
            restName: "",
            restMaxPercentage: 0,
            username: "",
            tokenPass: "",
            createdAt: createdDate,
            restAddress: "",
            restWebsite: "",
            restOrderWeb: "",
            isRestActive: false,
            yourLocation: " ",
            followerNum: 0,
            eGiftChoiceDate: 202012,
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            egiftChoice: "grub",
            Notifications: { tempBadgeNum: 0, notificationsList: { 0: "_" } },
            boolToken: true,
            iseGiftRequested: false,
          });
        } else {
          await AsyncStorage.setItem("userToken", token);
          SettingInfo.InfoPusher({
            email: snapshot.val().email,
            username: snapshot.val().username,
            tokenPass: snapshot.val().tokenPass,
            firstname: snapshot.val().firstname,
            aroundRadius: snapshot.val().aroundRadius,
            lastname: snapshot.val().lastname,
            tempHours: snapshot.val().tempHours,
            isRecommended: false,
            egiftEarned: snapshot.val().egiftEarned,
            code: snapshot.val().code,
            phoneNum: snapshot.val().phoneNum,
            restFollowingNum: snapshot.val().restFollowingNum,
            restHours: snapshot.val().restHours,
            userTotalRate: snapshot.val().userTotalRate,
            restDesc: snapshot.val().restDesc,
            image: snapshot.val().image,
            followingNum: snapshot.val().followingNum,
            redeemedPoints: snapshot.val().redeemedPoints,
            points: snapshot.val().points,
            restMaxPercentage: snapshot.val().restMaxPercentage,
            expoToken: snapshot.val().expoToken,
            Drink: snapshot.val().Drink,
            Appetizer: snapshot.val().Appetizer,
            Entrée: snapshot.val().Entrée,
            Dessert: snapshot.val().Dessert,
            createdAt: snapshot.val().createdAt,
            isRestActive: snapshot.val().isRestActive,
            yourLocation: snapshot.val().yourLocation,
            restName: snapshot.val().restName,
            restAddress: snapshot.val().restAddress,
            restWebsite: snapshot.val().restWebsite,
            restOrderWeb: snapshot.val().restOrderWeb,
            followerNum: snapshot.val().followerNum,
            restsList: snapshot.val().restsList,
            followersList: snapshot.val().followersList,
            followingList: snapshot.val().followersList,
            egiftChoice: snapshot.val().egiftChoice,
            eGiftChoiceDate: snapshot.val().eGiftChoiceDate,
            Notifications: snapshot.val().Notifications,
            boolToken: snapshot.val().boolToken,
            iseGiftRequested: snapshot.val().iseGiftRequested,
          });
        }
      });
    });
};

const fetchDataFB = async (token) => {
  const credential = firebase.auth.FacebookAuthProvider.credential(token);
  firebase
    .auth()
    .signInWithCredential(credential)
    .then((resp) => {
      var user = firebase.auth().currentUser;
      const fullname = resp.user.displayName;
      const stringArray = fullname.split(" ");
      const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
      refrence.once("value").then(async (snapshot) => {
        if (snapshot.val() === null) {
          await AsyncStorage.setItem("userToken", token);
          refrence.update({
            email: resp.user.email,
            firstname: stringArray[0],
            lastname: stringArray[1],
            image: resp.user.photoURL,
            points: 0,
            isRestActive: false,
            yourLocation: " ",
            restName: "",
            tempHours: 0,
            egiftEarned: 0,
            username: "",
            redeemedPoints: 0,
            restMaxPercentage: 0,
            restFollowingNum: 0,
            followingNum: 0,
            aroundRadius: 40234,
            phoneNum: "",
            isRecommended: false,
            code: 0,
            userTotalRate: 0,
            expoToken: "",
            tokenPass: "",
            restAddress: "",
            restWebsite: "",
            restDesc: "",
            restOrderWeb: "",
            restHours: "",
            followerNum: 0,
            createdAt: createdDate,
            Drink: 0,
            Appetizer: 0,
            Entrée: 0,
            Dessert: 0,
            eGiftChoiceDate: 202012,
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            egiftChoice: "grub",
            Notifications: { tempBadgeNum: 0, notificationsList: { 0: "_" } },
            boolToken: true,
            iseGiftRequested: false,
          });
          SettingInfo.InfoPusher({
            email: resp.user.email,
            firstname: stringArray[0],
            lastname: stringArray[1],
            image: resp.user.photoURL,
            points: 0,
            Drink: 0,
            Appetizer: 0,
            userTotalRate: 0,
            redeemedPoints: 0,
            egiftEarned: 0,
            aroundRadius: 40234,
            isRecommended: false,
            tempHours: 0,
            expoToken: "",
            restDesc: "",
            restHours: "",
            code: 0,
            followingNum: 0,
            Entrée: 0,
            phoneNum: "",
            Dessert: 0,
            restName: "",
            restMaxPercentage: 0,
            username: "",
            tokenPass: "",
            createdAt: createdDate,
            restAddress: "",
            restWebsite: "",
            restOrderWeb: "",
            isRestActive: false,
            yourLocation: " ",
            followerNum: 0,
            eGiftChoiceDate: 202012,
            restsList: { 0: "_" },
            followersList: { 0: "_" },
            followingList: { 0: "_" },
            restFollowingNum: 0,
            egiftChoice: "grub",
            Notifications: {
              tempBadgeNum: 0,
              notificationsList: { 0: "_" },
            },
            boolToken: true,
            iseGiftRequested: false,
          });
        } else {
          await AsyncStorage.setItem("userToken", token);
          SettingInfo.InfoPusher({
            email: snapshot.val().email,
            username: snapshot.val().username,
            tokenPass: snapshot.val().tokenPass,
            firstname: snapshot.val().firstname,
            aroundRadius: snapshot.val().aroundRadius,
            lastname: snapshot.val().lastname,
            tempHours: snapshot.val().tempHours,
            isRecommended: false,
            egiftEarned: snapshot.val().egiftEarned,
            code: snapshot.val().code,
            phoneNum: snapshot.val().phoneNum,
            restFollowingNum: snapshot.val().restFollowingNum,
            restHours: snapshot.val().restHours,
            userTotalRate: snapshot.val().userTotalRate,
            restDesc: snapshot.val().restDesc,
            image: snapshot.val().image,
            redeemedPoints: snapshot.val().redeemedPoints,
            points: snapshot.val().points,
            restMaxPercentage: snapshot.val().restMaxPercentage,
            expoToken: snapshot.val().expoToken,
            Drink: snapshot.val().Drink,
            Appetizer: snapshot.val().Appetizer,
            Entrée: snapshot.val().Entrée,
            followingNum: snapshot.val().followingNum,
            Dessert: snapshot.val().Dessert,
            createdAt: snapshot.val().createdAt,
            isRestActive: snapshot.val().isRestActive,
            yourLocation: snapshot.val().yourLocation,
            restName: snapshot.val().restName,
            restAddress: snapshot.val().restAddress,
            restWebsite: snapshot.val().restWebsite,
            restOrderWeb: snapshot.val().restOrderWeb,
            followerNum: snapshot.val().followerNum,
            restsList: snapshot.val().restsList,
            followersList: snapshot.val().followersList,
            followingList: snapshot.val().followersList,
            egiftChoice: snapshot.val().egiftChoice,
            eGiftChoiceDate: snapshot.val().eGiftChoiceDate,
            Notifications: snapshot.val().Notifications,
            boolToken: snapshot.val().boolToken,
            iseGiftRequested: snapshot.val().iseGiftRequested,
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      if (
        err.message ===
        "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address."
      ) {
        Alert.alert("Facebook Login Error", err.message, [
          {
            text: "OK",
            onPress: () => {
              AsyncStorage.removeItem("fb_token");
            },
          },
        ]);
      }
    });
};
