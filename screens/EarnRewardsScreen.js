import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, Linking, FlatList, ActivityIndicator, TouchableHighlight, Keyboard, Input, Alert, TextInput, Share, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@react-navigation/native';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme, List, RadioButton, Caption } from 'react-native-paper';
import * as actions from '../actions';
import { connect } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Camera } from 'expo-camera';
import { Header } from 'react-native-elements';
import update from 'immutability-helper';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from 'expo-status-bar';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import uuid from 'uuid-v4';
import Modal from 'react-native-modal';
import algoliasearch from 'algoliasearch';
import Feather from 'react-native-vector-icons/Feather';
import FindRestaurantScreen from './FindRestaurantScreen';
import Geocoder from 'react-native-geocoding';
import ConfettiCannon from 'react-native-confetti-cannon';
import ImageZoom from 'react-native-image-pan-zoom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
  // connectRefinementList,
} from 'react-instantsearch-native'; 
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen  } from 'react-native-view-shot';
// import { resetAnalyticsData } from 'expo-firebase-analytics';


const firebase = require('firebase/app').default
require('firebase/auth')
require('firebase/database')

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

const createdDate = ((year * 10000) + (month * 100) + day);

const attrToRetr = ['foodInfo.tags', 'foodInfo.foodType', 'foodInfo.food_name', 'restaurantUid', 'dateId', 'foodInfo.Calorie', 'totalView', 'phoneNum', 'restDesc', 'Notifications',
                    'foodInfo.image', 'restName', 'foodInfo.Rate.overallRate', 'foodInfo.Rate.qualityRate', 'comments', 'foodInfo.price', 'publish', 'isUndecided',
                    'foodInfo.Rate.matchingPicRate', '_geoloc.lat', '_geoloc.lng', 'restWebsite', 'tempChecker.uids', 'restHours', 'isRestActive', 'isImageUploaded',
                    'foodLocation.latitude', 'foodLocation.longitude', 'restAddress', 'restOrderWeb', 'foodInfo.Rate.totalRate', 'tempChecker.hour'];


const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
  timeouts: {
    connect: 1,
    read: 2, // The value of the former `timeout` parameter
    write: 30
  }
});

let newSearchState = {
    food_name: '',
  }; 

let searchState = {
    noResults: false,
    noResultsReq: false,
    resultsLength: 1,
    hitsLength: 1,
    takenPicture: '',
    food_name: '',
    searchingWord: '',
    nameRest: '',
    nameRestDesc: ''
  }; 

let dateID = 0;

const avatorTheme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#EE5B64',
      accent: '#EE5B64',
    },
  };
  
