
import React, { useEffect, useState, useRef }  from 'react';
import { 
    View, 
    Text, 
    Keyboard,
    Image,
    Linking,
    TouchableOpacity, 
    TouchableHighlight,
    ImageBackground,
    Platform,
    Dimensions,
    StyleSheet,
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
// import LinearGradient from 'react-native-linear-gradient';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as AppleAuthentication from 'expo-apple-authentication';
import Feather from 'react-native-vector-icons/Feather';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import Tags from "react-native-tags";
import axios from 'axios';
// import * as firebase from 'firebase';
import algoliasearch from 'algoliasearch';
import { connect } from 'react-redux';
import {  Avatar, Card, Title, Paragraph, DefaultTheme, useTheme, Button, List, RadioButton, TextInput } from 'react-native-paper';
import * as actions from '../actions';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';
import openMap from 'react-native-open-maps';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import uuid from 'uuid-v4';
import update from 'immutability-helper';
import { AuthContext } from '../components/context';
import { ScrollView } from 'react-native-gesture-handler';
import { margin, marginBottom } from 'styled-system';

const firebase = require('firebase/app').default
require('firebase/auth')
require('firebase/database')

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();
// const newImage = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenuItem.png?alt=media&token=afea0680-37f2-4ce6-b429-8838796b747d';
const oldImage = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d';

const createdDate = ((year * 10000) + (month * 100) + day);

const restAttrToRetr = ['restaurantUid', 'restName', 'restAddress', 'restWebsite', 'isRestActive', 'image', 'RestNumFollowers', 'restHours', 'objectID', 'Notifications', 'restsList',
                        'RestEntreeNum', 'RestDrinkNum', 'RestDessertNum', 'RestApptNum', 'restMaxPercentage', 'phoneNum', 'restDesc', 'restOrderWeb'];

// const attrToRetr = ['foodInfo.image', 'restName', 'publish', 'isUndecided','isRestActive', 'isImageUploaded'];

const attrToRetr = ['foodInfo.tags', 'foodInfo.foodType', 'foodInfo.food_name', 'restaurantUid', 'dateId', 'foodInfo.Calorie', 'totalView', 'phoneNum', 'restDesc', 'Notifications',
                    'foodInfo.image', 'restName', 'foodInfo.Rate.overallRate', 'foodInfo.Rate.qualityRate', 'comments', 'foodInfo.price', 'publish', 'isUndecided',
                    'foodInfo.Rate.matchingPicRate', '_geoloc.lat', '_geoloc.lng', 'restWebsite', 'tempChecker.uids', 'restHours', 'isRestActive', 'isImageUploaded',
                    'foodLocation.latitude', 'foodLocation.longitude', 'restAddress', 'restOrderWeb', 'foodInfo.Rate.totalRate', 'tempChecker.hour'];


const avatorTheme = {
  ...DefaultTheme,
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    primary: '#EE5B64',
    accent: '#EE5B64',
  },
};

const foodImage = require('../assets/images/2.png');
const foodImageUri = Image.resolveAssetSource(foodImage).uri;

const foodImage0 = require('../assets/images/0.png');
const foodImage0Uri = Image.resolveAssetSource(foodImage0).uri;
// const foodImage0Uri = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2F0.png?alt=media&token=02da43d8-cbfe-4017-9a37-dc0a4a019665';

const foodImage1 = require('../assets/images/1.png');
const foodImage1Uri = Image.resolveAssetSource(foodImage1).uri;
// const foodImage1Uri = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2F1.png?alt=media&token=3b1acbe0-9307-488f-93a6-2c75c71d79ec';

let dateID = 0;

const RequestNewRestScreen = (props) => {
  
    const [searchQuery, setSearchQuery] = useState('');
    const onChangeSearch = query => setSearchQuery(query);
    const firstNameRef = useRef(null);

    useEffect(() => {
        // let controller = new AbortController()

        setTimeout(async() => {
            try {
                await isOpen(props.route.params.place_id);
                controller = null;
            } catch (e) { 
              // Handle fetch error
            }
            
        }, 10);
        return () => { 
        //   clearTimeout(timerId);
        //   controller?.abort();
        //   console.log('unmounting...');
        }
      }, []);

    const [newData, setData] = React.useState({
        restName: '',
        restAddress: '',
        restAxiosData: null,
        isOpenNow: false,
        noResultsReq: false,
        toggleItemCat: true,
        userSubmitImage: false,
        isFirstNameFocused: false,
        itemName: '',
        farAway: '',
        newCatType: 'Entrée',
        restOrderWeb: '',
        restWebsite: '',
        takenPicture: '',
        phoneNum: 0,
        image: '_5_',
        foodMenu: [],
        cardRestNumFollowers: 0,
        RestNumFollowers: 0,
        business_status: 'OPERATIONAL', // CLOSED_TEMPORARILY
        currentLocation: {
            latitude: 41.937705,
            longitude: -87.657607,
            latitudeDelta: 0.20546,
            longitudeDelta: 0.17854
        },
    });

    const { colors } = useTheme();

    // const { signIn } = React.useContext(AuthContext);

    // useEffect(() => { 
	//   	const worestsListsReg = firebase.database().ref('/worestsLists/');
    //     //   console.log(props)
	//   	worestsListsReg.once('value', (snapshot) => {
	// 			if (snapshot.val() !== null) {
	// 		    	setData({ ...newData, bonusEmails: snapshot.val().bonusEmails });
	// 		    	// const emailListsLength = snapshot.val().length;
	// 		    	// let i;
	// 		    	// for (i = 0; i < emailListsLength; i++) {
	// 		    	// 	console.log(snapshot.val().bonusEmails[i]);
	// 		    	// }
	// 	    	}
	// 	    });

    //     return () => { 
    //     //   console.log('unmounting...');
    //     }
    //   }, [newData.bonusEmails]);
    const shuffle = (array) => {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        // this.setState({ restsImage: this.state.restsImage.concat(array[randomIndex].image) });
      }

      return array;
    }
    async function isOpen (place_id) {
        const newResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,type,opening_hours,formatted_phone_number,formatted_address,geometry,website,business_status&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`)
        let strFarAway;
        const { currentUser } = firebase.auth();
            if (currentUser !== null) {
                firebase.database().ref(`/users/${currentUser?.uid}`).once('value', async (snapshot) => {
                    if (snapshot.val() !== null) {
                        if (props?.route?.params?.cameFrom === 'Restaurant' || props?.route?.params?.cameFrom === 'Home') {
                                strFarAway = await distance(newResponse?.data?.result?.geometry?.location?.lat, newResponse?.data?.result?.geometry?.location?.lng);
                                setData({ 
                                    ...newData, 
                                        farAway: strFarAway, 
                                        restAxiosData: newResponse, 
                                        cardIcon: 'heart-o', 
                                        isLiked: false, 
                                        restName: newResponse?.data?.result?.name,
                                        restAddress: newResponse?.data?.result?.formatted_address,
                                        isOpenNow: newResponse?.data?.result?.opening_hours?.open_now,
                                        restWebsite: newResponse?.data?.result?.website,
                                        phoneNum: newResponse?.data?.result?.formatted_phone_number,
                                        business_status: newResponse?.data?.result?.business_status
                                });
                        } 
                    } else {                            
                        strFarAway = await distance(newResponse?.data?.result?.geometry?.location?.lat, newResponse?.data?.result?.geometry?.location?.lng);
                        setData({ 
                            ...newData, 
                                farAway: strFarAway,
                                restAxiosData: newResponse, 
                                restName: newResponse?.data?.result?.name,
                                restAddress: newResponse?.data?.result?.formatted_address,
                                isOpenNow: newResponse?.data?.result?.opening_hours?.open_now,
                                restWebsite: newResponse?.data?.result?.website,
                                phoneNum: newResponse?.data?.result?.formatted_phone_number,
                                business_status: newResponse?.data?.result?.business_status
                        });
                    }
                })
            } else {                            
                strFarAway = await distance(newResponse?.data?.result?.geometry?.location?.lat, newResponse?.data?.result?.geometry?.location?.lng);
                setData({ 
                    ...newData, 
                        farAway: strFarAway, 
                        restAxiosData: newResponse, 
                        restName: newResponse?.data?.result?.name,
                        restAddress: newResponse?.data?.result?.formatted_address,
                        isOpenNow: newResponse?.data?.result?.opening_hours?.open_now,
                        restWebsite: newResponse?.data?.result?.website,
                        phoneNum: newResponse?.data?.result?.formatted_phone_number,
                        business_status: newResponse?.data?.result?.business_status
                });
            }
            // setData({ ...newData, foodMenu: object, restAxiosData: newResponse, cardRestNumFollowers: props.route.params.finalResults.RestNumFollowers });
       
   }
    const distance = async (lat2,lon2) => {
        
        // setTimeout(async() => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const newStrFarAway = await Location.getCurrentPositionAsync({accuracy: 1}).then(async (currentLocation) => { 
                            const lat1 = currentLocation.coords.latitude;
                            const lon1 = currentLocation.coords.longitude;
                            // const lat2 = newData.restAxiosData?.data?.result?.geometry?.location?.lat;
                            // const lon2 = newData.restAxiosData?.data?.result?.geometry?.location?.lng;
                            var radlat1 = Math.PI * lat1/180
                            var radlat2 = Math.PI * lat2/180
                            var theta = lon1-lon2
                            var radtheta = Math.PI * theta/180
                            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                            dist = Math.acos(dist)
                            dist = dist * 180/Math.PI
                            dist = dist * 60 * 1.1515
                            // if (unit=="K") { dist = dist * 1.609344 }
                            // if (unit=="M") { dist = dist * 0.8684 }
                            dist = dist * 0.8684
                            const strFarAway = `${Math.ceil(dist)} M Away`;
                            // setData({ ...newData, farAway: strFarAway })
                            // console.log('strFarAway: ', strFarAway)
                            return strFarAway
                        }).catch((err) => {
                            // console.log('error: ', err)
                        });
                        return newStrFarAway
                }
            } catch {

            }
        // }, 10);
    }
    // async function requestNow (place_id) {
    //    const reesponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,type,opening_hours,formatted_phone_number,formatted_address,geometry,website,business_status&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`)
    //     setData ({
    //        ...newData,
    //        restAxiosData: reesponse,
    //        restName:reesponse?.data?.result?.name,
    //        restAddress: reesponse?.data?.result?.formatted_address,
    //        isOpenNow: reesponse?.data?.result?.opening_hours?.open_now,
    //        restWebsite: reesponse?.data?.result?.website,
    //        phoneNum: reesponse?.data?.result?.formatted_phone_number,
    //        business_status: reesponse?.data?.result?.business_status
    //    })
    //    console.log(reesponse)
       //    const { currentUser } = firebase.auth();
    //         firebase.database().ref(`/users/${currentUser.uid}`).once('value', (snapshot) => {
    //             if (snapshot.val() !== null) {
    //                 if (snapshot.val().restsList.indexOf(props.route.params.restaurantUid) !== -1) {
    //                     setData({ ...newData, foodMenu: object, restAxiosData: newResponse, cardRestNumFollowers: props.route.params.finalResults.RestNumFollowers, cardIcon: 'heart', isLiked: true });
    //                 } else {
    //                     setData({ ...newData, foodMenu: object, restAxiosData: newResponse, cardRestNumFollowers: props.route.params.finalResults.RestNumFollowers, cardIcon: 'heart-o', isLiked: false });
    //                 }
    //             } else {
    //                 setData({ ...newData, foodMenu: object, restAxiosData: newResponse, cardRestNumFollowers: props.route.params.finalResults.RestNumFollowers });
    //             }
    //         })
