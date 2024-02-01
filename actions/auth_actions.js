
import React from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from "expo-crypto";
// import * as Random from 'expo-random';
// import * as Facebook from 'expo-facebook';
// import * as Facebook from 'expo-auth-session/providers/facebook';
// import { ResponseType } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
// import Modal from 'react-native-modal';
// import * as Google from 'expo-google-app-auth';
// import * as GoogleSignIn from 'expo-google-sign-in';
import SettingInfo from '../screens/SettingInfo';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
// import * as Google from 'expo-auth-session/providers/google';
// import { AuthContext } from '../components/context';
// import Constants from 'expo-constants';
// import RestSettingInfo from '../src/RestSettingInfo';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';


import uuid from 'uuid-v4';

import firebase from 'firebase/app'

// // Optionally import the services that you want to use
import "firebase/auth";
import "firebase/database";

import {
	FACEBOOK_LOGIN_SUCCESS, 
	FACEBOOK_LOGIN_FAIL,
	APPLE_LOGIN_SUCCESS, 
	APPLE_LOGIN_FAIL,
	GOOGLE_LOGIN_SUCCESS, 
	GOOGLE_LOGIN_FAIL
} from './types';
import * as WebBrowser from 'expo-web-browser';
// How to use AsyncStorage:
// AsyncStorage.setItem('fc_token', token);
// AsyncStorage.getItem('fb_token') 
// import '../shim.js'
// import crypto from 'crypto'

// const string_decoder = require("string_decoder");
// const { StringDecoder } = require('string_decoder');
const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

const createdDate = ((year * 10000) + (month * 100) + day);
var Buffer = require('buffer/').Buffer