const EarnRewardsScreen = (props) => {  

    const { colors } = useTheme();
    let explosion = useRef(null);
    let _flatList = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const theme = useTheme();
    const [restaurantName, setRestaurantName] = React.useState('')
    const [restaurantUid, setRestaurantUid] = React.useState('')
    const [restAddress, setRestAddress] = React.useState('')
    const [takenPicture, setTakenPicture] = React.useState('')
    const [isRewardsRequest, setIsRewardsRequest] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isClickedImage, setIsClickedImage] = React.useState(false)
    const [isSelectRest, setIsSelectRest] = React.useState(false)
    const [initialState, setInitialState] = React.useState(false)
    const [imageIndex, setImageIndex] = React.useState(0)
    const [totalAmount, setTotalAmount] = React.useState(0)


    const [data, setData] = React.useState({
        oldImage: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d',
        newImage: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea',
        PrivacyPolicy: '',
        TermsConditions: '',
        isSubmitImage: false,
        food_name: '',
        restaurantUid: '',
        restaurantName: '',
        restName: '',
        takenPicture: '',
        foodRequestedType: 'Entrée',
        myRewards: [],
        stateNavigation: { 0: 'a' },
        foodType: '',
        restOrderWeb: '',
        restWebsite: '',
        isFoundItem: false,
        tempUserId: '',
        userPostId: '',
        toggleFoodType: true,
        restLocation: null,
        managmentExpoToken: '',
        restAddress: '',
        tempRestId: '',
        managmentUid: 'uE1OWGdOQRfPna29DnQ9yGUTvIF3',
        place_id: '',
        business_status: 'OPERATIONAL', // CLOSED_TEMPORARILY,
        restAxiosData: null,
        isSelectRest: false,
        isLogin: false,
        foodObjectId: '',
        tempFoodName: '',
        uid: '',
        isFoundItemChange: false,
      });

      const isEquivalent = (a, b) => {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
    
        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }
    
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
    
            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
    
        // If we made it this far, objects
        // are considered equivalent
        return true;
      }
      async function uploadImageShareAsync(uri) {
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
          .ref('itemShared')
          .child(uuid());
        const snapshot = await ref.put(blob);
        // We're done with the blob, close and release it
        blob.close();
        
        return await snapshot.ref.getDownloadURL();
        // return await snapshot.downloadURL;
      }
      // const shareNow = async () => {
      //   const userToken = await AsyncStorage.getItem('userToken');
      //   if (userToken !== null) {
      //     Sharing.isAvailableAsync().then(async (isAvailableAsync) => {
      //         if(isAvailableAsync) {
      //             // await captureRef(_flatListItem, {
      //             //     result: 'tmpfile',
      //             //     quality: 0.25,
      //             //     format: 'jpg',
      //               // })
      //               captureScreen({
      //                 result: 'tmpfile',
      //                 quality: 0.25,
      //                 format: 'jpg',
      //               })
      //             .then(async (uri) => {
      //                 let uploadUrl = await uploadImageShareAsync(uri);
      //                 Alert.alert(
      //                   'Share',
      //                   'Do you want to share this item? ',
      //                   [
      //                     { text: 'No', onPress: () => { }, style: 'cancel' },
      //                     { text: 'Yes', onPress: async () => {
      //                       const result = await Share.share({
      //                           url: uri,
      //                           message: `I recommend you ${food_name} from ${restaurantName}. Find more about this item with TroFii App: \nhttps://www.TroFii.Net \n\n${restWebsite} \n\n${uploadUrl}`
      //                       });
      //                       motionEvent();
      //                   }}]);
      //             });
      //         }
      //     })
      //   } else {
      //     setData({ ...data, isLogin: true });
      //   }
      // }

      // const onSearchStateChange = (results) => {
      //   // console.log(results)
      //   if (!(isEquivalent(data.stateNavigation, results))) {
      //       if (tempFoodName !== results.query) {
      //           setFoodName(results.query);
      //           setTempFoodName(results.query);
      //           setTimeout(() => {
      //               setData({ 
      //               ...data, 
      //                   stateNavigation: results,
      //                   // tempFoodName: results.query,
      //                   // food_name: results.query,
      //                   isSelectRest: false
      //               });
      //           }, 10);
      //       } else {
      //           setTimeout(() => {
      //               setFoodName(props?.route?.params?.food_name);
      //               setData({ 
      //               ...data, 
      //                   stateNavigation: results,
      //                   // tempFoodName: results.query,
      //                   // food_name: props?.route?.params?.food_name,
      //                   isSelectRest: false
      //               });
      //           }, 10);

      //       }
      //   //   setData({ ...data, food_name: searchState.foodInfo.food_name });
      //   //   setData({ ...data, noResults: searchState.noResults, initialState: true });
      //   }
      // }
      useEffect(() => {
        refreshData() 
        Geocoder.init('AIzaSyC2sLkZAFtMIsOzFqGKDgmxKbSajNfz-7A');
        setTimeout(() => {
            const { currentUser } = firebase.auth();
            if (currentUser !== null) {
                firebase.database().ref(`/userReceipt/${currentUser.uid}`)
                    .once('value', (snapshot) => {
                        if(snapshot.val() !== null) {
                            const arr = Object.keys(snapshot.val()).map((key) => {
                                return (snapshot.val()[key]);
                            }).sort((a, b) => { return (b.dateID) - (a.dateID); });
                            setData({ ...data, 
                                uid: currentUser.uid,
                                myRewards: arr
                            });
                        }
                });
            }
        }, 10);
          if(props?.route?.params?.restaurantName !== '' && props?.route?.params?.restaurantName !== undefined) {
                setIsLoading(true)
            }
            Keyboard.dismiss();
            setTimeout(() => {
                setRestaurantName(props?.route?.params?.restaurantName);
                setRestaurantUid(props?.route?.params?.restaurantUid);
                setRestAddress(props?.route?.params?.restAddress);
                setIsLoading(false)
                setIsSelectRest(false)
                if (initialState){
                  setTimeout(() => {
                    setIsRewardsRequest(true)
                  }, 1000);
                }
                // setData({ ...data, isSelectRest: false });
            }, 100);
        return () => { 
          // console.log('unmounting...');
        }
    }, [props?.route?.params]);
    const useCameraHandler = async () => {
        const { currentUser } = firebase.auth();
        if (currentUser === null || currentUser === undefined) {
            setTimeout(() => {
                setData({ 
                    ...data,
                        isLogin: true
                });
            }, 10);
        }
        else {
            await askPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [9, 16],
                base64: false,
                quality: 0.5
            });
                _handleImagePicked(result);
        }
    };
    const useLibraryHandler = async () => {
        const { currentUser } = firebase.auth();
        if (currentUser === null || currentUser === undefined) {
            setTimeout(() => {
                setData({ 
                    ...data,
                        isLogin: true
                });
            }, 10);
        }
        else {
            await askPermissionsAsync();
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [9, 16],
                base64: false,
                quality: 0.5
            });
            _handleImagePicked(result);
        }
    };
  //  const sendPushNotification = async (title, body, type, image, uid, tempRestId) => {
  //     const year = new Date().getFullYear();
  //     const month = new Date().getMonth() + 1;
  //     const day = new Date().getDate();
  //     const hours = new Date().getHours();
  //     const minutes = new Date().getMinutes();
  //     const seconds = new Date().getSeconds();
  //     const milliseconds = new Date().getMilliseconds();
  
  //     const createdDate = ((year * 1000000000000) + (month * 10000000000) + (day* 100000000) + (hours * 1000000) + (minutes * 10000) + (seconds * 100) + milliseconds);
  //     const notificationData = 
  //        {    
  //          type,
  //          title,
  //          message: body,
  //          image,
  //          dateID: createdDate,
  //          uid,
  //          managmentUid: data.managmentUid,
  //          restImageRefID: tempRestId,
  //          isSeen: false
  //        };
  //     firebase.database().ref(`/users/${data.managmentUid}`).once('value', (snapshot) => {
  //       firebase.database().ref(`/users/${data.managmentUid}`)
  //         .update({  
  //          Notifications: 
  //            { 
  //              tempBadgeNum: snapshot.val().Notifications.tempBadgeNum + 1, 
  //              notificationsList: snapshot.val().Notifications.notificationsList.concat(notificationData)
  //            } 
  //         });
  //     })
  //     await fetch('https://exp.host/--/api/v2/push/send', {       
  //           method: 'POST', 
  //           headers: {
  //               Accept: 'application/json',  
  //               'Content-Type': 'application/json', 
  //               'accept-encoding': 'gzip, deflate',   
  //               'host': 'exp.host'      
  //             }, 
  //           body: JSON.stringify({                 
  //               to: data.managmentExpoToken,                        
  //               title: title,                  
  //               body: body,
  //               subtitle: body,      
  //               data: {
  //                 type,
  //                 title,
  //                 message: body,
  //                 image,
  //                 uid,
  //                 managmentUid: data.managmentUid,
  //                 restImageRefID: tempRestId,
  //                 dateID: createdDate,
  //                 isSeen: false
  //               },   
  //               priority: "high",            
  //               sound:"default",              
  //               channelId:"default",   
  //           }),        
  //       })
  //   }
  const resetData = () => {
    setIsRewardsRequest(false);
    setIsLoading(false);
    setTotalAmount(0);
    setTakenPicture('');
    setRestaurantName('');
    setRestaurantUid('');
    setRestAddress('');
  }
  const refreshData = () => {
    setTimeout(() => {
        const { currentUser } = firebase.auth();
        if (currentUser !== null) {
            firebase.database().ref(`/userReceipt/${currentUser.uid}`)
                .once('value', (snapshot) => {
                    if(snapshot.val() !== null) {
                        const arr = Object.keys(snapshot.val()).map((key) => {
                            return (snapshot.val()[key]);
                        }).sort((a, b) => { return (b.dateID) - (a.dateID); });
                        setData({ ...data, 
                            uid: currentUser.uid,
                            myRewards: arr
                        });
                    }
            });
        }
    }, 10);
  }
    const submitNow = () => {
        const { currentUser } = firebase.auth();
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const hrs = new Date().getHours();
        const min = new Date().getMinutes();
        const sec = new Date().getSeconds();
        const milsec = new Date().getMilliseconds();
        const time = `${month}/${day}/${year} ${hrs}:${min}`;
        dateID = ((year * 10000000000000) + (month * 100000000000) + 
        (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
    Alert.alert(
        'Rate Submission Alert',
        'Are you sure about your submission? ',
        [
          { text: 'No', onPress: () => { }, style: 'cancel' },
          { text: 'Yes', onPress: () => {
            setIsLoading(true)
            if (currentUser !== null && currentUser !== undefined) {
              const usersReceiptRef = firebase.database().ref(`/userReceipt/${currentUser.uid}`);
              const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
                setTimeout(() => {
                    userRef.once("value", (snap) => {
                      usersReceiptRef.push({ 
                        receiptPicture: takenPicture, 
                        uidUser: currentUser.uid,
                        firstname: snap.val().firstname,
                        lastname: snap.val().lastname,
                        restName: restaurantName,
                        userEmail: snap.val().email,
                        restaurantUid: restaurantUid,
                        restAddress: restAddress,
                        dateID: dateID,
                        submissionTime: time,
                        approvedBy: '',
                        deniedBy: '',
                        deniedTime: '',
                        reason: '',
                        totalAmount: totalAmount,
                        receiptDate: '',
                        orderNumber: 0,
                        approvedTime: '',
                        isApproved: false,
                        isViewed: false,
                      });
                    })
                    refreshData();
                    resetData();
                    setIsLoading(false);
                }, 1500);
            } 
          }}])
    }
    const askPermissionsAsync = async () => {
        await Camera.getCameraPermissionsAsync()
        await Camera.requestCameraPermissionsAsync();
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
      const { currentUser } = firebase.auth();
      try {
        if (!pickerResult.cancelled) {
            setIsLoading(true)
          let uploadUrl = await uploadImageAsync(pickerResult.uri);

          setTakenPicture(uploadUrl)
            // setTakenPicture(pickerResult.uri)
        } else {
            setIsLoading(false)
        }
      } catch (e) {
          console.log(e)
        alert('Upload failed, sorry :(');
      } finally {
        setIsLoading(false)
            // setData({ 
            //   ...data, 
            //   uploading: false
            // })
      }
    };
    // const cancelUpdate = () => {
    //   // Delete the file
    //   if (searchState.takenPicture !== '') {
    //     var the_string = searchState.takenPicture;
    //     var imageFirstPart = the_string.split('preApprovalImage%2F', 2);
    //     var imageSecPart =  imageFirstPart[1].split('?', 1);
    //     var finalImageName = imageSecPart[0];
    //     var storage = firebase.storage();
    //     var storageRef = storage.ref();
    //     let userImage = storageRef.child(`preApprovalImage/${finalImageName}`);
    //     userImage.delete();
        
    //     const newItem = data.finalResults;
    //     const imageUrl = update(data.finalResults[data.activeSlide], { foodInfo: { image: { $set: data.oldImage } } });
    //     newItem[data.activeSlide] = imageUrl;
    //     setData({ 
    //       ...data, 
    //         takenPicture: '',
    //         finalResults: newItem,
    //         isSubmitImage: false
    //     })
    //     searchState = Object.assign({ ...searchState, takenPicture: '' }); 

    //   } else {
    //     const newItem = data.finalResults;
    //     const imageUrl = update(data.finalResults[data.activeSlide], { foodInfo: { image: { $set: data.oldImage } } });
    //     newItem[data.activeSlide] = imageUrl;
    //     setData({ 
    //       ...data, 
    //         takenPicture: '',
    //         finalResults: newItem,
    //         isSubmitImage: false
    //     })
    //     searchState = Object.assign({ ...searchState, takenPicture: '' }); 
    //   }
    // }
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
        .ref('usersReceipt')
        .child(uuid());
      const snapshot = await ref.put(blob);
      // We're done with the blob, close and release it
      blob.close();
      
      return await snapshot.ref.getDownloadURL();
      // return await snapshot.downloadURL;
    }
    function handleSomeKindOfEvent() {
        explosion && explosion.start();
    };
    const renderEmpty = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                      style={{ "resizeMode": "contain", "backgroundColor": "#ffffff", width, height: height - 85 }}
                      source={require('../assets/Rewards.png')}
                  />
                </View>
            </View>
      )
    }
    const _renderItem = ({ item, index }) => {
      return (
        <View style={{ width, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 15 }}>
            <View style={{ flexDirection: 'row' , width: width * 0.90, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ flex: 1, marginLeft: -10, marginTop: 20 }} onPress={() => { setImageIndex(index); setIsClickedImage(true)}}>
                    <Image 
                        style={{ zIndex:2, width: 30, height: 30, marginLeft:  width * 0.065, marginTop: 5, backgroundColor: 'white', borderRadius: 15 }}
                        source={(item.isApproved === true && item.isViewed === true) ? require('../assets/icons/approve.png') : ((item.isApproved === false && item.isViewed === true) ? require('../assets/icons/deny.png') : require('../assets/icons/pending.png'))}

                    />
                    <Image 
                        style={{ zIndex:-1, flex: 1 , marginTop: -70, "resizeMode": "contain", "backgroundColor": "#ffffff", width: width * 0.20, borderRadius: 35 }}
                        source={{ uri: item.receiptPicture }}
                    />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: -50, justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 0 }}>
                    <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', width: width * 0.45 }}>
                        <Text style={styles.titleStyle3}>
                            {item.restName}
                        </Text>
                        {/* <Image 
                            style={{ width: 20, height: 20, marginLeft: 10, marginTop: -3 }}
                            source={{ uri: '__' }}
                        /> */}
                    </View>
                    <View style={{ marginBottom: 5, marginLeft: -15 }}>
                      <Text style={styles.titleStyle6}>
                          Submission Time:
                      </Text>
                    </View>
                    <Text style={styles.titleStyle5}>
                        {item.submissionTime}
                    </Text>
                    {/* <Text style={styles.titleStyle5}>
                        ID: {item.dateID}
                    </Text> */}
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <Caption style={styles.titleStyle4}>
                        Total
                    </Caption>
                    <Caption style={styles.titleStyle4}>
                        Amount
                    </Caption>
                    <Text style={styles.titleStyle2}>
                        ${item.totalAmount}
                    </Text>
                </View>
            </View>
            {
              item.reason !== '' ?
                <View style={{ flexDirection: 'row' ,width: width * 0.75, marginTop: 10, marginLeft: -width * 0.2 + 30, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <Text style={styles.titleStyle5}>
                      Reason: 
                  </Text>
                  <Text style={styles.titleStyle6}>
                      {item.reason}
                  </Text>
                </View>
              : null
            }
        </View>
      )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
            <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, height: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <TouchableOpacity style={{ marginLeft: 0 }} onPress={() => { props.navigation.openDrawer(); }} >
                    <Image
                        style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
                        source={require('../assets/icons/menu.png')}
                        fadeDuration={100}
                    />
                </TouchableOpacity> 
                <Text style={styles.titleStyle77}>
                  Upload Receipts
                </Text>
                <TouchableOpacity onPress={() => { setIsRewardsRequest(true); setInitialState(true) }} >
                    <Image
                        style={{ flex: 1, marginRight: 15, width: 50 , height: 5, marginTop: 0 }}
                        source={require('../assets/icons/receipt.png')}
                        fadeDuration={100}
                    />
                </TouchableOpacity> 
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)' , elevation: 1 }} />
            <View style={{ backgroundColor: 'white' }}>
                <FlatList
                    ref={(flatList) => { _flatList = flatList }}
                    data={data.myRewards}
                    extraData={data.myRewards}
                    initialNumToRender={10} 
                    keyExtractor={(item) => (item?.dateID?.toString())}
                    renderItem={_renderItem.bind(this)}
                    ItemSeparatorComponent={ItemSeperator}
                    onEndReachedThreshold={0.5}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
                    ListEmptyComponent={renderEmpty.bind(this)}
                />
            </View>
          <Modal  
            isVisible={isRewardsRequest}
            animationInTiming={550}
            animationOutTiming={550} 
            propagateSwipe
            onModalHide={() => { setIsRewardsRequest(false) }}
            onModalShow={() => { setIsRewardsRequest(true) }}
            onBackdropPress={() => { setIsRewardsRequest(false) }} 
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={0.3}
            hideModalContentWhileAnimating
            onRequestClose={() => { setIsRewardsRequest(false) }} 
            style={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                overflow: 'hidden',
                padding: -5,
                backgroundColor: 'transparent'
            }}
          >
            <ScrollView keyboardShouldPersistTaps='always' style={{ marginTop: height / 5 }}>
              <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' , borderRadius: 15 }}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <InstantSearch
                searchClient={client}
                indexName="worests"
                refresh
                stalledSearchDelay={0}
                // searchState={searchState}
                // onSearchStateChange={(results) => onSearchStateChange(results)}
              >  
              <Configure 
                filters={`restaurantUid:${restaurantUid}`} 
                facetFilters= {['isImageUploaded:false']}
                attributesToRetrieve={attrToRetr} 
                hitsPerPage={25}
                typoTolerance={'strict'}
              />                   
              <TouchableOpacity 
                onPress={() => { 
                  setIsRewardsRequest(false); 
                  setTimeout(() => {
                    setIsSelectRest(true); 
                  }, 1000);
                }} 
                style={styles.action1}
              >
                  <Icon 
                      name="ios-restaurant"
                      color={colors.text}
                      size={25}
                      style={{ marginTop: 10}}
                  />
                  <Text style={{ fontFamily: 'MontserratBold', fontSize: 16, width: width * 0.75, marginTop: Platform.OS === 'ios' ? restaurantName !== '' && restaurantName !== undefined ? 5 : 15 : restaurantName !== '' && restaurantName !== undefined ? 5 : 10, color: 'black', marginLeft: 5, marginBottom: 5 }}>
                    {restaurantName !== '' && restaurantName !== undefined ? restaurantName : "Find your Restaurant"}
                  </Text>
                  {/* <TextInput
                      placeholder="Find your Restaurant"
                      keyboardType="default"
                      autoCompleteType="name"
                      editable={false}
                      multiline={true}
                      value={restaurantName}
                      textContentType={"name"} 
                      placeholderTextColor="#666666"
                      autoCapitalize="none"
                      style={{ flex: 1, fontFamily: 'MontserratBold', marginVertical: -5, fontSize: 16, width: width * 0.75, marginTop: 0, color: 'black', marginLeft: 5 }}

                  /> */}
              </TouchableOpacity>
          </InstantSearch>
          </View>
          {
              takenPicture === '' ?
              <View style={{ height: width * 0.41, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', marginTop: 20, marginBottom: -40 }}>
                  <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                  <TouchableOpacity 
                      onPress={() => useCameraHandler()}
                  > 
                      <Image
                      style={{ marginRight: 0, width: 120 , height: 120, marginTop: 0 }}
                      source={require('../assets/icons/photo.png')}
                      fadeDuration={100}
                      />
                  </TouchableOpacity>
                  </View>
                  <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                  <TouchableOpacity 
                      onPress={() =>  useLibraryHandler()}
                  >
                      <Image
                      style={{ marginLeft: 0, width: 120 , height: 120, marginTop: 0 }}
                      source={require('../assets/icons/image.png')}
                      fadeDuration={100}
                      />
                  </TouchableOpacity>
                  </View>
              </View> : 
              <View style={{ height: width * 0.41, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30, marginBottom: 20 }}>
                  <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                      <TouchableOpacity 
                          onPress={() => useCameraHandler()}
                      > 
                          <Image
                          style={{ marginRight: 0, width: 80 , height: 80, marginTop: 0 }}
                          source={require('../assets/icons/photo.png')}
                          fadeDuration={100}
                          />
                      </TouchableOpacity>
                  </View>
                  <Image
                      style={styles.CurrentImage}
                      source={{ uri: takenPicture }}
                  />
                  <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                      <TouchableOpacity 
                          onPress={() =>  useLibraryHandler()}
                      >
                          <Image
                          style={{ marginLeft: 0, width: 80 , height: 80, marginTop: 0 }}
                          source={require('../assets/icons/image.png')}
                          fadeDuration={100}
                          />
                      </TouchableOpacity>
                  </View>
              </View>
          }                  
          <View style={styles.action}>
              <Icon 
                  name="ios-cash"
                  color={colors.text}
                  size={25}
                  style={{ marginTop: 10}}
              />
              <TextInput
                  placeholder="Receipt's Total Amount"
                  keyboardType="decimal-pad"
                  autoCompleteType="name"
                  editable={true}
                  // value={totalAmount}
                  textContentType={"name"} 
                  onChangeText={(val) => { setTotalAmount(val) }}
                  placeholderTextColor="#666666"
                  autoCapitalize="none"
                  style={{ fontFamily: 'MontserratBold', marginVertical: -5, fontSize: 16, width: width * 0.75, marginTop: 0, color: 'black', marginLeft: 5 }}
              />
          </View>
          <TouchableOpacity style={{ marginTop: 35 }} onPress={() => { submitNow() }} disabled={!(totalAmount !==0 && restaurantName !== '' && takenPicture !== '' && restaurantName !== undefined) ? true : false}>
              <View style={{ marginTop: takenPicture === '' ? -25 : 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <LinearGradient colors={ !(totalAmount !==0 && restaurantName !== '' && takenPicture !== '' && restaurantName !== undefined) ? ['#cccccc', '#cccccc', '#cccccc'] : ['#ff4d4d', '#e60000', '#990000']} style={styles.linearGradient}>
                      <Text style={styles.buttonText}>Submit your Receipt</Text>
                  </LinearGradient>
              </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { resetData(); }}>
              <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                      <Text style={styles.buttonTextCancel}>Cancel</Text>
              </View>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <Modal
        isVisible={isClickedImage}
        onBackdropPress={() => setIsClickedImage(false) }
        onBackButtonPress={() => setIsClickedImage(false) }
        backdropColor='white'
        backdropOpacity={0.5}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Header 
            backgroundColor='white'
            barStyle={'dark-content'}
          >
            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: -60 }}>
              <Icon
                style={{ color: 'gray', fontSize: 45, fontWeight: 'bold', alignItems: 'flex-start', paddingTop: 10 }}
                name="ios-close-circle"
                onPress={()=>{setIsClickedImage(false)}}
              />
            </View>
          </Header>
          <ImageZoom 
            cropWidth={width * 0.90}
            cropHeight={height * 0.80}
            imageWidth={width * 0.90}
            imageHeight={height * 0.80}
          >
            <Image
              style={{ flex: 1, "resizeMode": "contain", width: width * 0.80, borderRadius: 10, marginLeft: width * 0.05, marginTop: 10 }}
              source={{uri: data?.myRewards[imageIndex]?.receiptPicture }}
            />
          </ImageZoom>
        </View>
      </Modal> 
        <Modal  
            isVisible={isLoading}
            animationInTiming={0}
            animationOutTiming={0} 
            propagateSwipe
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            // onModalHide={() => { setData({ ...data, isSelectRest: false }); }}
            // onModalShow={() => { setData({ ...data, isSelectRest: true }); }}
            // onBackdropPress={() => { setData({ ...data, isSelectRest: false }); }} 
            backdropColor='white'
            useNativeDriver={true}
            backdropOpacity={0}
            // hideModalContentWhileAnimating
            // onRequestClose={() => { setData({ ...data, isSelectRest: false }); }} 
            // style={{
            //     borderTopLeftRadius: 15,
            //     borderTopRightRadius: 15,
            //     borderBottomLeftRadius: 15,
            //     borderBottomRightRadius: 15,
            //     overflow: 'hidden',
            //     backgroundColor: 'transparent',
            //     marginLeft: 5,
            //     marginRight: 5,
            //     marginBottom: 5,
            //     marginTop: 50
            // }}
        >
        <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
            <ActivityIndicator 
                animating={isLoading} 
                size="large" 
                color="#C90611"
            />
        </View>
        </Modal>
        <Modal  
            isVisible={isSelectRest}
            animationInTiming={550}
            animationOutTiming={550} 
            propagateSwipe
            onModalHide={() => { setIsSelectRest(false) }}
            onModalShow={() => { setIsSelectRest(true) }}
            onBackdropPress={() => { setIsSelectRest(false) }} 
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={0.3}
            hideModalContentWhileAnimating
            onRequestClose={() => { setIsSelectRest(false) }} 
            style={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                overflow: 'hidden',
                backgroundColor: 'transparent',
                marginLeft: 5,
                marginRight: 5,
                marginBottom: 5,
                marginTop: 50
            }}
        >
            <View style={{ flex: 1, marginTop: 0 }}>
                <View style={{ height: 75, backgroundColor: 'white', flexDirection: 'row' }}>
                  <TouchableOpacity
                      onPress={() => { 
                        setTimeout(() => {
                          setIsSelectRest(false); 
                        }, 1000);
                      }}
                      style={{ flex: 1, marginVertical: 10, marginLeft: 15, marginTop: 15, width: 60 }}
                    >
                      <Feather 
                          name="x"
                          color="gray"
                          size={30}
                      />
                  </TouchableOpacity>
                  <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', marginTop: -15, marginLeft: -80 }}>
                    <Text style={{ color: '#C90611', fontSize: 30, textAlign: 'center', fontFamily: 'BerkshireSwash'}}>TroFii</Text>
                  </View>
                </View>
                <FindRestaurantScreen props={props} isEarnRewards={true}/>
            </View>
        </Modal>
        <ConfettiCannon
            count={200}
            explosionSpeed={2000}
            fallSpeed={1500}
            fadeOut={true}
            origin={{x: width / 2, y: -900}}
            autoStart={false}
            ref={ref => (explosion = ref)}
        />
        </SafeAreaView>
    );
}