//    }
    const getGeocode = (lat, lng) => {
     axios.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ lat +','+ lng +'&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU') // be sure your api key is correct and has access to the geocode api
        .then(response => {
            setData({
                ...newData, 
                    yourLocation: response.data.results[0].formatted_address,
                    isChangeLocation: false
            });
        }).catch((error) => { // catch is called after then
            setData({
                ...newData, error: error.message
            });
        });
    }
     const _getLocationAsync = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let currentLocation = await Location.getCurrentPositionAsync({});
          getGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude);
        } else {
            setData({
                ...newData, 
                errorMessage: 'Permission to access location was denied',
            });
        }
      };   
      const callNow = async (phoneNum) => {
        //   CALL({ number: phoneNum });
          Linking.openURL(`tel:${phoneNum}`);
      } 
      const goToLocation = (address) => {
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU`)
         .then(response => {
            openMap({ 
              query: response.data.results[0].formatted_address, 
              latitude: response.data.results[0].geometry.location.lat, 
              longitude: response.data.results[0].geometry.location.lng, 
              zoom: 18, 
              provider: Platform.OS === 'ios' ? 'apple' : 'google', 
              end: response.data.results[0].formatted_address,
              travelType: 'drive'
            });
          });
        }
    //   const orderOnline = (restOrderWeb) => {
    //     const { currentUser } = firebase.auth();
    //     // if (currentUser === null || currentUser === undefined) {
    //     //     this.setState({ isUserUnsignedVisible: true, isCommentsVisible: false });
    //     //   }
    //     if ((currentUser !== null && currentUser !== undefined) && (restOrderWeb === null || restOrderWeb === undefined || restOrderWeb === '')) {
    //     Alert.alert('Online Order Error: ', 'Sorry, online ordering for this restaurant is not setup, yet.\n\n\nPlease come back later. ', [{ text: 'OK', 
    //       onPress: () => {}, 
    //       style: 'cancel' }], { cancelable: false });
    //     } 
    //     // if (currentUser !== null && currentUser !== undefined && restOrderWeb !== undefined && restOrderWeb !== '') {
    //       Linking.openURL(`http://${restOrderWeb}`);
    //     // }
    //   }   
    const openUntil = (periods) => {
        if (periods !== undefined & periods !== null) {
            const today = new Date().getDay();
            const hr = new Date().getHours();
            const minute = new Date().getMinutes();
            let timeNow = (hr * 100) + minute;
            // let yesterday = today - 1;
            // let time = periods[today]?.close?.time
            // let timeOpen = periods[today]?.open?.time
            // let timeNum = Number(timeOpen);

            for (var i = 0; i < periods.length; i++) {
                if(periods[i].open.day === today) {
                    let yesterday = i - 1;
                    let time = periods[i]?.close?.time
                    let timeOpen = periods[i]?.open?.time;
                    let timeNum = Number(timeOpen);
                    if(timeNow < timeNum) {
                        if (yesterday === -1) {
                            yesterday = 6;
                            time = periods[yesterday]?.close?.time;
                            timeNum = Number(time);
                            if (time !== undefined & time !== null) {
                                const hour = Number(time.toString().substring(0, 2));
                                const min = Number(time.toString().substring(2, 4));
                                    return(`until ${hour > 12 ? `${hour === 24 ? '00' : `${hour - 12}`}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`} ${hour >= 12 ? `${hour === 24 ? 'AM' : 'PM'}` : 'AM'}`);
                            } else {
                                return('')
                            }
                        } else {
                            time = periods[yesterday]?.close?.time;
                            timeNum = Number(time);
                            if (time !== undefined & time !== null) {
                                const hour = Number(time.toString().substring(0, 2));
                                const min = Number(time.toString().substring(2, 4));
                                    return(`until ${hour > 12 ? `${hour === 24 ? '00' : `${hour - 12}`}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`} ${hour >= 12 ? `${hour === 24 ? 'AM' : 'PM'}` : 'AM'}`);
                            } else {
                                return('')
                            }
                        }
                    } else {
                        if (time !== undefined & time !== null) { 
                            const hour = Number(time.toString().substring(0, 2));
                            const min = Number(time.toString().substring(2, 4));
                                return(`until ${hour > 12 ? `${hour === 24 ? '00' : `${hour - 12}`}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`} ${hour >= 12 ? `${hour === 24 ? 'AM' : 'PM'}` : 'AM'}`);
                        } else {
                            return('')
                        }
                    }
                } else {
                    return('')
                }
            }
        }
    }      
    const closedUntil = (periods) => {
        if (periods !== undefined & periods !== null) {
            const today = new Date().getDay();
            const hr = new Date().getHours();
            const minute = new Date().getMinutes();
            const timeNow = (hr * 100) + minute;

            for (var i = 0; i < periods.length; i++) {
                if(periods[i].open.day === today) {
                    let time = periods[i]?.open?.time;
                    let timeNum = Number(time);
                    if (time !== undefined & time !== null) {
                        if (timeNow < timeNum) {
                            const hour = Number(time.toString().substring(0, 2));
                            const min = Number(time.toString().substring(2, 4));
                            let returnStr = `until ${hour > 12 ? `${hour === 24 ? '00' : `${hour - 12}`}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`} ${hour >= 12 ? `${hour === 24 ? 'AM' : 'PM'}` : 'AM'}`;
                                return(returnStr);
                        } else {
                            const tomorrow = today + 1;
                            time = periods[tomorrow]?.open?.time;
                            const hour = Number(time.toString().substring(0, 2));
                            const min = Number(time.toString().substring(2, 4));
                            let returnStr = `until tomorrow ${hour > 12 ? `${hour === 24 ? '00' : `${hour - 12}`}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`} ${hour >= 12 ? `${hour === 24 ? 'AM' : 'PM'}` : 'AM'}`;
                            return(returnStr);
                        }
                    } else {
                        return('')
                    }
                } else {
                    return('')
                }
            }
        }
    }
    const tagSeperator = (tags) => {
        if (tags !== undefined) {
            const tagsArr = tags.split(", ");
            return (
                <Tags
                initialTags={tagsArr}
                containerStyle={{ justifyContent: "center" }}
                inputContainerStyle={{ height: 0, width: 0 }}
                renderTag={({ tag, index }) => (
                    <View key={`${tag}-${index}`} style={{ marginLeft: 2, marginTop: -10, marginRight: 3, marginBottom: 20, backgroundColor: 'rgba(238, 91, 100, 0.14)', borderRadius: 10, height: tag.length > width / 13.71 ? 50 : 30, justifyContent: 'center', alignItems: 'center' }}> 
                        <Paragraph style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, color: '#C90611', marginLeft: 10, marginRight: 10 }}>{tag}</Paragraph>
                    </View>
                )}
                />
            )
        }
    }

    const checkIsFollow = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user !== null) {
                firebase.database().ref(`/users/${user.uid}`).once('value', (snapshot) => {
                    if (snapshot.val() !== null) {
                        // console.log('checkIsFollow');
                        if (snapshot.val().restsList.indexOf(props.route.params.restaurantUid) !== -1) {
                            setData({ ...newData, cardIcon: 'heart', isLiked: true, isLogin: false });
                        }
                        else if (snapshot.val().restsList.indexOf(props.route.params.restaurantUid) === -1) {
                            setData({ ...newData, cardIcon: 'heart-o', isLiked: false, isLogin: false });
                        }
                    }
                })
            }
        })
    } 
    const login = (type) => {
      if (type === 'facebook') {
        props.facebookLogin()
        .then(() => {
            setTimeout(() => {
                checkIsFollow()
            }, 100);
        })
        // setData({ ...newData, isLogin: false });
      } 
      else if (type === 'google') {
        props.googleLogin()
        .then(() => {
            setTimeout(() => {
                checkIsFollow()
            }, 100);
        })
      } 
      if (type === 'apple') {
        props.appleLogin()
        .then(() => {
            setTimeout(() => {
                checkIsFollow()
            }, 100);
        })
        // setData({ ...newData, isLogin: false });
      } 
    }
    // const followingFunc = () => {
    //   const { currentUser } = firebase.auth();
    //   let userRef;
    //   if (currentUser !== null) {
    //     userRef = firebase.database().ref(`/users/${currentUser.uid}`);
    //     const restListRef = firebase.database().ref(`/restsList/${props.route.params.finalResults.objectID}`);
    //     const restRef = firebase.database().ref(`/users/${props.route.params.restaurantUid}`);
    //     let restFollowersList = [];
    //     let idxOfFollowerList = [];
    //     restRef.once('value', (snapFirst) => {
    //       restFollowersList = snapFirst.val().followersList;
    //       if (newData.cardIcon === 'heart-o') {
    //         userRef.once('value', (snapshot) => {
    //         if (snapshot !== null && restFollowersList !== undefined && restFollowersList !== null) {
    //             const ListOfRests = snapshot.val().restsList;
    //             ListOfRests.push(props.route.params.restaurantUid);
    //             userRef.update({ restsList: ListOfRests, followerNum: (snapshot.val().followerNum + 1) });      
    //             restListRef.update({ RestNumFollowers: (newData.cardRestNumFollowers + 1) });  
    //             restRef.update({ followerNum: (newData.cardRestNumFollowers + 1), followersList: restFollowersList.concat(`${currentUser.uid}`) });
    //             return (
    //               setData({ ...newData, cardIcon: 'heart', isLiked: true, cardRestNumFollowers: newData.cardRestNumFollowers + 1 })
    //             );
    //           }
    //         });
    //       } 
    //       if (newData.cardIcon === 'heart' && newData.cardRestNumFollowers !== 0) {
    //           userRef.once('value', (snapshot) => {
    //             if (snapshot !== null) {
    //               const ListOfRests = snapshot .val().restsList;
    //               const idx = ListOfRests.indexOf(props.route.params.restaurantUid);
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
    //                         setData({ ...newData, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: newData.cardRestNumFollowers - 1 })
    //                       );
    //                     } 
    //                     else {
    //                       userRef.update({ restsList: { 0: '_' }, followerNum: 0 }); 
    //                       restRef.update({ followerNum: (newData.cardRestNumFollowers - 1), followersList: restFollowersList });
    //                       restListRef.update({ RestNumFollowers: (newData.cardRestNumFollowers - 1) });
    //                       return (
    //                         setData({ ...newData, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: newData.cardRestNumFollowers - 1 })
    //                       );
    //                     }
    //                   } 
    //                   else {
    //                       if (restFollowersList.length === 0) {
    //                         userRef.update({ restsList: ListOfRests, followerNum: (newData.cardRestNumFollowers - 1) });
    //                         restListRef.update({ RestNumFollowers: 0 });
    //                         restRef.update({ followerNum: 0, followersList: { 0: '_' } });
    //                         return (
    //                             setData({ ...newData, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: newData.cardRestNumFollowers - 1 })
    //                         );
    //                       }
    //                     else {
    //                       userRef.update({ restsList: ListOfRests, followerNum: (newData.cardRestNumFollowers - 1) });
    //                       restRef.update({ followerNum: (newData.cardRestNumFollowers - 1), followersList: restFollowersList });
    //                       restListRef.update({ RestNumFollowers: (newData.cardRestNumFollowers - 1) });
    //                       return (
    //                         setData({ ...newData, cardIcon: 'heart-o', isLiked: false, cardRestNumFollowers: newData.cardRestNumFollowers - 1 })
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
    //         setData({ ...newData, isLogin: true });}
    //   }
    const useCameraHandler = async () => {
        await askPermissionsAsync();
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            base64: false,
            quality: 0.5
        });
          // setTimeout(() => {
          //      this.setState({ loadingStateVisible: false });
          // }, 1000);
          _handleImagePicked(result);
        // if (result.cancelled) {
        //   setTimeout(() => {
        //        this.setState({ loadingStateVisible: false });
        //   }, 1000);
        // }
      
      };
      const useLibraryHandler = async () => {
        await askPermissionsAsync();
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            base64: false,
            quality: 0.5
        });
        // this.setState({ loadingOverlayVisible: true });
        _handleImagePicked(result);
      };
      const _handleImagePicked = async pickerResult => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const hrs = new Date().getHours();
        const min = new Date().getMinutes();
        const time = `${month}/${day}/${year} ${hrs}:${min}`;
        // const sec = new Date().getSeconds();
        const milsec = new Date().getMilliseconds();
        // const dateID = ((year * 10000000000000) + (month * 100000000000) + 
          // (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
        // const { currentUser } = firebase.auth();
        try {
          if (!pickerResult.cancelled) {
            let uploadUrl = await uploadImageAsync(pickerResult.uri);
            // if (newData.noResultsReq === true) {
              // const userImageRef = firebase.database().ref(`/userImage/${currentUser.uid}`);
              // const restImageRef = firebase.database().ref(`/restImage/${data.finalResults[data.activeSlide].restaurantUid}/${data.finalResults[data.activeSlide].objectID}`);
            //   const newItem = newData.finalResults;
            //   const imageUrl = update(newData.finalResults[newData.activeSlide], { foodInfo: { image: { $set: uploadUrl } } });
            //   newItem[newData.activeSlide] = imageUrl;
            setTimeout(() => {
                setData({ 
                  ...newData, 
                    takenPicture: uploadUrl,
                    // finalResults: newItem,
                    userSubmitImage: false
                })
            }, 10);
              
            // } else {
            //   setData({ 
            //     ...newData, 
            //         takenPicture: uploadUrl
            //   })
            // }
          }
        } catch (e) {
          alert('Upload failed, sorry :(');
        } finally {
              setData({ 
                ...newData, 
                uploading: false
              })
        }
      };
      const cancelUpdate = () => {
        // Delete the file
        if (newData.takenPicture !== '') {
          var the_string = newData.takenPicture;
          var imageFirstPart = the_string.split('preApprovalImage%2F', 2);
          var imageSecPart =  imageFirstPart[1].split('?', 1);
          var finalImageName = imageSecPart[0];
          var storage = firebase.storage();
          var storageRef = storage.ref();
          let userImage = storageRef.child(`preApprovalImage/${finalImageName}`);
          userImage.delete();
          
        //   const newItem = newData.finalResults;
        //   const imageUrl = update(newData.finalResults[newData.activeSlide], { foodInfo: { image: { $set: newData.oldImage } } });
        //   newItem[newData.activeSlide] = imageUrl;
          setData({ 
            ...newData, 
              takenPicture: '',
              itemName: '',
              newCatType: 'Entrée',
            //   finalResults: newItem,
            noResultsReq: false
          })
  
        } else {
        //   const newItem = newData.finalResults;
        //   const imageUrl = update(newData.finalResults[newData.activeSlide], { foodInfo: { image: { $set: newData.oldImage } } });
        //   newItem[newData.activeSlide] = imageUrl;
          setData({ 
            ...newData, 
                takenPicture: '',
                itemName: '',
                newCatType: 'Entrée',
            //   finalResults: newItem,
                noResultsReq: false
          })
        }
      }
      const askPermissionsAsync = async () => {
          await Camera.getCameraPermissionsAsync()
          await Camera.requestCameraPermissionsAsync();
          // you would probably do something to verify that permissions
          // are actually granted, but I'm skipping that for brevity
      }; 
      async function uploadImageAsync(uri) {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            resolve(xhr.response);
          };
          xhr.onerror = function(e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
        const ref = firebase
          .storage()
          .ref('preApprovalImage')
          .child(uuid());
        const snapshot = await ref.put(blob);
        // We're done with the blob, close and release it
        blob.close();
        
        return await snapshot.ref.getDownloadURL();
        // return await snapshot.downloadURL;
      }
      
    const startPostPic = () => {
        const { currentUser } = firebase.auth();
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const hrs = new Date().getHours();
        const min = new Date().getMinutes();
        const sec = new Date().getSeconds();
        const milsec = new Date().getMilliseconds();
        dateID = ((year * 10000000000000) + (month * 100000000000) + 
        (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);

        if (currentUser !== null && currentUser !== undefined) {
            firebase.database().ref(`/users/`)
                .push({
                    email: `@${newData.restName.toString().replace( /\s/g, '')}${newData?.restAddress?.split(",")[1].toString().replace( /\s/g, '')}`,
                    restName: `${newData.restName} -${newData?.restAddress?.split(",")[1]}`,
                    restAddress: `${newData.restAddress}`,
                    restHours: newData.restAxiosData?.data?.result?.opening_hours?.weekday_text.toString().replace(/,/g, '\n\n'),
                    phoneNum: newData.phoneNum,
                    restDesc: '',
                    firstname: '',
                    lastname: '', 
                    isUndecided: true, 
                    image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FnewRestLogo.jpg?alt=media&token=69cdad07-6e87-4022-bb9f-3024c7b8de4e', 
                    code: 0, 
                    isRecommended: false, 
                    username: '',
                    redeemedPoints: 0, 
                    userTotalRate: 0, 
                    tokenPass: '', 
                    restMaxPercentage: 0, 
                    tempHours: 0, 
                    yourLocation: '',
                    followerNum: 0, 
                    followersList: { 0: '_' }, 
                    restsList: { 0: '_' }, 
                    points: 0,
                    restOrderWeb: '', 
                    restWebsite: newData.restWebsite.slice(newData.restWebsite.indexOf('://')+3), 
                    isRestActive: true, 
                    aroundRadius: 40234,
                    boolToken: true, 
                    egiftEarned: 0,
                    createdAt: createdDate
                }).then((snapshot) => {
                    if (snapshot !== null && snapshot !== undefined) { 
                        firebase.database().ref(`/restsList/`)
                            .push({
                                isRestActive: true,
                                isUndecided: true,
                                restaurantUid: `${snapshot.key}`,
                                image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FnewRestLogo.jpg?alt=media&token=69cdad07-6e87-4022-bb9f-3024c7b8de4e',
                                restName: `${newData.restName} -${newData?.restAddress?.split(",")[1]}`,
                                restDesc: '',
                                restAddress: `${newData.restAddress}`,
                                phoneNum: newData.phoneNum,
                                restHours: newData.restAxiosData?.data?.result?.opening_hours?.weekday_text.toString().replace(/,/g, '\n\n'),
                                restMaxPercentage: 0,
                                restWebsite: newData.restWebsite.slice(newData.restWebsite.indexOf('://')+3),
                                restOrderWeb: '',
                                // expoToken: this.state.expoToken,
                                RestNumFollowers: 0, 
                                RestApptNum: 0, 
                                RestDrinkNum: 0, 
                                RestEntreeNum: 0, 
                                RestDessertNum: 0 
                            }).then(() => {
                                firebase.database().ref(`/food/`)
                                    .push({
                                        _geoloc: {
                                            lat: newData.restAxiosData?.data?.result?.geometry?.location?.lat,
                                            lng: newData.restAxiosData?.data?.result?.geometry?.location?.lng
                                        },
                                        dateId: dateID,
                                        createdBy: currentUser.email,
                                        totalView: 0,
                                        publish: true,
                                        isRestActive: true,
                                        isUndecided: true,
                                        restAddress: newData.restAddress,
                                        restWebsite: newData.restWebsite.slice(newData.restWebsite.indexOf('://')+3),
                                        restDesc: '',
                                        restOrderWeb: '',
                                        restaurantUid: `${snapshot.key}`,
                                        isImageUploaded: false,
                                        phoneNum: newData.phoneNum,
                                        restName: `${newData.restName} -${newData?.restAddress?.split(",")[1]}`,
                                        tempChecker: {
                                            hour: 0,
                                            uids: { 0: '_' }
                                        },
                                        foodLocation: {
                                                latitude: newData.restAxiosData?.data?.result?.geometry?.location?.lat,
                                                longitude: newData.restAxiosData?.data?.result?.geometry?.location?.lng,  
                                            },
                                        foodInfo:{
                                            foodType: newData.newCatType,
                                            price: 0,
                                            food_name: newData.itemName,
                                            Rate: {
                                                totalRate: 0,
                                                overallRate: 0,
                                                qualityRate: 0,
                                                matchingPicRate: 0,
                                                priceToPortionRate: 0,
                                            },
                                            image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea',
                                            tags: '',
                                            Calorie: 'N/A'
                                        }
                                    }).then((snap) => {
                                        postPhoto(snapshot.key, snap.key);
                                    })
                            })
                    }
                })	
        } else {
            setTimeout(() => {
                setData({ 
                  ...newData, 
                    isLogin: true
                })
            }, 10);
        }
      }
      const postPhoto = (restaurantUid, objectID) => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const hrs = new Date().getHours();
        const min = new Date().getMinutes();
        const time = `${month}/${day}/${year} ${hrs}:${min}`;
        const sec = new Date().getSeconds();
        const milsec = new Date().getMilliseconds();
        const dateID = ((year * 10000000000000) + (month * 100000000000) + 
          (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
        const { currentUser } = firebase.auth();
        const userImageRef = firebase.database().ref(`/userImage/${currentUser?.uid}`);
        const restImageRef = firebase.database().ref(`/restImage/${restaurantUid}/${objectID}`);
        
        Alert.alert('Congratulations!', 'Your image successfully uploaded, please wait 48 hours to approve your image. After we approve your image, you will receive 1 Reward Point.', [{ text: 'OK', 
            onPress: () => {}, 
            style: 'cancel' }], { cancelable: false });
            firebase.auth().onAuthStateChanged((user) => {
            if (user !== null) {
            const userRef = firebase.database().ref(`/users/${user.uid}`);
                userRef.once("value", (snap) => {
                    restImageRef.push({ 
                        takenPicture: newData.takenPicture, 
                        uidUser: currentUser?.uid,
                        firstname: snap.val().firstname,
                        lastname: snap.val().lastname,
                        restName: `${newData.restName} -${newData?.restAddress?.split(",")[1]}`,
                        userEmail: snap.val().email,
                        tags: '',
                        dateID: dateID,
                        submissionTime: time,
                        approvedBy: '',
                        deniedBy: '',
                        isNewItem: true,
                        deniedTime: '',
                        reason: '',
                        approvedTime: '',
                        isApproved: false,
                        isViewed: false,
                        food_name: newData.itemName,
                        foodType: newData.newCatType
                    }).then((snapShot) => {
                        userImageRef.push({ 
                            takenPicture: newData.takenPicture, 
                            restName: `${newData.restName} -${newData?.restAddress?.split(",")[1]}`,
                            tags: '',
                            restaurantUid: restaurantUid,
                            dateID: dateID,
                            submissionTime: time,
                            approvedBy: '',
                            deniedBy: '',
                            isNewItem: true,
                            deniedTime: '',
                            reason: '',
                            approvedTime: '',
                            isApproved: false,
                            isViewed: false,
                            foodObjectId: objectID,
                            food_name: newData.itemName,
                            foodType: newData.newCatType,
                    }).then(() => {
                        setData({ 
                        ...newData,
                            isSubmitImage: false,
                            tempRestId: snapShot.key
                        });
                        props.navigation.navigate('HomeDrawer', 
                        {
                            screen: props?.route?.params?.cameFrom === 'Restaurant' ? 'Restaurants' : 'Home',
                            params: {
                            screen: props?.route?.params?.cameFrom === 'Restaurant' ? 'RestaurantSearch' : 'FindRestaurant',
                            },
                        });
                    })
                });
                });
                } 
            })
      }

    return (
      <View style={styles.container}>
          <StatusBar 
        //   backgroundColor='#ed5962' 
          barStyle="light-content"/>
          <ScrollView
              style={{ flex: 1 }} 
              scrollEnabled={false}
              // keyboardDismissMode="none"
              // keyboardShouldPersistTaps="handled"
              keyboardShouldPersistTaps='always'
              keyboardDismissMode={'interactive'}
          >
            <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', height: 50, zIndex: 1, marginTop: 60 }}>
              <View>
                <TouchableOpacity style={{flex: 2, marginLeft: 15 }} 
                    onPress={() => {
                        // console.log(props?.route?.params?.cameFrom)
                        props.navigation.navigate('HomeDrawer', 
                        {
                            screen: props?.route?.params?.cameFrom === 'Restaurant' ? 'Restaurants' : 'Home',
                            params: {
                            screen: props?.route?.params?.cameFrom === 'Restaurant' ? 'RestaurantSearch' : 'FindRestaurant',
                            },
                        });
                    }}
                    >
                    <Image
                    style={{ flex: 1, width: 50 , height: 50 }}
                    source={require('../assets/icons/goback.png')}
                    fadeDuration={1}
                    />
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity style={{flex: 1, marginRight: 15 }} disabled={true} 
                    // onPress={() => {
                    //  await isOpen(props.route.params.finalResults.restName)
                    // followingFunc()
                    // }}
                >
                    <Image
                        style={{ flex: 1, width: 50 , height: 50 }}
                        source={require('../assets/icons/un-heart.png')}
                        fadeDuration={100}
                    /> 
                    {/* {
                        newData.isLiked === true ? 
                            <Image
                                style={{ flex: 1, width: 50 , height: 50 }}
                                source={require('../assets/icons/heart.png')}
                                fadeDuration={100}
                            /> 
                        :
                            <Image
                                style={{ flex: 1, width: 50 , height: 50 }}
                                source={require('../assets/icons/un-heart.png')}
                                fadeDuration={100}
                            />
                    } */}
                </TouchableOpacity> 
              </View>
            </View>
            <ImageBackground source={{ uri: props.route.params.foodImage !== undefined ? props.route.params.foodImage : foodImageUri, cache: 'force-cache'}} resizeMode="cover" style={styles.image} />
            <Animatable.View 
                animation="fadeInUpBig"
                style={[styles.footer, {
                    backgroundColor: colors.background
                }]}
            >
                <View style={{ padding: 20, marginTop: -30, marginBottom: 35, justifyContent: 'flex-start', marginLeft: -10, marginRight: -30 }}>
                    {/* <View style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50, marginTop: -15, marginLeft: 20 }}>
                      <Image
                        // size={100}
                        style={{alignItems: 'center', justifyContent: 'center', height: 100, width: 100, borderRadius: 50}}
                        source={{ uri: props?.route?.params?.finalResults?.image }}
                      />
                    </View> */} 
                    <Title style={{ fontSize: 20, fontFamily: 'MontserratBold', marginTop: 25, marginBottom: -30, color: '#EE5B64' }}>{newData.business_status === 'CLOSED_TEMPORARILY' ? 'CLOSED TEMPORARILY' : ''}</Title>
                    <Text style={{ marginTop: 40, marginBottom: 5, fontFamily: 'MontserratBold', fontSize: 22, color: 'black' }}>
                        {newData.restName} -{newData?.restAddress?.split(",")[1]}
                    </Text>
                    <Paragraph style={{ fontSize: 14, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start' }}>{newData.restAddress}</Paragraph>
                    {
                        newData.business_status !== 'CLOSED_TEMPORARILY' ?
                            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                                <View>
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: (newData.isOpenNow ? '#06C906' : (newData.isOpenNow == undefined ? '#06C906' : '#C90611')), marginRight: 5, marginLeft: 0, marginTop: 5 }}>
                                        {props?.route?.params?.isOpenNow ? `Open Now` : (newData.isOpenNow === undefined ? '' :'Closed')}
                                    </Text>
                                </View>
                                <View>
                                    {
                                        newData.restAxiosData?.data?.result?.opening_hours !== undefined ?
                                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: 'rgba(0, 0, 0, 0.30)', marginRight: 5, marginLeft: 0, marginTop: 5 }}>
                                            {   props?.route?.params?.isOpenNow ? `${openUntil(newData.restAxiosData?.data?.result?.opening_hours?.periods)}` : `${closedUntil(newData.restAxiosData?.data?.result?.opening_hours?.periods)}`}
                                            </Text> 
                                        : null
                                    }
                                </View>
                            </View> : <View style={{ marginBottom: 10 }}/>
                    }
                    {/* {
                        props?.route?.params?.finalResults?.restDesc?.length !== 0 ?
                            <View style={{ flexDirection: 'row' }}>
                                <FontAwesome 
                                    name="cutlery"
                                    color={'#EE5B64'}
                                    size={20}
                                />
                                <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 10, marginLeft: 10 }}>{props?.route?.params?.finalResults?.restDesc}</Paragraph>
                            </View>
                        : null
                    } */}
                    <View style={{ marginTop: 10 }}>
                                <View>
                                    {
                                        newData.cardRestNumFollowers === 0 ?
                                            <View style={{ flexDirection: 'row' }}>
                                                <FontAwesome 
                                                    name="heart"
                                                    color={'#EE5B64'}
                                                    size={20}
                                                />
                                                <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>This Restaurant is Not Yet Available.</Paragraph>
                                            </View>
                                        :
                                        <TouchableOpacity
                                            disabled={true}
                                            onPress={() => {  }}
                                        > 
                                        <View style={{ flexDirection: 'row' }}>
                                        {
                                            newData.cardRestNumFollowers === 0 ?
                                            <FontAwesome 
                                                name="heart-o"
                                                color={'#EE5B64'}
                                                size={20}
                                            />
                                            :
                                            
                                            <FontAwesome 
                                                name="heart"
                                                color={'#EE5B64'}
                                                size={20}
                                            />
                                        }
                                            <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>{newData.cardRestNumFollowers} {newData.cardRestNumFollowers === 1 ? 'Follower' : 'Followers' }</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 30 }}>
                                <View>
                                        <TouchableOpacity
                                            onPress={() => { Linking.openURL(`http://${newData.restOrderWeb}`); }}
                                        > 
                                        <View style={{ flexDirection: 'row' }}>
                                        <FontAwesome 
                                            name="shopping-cart"
                                            color={'#EE5B64'}
                                            size={20}
                                        />
                                            <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>Order Online</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => { goToLocation(newData.restAddress) }}
                                    > 
                                        <View style={{ flexDirection: 'row' }}>
                                        <FontAwesome 
                                            name="map-marker"
                                            color={'#EE5B64'}
                                            size={20}
                                        />
                                            <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>{newData.farAway}</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 30 }}>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => { Linking.openURL(`http://${newData.restWebsite}`); }}
                                    > 
                                        <View style={{ flexDirection: 'row' }}>
                                        <FontAwesome 
                                            name="globe"
                                            color={'#EE5B64'}
                                            size={20}
                                        />
                                            <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>Go to Website</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => { callNow(newData.phoneNum) }}
                                    > 
                                        <View style={{ flexDirection: 'row' }}>
                                        <FontAwesome 
                                            name="phone"
                                            color={'#EE5B64'}
                                            size={20}
                                        />
                                            <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0, justifyContent: 'flex-start', color: 'rgba(0, 0, 0, 0.50)', marginBottom: 20, marginLeft: 10 }}>Call</Paragraph>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, marginLeft: 0, marginBottom: 15 }}>
                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 16, color: colors.text }}>Popular Items</Text>
                        </View>
                        <View style={{ flexDirection: 'row', zIndex: 0 }}>
                            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 30, marginTop: 20, marginLeft: 0 }}>
                                <Card elevation={10} style={{ justifyContent: 'flex-start', width: width * 0.70, borderRadius: 15 }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Card.Cover style={{ width: width * 0.70, borderTopLeftRadius: 15, borderTopRightRadius: 15 }} source={{ uri:  newData?.foodMenu[0]?.foodInfo?.image === undefined ? foodImage0Uri : newData?.foodMenu[0]?.foodInfo?.image }} />
                                    </View>
                                    <View style={{ width: width * 0.50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                            {/* <Avatar.Image size={50} source={{ uri: data.restsImageList[index] }} /> */}
                                            <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                                                <Text style={{ fontSize: 14, fontFamily: 'MontserratSemiBold' }}>{newData?.foodMenu[0]?.foodInfo?.food_name  === undefined ? 'Delicious' : newData?.foodMenu[0]?.foodInfo?.food_name }</Text>
                                                <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0 }}>{newData?.foodMenu[0]?.foodInfo?.foodType  === undefined ? 'Entree' : newData?.foodMenu[0]?.foodInfo?.foodType}</Paragraph>
                                            </Card.Content>
                                        </View>
                                        <View style={{ width: width * 0.20, marginTop: 15, flexDirection: 'column', marginLeft: 10, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                            <View style={{ alignItems: 'center', marginRight: 15, flexDirection: 'row', marginTop: -5, justifyContent: 'flex-end' }}>
                                                <View>
                                                    <Button labelStyle={{ fontSize: 18, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} icon={require('../assets/icons/eye.png')} />
                                                </View>
                                                <View>
                                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: colors.text, marginLeft: -20, marginRight: 1 }}>{(newData?.foodMenu[0]?.totalView) === 0 ? 'None' : newData?.foodMenu[0]?.totalView  === undefined ? 235 : newData?.foodMenu[0]?.totalView}</Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'center', marginRight: 15, flexDirection: 'row', marginTop: -5, justifyContent: 'flex-end' }}>
                                                <View>
                                                    <Button labelStyle={{ fontSize: 18, fontFamily: 'MontserratSemiBold', color: '#FFC607', marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} icon={require('../assets/icons/star.png')} />
                                                </View>
                                                <View>
                                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: '#FFC607', marginLeft: -20, marginRight: 1 }}>{(newData?.foodMenu[0]?.foodInfo?.Rate?.qualityRate) === 0 ? 'None' : newData?.foodMenu[0]?.foodInfo?.Rate?.qualityRate === undefined ? 4.6 : newData?.foodMenu[0]?.foodInfo?.Rate?.qualityRate}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>   
                                    <View style={{ margin: 10 }}>
                                        {tagSeperator(newData?.foodMenu[0]?.foodInfo?.tags)}
                                    </View>
                                </Card>
                            </View>
                            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 30, marginTop: 20, marginLeft: 25 }}>
                                <Card elevation={10} style={{ justifyContent: 'flex-start', width: width * 0.70, borderRadius: 15 }}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Card.Cover style={{ width: width * 0.70, borderTopLeftRadius: 15, borderTopRightRadius: 15 }} source={{ uri:  newData?.foodMenu[1]?.foodInfo?.image === undefined ? foodImage1Uri : newData?.foodMenu[1]?.foodInfo?.image }} />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    {/* <Avatar.Image size={50} source={{ uri: data.restsImageList[index] }} /> */}
                                    <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'MontserratSemiBold' }}>{newData?.foodMenu[1]?.foodInfo?.food_name === undefined ? 'Yummy' : newData?.foodMenu[1]?.foodInfo?.food_name }</Text>
                                    <Paragraph style={{ fontSize: 12, fontFamily: 'Montserrat', marginTop: 0 }}>{newData?.foodMenu[1]?.foodInfo?.foodType === undefined ? 'Appetizer' : newData?.foodMenu[1]?.foodInfo?.foodType}</Paragraph>
                                    </Card.Content>
                                </View>
                                    <View style={{ width: width * 0.20, marginTop: 15, flexDirection: 'column', marginLeft: -15 }}>
                                        <View style={{ alignItems: 'center', marginLeft: 15, flexDirection: 'row', marginTop: -5 }}>
                                        <View>
                                            <Button labelStyle={{ fontSize: 18, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} icon={require('../assets/icons/eye.png')} />
                                        </View>
                                        <View>
                                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: colors.text, marginLeft: -20 }}>{(newData?.foodMenu[1]?.totalView) === 0 ? 'None' : newData?.foodMenu[1]?.totalView === undefined ? 65 : newData?.foodMenu[1]?.totalView}</Text>
                                        </View>
                                        </View>
                                        <View style={{ alignItems: 'center', marginLeft: 15, flexDirection: 'row', marginTop: -5, marginLeft: -10 }}>
                                        <View>
                                            <Button labelStyle={{ fontSize: 18, fontFamily: 'MontserratSemiBold', color: '#FFC607', marginLeft: 10, justifyContent: 'center', alignItems: 'center' }} icon={require('../assets/icons/star.png')} />
                                        </View>
                                        <View>
                                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: '#FFC607', marginLeft: -20 }}>{(newData?.foodMenu[1]?.foodInfo?.Rate?.qualityRate) === 0 ? 'None' : newData?.foodMenu[1]?.foodInfo?.Rate?.qualityRate === undefined ? 4.9 : newData?.foodMenu[1]?.foodInfo?.Rate?.qualityRate }</Text>
                                        </View>
                                        </View>
                                    </View>
                                </View>   
                                    <View style={{ margin: 10 }}>
                                        {tagSeperator(newData?.foodMenu[1]?.foodInfo?.tags)}
                                    </View>
                                </Card>
                            </View>
                        </View>
                        <View style={styles.button} >
                            <TouchableOpacity 
                            disabled={newData.business_status === 'CLOSED_TEMPORARILY' ? true : false} 
                            onPress={() => { 
                                setData({ ...newData, noResultsReq: true })
                                // props?.route?.params?.cameFrom === 'Restaurant' ?  
                                }}
                            >
                                <View style={{ marginTop:  10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                    <LinearGradient colors={newData.business_status === 'CLOSED_TEMPORARILY' ?  ['#f2f2f2', '#f2f2f2', '#e6e6e6'] : ['#fb8389', '#f70814', '#C90611']} style={styles.linearGradient}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'MontserratBold',
                                            textAlign: 'center',
                                            margin: 10,
                                            color: newData.business_status === 'CLOSED_TEMPORARILY' ? 'black' : '#ffffff',
                                            backgroundColor: 'transparent',}}
                                        >
                                                Add a First Picture Menu
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        </View>
                </View>
            </Animatable.View>
          </ScrollView>
              <Modal  
                isVisible={newData.noResultsReq}
                animationInTiming={550}
                animationOutTiming={550} 
                propagateSwipe
                onModalHide={() => { setData({ ...newData, noResultsReq: false }); }}
                onModalShow={() => { setData({ ...newData, noResultsReq: true }) }}
                onBackdropPress={() => { cancelUpdate() }} 
                backdropColor='black'
                useNativeDriver={true}
                backdropOpacity={0.3}
                hideModalContentWhileAnimating
                onRequestClose={() => { setData({ ...newData, noResultsReq: false }); }} 
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
              <ScrollView 
                style={{ backgroundColor: 'white', borderRadius: 35 }}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ marginTop: 10 }}>
                    <Image
                      style={{ width: 100 , height: 100, marginTop: 35 }}
                      source={require('../assets/icons/not_pic_menu.png')}
                      fadeDuration={100}
                    />
                  </View>
                  <View>
                    <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 10 }}>{newData.itemName === '' ? 'New Item' : newData.itemName }</Title>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.80, borderRadius: 35 }}>
                <View style={{ marginLeft: width * 0.04, width: width * 0.70, marginTop: 5 }}>
                <TextInput
                    ref={firstNameRef}
                    mode="outlined"
                    label={"Item's name "}
                    value={newData.itemName}
                    theme={avatorTheme}
                    onChangeText={(text) => { setData({ ...newData, itemName: text }) }}
                    onFocus={() => { setData({ ...newData, isFirstNameFocused: true }) }}
                    onBlur={() => { 
                    setData({ ...newData, isFirstNameFocused: false }) 
                    }}
                    style={{ fontFamily: 'Montserrat', fontSize: 18 }}
                />
                </View>
                  </View>
                  <View style={{ marginTop: 10, flexDirection: 'row', backgroundColor: '#ffffff', paddingBottom: 8 }}>
                    <View style={{ marginBottom: 10, marginTop: -15 }}>
                        <List.Section
                            style={{
                            width: width * 0.6,
                            marginLeft: 0
                            }}
                        >
                            <List.Accordion
                            titleStyle={{
                                fontSize: 14,
                                color: 'black',
                                fontFamily: 'MontserratSemiBold',
                                marginLeft: 0
                            }}
                            title="Item Category: "
                            expanded={newData.toggleItemCat}
                            onPress={() => { setData({ ...newData, toggleItemCat: !newData.toggleItemCat }) }}
                            >
                            <TouchableOpacity
                                onPress={() => { setData({ ...newData, newCatType: 'Entrée' });  }}
                            >
                                <List.Item 
                                style={{ backgroundColor: 'white', borderTopLeftRadius: 15, borderTopRightRadius: 15, marginLeft: -40, elevation: 0 }} 
                                title=" Entrée"
                                titleStyle={{
                                    fontSize: 14,
                                    marginTop: -5,
                                    marginTop: -20,
                                    color: 'black',
                                    fontFamily: 'MontserratBold',
                                }} 
                                left={props => 
                                    <View style={{ flexDirection: 'row', marginTop: -20 }}> 
                                    <RadioButton
                                        value="Entrée"
                                        status={newData.newCatType === 'Entrée' ? 'checked' : 'unchecked'}
                                        color={"#C90611"}
                                        uncheckedColor={"#C90611"}
                                        // onPress={() => {}}
                                    />
                                    </View>
                                }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ marginTop: 0 }}
                                onPress={() => { setData({ ...newData, newCatType: 'Appetizer' }); }}
                            >
                            <List.Item 
                                style={{ backgroundColor: 'white', marginLeft: -40, elevation: 0 }} 
                                title=" Appetizer" 
                                titleStyle={{
                                fontSize: 14,
                                color: 'black',
                                fontFamily: 'MontserratBold',
                                marginTop: -22
                                }}
                                left={props => 
                                <View style={{ flexDirection: 'row', marginTop: -20 }}> 
                                    <RadioButton
                                    value="Appetizer"
                                    status={newData.newCatType === 'Appetizer' ? 'checked' : 'unchecked'}
                                    color={"#C90611"}
                                    uncheckedColor={"#C90611"}
                                    // onPress={() => {}}
                                    />
                                </View>
                                }
                            />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setData({ ...newData, newCatType: 'Dessert' }); }}
                            >
                                <List.Item 
                                style={{ backgroundColor: 'white', marginLeft: -40, elevation: 0, marginTop: -1 }} 
                                title=" Dessert" 
                                titleStyle={{
                                    fontSize: 14,
                                    color: 'black',
                                    fontFamily: 'MontserratBold',
                                    marginTop: -20
                                }}
                                left={props => 
                                    <View style={{ flexDirection: 'row', marginTop: -20 }}> 
                                    <RadioButton
                                        value="Dessert"
                                        status={newData.newCatType === 'Dessert' ? 'checked' : 'unchecked'}
                                        color={"#C90611"}
                                        uncheckedColor={"#C90611"}
                                        // onPress={() => {}}
                                    />
                                    </View>
                                }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setData({ ...newData, newCatType: 'Drink' }); }}
                            >
                                <List.Item 
                                style={{ backgroundColor: 'white', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, marginLeft: -40, elevation: 0, marginTop: -1 }} 
                                title=" Drink" 
                                titleStyle={{
                                    fontSize: 14,
                                    color: 'black',
                                    fontFamily: 'MontserratBold',
                                    marginTop: -20
                                }}
                                left={props => 
                                    <View style={{ flexDirection: 'row', marginTop: -20 }}> 
                                    <RadioButton
                                        value="Drink"
                                        status={newData.newCatType === 'Drink' ? 'checked' : 'unchecked'}
                                        color={"#C90611"}
                                        uncheckedColor={"#C90611"}
                                        // onPress={() => {}}
                                    />
                                    </View>
                                }
                                />
                            </TouchableOpacity>
                            </List.Accordion>
                          </List.Section>
                        </View>
                  </View>
                </View>
                {
                  newData.takenPicture === '' ?
                    <View style={{ height: width * 0.41, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', marginTop: -10 }}>
                      <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                        <TouchableOpacity 
                            onPress={useCameraHandler}
                        > 
                          <Image
                            style={{ marginRight: -30, width: 120 , height: 120, marginTop: 0 }}
                            source={require('../assets/icons/photo.png')}
                            fadeDuration={100}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                        <TouchableOpacity 
                            onPress={useLibraryHandler}
                        >
                          <Image
                            style={{ marginLeft: -30, width: 120 , height: 120, marginTop: 0 }}
                            source={require('../assets/icons/image.png')}
                            fadeDuration={100}
                          />
                        </TouchableOpacity>
                      </View>
                    </View> : 
                    <Image
                      style={styles.CurrentImage}
                      source={{ uri: newData.takenPicture }}
                    />
                }
                <TouchableOpacity 
                    style={{ marginTop: -20, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }} 
                    onPress={() => { 
                        startPostPic() 
                    }} 
                    disabled={(newData.takenPicture === '' && newData.itemName === '')}
                >
                  <LinearGradient colors={(newData.takenPicture === '' && newData.itemName === '')? ['#cccccc', '#cccccc', '#cccccc'] : ['#fb8389', '#f70814', '#C90611']} style={styles.linearGradient}>
                    <Text style={styles.buttonText}>Post Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ marginTop: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                  <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => { cancelUpdate() }} >
                    <Title style={{ color: 'black', fontSize: 16, fontFamily: 'Montserrat' }}>Cancel</Title>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>
          <Modal  
            isVisible={newData.isLogin}
            animationInTiming={550}
            animationOutTiming={550} 
            propagateSwipe
            onModalHide={() => { setData({ ...newData, isLogin: false }); }}
            onModalShow={() => { setData({ ...newData, isLogin: true }); }}
            // onBackdropPress={() => { setData({ ...newData, isLogin: false }); }} 
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={0.3}
            hideModalContentWhileAnimating
            onRequestClose={() => { setData({ ...newData, isLogin: false }); }} 
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
                      onPress={() => { setData({ ...newData, isLogin: false }); }}
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
                  // props.navigation.navigate({name:'SignUpScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false });
                    setData({ ...newData, isLogin: false });
                    props.navigation.navigate(
                      'LogIn', 
                    {
                      screen: 'SignUpScreen',
                      // params: {
                      //   screen: 'SignUpScreen',
                        // params: {
                        //   screen: 'Media',
                        // },
                      // },
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
                  // props.navigation.navigate({name:'SignInScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...newData, isLogin: false }); 
                  setData({ ...newData, isLogin: false });
                  props.navigation.navigate(
                      'LogIn', 
                    {
                      screen: 'SignInScreen'
                    }
                  );
                  }} 
                  style={{ marginBottom: 10 }}>
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
                <View style={styles.button2} >
                    <TouchableOpacity 
                        onPress={() =>{ login('facebook')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                            <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/fb.png')}
                                />
                                <Text style={styles.buttonTextBlack}>Sign in with Facebook</Text>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.button2} >
                    <TouchableOpacity 
                    onPress={() =>{ login('google')}}
                    >
                        <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                            <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6'] } style={styles.linearGradientSocial}>
                                <Image
                                    style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                    source={require('../assets/icons/google.png')}
                                />
                                <Text style={styles.buttonTextBlack}>Sign in with Google</Text>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </View>
                {
                  Platform.OS === 'ios' ? 
                      <View style={styles.button2} >
                          <TouchableOpacity 
                          onPress={() =>{ login('apple')}}
                          >
                              <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                                  <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6'] } style={styles.linearGradientSocial}>
                                      <Image
                                          style={{ marginLeft: 0, marginTop: 0, width: 20, height: 25 }}
                                          source={require('../assets/icons/apple.png')}
                                      />
                                      <Text style={styles.buttonTextBlack}>Sign in With Apple</Text>
                                  </LinearGradient>
                              </View>
                          </TouchableOpacity>
                      </View>
                  : null
                }         
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
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => { setData({ ...newData, isLogin: false }); }}>
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
        </Modal>
      </View>
    );
};