WebBrowser.maybeCompleteAuthSession();
// const { signIn } = React.useContext(AuthContext);
export const appleLogin = () => async (dispatch) => {
	// AppleAuthentication.AppleAuthenticationCredentialState.REVOKED();
	const token = await AsyncStorage.getItem('apple_token');
	const { status } = await requestTrackingPermissionsAsync();
	const { granted } = await getTrackingPermissionsAsync();
    try {
    	const csrf = Math.random().toString(36).substring(2, 15);
	    const nonce = Math.random().toString(36).substring(2, 10);
	    const hashedNonce = await Crypto.digestStringAsync(
	    Crypto.CryptoDigestAlgorithm.SHA256, nonce);
		if (granted || status === 'granted') {
			const appleCredential = await AppleAuthentication.signInAsync({
				requestedScopes: [
				  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
				  AppleAuthentication.AppleAuthenticationScope.EMAIL
				],
				state: csrf,
				nonce: hashedNonce
			  });
			  const { identityToken, email, user } = appleCredential;	
			  await AsyncStorage.setItem('appleUser', user);
			  await AsyncStorage.setItem('appleState', csrf);
				const loginAvailable = await AppleAuthentication.isAvailableAsync();
		 //  	if (token) {
			   //    fetchDataAPPLE(identityToken, nonce);
				  // dispatch({ type: APPLE_LOGIN_SUCCESS, payload: token });
			//     // signed in
			//     // `@${user}`,
			// 	} 
			// 	else {
			  // if (type === 'cancel') {
			  // 	return dispatch({ type: FACEBOOK_LOGIN_FAIL });
			  // } else {
				  dispatch({ type: APPLE_LOGIN_SUCCESS, payload: identityToken });
				  await AsyncStorage.setItem('apple_token', hashedNonce);
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
      if (e.code === 'ERR_CANCELED') {
		dispatch({ type: APPLE_LOGIN_FAIL });
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
};

export const facebookLogin = (response) => async (dispatch) => {
	// console.log('responseFacebookAuth: ',response.params.access_token);

	const token = await AsyncStorage.getItem('fb_token');
	const fbToken = response?.params?.access_token;
	const fbType = response?.type;
	if (response?.params !== undefined) {
		try {
				if (token) {
					requestAsync(token, dispatch);
					dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
				} else {
					doFacebookLogin(fbToken,fbType,dispatch);
				}
			} catch ({ message }) {
				console.log(`Facebook Login Error: ${message}`);
			}
	}
};

const doFacebookLogin = async (token,type,dispatch) => {
	if (type === 'success') {
		requestAsync(token, dispatch);
	   	dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });	
	} else if (type === 'cancel'){
		dispatch({ type: FACEBOOK_LOGIN_FAIL });
	}
};

 function requestAsync(token,dispatch) {
	if (token) {
        setTimeout(async() => {
				const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`);
				const body = await response.json();
				if (body?.email !== undefined) {
					fetchDataFB(token);
					await AsyncStorage.setItem('fb_token', token);
					dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
				} else {	
					console.log('FACEBOOK_LOGIN_FAIL')
					Alert.alert('Facebook Login Error', 'Your Facebook account does not have an email address. You will need to login with valid email address.',
						[
							{text: 'OK', onPress: () => {
								AsyncStorage.removeItem('fb_token');
								dispatch({ type: FACEBOOK_LOGIN_FAIL });
							}},
						]
					);
				}

		}, 100);
	}
}

// const signInAsync = async () => {
//     try {
//       	await GoogleSignIn.askForPlayServicesAsync();
//       	const { type, user } = await GoogleSignIn.signInAsync();
//       	if (type === 'success') {
//         	fetchDataGoogle(user?.auth?.idToken);
// 	  }
//     } catch ({ message }) {
//       alert('login: Error:' + message);
//     }
//   };

const signInAsync = async () => {
    try {
      	await GoogleSignIn.askForPlayServicesAsync();
    	// const user = await GoogleSignIn.signInSilentlyAsync();
		const { type, user } = await GoogleSignIn.signInAsync()
		// const isSignedIn = await GoogleSignIn.isSignedInAsync();
		alert('user: ' + user);
      	// if (type === 'success') {
		// 	alert('Token: ' + user?.auth?.idToken);
		// 	// alert('Type: ' + type);
        // 	fetchDataGoogle(user?.auth?.idToken);
	  	// }
	} catch ({ message }) {
		alert('Error: ' + message);
	}
  };
//    export const checkSignIn = () => {
function checkSignIn (request, response) {
    // try {
		// const [request, response, promptAssync] = Google.useIdTokenAuthRequest({
		// 	androidClientId: '513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com',
		// 	// iosClientId: '513107977432-qnub27n3o6s0e3lo1sneio03o6ka5k9m.apps.googleusercontent.com',
		// 	// expoClientId: '513107977432-lc0v0hfelturt4qhieocja8f2dm6isht.apps.googleusercontent.com',
		// 	scopes: ['profile', 'email'],
		// 	// useProxy: true
		// })
		//   const [request, response, promptAsync] = Google.useAuthRequest({
		// 	androidClientId: "694235095257-fkbf1u81sm5ii76om74j5b7h8u4v2m7a.apps.googleusercontent.com",
		// 	iosClientId: "694235095257-qnub27n3o6s0e3lo1sneio03o6ka5k9m.apps.googleusercontent.com",
		// 	expoClientId: "694235095257-7t7h7mv877d2jfu7r508ct1egmesbqdm.apps.googleusercontent.com"
		//   });
		//   alert('login: Error:' + promptAssync);
		//   console.log(response)
		if (response === null) {
			// return dispatch({ type: GOOGLE_LOGIN_FAIL });
			alert('response is null');
		} 
		else {
			// alert('response2:' + response);
				// fetchDataGoogle('idToken');
				// dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
				// signIn();
		}
	// } catch ({ message }) {
	// 	alert('login: ' + message);
	// }
}
export const googleLogin = (response) => async (dispatch) => {
	if (response?.type === "success") {
	//   if (isSignedIn) {
		  fetchDataGoogle(response?.params?.id_token);
		  await AsyncStorage.setItem('google_token', response?.params?.id_token);
		  dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: response?.params?.id_token });
	//   }
	}  else {
	  // some other error happened
	  if (response?.error !== undefined) {
		alert('login: Error:' + response.error);
	  }
	}

	// console.log(response)
	// console.log(promptAsync)
    // try {
	// 	// const [request, response, promptAssync] = Google.useIdTokenAuthRequest({
	// 	// 	androidClientId: '513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com',
	// 	// 	// iosClientId: '513107977432-qnub27n3o6s0e3lo1sneio03o6ka5k9m.apps.googleusercontent.com',
	// 	// 	// expoClientId: '513107977432-lc0v0hfelturt4qhieocja8f2dm6isht.apps.googleusercontent.com',
	// 	// 	scopes: ['profile', 'email'],
	// 	// 	// useProxy: true
	// 	// })
	// 	  const [request, response, promptAsync] = Google.useAuthRequest({
	// 		androidClientId: "694235095257-fkbf1u81sm5ii76om74j5b7h8u4v2m7a.apps.googleusercontent.com",
	// 		iosClientId: "694235095257-qnub27n3o6s0e3lo1sneio03o6ka5k9m.apps.googleusercontent.com",
	// 		expoClientId: "694235095257-7t7h7mv877d2jfu7r508ct1egmesbqdm.apps.googleusercontent.com"
	// 	  });
	// 	  alert('login: Error:' + promptAssync);
	// 	  console.log(response)
	// 	// if (response === null) {
	// 	// 	// return dispatch({ type: GOOGLE_LOGIN_FAIL });
	// 	// 	alert('response is null');
	// 	// } 
	// 	// else {
	// 	// 	alert('response2:' + response);
	// 	// 		// fetchDataGoogle('idToken');
	// 	// 		// dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
	// 	// 		// signIn();
	// 	// }
	// } catch ({ message }) {
	// 	alert('login: ' + message);
	// }
}
export const googleLogin2 = () => async (dispatch) => {
	const token = await AsyncStorage.getItem('google_token');
	if (Platform.OS === 'ios') {
		await GoogleSignIn.initAsync({
			// You may ommit the clientId when the firebase `googleServicesFile` is configured
			clientId: '513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com',
		  });
		// const user = await GoogleSignIn.signInSilentlyAsync();
		signInAsync()
	} else {
		await GoogleSignIn.initAsync(
			{ 
				scopes: ['profile', 'email'],
				// isPromptEnabled: false,
				// isOfflineEnabled: true,
				webClientId:'513107977432-01pktott0s803ktn40ll0fib72jtuod0.apps.googleusercontent.com'
			}
		);
		signInAsync()
		//   if (type === 'cancel') {
		// 	  return dispatch({ type: GOOGLE_LOGIN_FAIL });
		//   } 
		//   else {
		// 		fetchDataGoogle(idToken);
		// 	  	dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
		// 	  	// signIn();
		//   }
		// checkSignIn(request, response)
		// const { type, idToken } = await Google.logInAsync({
		// 	iosClientId: `513107977432-7aqgll3sjloiv13ppgmpf8jkiuq00f05.apps.googleusercontent.com`,
		// 	androidClientId: `513107977432-ievlif60nmc6k0vbdcgmq4fm7ao7c26b.apps.googleusercontent.com`,
		// 	iosStandaloneAppClientId: `513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com`,
		// 	androidStandaloneAppClientId: `513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com`,
		
		// 	scopes: ['profile', 'email']
		//   });
		//   if (type === 'cancel') {
		// 	  return dispatch({ type: GOOGLE_LOGIN_FAIL });
		//   } 
		//   else {
		// 		fetchDataGoogle(idToken);
		// 	  	dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
		// 	  	// signIn();
		//   }

	}

};

export const googleLogin3 = () => async (dispatch) => {
	// if (Constants.appOwnership === 'standalone') {
		const token = await AsyncStorage.getItem('google_token');
		// androidClientId:'513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com',
		GoogleSignin.configure(
			{
			// scopes: ['profile', 'email'], // [Android] what API you want to access on behalf of the user, default is email and profile
			webClientId: '513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
			offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
			// hostedDomain: 'https://trofii.net/', // specifies a hosted domain restriction
			// forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
			// iosClientId: '513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
			// profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
		  }
		);
		
		try {
			// await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
			const userInfo = await GoogleSignin.signIn();
			// const userInfo = await GoogleSignin.signInSilently();
			
			alert('userInfo: ' + userInfo);
			// const { idToken, accessToken } = await GoogleSignin.getTokens();
			
			// // alert('Token: ' + idToken + ' AccessToken: ' + accessToken);
			// const isSignedIn = await GoogleSignin.isSignedIn();
			// // alert('isSignedIn: ' + isSignedIn);
			// if (isSignedIn) {
			// 	fetchDataGoogle(idToken);
			// 	await AsyncStorage.setItem('google_token', idToken);
			// 	dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
			// }
		} 
		catch (error) { 
			alert('login: ' + error);
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
			  // user cancelled the login flow
			  alert('login: Error:' + 'User cancels the sign in flow');
			  return dispatch({ type: GOOGLE_LOGIN_FAIL });
			} else if (error.code === statusCodes.IN_PROGRESS) {
			  // operation (e.g. sign in) is in progress already
			  const userInfo = await GoogleSignin.signInSilently();
			  const isSignedIn = await GoogleSignin.isSignedIn();
			  const { idToken } = await GoogleSignin.getTokens();
			  if (isSignedIn) {
				  fetchDataGoogle(idToken);
				  await AsyncStorage.setItem('google_token', idToken);
				  dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
			  }
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			  // play services not available or outdated
			  alert('login: Error:' + 'Play services are not available or outdated, this can only happen on Android');
			} else {
			  // some other error happened
						
				if (error !== undefined) {
					alert('login: Error:' + error);
				}
			}
		}  
	// }
	// const token = await AsyncStorage.getItem('google_token');
	// if (Platform.OS === 'ios') {
	// 	await GoogleSignIn.initAsync({
	// 		// You may ommit the clientId when the firebase `googleServicesFile` is configured
	// 		clientId: '513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com',
	// 	  });
	// 	const user = await GoogleSignIn.signInSilentlyAsync();
	// 	signInAsync()
	// } else {
		// const { type, idToken } = await Google.logInAsync({
		// 	iosClientId: `513107977432-7aqgll3sjloiv13ppgmpf8jkiuq00f05.apps.googleusercontent.com`,
		// 	androidClientId: `513107977432-ievlif60nmc6k0vbdcgmq4fm7ao7c26b.apps.googleusercontent.com`,
		// 	iosStandaloneAppClientId: `513107977432-2024knee33edbe35ksg9j626sitnm3rs.apps.googleusercontent.com`,
		// 	androidStandaloneAppClientId: `513107977432-kvg2n05qnefo7bm0n8a6oh8bdbeigsu4.apps.googleusercontent.com`,
		// 	scopes: ['profile', 'email']
		//   });

	// 	  if (type === 'cancel') {
	// 		  return dispatch({ type: GOOGLE_LOGIN_FAIL });
	// 	  } 
	// 	  else {
	// 			fetchDataGoogle(idToken);
	// 		  	dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: token });
	// 		  	// signIn();
	// 	  }
	// }

};
// const getCurrentUserInfo = async () => {
// 	try {
// 	  const userInfo = await GoogleSignin.signInSilently();
// 	  this.setState({ userInfo });
// 	} catch (error) {
// 	  if (error.code === statusCodes.SIGN_IN_REQUIRED) {
// 		// user has not signed in yet
// 	  } else {
// 		// some other error
// 	  }
// 	}
// };
// 	Generate a new random string for each sign-in
// const generateNonce = function(length) {
//   // const decoder = StringDecoder("ascii");
//   const decoder = new StringDecoder('ascii');

// // const buf = Buffer.alloc(length, 'aGVsbG8gd29ybGQ=', 'ascii');
//   const buf = Buffer.alloc(length,);

//   var nonce = uuid();
//   while (nonce.length < length) {
//     // Math.random(buf);
//     // crypto.randomFillSync(buf);
//     Random.getRandomBytesAsync(buf)
//     nonce = decoder.write(buf);
//   }

//   return nonce.substr(24, length);
// };

const fetchDataGoogle = async (idToken) => {
	const provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('profile');
	provider.addScope('email');
	const googleCredential = provider.credential(idToken);
	firebase.auth().signInWithCredential(googleCredential)
	    .then((resp) => {
	    	const fullname = resp.user.displayName;
			const stringArray = fullname.split(' ');
			const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
			refrence.once('value').then(async(snapshot) => {	
			// signIn();
			if (snapshot.val() === null) { 
				await AsyncStorage.setItem('userToken', idToken);
				refrence.update({
			      email: resp.user.email,
			      firstname: fullname === null ? 'First' : stringArray[0],
			      lastname: fullname === null ? 'Last' : stringArray[1],
			      image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
			      points: 0,
				  isRestActive: false,
				  yourLocation: ' ',
				  restName: '',
				  tempHours: 0,
				  followingNum: 0,
				  restFollowingNum: 0,
				  egiftEarned: 0,
				  username: '',
				  redeemedPoints: 0,
				  restMaxPercentage: 0,
				  aroundRadius: 40234,
				  phoneNum: '',
				  isRecommended: false,
				  code: 0,
				  userTotalRate: 0,
				  expoToken: '',
				  tokenPass: '',
				  restAddress: '',
				  restWebsite: '',
				  restDesc: '',
				  restOrderWeb: '',
				  restHours: '',
				  followerNum: 0,
				  createdAt: createdDate,
				  Drink: 0,
				  Appetizer: 0,
				  Entrée: 0,
				  Dessert: 0,
        		  eGiftChoiceDate: 202012,
				  egiftChoice: 'grub',
				  restsList: { 0: '_' },
				  followersList: { 0: '_' },
				  followingList: { 0: '_' },
				  Notifications: { tempBadgeNum: 0, notificationsList: { 0: '_' } },
				  boolToken: true,
				  iseGiftRequested: false
		    	});
		    	SettingInfo.InfoPusher({
			      email: resp.user.email,
			      firstname: fullname === null ? 'First' : stringArray[0],
			      lastname: fullname === null ? 'Last' : stringArray[1],
			      image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
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
				  expoToken: '',
				  restDesc: '',
				  restHours: '',
				  code: 0,
				  Entrée: 0,
				  phoneNum: '',
				  Dessert: 0,
				  restName: '',
				  restMaxPercentage: 0,
				  username: '',
				  tokenPass: '',
				  createdAt: createdDate,
				  restAddress: '',
				  restWebsite: '',
				  restOrderWeb: '',
				  isRestActive: false,
				  yourLocation: ' ',
				  followerNum: 0,
        		  eGiftChoiceDate: 202012,
				  egiftChoice: 'grub',
				  restsList: { 0: '_' },
				  followersList: { 0: '_' },
				  followingList: { 0: '_' },
				  Notifications: { tempBadgeNum: 0, notificationsList: { 0: '_' } },
				  boolToken: true,
				  iseGiftRequested: false
		    	});
	    	}
	    	else {
				await AsyncStorage.setItem('userToken', idToken);
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
				  iseGiftRequested: snapshot.val().iseGiftRequested
		    	});
	    	}
			});
	    });
	};

const fetchDataAPPLE = async (token, nonce) => {
	// const unhashedNonce = generateNonce(10);
	const provider = new firebase.auth.OAuthProvider("apple.com")
	const appleCredential = provider.credential({ idToken:token, rawNonce: nonce });
	firebase.auth().signInWithCredential(appleCredential)
	    .then((resp) => {
	    	const fullname = resp.user.displayName;
	    	let stringArray = "";
	    	if (fullname !== null) {
				stringArray = fullname.split(' ');
	    	}
			const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
			refrence.once('value').then(async(snapshot) => {
			// signIn();
	    	// console.log(resp.user);
			if (snapshot.val() === null) { 
				await AsyncStorage.setItem('userToken', token);
				refrence.update({
			      email: resp.user.email,
			      firstname: fullname === null ? 'First' : stringArray[0],
			      lastname: fullname === null ? 'Last' : stringArray[1],
			      image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
			      points: 0,
				  isRestActive: false,
				  yourLocation: ' ',
				  restName: '',
				  tempHours: 0,
				  egiftEarned: 0,
				  restFollowingNum: 0,
				  username: '',
				  redeemedPoints: 0,
				  restMaxPercentage: 0,
				  aroundRadius: 40234,
				  phoneNum: '',
				  isRecommended: false,
				  code: 0,
				  userTotalRate: 0,
				  followingNum: 0,
				  expoToken: '',
				  tokenPass: '',
				  restAddress: '',
				  restWebsite: '',
				  restDesc: '',
				  restOrderWeb: '',
				  restHours: '',
				  followerNum: 0,
				  createdAt: createdDate,
				  Drink: 0,
				  Appetizer: 0,
				  Entrée: 0,
				  Dessert: 0,
				  egiftChoice: 'grub',
        		  eGiftChoiceDate: 202012,
				  restsList: { 0: '_' },
				  followersList: { 0: '_' },
				  followingList: { 0: '_' },
				  Notifications: { tempBadgeNum: 0, notificationsList: { 0: '_' } },
				  boolToken: true,
				  iseGiftRequested: false
		    	});
		    	SettingInfo.InfoPusher({
			      email: resp.user.email,
			      firstname: fullname === null ? 'First' : stringArray[0],
			      lastname: fullname === null ? 'Last' : stringArray[1],
			      image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
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
				  expoToken: '',
				  restDesc: '',
				  restHours: '',
				  code: 0,
				  Entrée: 0,
				  phoneNum: '',
				  Dessert: 0,
				  restName: '',
				  restMaxPercentage: 0,
				  username: '',
				  tokenPass: '',
				  createdAt: createdDate,
				  restAddress: '',
				  restWebsite: '',
				  restOrderWeb: '',
				  isRestActive: false,
				  yourLocation: ' ',
				  followerNum: 0,
        		  eGiftChoiceDate: 202012,
				  restsList: { 0: '_' },
				  followersList: { 0: '_' },
				  followingList: { 0: '_' },
				  egiftChoice: 'grub',
				  Notifications: { tempBadgeNum: 0, notificationsList: { 0: '_' } },
				  boolToken: true,
				  iseGiftRequested: false
		    	});
	    	}
	    	else {
				await AsyncStorage.setItem('userToken', token);
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
				  iseGiftRequested: snapshot.val().iseGiftRequested
		    	});
	    	}
			});
	    });
	};


const fetchDataFB = async (token) => {
		// const provider = new firebase.auth.FacebookAuthProvider();
	    // const credential = provider.credential({ accessToken: token });
		// console.log(credential.accessToken)
		const credential = firebase.auth.FacebookAuthProvider.credential(token);
		firebase.auth().signInWithCredential(credential)
	    .then((resp) => {
			// console.log(resp)
			var user = firebase.auth().currentUser;
				const fullname = resp.user.displayName;
				const stringArray = fullname.split(' ');
				const refrence = firebase.database().ref(`/users/${resp.user.uid}`);
				// const refrenceRestsList = firebase.database().ref(`/restsList/`);
				// refrenceRestsList.once('value').then(function(snapshot) {
				// 	if (snapshot.val() === null) { 
				// 		refrenceRestsList.push({
				// 		    image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
				// 			isRestActive: false,
				// 			restName: '',
				// 			restAddress: '',
				// 			restaurantUid: `${resp.uid}`,
				// 	        RestNumFollowers: 0,
				// 	        RestApptNum: 0,
				// 	        RestDrinkNum: 0,
				// 	        RestEntreeNum: 0,
				// 	        RestDessertNum: 0
				//     	});
			 //    		RestSettingInfo.RestInfoPusher({
				// 		    image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
				// 			isRestActive: false,
				// 			restName: '',
				// 			restAddress: '',
				// 			restaurantUid: `${resp.uid}`,
				// 	        RestNumFollowers: 0,
				// 	        RestApptNum: 0,
				// 	        RestDrinkNum: 0,
				// 	        RestEntreeNum: 0,
				// 	        RestDessertNum: 0
				//     	});
				// 	} 
				// 	else { 
				// 		refrenceRestsList.push({
				// 		    image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e',
				// 			isRestActive: false,
				// 			restName: '',
				// 			restAddress: '',
				// 			restaurantUid: `${resp.uid}`,
				// 	        RestNumFollowers: 0,
				// 	        RestApptNum: 0,
				// 	        RestDrinkNum: 0,
				// 	        RestEntreeNum: 0,
				// 	        RestDessertNum: 0
				//     	});
			 //    		RestSettingInfo.RestInfoPusher({
				// 	      	image: snapshot.val().image,
				// 		  	isRestActive: snapshot.val().isRestActive,
				// 		  	restName: snapshot.val().restName,
				// 		  	restAddress: snapshot.val().restAddress,
				// 		  	restaurantUid: snapshot.val().restaurantUid,
				// 	        RestNumFollowers: snapshot.val().RestNumFollowers,
				// 	        RestApptNum: snapshot.val().RestApptNum,
				// 	        RestDrinkNum: snapshot.val().RestDrinkNum,
				// 	        RestEntreeNum: snapshot.val().RestEntreeNum,
				// 	        RestDessertNum: snapshot.val().RestDessertNum
				//     	});
				// 	}
				// });
				refrence.once('value').then(async(snapshot) => {
				if (snapshot.val() === null) { 
					await AsyncStorage.setItem('userToken', token);
					// signIn();
					refrence.update({
					  email: resp.user.email,
					  firstname: stringArray[0],
					  lastname: stringArray[1],
					  image: resp.user.photoURL,
					  points: 0,
					  isRestActive: false,
					  yourLocation: ' ',
					  restName: '',
					  tempHours: 0,
					  egiftEarned: 0,
					  username: '',
					  redeemedPoints: 0,
					  restMaxPercentage: 0,
					  restFollowingNum: 0,
					  followingNum: 0,
					  aroundRadius: 40234,
					  phoneNum: '',
					  isRecommended: false,
					  code: 0,
					  userTotalRate: 0,
					  expoToken: '',
					  tokenPass: '',
					  restAddress: '',
					  restWebsite: '',
					  restDesc: '',
					  restOrderWeb: '',
					  restHours: '',
					  followerNum: 0,
					  createdAt: createdDate,
					  Drink: 0,
					  Appetizer: 0,
					  Entrée: 0,
					  Dessert: 0,
					  eGiftChoiceDate: 202012,
					  restsList: { 0: '_' },
					  followersList: { 0: '_' },
					  followingList: { 0: '_' },
					  egiftChoice: 'grub',
					  Notifications: { tempBadgeNum: 0, notificationsList: { 0: '_' } },
					  boolToken: true,
					  iseGiftRequested: false
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
					  expoToken: '',
					  restDesc: '',
					  restHours: '',
					  code: 0,
					  followingNum: 0,
					  Entrée: 0,
					  phoneNum: '',
					  Dessert: 0,
					  restName: '',
					  restMaxPercentage: 0,
					  username: '',
					  tokenPass: '',
					  createdAt: createdDate,
					  restAddress: '',
					  restWebsite: '',
					  restOrderWeb: '',
					  isRestActive: false,
					  yourLocation: ' ',
					  followerNum: 0,
					  eGiftChoiceDate: 202012,
					  restsList: { 0: '_' },
					  followersList: { 0: '_' },
					  followingList: { 0: '_' },
					  restFollowingNum: 0,
					  egiftChoice: 'grub',
					  Notifications: { 
						  tempBadgeNum: 0, 
						  notificationsList: { 0: '_' }
					  },
					  boolToken: true,
					  iseGiftRequested: false
					});
				}
				else {
					await AsyncStorage.setItem('userToken', token);
					// signIn();
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
					  iseGiftRequested: snapshot.val().iseGiftRequested
					});
				}
				});
	    }).catch((err) =>{
			console.log(err)
			if (err.message === 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.') {
				Alert.alert('Facebook Login Error', err.message,
				[
					{text: 'OK', onPress: () => {
						AsyncStorage.removeItem('fb_token');
					}},
				]
				// ,
				//   { cancelable: false }
					
				  );
			}
		});
	};