const Hits = connectInfiniteHits(({ hits, hasMore, refine, colors, navigation }) => {
    let _flatList = useRef(null); 
    const onEndReached = function() {
      if (hasMore) {
        refine();
      }
  };
    const emptryComponent = () => {
        return (
            <View style={{ backgroundColor: 'white', width, height: 50 }}>
                <TouchableOpacity
                    onPress={() => { 
                    // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
                    // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                    navigation?.navigate('PostPictureScreen', { 
                        food_name: newSearchState.food_name
                    });
                //   refine(item.foodInfo.food_name)
                    // navigation.dispatch({
                    //   ...CommonActions.setParams({ restaurantName: item.restName })
                    // });
                    }}
                > 
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 20, marginBottom: 5, marginTop: 5}}>
                        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', width: width * 0.60, justifyContent: 'flex-start' }}>  
                            <View style={{ flex: 1, alignItems: 'flex-start', width: width * 0.60, justifyContent: 'flex-start', marginLeft: 10, marginRight: 5 }}>
                                <Text style={{ fontFamily: 'Montserrat', fontSize: 15, marginRight: 30, marginLeft: 5 }}>
                                    {newSearchState.food_name}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )}
      return (    
          <View style={{ flex: 1, height: 65 }}>
            <FlatList
              data={hits}
              extraData={hits}
              onEndReached={onEndReached}
              ItemSeparatorComponent={ItemSeperator}
              keyboardShouldPersistTaps={'handled'}
              ListEmptyComponent={emptryComponent()}
              initialNumToRender={11}
              onEndReachedThreshold={3}
              keyExtractor={(item, index) => item.objectID}
              renderItem={({ item, index }) => {
                return (
                  <View style={{ marginBottom: (hits.length === index + 1 ) ? 200 : 0 }}>
                    {/* <View style={{ backgroundColor: 'black', height: index === 0 ? 1 : 0 }} /> */}
                    <TouchableHighlight
                      onPress={() => { 
                      // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
                      // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                      navigation?.navigate('PostPictureScreen', { 
                        food_name: item.foodInfo.food_name
                      });
                    //   refine(item.foodInfo.food_name)
                      // navigation.dispatch({
                      //   ...CommonActions.setParams({ restaurantName: item.restName })
                      // });
                    }}
                    > 
                      <View style={{ backgroundColor: 'white', width }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 20, marginBottom: 5, marginTop: 5}}>
                            <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start', width: width * 0.60, justifyContent: 'flex-start' }}>  
                              <View style={{ flex: 1, alignItems: 'flex-start', width: width * 0.60, justifyContent: 'flex-start', marginLeft: 10, marginRight: 5 }}>
                                <Text style={{ fontFamily: 'Montserrat', fontSize: 12, marginRight: 30, marginLeft: width * 0.04 }}>
                                  {/* <Highlight attribute="foodInfo.food_name" hit={item} /> */}
                                  {item.foodInfo.food_name}
                                </Text>
                              </View>
                            </View>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>
                );
              }}
            />
          </View>
      );
  });
  const ItemSeperator = () => <View style={{ height: 1, backgroundColor: 'black', width: width * 0.84, marginLeft: width * 0.08 }} />;
  
  const Highlight = connectHighlight(({ highlight, attribute, hit }) => {
      const parsedHit = highlight({
        attribute,
        hit,
        highlightProperty: '_highlightResult',
      });
    //   console.log('parsedHit: ',parsedHit)
      const highlightedHit = parsedHit.map((part, idx) => {
        if (part.isHighlighted)
          return (
            <Text key={idx} style={{ backgroundColor: 'black' }}>
              {part.value}
            </Text>
          );
        return part.value;
      });
      return <Text>{highlightedHit}</Text>;
  });
  const SearchBox = connectSearchBox(({ onFocus, onBlur, refine, currentRefinement }) => {
    // if (Searched_Word !== '' && Searched_Word !== searchingWord) {
      // refine(searchState.nameRest)
    // }
    return (
      <View>
        <Searchbar
          placeholder={"Search an item ..."}
          // onIconPress={() => { handleSearch(searchQuery); }}
          onChangeText={
            (text) => { 
              // refine(event.currentTarget.value)
                refine(text); 
            //   preLoad = false;
            //   searchWord = text;
                newSearchState = Object.assign({ food_name: text }); 
            }
          }
          // value={searchQuery}
          value={currentRefinement}
          // onFocus={onFocus}
          // onBlur={onBlur}
          // defaultValue={data.searchQuery}
          maxLength={100}
          returnKeyType={'done'}
          keyboardType={'default'}
          selectionColor= '#EE5B64'
          style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 15, height: 45, marginTop: Platform.OS === ' ios' ? -10 : 0, width: width *0.85 }}
          inputStyle={{ fontFamily: 'Montserrat', fontSize: 16 }}
        />
      </View>
    );
  });
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    CurrentImage: {
      width: width * 0.50 * 9/16, 
      height: width * 0.50,
      borderRadius: 5,
      marginBottom: 30,
      marginTop: 30,
      justifyContent: 'center',
      alignItems: 'center'
    },
    linearGradient: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      width: width * 0.75
    },
    color_textPrivateBold: {
        color: '#C90611', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 12
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
    color_textPrivate: {
        color: 'grey', 
        fontFamily: 'MontserratSemiBold',
        fontSize: 12
    },
    titleStyle77: { 
        flex: 1,
        fontFamily: 'MontserratSemiBold',
        fontSize: 14, 
        marginLeft: (height / width) > 1.5 ? width * 0.25 - 20 : width * 0.4 - 20,
        justifyContent: 'center'
    },
    action1: {
        flexDirection: 'row',
        width: width * 0.80,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        marginLeft: -5
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
        marginLeft: -5
    },
    buttonTextBlack: {
        fontSize: 14,
        fontFamily: 'MontserratSemiBold',
        textAlign: 'center',
        margin: 10,
        color: '#000',
        backgroundColor: 'transparent',
    },
    linearGradientSocial: {
        flexDirection: 'row',
        height: 50,
        borderWidth: 1,
        borderColor: Platform.OS === 'ios' ? 'black' : 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        width: width * 0.75
    },
    searchDescStyle: {
      textAlign: 'left',
      fontSize: 14, 
      marginLeft: 15,
      width: width * 0.75,
      borderRadius: 40,
      fontFamily: 'MontserratReg',
      color: 'rgba(0, 0, 0, 0.39)',
    },
    searchDescStyle3: {
      textAlign: 'center',
      fontSize: 12, 
      marginLeft: 15,
      width: width * 0.70,
      borderRadius: 40,
      fontFamily: 'Poppins',
      color: 'rgba(0, 0, 0, 0.39)',
    },
    buttonText4: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    buttonText2: {
        fontSize: 13,
        fontFamily: 'MontserratSemiBold',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent'
    },
    buttonText3: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#C90611',
      backgroundColor: 'transparent',
    },
    linearGradient2: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        width: width * 0.75,
        borderColor: '#C90611',
        borderWidth: 1
    },
    buttonText: {
      fontSize: 16,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 40,
        marginBottom: 30,
        width: width * 0.75
    },
    button3: {
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10
    },
    button: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 5,
    },
    buttonTextCancel: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      color: 'gray',
    },
    buttonText: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      color: '#fff',
    },
    titleStyle7: { 
        flex: 1,
        fontFamily: 'MontserratSemiBold',
        fontSize: 14, 
        marginLeft: (height / width) > 1.5 ? width * 0.3 : width * 0.40,
        justifyContent: 'center'
    },
    titleStyle6: { 
      fontFamily: 'Montserrat',
      fontSize: 12, 
      marginTop: -5,
      marginBottom: 0,
      marginLeft: 10,
      justifyContent: 'flex-start',
    //   width: width * 0.50
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle3: { 
      fontFamily: 'MontserratBold',
      fontSize: 14, 
      marginTop: -5,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start',
    //   width: width * 0.50
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle5: { 
      fontFamily: 'MontserratBold',
      fontSize: 13, 
      marginTop: -5,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start',
      // width: width * 0.40
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle4: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      justifyContent: 'flex-end',
      marginTop: -7,
      alignItems: 'flex-end',
    //   width: width * 0.70
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle2: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 16, 
      marginTop: -5,
      color: '#EE5B64',
      justifyContent: 'flex-end', 
      alignItems: 'flex-end'
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle1: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 17, 
      width: width * 0.55
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
  });

export default connect(null, actions)(EarnRewardsScreen);