// function mapStateToProps({ auth }) {
// 	return { token: auth.token };
// }


export default connect(null, actions)(RequestNewRestScreen);

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#ed5962'
    },
    image: {
      flex: 1,
      marginTop: -120,
      zIndex: 0,
      height: height/2,
      justifyContent: "center"
    },
    CurrentImage: {
      width: width * 0.40, 
      height: width * 0.40,
      borderRadius: 5,
      marginTop: -25,
      marginLeft: width * 0.25,
      marginBottom: 35,
      justifyContent: 'center',
      alignItems: 'center'
    },
    descCitiesStyle: { 
      color: 'black',
      // marginTop: -5,
      fontFamily: 'MontserratSemiBold',
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        marginTop: -15,
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    buttonTextBlack: {
        fontSize: 14,
        fontFamily: 'MontserratSemiBold',
        textAlign: 'center',
        margin: 10,
        color: '#000',
        backgroundColor: 'transparent',
    },
    buttonAction: {
        fontSize: 18,
        fontFamily: 'MontserratBold',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 15,
        color: 'black'
    },
    searchDescStyle2: {
      textAlign: 'left',
      fontSize: 12, 
      marginLeft: 15,
      width: width * 0.70,
      borderRadius: 40,
      fontFamily: 'Poppins',
      color: 'black',
    },
    searchDescStyle: {
      textAlign: 'center',
      fontSize: 14, 
      marginLeft: 15,
      width: width * 0.75,
      borderRadius: 40,
      fontFamily: 'MontserratReg',
      color: 'black',
    },
    buttonText: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    buttonText2: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#C90611',
      backgroundColor: 'transparent',
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 1
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontFamily: 'MontserratSemiBold',
        fontSize: 18
    },
    color_textPrivateBold: {
        color: '#C90611', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 12
    },
    color_textPrivate: {
        color: 'grey', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 12
    },
    text_footer2: {
        color: '#05375a',
        fontFamily: 'MontserratSemiBold',
        fontSize: 18
    },
    color_textPrivateBold2: {
        color: '#C90611', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 14
    },
    color_textPrivate2: {
        color: 'grey', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 14
    },
    linearGradientSocial: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        width: width * 0.75
    },
    linearGradient: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        width: width * 0.75
    },
    linearGradient2: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        width: width * 0.75,
        borderColor: '#C90611',
        borderWidth: 1
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 30,
        width: width * 0.85
    },
    textPrivate2: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginLeft: 20,
        marginTop: 30,
        marginBottom: 30,
        width: width * 0.80
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontFamily: 'Montserrat',
        marginBottom: 15,
        fontSize: 12,
    },
    button2: {
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: 'white',
        zIndex: 1,
        width,
        marginTop: -200,
        marginLeft: -25,
        marginBottom: 160
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
  });
