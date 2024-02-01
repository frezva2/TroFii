import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  SectionList,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Keyboard,
  Alert,
  Share,
  RefreshControl,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  FAB,
  Caption,
  DefaultTheme,
} from "react-native-paper";
import Carousel from "react-native-snap-carousel-v4";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import Geocoder from "react-native-geocoding";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import openMap from "react-native-open-maps";
import { CheckBox, AirbnbRating, Input, Rating } from "react-native-elements";
import algoliasearch from "algoliasearch";
import * as actions from "../actions";
import { connect } from "react-redux";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
// import ScrollToTop from 'react-native-scroll-to-top';
// import * as firebase from 'firebase';
// import Modal from 'react-native-modal';
import { useScrollToTop } from "@react-navigation/native";
import Modal1 from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import Tags from "react-native-tags";
import uuid from "uuid-v4";
import { Camera } from "expo-camera";
import update from "immutability-helper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Modal, ModalContent, SlideAnimation } from "react-native-modals";
import * as Sharing from "expo-sharing";
import { captureRef, captureScreen } from "react-native-view-shot";
// import { usePreventScreenCapture } from 'expo-screen-capture';
// import * as ScreenCapture from 'expo-screen-capture';
import { TouchableRipple } from "react-native-paper";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { ResponseType } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

const firebase = require("firebase/app").default;
require("firebase/auth");

const userAttrToRetr = [
  "email",
  "isRestActive",
  "createdAt",
  "firstname",
  "image",
  "lastname",
  "restDesc",
  "userPostId",
  "username",
  "restName",
  "tokenPass",
  "yourLocation",
  "restUpdateslist",
  "restaurantUid",
  "restWebsite",
  "restAddress",
  "restOrderWeb",
  "code",
];

const attrToRetr = [
  "foodInfo.tags",
  "isNonRestaurantUpload",
  "foodInfo.foodType",
  "foodInfo.food_name",
  "foodInfo.steps",
  "foodInfo.ingredients",
  "restaurantUid",
  "userPostId",
  "uid",
  "isHomemadeItem",
  "dateId",
  "foodInfo.Calorie",
  "totalView",
  "phoneNum",
  "restDesc",
  "Notifications",
  "foodInfo.image",
  "restName",
  "foodInfo.Rate.overallRate",
  "foodInfo.Rate.qualityRate",
  "comments",
  "foodInfo.price",
  "publish",
  "isUndecided",
  "foodInfo.Rate.matchingPicRate",
  "_geoloc.lat",
  "_geoloc.lng",
  "restWebsite",
  "tempChecker.uids",
  "restHours",
  "isRestActive",
  "isImageUploaded",
  "foodLocation.latitude",
  "foodLocation.longitude",
  "restAddress",
  "restOrderWeb",
  "foodInfo.Rate.totalRate",
  "tempChecker.hour",
];

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const catHeight1 = (height * 0.45) / 6;
const catHeight2 = (height / width) * 100;

const catWidth = width * 0.15;
const catHeight = height / width > 1.5 ? catHeight1 : catHeight2;

const day = new Date().getDate();
const month = new Date().getMonth() + 1;
const hours = new Date().getHours();

const dateNum = month * 100 + day;
const hour = dateNum * 100 + hours;

let dateID = 0;
let hrs = 0;
let firstItemNum = 0;

const oldImage =
  "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d";
const newImage =
  "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea";

const avatorTheme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#EE5B64",
    accent: "#EE5B64",
  },
};

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

WebBrowser.maybeCompleteAuthSession();

const FoodScreen = (props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [userPostId, setUserPostId] = useState("");
  const [imageUser, setImageUser] = useState("_");
  const [nowIndex, setNowIndex] = useState(0);
  const [isaddToFavorite, setIsaddToFavorite] = useState(false);
  const onChangeSearch = (query) => setSearchQuery(query);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isTouchableRipple, setIsTouchableRipple] = React.useState(false);

  // const wait = (timeout) => {
  //   return new Promise(resolve => setTimeout(resolve, timeout));
  // }
  // const onRefresh = React.useCallback(() => {
  //   setRefreshing(true);
  //   wait(10).then(() => {setRefreshing(false); console.log(nowIndex);});
  // }, []);
  const doubleTapRef = useRef(null);

  const theme = useTheme();
  let _flatList = useRef(null);
  let _flatList1 = useRef(null);
  let _flatListItem = useRef(null);

  // let _flatList = {};
  const [requestFacebookAuth, responseFacebookAuth, promptFacebookAuthAsync] =
    Facebook.useAuthRequest(
      {
        clientId: "307295626459407",
        redirectUri: `fb307295626459407://authorize`,
        expoClientId: "307295626459407",
        responseType: ResponseType.Token,
        usePKCE: true,
      },
      {
        // projectNameForProxy: "@frezva2/trofii",
        shouldAutoExchangeCode: true,
        useProxy: false,
      }
    );
  const [requestGoogleAuth, responseGoogleAuth, promptAsyncGoogleAuth] =
    Google.useIdTokenAuthRequest(
      {
        androidClientId:
          "513107977432-g5eq07mah3rdo8tsr6lqg156k0fp7mej.apps.googleusercontent.com",
        iosClientId:
          "513107977432-4tnskjkkhkj4n4a23k5p7aolph8704kp.apps.googleusercontent.com",
        expoClientId:
          "513107977432-dont3igkq2o8lvhm2t8tcgjntig551bf.apps.googleusercontent.com",
      },
      {
        // projectNameForProxy: "@frezva2/trofii",
        shouldAutoExchangeCode: true,
        useProxy: false,
        selectAccount: true,
      }
    );

  const [data, setData] = React.useState({
    foodNameArr: [],
    finalResults: [],
    commentsList: [],
    // isaddToFavorite: false,
    activeSlide: 0,
    currentRating: 0,
    newTotalRate: 0,
    tempAppt: 0,
    tempDess: 0,
    tempDrnk: 0,
    tempEntr: 0,
    isMatched: "yes",
    currentItem: null,
    isSeeItem: false,
    isSeeCommments: false,
    isRatingNow: false,
    isFilterChange: false,
    isSortByChange: false,
    isLocationChange: false,
    refreshing: false,
    isScrollUpShows: false,
    loading: false,
    isNoResults: false,
    restUidIndex: 0,
    newMargin: 0,
    myLocation: "Chicago, IL",
    myOldLocation: "Chicago, IL",
    sortBy: "sortByTotalView",
    oldSortBy: "sortByTotalView",
    aroundRadius: 40234,
    foodType: "",
    comment: "",
    tempIndex: [],
    restsImage: [],
    numOfItems: 0,
    currentIndex: 0,
    newRating: 0,
    restsUidArr: [],
    dateIdList: [],
    tempRestsUidArr: [],
    restsImageList: [],
    food_name: "",
    userIcon: "",
    takenPicture: "",
    isSubmitImage: false,
    isLogin: false,
    // searchQuery: ''
  });

  // const onChangeSearch = (query) => {
  //   setData({ ...data, searchQuery: query });
  // }

  // const mounted = async () => {
  //   searchByFood();
  //   const { currentUser } = firebase.auth();
  //   if (currentUser !== null) {
  //     await Analytics.setUserId(currentUser.uid);
  //   }
  // }

  // const onSingleTapEvent = (event) => {
  //   if (event.nativeEvent.state === State.ACTIVE) {
  //     console.log("single tap 1");
  //   }
  // };

  const onDoubleTapEvent = (event, index) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      checkIfLiked(data.finalResults[index]?.objectID);
      getUserPostId(data.finalResults[index]?.uid);
      getImageUser(data.finalResults[index]?.uid);
      setData({
        ...data,
        currentIndex: index,
        isSeeItem: true,
      });
    }
  };

  useEffect(() => {
    // console.log(nowIndex);
    Geocoder.init("AIzaSyBv-uuNSNVNETBl0ol-jyI8zUs2yHr0QL4");
    // mounted();
    // console.log('mounted')
    // const identify = new Identify();
    // Amplitude.getInstance().identify(identify);
    // firebase.auth().onAuthStateChanged((user) => {
    //   if (user !== null) {
    //     identify.set("user", user.uid);
    //     Amplitude.getInstance().logEvent(user.uid);
    //     // Amplitude.getInstance().logEvent("BUTTON_CLICKED", {"Hover Time": "100ms"});
    //   } else {
    //     Amplitude.getInstance().logEvent('Unsigned User');
    //   }
    // })
    if (responseGoogleAuth === null && responseFacebookAuth === null) {
      searchByFood();
    }
    if (responseGoogleAuth !== null) {
      props.googleLogin(responseGoogleAuth);
    }
    if (responseFacebookAuth !== null) {
      props.facebookLogin(responseFacebookAuth);
    }
    return () => {
      // console.log('unmounting...');
    };
  }, [responseGoogleAuth, responseFacebookAuth]);

  //  const getRestLogo = (idx, restaurantUid) => {
  //   const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
  //     // timeouts: {
  //     //   connect: 1,
  //     //   read: 1, // The value of the former `timeout` parameter
  //     //   write: 30
  //     // }
  //   });
  //   let newIndexList = data.tempIndex;
  //   // console.log(newIndexList.indexOf(idx))
  //   if (data.tempIndex.indexOf(idx) === -1) {
  //     newIndexList.push(idx);
  //     setData({ ...data, tempIndex: newIndexList });
  //     let tempRestsImageList = data.restsImageList;
  //     client.initIndex('restsList').search(restaurantUid, {
  //         attributesToRetrieve: userAttrToRetr,
  //         hitsPerPage: 1,
  //         restrictSearchableAttributes: ['restaurantUid', 'objectID']
  //       }).then(responses => {
  //         const str = JSON.stringify(responses.hits);
  //         const object = JSON.parse(str);
  //         tempRestsImageList.push(object[0].image);

  //   // console.log(restaurantUid, object[0].restaurantUid);
  //         setData({ ...data, restsImageList: tempRestsImageList });
  //         // console.log(idx, object[0].restName)
  //       });
  //   }
  // }

  const shuffle = (array) => {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

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
  };
  const goToLocation = (address) => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU`
      )
      .then((response) => {
        openMap({
          query: response.data.results[0].formatted_address,
          latitude: response.data.results[0].geometry.location.lat,
          longitude: response.data.results[0].geometry.location.lng,
          zoom: 18,
          provider: Platform.OS === "ios" ? "apple" : "google",
          end: response.data.results[0].formatted_address,
          travelType: "drive",
        });
      });
  };
  const rateMeNow = async (item, index) => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      setData({
        ...data,
        isRatingNow: true,
        currentItem: item,
        currentIndex: index,
      });
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  const checkIfLiked = (objectID) => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null && currentUser !== undefined) {
      firebase
        .database()
        .ref(`/users/${currentUser?.uid}`)
        .once("value", (snap) => {
          if (snap?.val()?.listFavItems !== undefined) {
            const listFavItems = Object.values(snap?.val()?.listFavItems);
            setTimeout(() => {
              setIsaddToFavorite(listFavItems.includes(objectID));
            }, 1000);
          }
        });
    }
  };
  const orderOnline = (restOrderWeb) => {
    const { currentUser } = firebase.auth();
    // if (currentUser === null || currentUser === undefined) {
    //     this.setState({ isUserUnsignedVisible: true, isCommentsVisible: false });
    //   }
    if (
      currentUser !== null &&
      currentUser !== undefined &&
      (restOrderWeb === null ||
        restOrderWeb === undefined ||
        restOrderWeb === "")
    ) {
      Alert.alert(
        "Online Order Error: ",
        "Sorry, online ordering for this restaurant is not setup, yet.\n\n\nPlease come back later. ",
        [{ text: "OK", onPress: () => {}, style: "cancel" }],
        { cancelable: false }
      );
    }
    // if (currentUser !== null && currentUser !== undefined && restOrderWeb !== undefined && restOrderWeb !== '') {
    Linking.openURL(`http://${restOrderWeb}`);
    // }
  };
  const searchByFood = () => {
    // _flatList?.scrollToOffset({offset: 0, animated: true});
    setTimeout(() => {
      setData({
        ...data,
        finalResults: [],
      });
    }, 50);
    Keyboard.dismiss();
    const client = algoliasearch(
      "K9M4MC44R0",
      "dfc4ea1c057d492e96b0967f050519c4",
      {
        timeouts: {
          connect: 1,
          read: 1, // The value of the former `timeout` parameter
          write: 30,
        },
      }
    );
    let index = client.initIndex(data.sortBy);
    // const { currentUser } = firebase.auth();
    Geocoder.from(data.myLocation).then((json) => {
      var newLocation = json.results[0].geometry.location;
      const latString = newLocation.lat.toString();
      const lngString = newLocation.lng.toString();
      let arndLatLng = "";
      arndLatLng += latString;
      arndLatLng += ",";
      arndLatLng += lngString;
      index
        .search(searchQuery, {
          attributesToRetrieve: attrToRetr,
          hitsPerPage: 900,
          typoTolerance: "strict",
          minWordSizefor1Typo: 3,
          minWordSizefor2Typos: 6,
          // aroundLatLng: arndLatLng,
          restrictSearchableAttributes: [
            "foodInfo.food_name",
            "foodInfo.tags",
            "restName",
          ],
          // aroundRadius: Math.round(data.aroundRadius),
          // getRankingInfo: true,
          facetFilters: [
            `isRestActive:${true}`,
            `publish:${true}`,
            `isImageUploaded:${true}`,
            // `isNonRestaurantUpload:${true}`,
          ],
        })
        .then((responses) => {
          const str = JSON.stringify(responses.hits);
          let object = JSON.parse(str);
          index = "";
          if (object.length !== 0) {
            shuffle(object);
            // object.splice(150);
            firebase.auth().onAuthStateChanged((user) => {
              if (user !== null) {
                const userRef = firebase.database().ref(`/users/${user.uid}`);
                userRef.once("value", (snapshot) => {
                  if (snapshot.val() !== null) {
                    setTimeout(() => {
                      firebase
                        .database()
                        .ref("/worestsLists/")
                        .once("value", (snap) => {
                          if (snap.val() !== null) {
                            setData({
                              ...data,
                              PrivacyPolicy: snap.val().PrivacyPolicy,
                              TermsConditions: snap.val().TermsConditions,
                              tempHours: snapshot.val().tempHours,
                              finalResults: object,
                              userIcon: snapshot.val().image,
                              myLocation: snapshot.val().yourLocation,
                              myOldLocation: snapshot.val().yourLocation,
                              aroundRadius: snapshot.val().aroundRadius,
                              refreshing: false,
                              loading: false,
                              isFilterChange: false,
                              isSortByChange: false,
                              isLogin: false,
                              restUidIndex: 1,
                              tempIndex: [],
                              restsImageList: [],
                            });
                          }
                        });
                    }, 100);
                  }
                });
              } else {
                setTimeout(() => {
                  firebase
                    .database()
                    .ref("/worestsLists/")
                    .once("value", (snap) => {
                      if (snap.val() !== null) {
                        setData({
                          ...data,
                          PrivacyPolicy: snap.val().PrivacyPolicy,
                          TermsConditions: snap.val().TermsConditions,
                          finalResults: object,
                          userIcon: "",
                          refreshing: false,
                          loading: false,
                          isLogin: false,
                          isFilterChange: false,
                          isSortByChange: false,
                          restUidIndex: 1,
                          tempIndex: [],
                          restsImageList: [],
                        });
                      }
                    });
                }, 100);
              }
            });
          } else {
            setTimeout(() => {
              firebase
                .database()
                .ref("/worestsLists/")
                .once("value", (snap) => {
                  if (snap.val() !== null) {
                    setData({
                      ...data,
                      PrivacyPolicy: snap.val().PrivacyPolicy,
                      TermsConditions: snap.val().TermsConditions,
                      finalResults: object,
                      userIcon: "",
                      refreshing: false,
                      loading: false,
                      isFilterChange: false,
                      isLogin: false,
                      isSortByChange: false,
                      restUidIndex: 1,
                      tempIndex: [],
                      restsImageList: [],
                      isNoResults: true,
                    });
                  }
                });
            }, 100);
          }
        });
    });
  };
  async function uploadImageShareAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const ref = firebase.storage().ref("itemShared").child(uuid());
    const snapshot = await ref.put(blob);
    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
    // return await snapshot.downloadURL;
  }
  const shareNow = async (food_name, restName, restWebsite) => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      Sharing.isAvailableAsync().then(async (isAvailableAsync) => {
        if (isAvailableAsync) {
          // await captureRef(_flatListItem, {
          //     result: 'tmpfile',
          //     quality: 0.25,
          //     format: 'jpg',
          //   })
          captureScreen({
            result: "tmpfile",
            quality: 0.25,
            format: "jpg",
          }).then(async (uri) => {
            let uploadUrl = await uploadImageShareAsync(uri);
            const result = await Share.share({
              //   url: uri,
              message: `I recommend you ${food_name} from ${restName}. Find more about this item with TroFii App: \nhttps://www.TroFii.Net \n\n${restWebsite} \n\n${uploadUrl}`,
            });
          });
        }
      });
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  const gotoAccount = (realUserPostId) => {
    props.navigation.navigate("MyAccountScreen", {
      realUserPostId: realUserPostId,
      dateID: Math.floor(Math.random() * 100),
    });
  };
  const _renderItem = ({ item, index }) => {
    // getRestLogo(index, item.restaurantUid);
    return (
      <ScrollView
        style={{
          marginBottom: 1,
          marginTop: 15,
          width,
          height,
          marginLeft: -10,
          transform: [{ rotate: index % 2 === 1 ? "3deg" : "-3deg" }]
        }}
      >
        <TapGestureHandler
          ref={doubleTapRef}
          onHandlerStateChange={(event) => {
            onDoubleTapEvent(event, index-3);
          }}
          numberOfTaps={2}
        >
          <Card
            elevation={10}
            style={{
              justifyContent: "center",
              margin: 20,
              width: width * 0.82,
              borderRadius: 15,
              marginTop: 5,
              zIndex: -1,
            }}
          >
            <TouchableRipple
              style={{ borderRadius: 15 }}
              onPress={() => {}}
              rippleColor="white"
              borderless={true}
              disabled={isTouchableRipple}
            >
              <View>
                <View
                  ref={(flatList) => {
                    _flatListItem = flatList;
                  }}
                  style={{
                    flex: 1,
                    zIndex: -1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 0,
                  }}
                >
                  <Card.Cover
                    style={{
                      flex: 1,
                      zIndex: -1,
                      width: width * 0.82,
                      height: height * 0.4,
                      borderTopLeftRadius: 15,
                      borderTopRightRadius: 15,
                    }}
                    source={{
                      uri:
                        item.foodInfo.image === oldImage ||
                        item.foodInfo.image === newImage
                          ? newImage
                          : item.foodInfo.image,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: -10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      margin: 15,
                      width: width * 0.57,
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* <Avatar.Image size={50} source={{ uri: data.restsImageList[index] }} /> */}
                    <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                      <Title
                        style={{
                          fontSize: 14,
                          fontFamily: "MontserratSemiBold",
                        }}
                      >
                        {item.foodInfo.food_name}
                      </Title>
                    </Card.Content>
                  </View>
                  <View
                    style={{
                      marginTop: 15,
                      alignItems: "flex-start",
                      marginLeft: 5,
                    }}
                  >
                    <Caption
                      style={{
                        fontFamily: "MontserratBold",
                        fontSize: 11,
                        marginTop: 5,
                        marginLeft: -25,
                      }}
                    >
                      "{item.foodInfo.foodType}"
                    </Caption>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        marginLeft: -width * 0.12,
                      }}
                    >
                      {item.totalView === 0 ? (
                        <View />
                      ) : (
                        <View
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginLeft: 1,
                            flexDirection: "row",
                            marginTop: -5,
                          }}
                        >
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 14,
                                fontFamily: "MontserratSemiBold",
                                color: colors.text,
                                marginLeft: 10,
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                              icon={require("../assets/icons/eye.png")}
                            />
                          </View>
                          <View>
                            <Text
                              style={{
                                fontFamily: "MontserratSemiBold",
                                fontSize: 11,
                                color: colors.text,
                                marginLeft: -28,
                                marginTop: -2,
                              }}
                            >
                              {item.totalView === 0 ? "None" : item.totalView}
                            </Text>
                          </View>
                        </View>
                      )}
                      {item.foodInfo.Rate.qualityRate === 0 ? (
                        <View />
                      ) : (
                        <View
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginLeft: -25,
                            flexDirection: "row",
                            marginTop: -5,
                          }}
                        >
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 14,
                                fontFamily: "MontserratSemiBold",
                                color: "#FFC607",
                                marginLeft: 0,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              icon={require("../assets/icons/star.png")}
                            />
                          </View>
                          <View>
                            <Text
                              style={{
                                fontFamily: "MontserratSemiBold",
                                fontSize: 11,
                                color: "#FFC607",
                                marginLeft: -22,
                                marginTop: -2,
                              }}
                            >
                              {item.foodInfo.Rate.qualityRate === 0
                                ? "None"
                                : item.foodInfo.Rate.qualityRate}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 15,
                    marginTop: 5,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                >
                  {item?.foodInfo?.tags?.trim().length !== 0 ? (
                    tagSeperator(item.foodInfo.tags)
                  ) : (
                    <View />
                  )}
                </View>
              </View>
            </TouchableRipple>
          </Card>
        </TapGestureHandler>
      </ScrollView>
    );
  };
  const tagSeperator = (tags) => {
    if (tags !== undefined) {
      const tagsArr = tags.split(",");
      return (
        // setTimeout(() => {
        <Tags
          initialTags={tagsArr}
          readonly={true}
          // onChangeTags={tags => console.log(tags)}
          // onTagPress={(index, tagLabel, event, deleted) =>
          //   console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
          // }
          containerStyle={{ justifyContent: "flex-start" }}
          inputContainerStyle={{ height: 0, width: 0 }}
          renderTag={({ tag, index }) =>
            tag !== " " ? (
              <View
                key={`${tag}-${index}`}
                style={{
                  marginLeft: 2,
                  marginTop: -10,
                  marginRight: 3,
                  marginBottom: 20,
                  backgroundColor: "rgba(238, 91, 100, 0.14)",
                  borderRadius: 10,
                  height: tag.length > width / 11 ? 50 : 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Paragraph
                  style={{
                    fontFamily: "MontserratSemiBold",
                    fontSize: 12,
                    color: "#C90611",
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                >
                  {tag}
                </Paragraph>
              </View>
            ) : (
              <View />
            )
          }
        />
      );
      // }, 100);
    }
  };

  // _shouldItemUpdate = (prev, next) => {
  //     return prev.item !== next.item;
  // }
  const renderHeader = () => {
    return (
      <View style={{ width }}>
        <View style={{ marginTop: 15, marginLeft: 25, marginBottom: 5 }}>
          <View style={{ flexDirection: "row" }}>
            <FontAwesome
              name="map-marker"
              color={"rgba(0, 0, 0, 0.25)"}
              size={20}
            />
            <Caption
              style={{ fontFamily: "Montserrat", fontSize: 14, marginLeft: 10 }}
            >
              {data.myLocation}
            </Caption>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginLeft: 25 }}>
          <View>
            <Text
              style={{
                fontFamily: "MontserratBold",
                fontSize: 24,
                color: colors.text,
              }}
            >
              Search for{" "}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: "MontserratBold",
                fontSize: 24,
                color: "#EE5B64",
              }}
            >
              Food{" "}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginLeft: 25,
              marginRight: 5,
              marginTop: 15,
              marginBottom: 15,
              width: width * 0.72,
            }}
          >
            <Searchbar
              placeholder="Search anything..."
              onIconPress={() => {
                handleSearch(searchQuery);
              }}
              onChangeText={onChangeSearch}
              value={searchQuery}
              // defaultValue={data.searchQuery}
              onEndEditing={() => {
                handleSearch(searchQuery);
              }}
              maxLength={100}
              returnKeyType={"search"}
              keyboardType={"default"}
              selectionColor="#EE5B64"
              style={{ borderRadius: 15 }}
              inputStyle={{ fontFamily: "Montserrat", fontSize: 14 }}
            />
          </View>
          <Image
            style={{ width: 70, height: 70, marginTop: 5 }}
            source={require("../assets/icons/SQ.png")}
            // fadeDuration={100}
          />
        </View>
        <View style={{ flexDirection: "row", marginLeft: 25 }}>
          <Image
            style={{ width: 9.87, height: 13.73 }}
            source={require("../assets/icons/arrows.png")}
          />
          <View>
            <Text
              style={{
                fontFamily: "Montserrat",
                fontSize: 12,
                color: colors.text,
                marginTop: -3,
                marginLeft: 10,
              }}
            >
              Sort by:{" "}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#EE5B64",
                marginTop: -5,
                marginLeft: 1,
              }}
            >
              Best Food
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 15, marginLeft: 25, marginBottom: 5 }}>
          <Text
            style={{
              fontFamily: "MontserratSemiBold",
              fontSize: 16,
              color: colors.text,
            }}
          >
            Nearby Food
          </Text>
        </View>
      </View>
    );
  };
  const renderFooter = () => {
    if (!data.loading) return null;
    return (
      <View style={{ height: 50, marginTop: -15 }}>
        <ActivityIndicator size="large" color="#C90611" />
      </View>
    );
  };

  // _getItemLayout = (data, index) => {
  //   console.log(heightItem, index);
  //     return { length: heightItem, offset:(heightItem + 25) * index, index }
  // }
  const handleSearch = () => {
    // console.log(query, data.searchQuery)
    setData({
      ...data,
      numOfItems: 0,
      // searchQuery: query,
      finalResults: [],
      restUidIndex: 0,
    });
    searchByFood();
  };
  const handleRefresh = () => {
    setData({
      ...data,
      numOfItems: 0,
      finalResults: [],
      restUidIndex: 0,
      refreshing: true,
    });
    // , () => {
    searchByFood();
    // }
    // );
  };

  const handleLoadMore = () => {
    // console.log(data.restUidIndex, data.restsUidArr);
    setData({
      ...data,
      loading: true,
    });
    // const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
    //   // timeouts: {
    //   //   connect: 1,
    //   //   read: 1, // The value of the former `timeout` parameter
    //   //   write: 30
    //   // }
    // });
    // const index = client.initIndex('foodsList');
    //     index.search(data.searchQuery, {
    //       attributesToRetrieve: attrToRetr,
    //       hitsPerPage: 100,
    //       typoTolerance: 'strict',
    //       filters: `restaurantUid:${data.restsUidArr[data.restUidIndex]}`,
    //       facetFilters: [`isRestActive:${true}`, `publish:${true}`, `isImageUploaded:${true}`]
    //     }).then(responses => {
    //         const str = JSON.stringify(responses.hits);
    //         let object = JSON.parse(str);
    //         shuffle(object);
    //         object.splice(10);
    //         setData({
    //           ...data,
    //             finalResults: [...data.finalResults, ...object],
    //             refreshing: false,
    //             loading: false,
    //             numOfItems: data.numOfItems + 10,
    //             restUidIndex: data.restUidIndex + 1
    //           });
    //       });
  };

  //  const _shouldItemUpdate = (props, nextProps) => {
  //     if (this.isEquivalent(props, nextProps)) {
  //       return false;
  //     }
  //     else {
  //       return true;
  //     }
  //   }

  const renderEmpty = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginLeft: 20,
          marginTop: 5,
        }}
      >
        <ScrollView style={{ marginBottom: 0, marginTop: 0, width, height }}>
          <Card
            elevation={10}
            style={{
              justifyContent: "center",
              margin: 20,
              width: width * 0.82,
              height: height * 0.67,
              borderRadius: 15,
              marginTop: 5,
              zIndex: -1,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                zIndex: -1,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                marginTop: 0,
              }}
            >
              <ShimmerPlaceHolder
                style={{
                  flex: 1,
                  zIndex: -1,
                  width: width * 0.82,
                  height: height * 0.5,
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                  height: height * 0.25,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                marginLeft: -10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  margin: 15,
                  width: width * 0.57,
                  justifyContent: "flex-start",
                }}
              >
                {/* <Avatar.Image size={50} source={{ uri: data.restsImageList[index] }} /> */}
                <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                  <ShimmerPlaceHolder
                    style={{ width: width * 0.4, height: 15, borderRadius: 5 }}
                  />
                </Card.Content>
              </View>
              <View
                style={{
                  marginTop: 15,
                  alignItems: "flex-start",
                  marginLeft: 5,
                }}
              >
                <ShimmerPlaceHolder
                  style={{ width: width * 0.15, height: 15, borderRadius: 5 }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: -width * 0.2,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginLeft: 5,
                      flexDirection: "row",
                      marginTop: 15,
                    }}
                  >
                    <View>
                      <ShimmerPlaceHolder
                        style={{ width: 20, height: 20, borderRadius: 10 }}
                      />
                    </View>
                    <View>
                      <ShimmerPlaceHolder
                        style={{
                          width: width * 0.1,
                          height: 15,
                          borderRadius: 5,
                          marginLeft: 5,
                        }}
                      />
                    </View>
                    <View>
                      <ShimmerPlaceHolder
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          marginLeft: 5,
                        }}
                      />
                    </View>
                    <View>
                      <ShimmerPlaceHolder
                        style={{
                          width: width * 0.1,
                          height: 15,
                          borderRadius: 5,
                          marginLeft: 5,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                marginLeft: 15,
                marginTop: 25,
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 2,
                  marginTop: 10,
                  marginRight: 3,
                  marginBottom: 20,
                  borderRadius: 10,
                  height: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ShimmerPlaceHolder
                  style={{ width: width * 0.4, height: 30, borderRadius: 5 }}
                />
                <ShimmerPlaceHolder
                  style={{
                    width: width * 0.2,
                    height: 30,
                    borderRadius: 5,
                    marginLeft: 20,
                  }}
                />
              </View>
              <View
                style={{
                  marginLeft: 10,
                  marginTop: 20,
                  marginRight: 3,
                  marginBottom: 20,
                  borderRadius: 10,
                  height: 3,
                  width: width * 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ShimmerPlaceHolder
                  style={{ width: width * 0.55, height: 30, borderRadius: 5 }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 2,
                  marginTop: 20,
                  marginRight: 3,
                  marginBottom: 20,
                  borderRadius: 10,
                  height: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ShimmerPlaceHolder
                  style={{ width: width * 0.15, height: 30, borderRadius: 5 }}
                />
                <ShimmerPlaceHolder
                  style={{
                    width: width * 0.35,
                    height: 30,
                    borderRadius: 5,
                    marginLeft: 20,
                  }}
                />
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  };

  const login = (type) => {
    if (type === "facebook") {
      // props.facebookLogin(
      //   requestFacebookAuth,
      //   responseFacebookAuth,
      //   promptFacebookAuthAsync
      // );
      promptFacebookAuthAsync();
      // console.log(requestFacebookAuth)
      // console.log(responseFacebookAuth)
      setData({ ...data, isLogin: false });
    } else if (type === "google") {
      // console.log(request)
      // console.log(response)
      // console.log(promptAsync)
      promptAsyncGoogleAuth();
      // props.googleLogin(request, response, promptAsync);
      setData({ ...data, isLogin: false });
    }
    if (type === "apple") {
      props.appleLogin();
      setData({ ...data, isLogin: false });
    }
  };

  const totalViewFunc = (index) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hours = new Date().getHours();
    hrs = year * 1000000 + month * 10000 + day * 100 + hours;
    const emptyList = [];
    const { currentUser } = firebase.auth();
    if (data.finalResults[index] !== undefined) {
      if (data.finalResults[index].tempChecker !== undefined) {
        const list = Object.values(data.finalResults[index].tempChecker.uids);
        if (currentUser !== null) {
          if (list !== undefined) {
            if (data.finalResults[index].tempChecker.uids !== undefined) {
              if (
                hrs !== data.finalResults[index].tempChecker.hour &&
                list.indexOf(`${currentUser.uid}`) === -1 &&
                currentUser.uid !== data.finalResults[index].restaurantUid
              ) {
                firebase
                  .database()
                  .ref(`/food/${data.finalResults[index].objectID}`)
                  .update({
                    totalView: data.finalResults[index].totalView + 1,
                    tempChecker: {
                      hour: hrs,
                      uids: list.concat(`${currentUser.uid}`),
                    },
                  });
                firebase
                  .database()
                  .ref(`/users/${currentUser.uid}`)
                  .update({ tempHours: hrs });
              } else if (
                data.finalResults[index].tempChecker.hour !== hrs &&
                list.indexOf(`${currentUser.uid}`) !== -1 &&
                currentUser.uid !== data.finalResults[index].restaurantUid
              ) {
                firebase
                  .database()
                  .ref(`/food/${data.finalResults[index].objectID}`)
                  .update({
                    totalView: data.finalResults[index].totalView + 1,
                    tempChecker: {
                      hour: hrs,
                      uids: emptyList.concat(`${currentUser.uid}`),
                    },
                  });
                firebase
                  .database()
                  .ref(`/users/${currentUser.uid}`)
                  .update({ tempHours: hrs });
              }
            }
          }
        }
      }
    }
  };
  const calcRating = (Rate) => {
    firebase
      .database()
      .ref(`/food/${data.finalResults[data.currentIndex].objectID}`)
      .once("value", (snapshot) => {
        if (snapshot.val() !== null && snapshot.val() !== undefined) {
          if (
            snapshot.val().foodInfo.Rate.totalRate === 0 ||
            snapshot.val().foodInfo.Rate.qualityRate === 0
          ) {
            setTimeout(() => {
              setData({
                ...data,
                currentRating: Rate,
                newRating: Rate,
                newTotalRate: 1,
              });
            }, 100);
          } else {
            setTimeout(() => {
              setData({
                ...data,
                currentRating: Rate,
                newRating: (
                  (snapshot.val().foodInfo.Rate.qualityRate *
                    snapshot.val().foodInfo.Rate.totalRate +
                    Rate) /
                  (snapshot.val().foodInfo.Rate.totalRate + 1)
                ).toFixed(2),
                newTotalRate: snapshot.val().foodInfo.Rate.totalRate + 1,
              });
            }, 100);
            // console.log(parseFloat((((snapshot.val().foodInfo.Rate.qualityRate * snapshot.val().foodInfo.Rate.totalRate) + Rate) / (snapshot.val().foodInfo.Rate.totalRate + 1)).toFixed(2)))
          }
        }
      });
  };
  const saveMyLocation = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      firebase
        .database()
        .ref(`/users/${currentUser.uid}`)
        .update({ yourLocation: data.myLocation });
      setData({
        ...data,
        isLocationChange: false,
        myOldLocation: data.myLocation,
      });
    } else {
      setData({
        ...data,
        isLocationChange: false,
        myOldLocation: data.myLocation,
      });
    }
  };
  // const checkAddPic = async () => {
  //   const userToken = await AsyncStorage.getItem('userToken');
  //   if (userToken !== null) {
  //     // props.navigation.navigate('FindRestaurant')
  //   } else {
  //     setData({ ...data, isLogin: true });
  //   }
  // }
  const checkSortBy = () => {
    if (data.sortBy === "sortByTotalView") {
      return "Most Popular";
    } else if (data.sortBy === "sortByTotalRate") {
      return "Best Food";
    } else if (data.sortBy === "worests") {
      return "Price: high to low";
    } else if (data.sortBy === "sortByPrice") {
      return "Price: low to high";
    }
  };
  const isLoginYet = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      // const userToken = await AsyncStorage.getItem("userToken");
      // console.log(userToken)
      // if (userToken !== null) {
      props.navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  const resetFilter = () => {
    setData({
      ...data,
      foodType: "",
      myLocation: data.myOldLocation,
    });
  };
  const cancelRatings = () => {
    setData({
      ...data,
      isRatingNow: false,
      comment: "",
      currentItem: null,
      isMatched: "yes",
      currentRating: 0,
      newRating: 0,
      newTotalRate: 0,
    });
  };
  const sendToAllNotification = () => {
    const { currentUser } = firebase.auth();
    // firebase.database().ref(`/users/${data.currentItem.restaurantUid}`).once("value").then((snapshot) => {
    //   snapshot.val().followersList.forEach((uid) => {
    //     if (uid !== 0) {
    //         firebase.database().ref(`/users/${uid}`).once("value").then((snap) => {
    //           sendPushNotification(snap.val().expoToken, uid, 'New Rating ...', `${data.finalResults[data.currentIndex]?.restName} got ${data.newRating}/5 rating for ${data.currentItem.foodInfo.food_name}. `, 'NewRating', data.currentItem.foodInfo.image, currentUser.uid, data.currentItem.objectID)
    //         })
    //       }
    //     })
    // });

    firebase
      .database()
      .ref(`/users/uE1OWGdOQRfPna29DnQ9yGUTvIF3`)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val() !== null) {
          sendPushNotification(
            snapshot.val().expoToken,
            "uE1OWGdOQRfPna29DnQ9yGUTvIF3",
            "New Rating ...",
            `${data.finalResults[data.currentIndex]?.restName} got ${
              data.newRating
            }/5 rating for ${data.currentItem.foodInfo.food_name}. `,
            "NewRating",
            data.currentItem.foodInfo.image,
            currentUser.uid,
            data.currentItem.objectID
          );
        }
      });
  };
  const sendPushNotification = async (
    expoToken,
    expoTokenUid,
    title,
    body,
    type,
    image,
    uid,
    itemId
  ) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    const milliseconds = new Date().getMilliseconds();

    const createdDate =
      year * 1000000000000 +
      month * 10000000000 +
      day * 100000000 +
      hours * 1000000 +
      minutes * 10000 +
      seconds * 100 +
      milliseconds;
    const notificationData = {
      type,
      title,
      message: body,
      image,
      dateID: createdDate,
      uid,
      itemId,
      isSeen: false,
    };
    firebase
      .database()
      .ref(`/users/${expoTokenUid}`)
      .once("value", (snapshot) => {
        firebase
          .database()
          .ref(`/users/${expoTokenUid}`)
          .update({
            Notifications: {
              tempBadgeNum: snapshot.val().Notifications.tempBadgeNum + 1,
              notificationsList: snapshot
                .val()
                .Notifications.notificationsList.concat(notificationData),
            },
          });
      });
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "accept-encoding": "gzip, deflate",
        host: "exp.host",
      },
      body: JSON.stringify({
        to: expoToken,
        title: title,
        body: body,
        subtitle: body,
        data: {
          type,
          title,
          message: body,
          image,
          uid,
          itemId,
          dateID: createdDate,
          isSeen: false,
        },
        priority: "high",
        sound: "default",
        channelId: "default",
      }),
    });
  };
  const submitNow = (foodType) => {
    const year1 = new Date().getFullYear();
    const month1 = new Date().getMonth() + 1;
    const day1 = new Date().getDate();
    const hrs1 = new Date().getHours();
    const min1 = new Date().getMinutes();
    const sec1 = new Date().getSeconds();
    const milsec1 = new Date().getMilliseconds();
    dateID =
      year1 * 10000000000000 +
      month1 * 100000000000 +
      day1 * 1000000000 +
      hrs1 * 10000000 +
      min1 * 100000 +
      sec1 * 1000 +
      milsec1;

    const { currentUser } = firebase.auth();
    const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
    const Uid = currentUser.uid;
    Alert.alert(
      "Rate Submission Alert",
      "Are you sure about your submission? ",
      [
        { text: "No", onPress: () => {}, style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            firebase
              .database()
              .ref(
                `/food/${
                  data.finalResults[data.currentIndex].objectID
                }/foodInfo/Rate`
              )
              .update({
                qualityRate: data.newRating,
                totalRate: data.newTotalRate,
              });
            userRef.once("value", (userSnap) => {
              if (userSnap.val() !== null) {
                firebase
                  .database()
                  .ref(
                    `/food/${
                      data.finalResults[data.currentIndex].objectID
                    }/comments`
                  )
                  .push({
                    comment: data.comment,
                    Uid,
                    dateComment: dateID,
                    objectID: data.finalResults[data.currentIndex].objectID,
                    userImage: userSnap.val().image,
                    firstname: userSnap.val().firstname,
                    lastname: userSnap.val().firstname,
                    Quality_Rate: data.newRating,
                    isMatched: data.isMatched,
                  })
                  .then((snapshot) => {
                    firebase
                      .database()
                      .ref(`/users/${currentUser.uid}`)
                      .update({
                        points: userSnap.val().points + 1,
                        userTotalRate: userSnap.val().userTotalRate + 1,
                      });
                    firebase
                      .database()
                      .ref(`/users/${data.currentItem.restaurantUid}`)
                      .once("value", (restSnap) => {
                        if (restSnap.val() !== null) {
                          firebase
                            .database()
                            .ref(`/users/${currentUser.uid}/comments`)
                            .push({
                              comment: data.comment,
                              dateComment: dateID,
                              itemID:
                                data.finalResults[data.currentIndex].objectID,
                              restaurantUid: data.currentItem.restaurantUid,
                              restName: data.currentItem.restName,
                              restAddress: data.currentItem.restAddress,
                              food_name: data.currentItem.foodInfo.food_name,
                              restDesc: data.currentItem.restDesc,
                              foodPic: data.currentItem.foodInfo.image,
                              restLogo: restSnap.val().image,
                              Quality_Rate: data.newRating,
                              isMatched: data.isMatched,
                            })
                            .then((snap) => {
                              sendToAllNotification();
                              firebase
                                .database()
                                .ref(
                                  `/food/${
                                    data.finalResults[data.currentIndex]
                                      .objectID
                                  }/comments/${snapshot.key}`
                                )
                                .update({ key: snap.key });
                            });
                        }
                      });
                  });
                switch (foodType) {
                  case "Appetizer":
                    {
                      userRef.update({ Appetizer: dateNum });
                      setData({ ...data, tempAppt: dateNum });
                      Alert.alert(
                        "Congratulations !",
                        "Your rate submitted successfully.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              cancelRatings();
                              searchByFood();
                            },
                            style: "cancel",
                          },
                        ],
                        { cancelable: false }
                      );
                    }
                    break;
                  case "Dessert":
                    {
                      userRef.update({ Dessert: dateNum });
                      setData({ ...data, tempDess: dateNum });
                      Alert.alert(
                        "Congratulations !",
                        "Your rate submitted successfully.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              cancelRatings();
                              searchByFood();
                            },
                            style: "cancel",
                          },
                        ],
                        { cancelable: false }
                      );
                    }
                    break;
                  case "Drink":
                    {
                      userRef.update({ Drink: dateNum });
                      setData({ ...data, tempDrnk: dateNum });
                      Alert.alert(
                        "Congratulations !",
                        "Your rate submitted successfully.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              cancelRatings();
                              searchByFood();
                            },
                            style: "cancel",
                          },
                        ],
                        { cancelable: false }
                      );
                    }
                    break;
                  case "Entrée": {
                    userRef.update({ Entrée: dateNum });
                    setData({ ...data, tempEntr: dateNum });
                    Alert.alert(
                      "Congratulations !",
                      "Your rate submitted successfully.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            cancelRatings();
                            searchByFood();
                          },
                          style: "cancel",
                        },
                      ],
                      { cancelable: false }
                    );
                  }
                  default:
                    {
                    }
                    break;
                }
              }
            });
          },
        },
      ],
      { cancelable: false }
    );
  };
  const submitRatings = () => {
    if (data.newRating !== 0) {
      switch (data.currentItem.foodInfo.foodType) {
        case "Appetizer":
          {
            const { currentUser } = firebase.auth();
            firebase
              .database()
              .ref(`/users/${currentUser.uid}`)
              .once("value", (snap) => {
                if (snap.val() !== null) {
                  if (snap.val()?.Appetizer !== dateNum) {
                    submitNow("Appetizer");
                  } else {
                    Alert.alert(
                      "Rate Error Submission",
                      "We are so sorry but everyday you can Rate only one item in each food category.",
                      [{ text: "OK", onPress: () => {}, style: "cancel" }],
                      { cancelable: false }
                    );
                  }
                }
              });
          }
          break;
        case "Dessert":
          {
            const { currentUser } = firebase.auth();
            firebase
              .database()
              .ref(`/users/${currentUser.uid}`)
              .once("value", (snap) => {
                if (snap.val() !== null) {
                  if (snap.val()?.Dessert !== dateNum) {
                    submitNow("Dessert");
                  } else {
                    Alert.alert(
                      "Rate Error Submission",
                      "We are so sorry but everyday you can Rate only one item in each food category.",
                      [{ text: "OK", onPress: () => {}, style: "cancel" }],
                      { cancelable: false }
                    );
                  }
                }
              });
          }
          break;
        case "Drink":
          {
            const { currentUser } = firebase.auth();
            firebase
              .database()
              .ref(`/users/${currentUser.uid}`)
              .once("value", (snap) => {
                if (snap.val() !== null) {
                  if (snap.val()?.Drink !== dateNum) {
                    submitNow("Drink");
                  } else {
                    Alert.alert(
                      "Rate Error Submission",
                      "We are so sorry but everyday you can Rate only one item in each food category.",
                      [{ text: "OK", onPress: () => {}, style: "cancel" }],
                      { cancelable: false }
                    );
                  }
                }
              });
          }
          break;
        case "Entrée": {
          const { currentUser } = firebase.auth();
          firebase
            .database()
            .ref(`/users/${currentUser.uid}`)
            .once("value", (snap) => {
              if (snap.val() !== null) {
                if (snap.val()?.Entrée !== dateNum) {
                  submitNow("Entrée");
                } else {
                  Alert.alert(
                    "Rate Error Submission",
                    "We are so sorry but everyday you can Rate only one item in each food category.",
                    [{ text: "OK", onPress: () => {}, style: "cancel" }],
                    { cancelable: false }
                  );
                }
              }
            });
        }
        // default: {
        //     Alert.alert('Rate Error Submission', 'We are so sorry but everyday you can Rate only one item in each food category.', [{ text: 'OK',
        //     onPress: () => {},
        //     style: 'cancel' }], { cancelable: false });
        // }
        //   break;
      }
    }
  };
  const useCameraHandler = async () => {
    await askPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
      quality: 0.5,
    });
    _handleImagePicked(result);
  };
  const useLibraryHandler = async () => {
    await askPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
      quality: 0.5,
    });
    _handleImagePicked(result);
  };
  const postPhoto = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const time = `${month}/${day}/${year} ${hrs}:${min}`;
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    const dateID =
      year * 10000000000000 +
      month * 100000000000 +
      day * 1000000000 +
      hrs * 10000000 +
      min * 100000 +
      sec * 1000 +
      milsec;
    const { currentUser } = firebase.auth();
    const userImageRef = firebase
      .database()
      .ref(`/userImage/${currentUser.uid}`);
    const restImageRef = firebase
      .database()
      .ref(
        `/restImage/${data.finalResults[data.activeSlide].restaurantUid}/${
          data.finalResults[data.activeSlide].objectID
        }`
      );
    Alert.alert(
      "Congratulations!",
      "Your image successfully uploaded, please wait 48 hours to approve your image. After we approve your image, you will receive 1 Reward Point.",
      [{ text: "OK", onPress: () => {}, style: "cancel" }],
      { cancelable: false }
    );
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        const userRef = firebase.database().ref(`/users/${user.uid}`);
        userRef.once("value", (snap) => {
          restImageRef
            .push({
              takenPicture: data.takenPicture,
              uidUser: currentUser.uid,
              firstname: snap.val().firstname,
              lastname: snap.val().lastname,
              restName: data.finalResults[data.activeSlide].restName,
              userEmail: snap.val().email,
              tags: data.finalResults[data.activeSlide].foodInfo.tags,
              dateID: dateID,
              submissionTime: time,
              approvedBy: "",
              deniedBy: "",
              isNewItem: false,
              deniedTime: "",
              reason: "",
              approvedTime: "",
              isApproved: false,
              isViewed: false,
              food_name: data.finalResults[data.activeSlide].foodInfo.food_name,
              foodType: data.finalResults[data.activeSlide].foodInfo.foodType,
            })
            .then((snapShot) => {
              userImageRef.push({
                takenPicture: data.takenPicture,
                restName: data.finalResults[data.activeSlide].restName,
                tags: data.finalResults[data.activeSlide].foodInfo.tags,
                restaurantUid:
                  data.finalResults[data.activeSlide].restaurantUid,
                dateID: dateID,
                submissionTime: time,
                approvedBy: "",
                deniedBy: "",
                isNewItem: false,
                deniedTime: "",
                reason: "",
                approvedTime: "",
                isApproved: false,
                isViewed: false,
                foodObjectId: data.finalResults[data.activeSlide].objectID,
                food_name:
                  data.finalResults[data.activeSlide].foodInfo.food_name,
                foodType: data.finalResults[data.activeSlide].foodInfo.foodType,
              });
              setData({
                ...data,
                isSubmitImage: false,
                tempRestId: snapShot.key,
              });
            });
        });
      }
    });
  };
  const askPermissionsAsync = async () => {
    await Camera.getCameraPermissionsAsync();
    await Camera.requestCameraPermissionsAsync();
  };
  const _handleImagePicked = async (pickerResult) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const time = `${month}/${day}/${year} ${hrs}:${min}`;
    const milsec = new Date().getMilliseconds();
    const { currentUser } = firebase.auth();
    try {
      if (!pickerResult.cancelled) {
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        // if (data.isSubmitImage === true) {
        const newItem = data.finalResults;
        const imageUrl = update(data.finalResults[data.activeSlide], {
          foodInfo: { image: { $set: uploadUrl } },
        });
        newItem[data.activeSlide] = imageUrl;

        setTimeout(() => {
          setData({
            ...data,
            takenPicture: uploadUrl,
            finalResults: newItem,
            userSubmitImage: false,
          });
        }, 101);

        // } else {
        //   setData({
        //     ...data,
        //     takenPicture: uploadUrl
        //   })
        // }
      }
    } catch (e) {
      alert("Upload failed, sorry :(");
    } finally {
      setData({
        ...data,
        uploading: false,
      });
    }
  };
  const cancelUpdatePic = () => {
    // Delete the file
    if (data.takenPicture !== "") {
      var the_string = data.takenPicture;
      var imageFirstPart = the_string.split("preApprovalImage%2F", 2);
      var imageSecPart = imageFirstPart[1].split("?", 1);
      var finalImageName = imageSecPart[0];
      var storage = firebase.storage();
      var storageRef = storage.ref();
      let userImage = storageRef.child(`preApprovalImage/${finalImageName}`);
      userImage.delete();

      const newItem = data.finalResults;
      const imageUrl = update(data.finalResults[data.activeSlide], {
        foodInfo: { image: { $set: newImage } },
      });
      newItem[data.activeSlide] = imageUrl;

      setTimeout(() => {
        setData({
          ...data,
          takenPicture: "",
          finalResults: newItem,
          isSubmitImage: false,
        });
      }, 101);
    } else {
      const newItem = data.finalResults;
      const imageUrl = update(data.finalResults[data.activeSlide], {
        foodInfo: { image: { $set: newImage } },
      });
      newItem[data.activeSlide] = imageUrl;
      setTimeout(() => {
        setData({
          ...data,
          takenPicture: "",
          finalResults: newItem,
          isSubmitImage: false,
        });
      }, 101);
    }
  };
  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const ref = firebase.storage().ref("preApprovalImage").child(uuid());
    const snapshot = await ref.put(blob);
    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
    // return await snapshot.downloadURL;
  }
  const calcNow = (CreateAt) => {
  if (CreateAt !== undefined) {
      const minutes = Number(CreateAt.substring(10, 12));
      const hours = Number(CreateAt.substring(8, 10));
      const day = Number(CreateAt.substring(6, 8));
      const year = Number(CreateAt.substring(0, 4));
      // console.log(CreateAt)
      if (CreateAt.substring(4, 6) === "01") {
        return `Jan ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "02") {
        return `Feb ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "03") {
        return `Mar ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "04") {
        return `Apr ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "05") {
        return `May ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "06") {
        return `Jun ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "07") {
        return `Jul ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "08") {
        return `Aug ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "09") {
        return `Sep ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "10") {
        return `Oct ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "11") {
        return `Nov ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "12") {
        return `Dec ${day}, ${year}  ${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
    }
  };
  const _renderComments = ({ item, index }) => {
    // console.log(item)
    return (
      <Card
        style={{
          flex: 1,
          width: width * 0.95,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
          borderRadius: 15,
          elevation: 0,
          marginLeft: 10,
          marginBottom: 0,
          marginRight: 10,
        }}
      >
        <View
          style={{
            alignItems: "center",
            borderRadius: 10,
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              marginLeft: 5,
              flexDirection: "row",
              borderRadius: 5,
            }}
          >
            <View style={{ height: 60, width: 60 }}>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 7.5,
                  marginLeft: -2.5,
                  position: "absolute",
                  height: 55,
                  width: 55,
                  borderRadius: 30,
                  backgroundColor: "#e6e6e6",
                  zIndex: 0,
                }}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginTop: 10,
                  zIndex: 1,
                }}
              >
                <Avatar.Image
                  size={50}
                  theme={styles.theme}
                  source={{ uri: item.userImage }}
                  // rounded
                  // style={{ width: 50, height: 50, borderRadius: 25 }}
                  // activeOpacity={1.0}
                  // onPress={() => { console.log(this.getRestLogo(item.restaurantUid)) }}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", width: width * 0.75 }}>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginLeft: 0,
                  marginTop: 5,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 0,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "MontserratBold",
                      fontSize: 15,
                      width: width * 0.65,
                    }}
                  >
                    {item.firstname} {item.lastname}
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    marginBottom: 5,
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    borderRadius: 5,
                    marginTop: 5,
                  }}
                >
                  <Text style={styles.commentStyle}>{item.comment}</Text>
                  {item.isMatched ? (
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: -5,
                        marginLeft: 7,
                        marginBottom: 5,
                      }}
                    >
                      <AirbnbRating
                        count={5}
                        reviews={[
                          "Terrible",
                          "Not Too Bad",
                          "Good",
                          "Very Good",
                          "Amazing",
                        ]}
                        defaultRating={item.Quality_Rate}
                        size={15}
                        showRating={false}
                        isDisabled={true}
                        readonly={true}
                        style={{
                          fontSize: 10,
                        }}
                      />
                      <Image
                        style={{
                          marginLeft: 0,
                          width: 15,
                          height: 15,
                          marginTop: 3,
                          marginRight: 10,
                          marginLeft: 5,
                        }}
                        source={require("../assets/icons/approve.png")}
                        fadeDuration={100}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: -5,
                        marginLeft: 7,
                        marginBottom: 5,
                      }}
                    >
                      <AirbnbRating
                        count={5}
                        reviews={[
                          "Terrible",
                          "Not Too Bad",
                          "Good",
                          "Very Good",
                          "Amazing",
                        ]}
                        defaultRating={item.Quality_Rate}
                        size={15}
                        showRating={false}
                        isDisabled={true}
                        readonly={true}
                        style={{
                          fontSize: 10,
                        }}
                      />
                      <Image
                        style={{
                          marginLeft: 0,
                          width: 15,
                          height: 15,
                          marginTop: 3,
                          marginRight: 10,
                          marginLeft: 5,
                        }}
                        source={require("../assets/icons/close.png")}
                        fadeDuration={100}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.titleStyle8}>
            {calcNow(item.dateComment.toString())}
          </Text>
          <View
            style={{
              width: width * 0.7,
              justifyContent: "space-evenly",
              alignItems: "flex-start",
              marginBottom: 10,
              marginLeft: 30,
              flexDirection: "row",
            }}
          ></View>
        </View>
      </Card>
    );
  };
  const removeFromFavorites = (objectID) => {
    // console.log(objectID)
    const { currentUser } = firebase.auth();
    if (currentUser !== null && currentUser !== undefined) {
      firebase
        .database()
        .ref(`/users/${currentUser?.uid}`)
        .once("value", (snap) => {
          if (snap?.val()?.listFavItems !== undefined) {
            const listFavItems = Object.values(snap?.val()?.listFavItems);
            const position = listFavItems.indexOf(objectID);
            if (position > -1) {
              // only splice array when item is found
              listFavItems.splice(position, 1); // 2nd parameter means remove one item only
              firebase
                .database()
                .ref(`/users/${currentUser?.uid}`)
                .update({ listFavItems: listFavItems });
              setIsaddToFavorite(false);
            }
          }
        });
    }
  };
  const addToFavorite = (food_name, foodType, restName, objectID) => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null && currentUser !== undefined) {
      firebase
        .database()
        .ref(`/users/${currentUser?.uid}`)
        .once("value", (snap) => {
          if (snap?.val()?.listFavItems !== undefined) {
            const listFavItems = Object.values(snap?.val()?.listFavItems);
            firebase
              .database()
              .ref(`/users/${currentUser?.uid}`)
              .update({ listFavItems: listFavItems.concat(`${objectID}`) });
            setIsaddToFavorite(true);
          } else {
            firebase
              .database()
              .ref(`/users/${currentUser?.uid}`)
              .update({
                listFavItems: {
                  0: 0,
                  1: objectID,
                },
              });
            setIsaddToFavorite(true);
          }
        });
    } else {
      setTimeout(() => {
        setData({
          ...data,
          isLogin: true,
        });
      }, 100);
    }
  };
  const reportItem = (item) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const time = `${month}/${day}/${year} ${hrs}:${min}`;
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    let dateID = ((year * 10000000000000) + (month * 100000000000) + 
    (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);

    const { currentUser } = firebase.auth();
      if (currentUser !== null) {
			Alert.alert(
				"Report Alert:",
        "Are you sure you want to report this item?",
        [{ text: "YES", onPress: () => {
          firebase
          .database()
          .ref(`/userReportData/`)
          .push({ 
            dateID,
            emailReporter: currentUser.email,
            restName: item.restName,
            restaurantUid: item.restaurantUid,
            submitTime: time,
            foodUid: item.objectID,
            uidRequested: currentUser.uid,
          })
        }, style: "cancel" },
        {
          text: "NO",
          onPress: () => {},
          style: "cancel"
        }],
				{ cancelable: true }
			  );
      } else {
        setData({ ...data, isLogin: true });
      }
  }
  const swipeRightFunc = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const time = `${month}/${day}/${year} ${hrs}:${min}`;
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    let dateID =
      year * 10000000000000 +
      month * 100000000000 +
      day * 1000000000 +
      hrs * 10000000 +
      min * 100000 +
      sec * 1000 +
      milsec;

    // console.log('Swipe Right', index, data.currentIndex);
    // let idx = index+1;

    setTimeout(() => {
      props.navigation.navigate("MyFavoriteFood", { cameFromDate: dateID });
    }, 10);
  };
  const callNow = async (phoneNum) => {
    // CALL({ number: phoneNum  });
    Linking.openURL(`tel:${phoneNum}`);
  };
  const getUserPostId = (uid) => {
    if (uid !== null && uid !== undefined) {
      firebase
        .database()
        .ref(`/users/${uid}`)
        .once("value", (snapshot) => {
          if (snapshot !== null) {
            setUserPostId(snapshot?.val()?.userPostId);
          }
        });
    }
  };
  const getImageUser = (uid) => {
    if (uid !== null && uid !== undefined) {
      let userRef = firebase.database().ref(`/users/${uid}`);
      userRef.once("value", (snapshot) => {
        if (snapshot !== null) {
          setImageUser(snapshot?.val()?.image);
        }
      });
    }
  };
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
    swipeEnabled: true,
    longpressDelay: 700,
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
        {/* <View style={{ flex: 1, marginTop: -22 }}> */}
        <View style={{ width, height: 56, justifyContent: "center" }}>
          <View
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 0 }}
              onPress={() => {
                isLoginYet();
              }}
            >
              <Image
                style={{
                  flex: 1,
                  marginLeft: 10,
                  width: 55,
                  height: 55,
                  marginTop: 5,
                }}
                source={require("../assets/icons/menu.png")}
                fadeDuration={100}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: "#C90611",
                fontSize: 30,
                textAlign: "center",
                fontFamily: "BerkshireSwash",
                marginLeft: height / width > 1.5 ? width * 0.25 : width * 0.375,
              }}
            >
              TroFii
            </Text>
            <View
              style={{
                flex: 1,
                marginLeft: height / width > 1.5 ? width * 0.25 : width * 0.375,
                marginRight: 10,
              }}
            >
              <Image
                style={{
                  resizeMode: "contain",
                  width: 47,
                  height: 47,
                  borderRadius: 5,
                  marginTop: 3,
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
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              elevation: 1,
              width,
            }}
          />
        </View>
        {/* <View style={{ width, marginTop: 15 }}>
              <View style={{ flexDirection: 'row', marginLeft: 25, marginBottom: 15 }}>
                <FontAwesome 
                    name="map-marker"
                    color={'rgba(0, 0, 0, 0.25)'}
                    size={20}
                />
                <Text style={{ fontFamily: 'Montserrat', fontSize: 14, color: 'rgba(0, 0, 0, 0.25)', marginLeft: 10 }}>{data.myLocation}</Text>
              </View>
            </View> */}
        <ScrollView
          // refreshControl={
          //   <RefreshControl
          //     refreshing={refreshing}
          //     onRefresh={onRefresh}
          //   />
          // }
          style={{
            backgroundColor: "white",
            flex: 1,
            marginBottom: 35,
            marginTop: 10,
          }}
        >
          {data.finalResults.length !== 0 ? (
            <Carousel
              ref={(flatList) => {
                _flatList = flatList;
              }}
              data={data.finalResults}
              renderItem={_renderItem.bind(this)}
              // onScrollIndexChanged={(slideIndex) =>{ console.log(slideIndex) }}
              // onSnapToItem={(index) =>{ console.log('onSnapToItem: ', index) }}
              // onScrollIndexChanged={(index) => {
              //   // setNowIndex(index);
              //   if (index !== data.currentIndex) {
              //     if (index > data.currentIndex && data.currentIndex !== 0) {
              //       // swipeLeftFunc();
              //       // setTimeout(() => {
              //       setData({
              //         ...data,
              //         currentIndex: index,
              //         isSeeItem: false,
              //       });
              //       // }, 10);
              //       // totalViewFunc(index);
              //     }
              //     if (index < data.currentIndex && data.currentIndex !== 0) {
              //       // props.navigation.navigate('FoodSelected');
              //       // swipeRightFunc();
              //       // _flatList.snapToItem(data.currentIndex);
              //       // setTimeout(() => {
              //       checkIfLiked(
              //         data.finalResults[data.currentIndex]?.objectID
              //       );
              //       getUserPostId(data.finalResults[data.currentIndex]?.uid)
              //       getImageUser(data.finalResults[data.currentIndex]?.uid)
              //       setData({
              //         ...data,
              //         currentIndex: index + 1,
              //         isSeeItem: true,
              //       });
              //       // }, 10);
              //       // totalViewFunc(index);
              //     } else if (data.currentIndex === 0) {
              //       // setTimeout(() => {
              //       setData({
              //         ...data,
              //         currentIndex: index,
              //         isSeeItem: false,
              //       });
              //       // }, 100);
              //       // totalViewFunc(index);
              //     }
              //   }
              // }}
              // onBeforeSnapToItem={(slideIndex) => { console.log('onBeforeSnapToItem: ', slideIndex) }}
              sliderWidth={width}
              itemWidth={width * 0.85}
              callbackOffsetMargin={1}
              activeSlideAlignment={"center"}
              // activeAnimationType={"decay"}   Removed props
              layout={"tinder"}
              firstItem={firstItemNum}
              // swipeThreshold={width}  Removed props
              enableSnap={true}
              // enableMomentum={false}  Removed props
              useScrollView={false}
              // lockScrollWhileSnapping={true}   Removed props
              inactiveSlideOpacity={1.0}
              inactiveSlideScale={1.0}
              initialScrollIndex={0}
              activeSlideOffset={0}
              shouldOptimizeUpdates={true}
              initialNumToRender={15}
              decelerationRate={0.25}
              onEndReachedThreshold={6}
              loop={true}
              // loopClonesPerSide={3}
              // ListEmptyComponent={renderEmpty()}
              // slideStyle={{ transform: [{ rotate: "5deg" }] }}
              // contentContainerCustomStyle={{ marginTop: 15 }}
              viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
              removeClippedSubviews={Platform.OS === "ios" ? false : true}
            />
          ) : (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {renderEmpty()}
            </View>
          )}
        </ScrollView>
        <Modal1
          isVisible={data.isSubmitImage}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          onModalHide={() => {
            setData({ ...data, isSubmitImage: false });
          }}
          onModalShow={() => {
            setData({ ...data, isSubmitImage: true });
          }}
          onBackdropPress={() => {
            cancelUpdatePic();
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isSubmitImage: false });
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
          <View
            style={{
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 35,
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ marginTop: 10 }}>
                <Image
                  style={{ width: 100, height: 100, marginTop: 35 }}
                  source={require("../assets/icons/pic_menu.png")}
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
                  {data.food_name}
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
                    style={{
                      width: width * 0.95,
                      marginTop: 0,
                      marginLeft: 15,
                    }}
                  >
                    <Paragraph style={styles.searchDescStyle}>
                      Submit your picture for {data.food_name} by uploading your
                      picture, or taking one.
                    </Paragraph>
                  </View>
                </View>
              </View>
            </View>
            {data.takenPicture === "" ? (
              <View
                style={{
                  height: width * 0.41,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-evenly",
                  marginTop: 10,
                }}
              >
                <View style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => useCameraHandler()}>
                    <Image
                      style={{
                        marginRight: 0,
                        width: 120,
                        height: 120,
                        marginTop: 0,
                      }}
                      source={require("../assets/icons/photo.png")}
                      fadeDuration={100}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => useLibraryHandler()}>
                    <Image
                      style={{
                        marginLeft: 0,
                        width: 120,
                        height: 120,
                        marginTop: 0,
                      }}
                      source={require("../assets/icons/image.png")}
                      fadeDuration={100}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Image
                style={styles.CurrentImage}
                source={{ uri: data.takenPicture }}
              />
            )}
            <TouchableOpacity
              onPress={() => {
                postPhoto();
              }}
              disabled={data.takenPicture === "" ? true : false}
            >
              <View
                style={{
                  marginTop: data.takenPicture === "" ? -20 : 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <LinearGradient
                  colors={
                    data.takenPicture === ""
                      ? ["#cccccc", "#cccccc", "#cccccc"]
                      : ["#fb8389", "#f70814", "#C90611"]
                  }
                  style={styles.linearGradient}
                >
                  <Text style={styles.buttonText}>Post Photo</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            <View
              style={{
                marginTop: 5,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={() => {
                  cancelUpdatePic();
                }}
              >
                <Title
                  style={{
                    color: "black",
                    fontSize: 16,
                    fontFamily: "Montserrat",
                  }}
                >
                  Cancel
                </Title>
              </TouchableOpacity>
            </View>
          </View>
        </Modal1>
        <Modal1
          isVisible={data.isRatingNow}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          swipeDirectio={"up"}
          onModalHide={() => {
            setData({ ...data, isRatingNow: false });
          }}
          onModalShow={() => {
            setData({ ...data, isRatingNow: true });
          }}
          onBackdropPress={() => {
            cancelRatings();
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isRatingNow: false });
          }}
          style={{
            zIndex: 1,
            flex: 1,
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            borderBottomLeftRadius: 35,
            borderBottomRightRadius: 35,
            overflow: "hidden",
            padding: -5,
            backgroundColor: "transparent",
          }}
        >
          <ScrollView
            style={{
              backgroundColor: "white",
              borderRadius: 35,
              // height: height * 0.7,
            }}
            scrollEnabled={true}
            // keyboardDismissMode="none"
            // keyboardShouldPersistTaps="handled"
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={"interactive"}
          >
            <TouchableOpacity
              onPress={() => {
                cancelRatings();
              }}
              style={{ marginVertical: 10, marginLeft: 25, marginTop: 25 }}
            >
              <Feather name="x" color="grey" size={30} />
            </TouchableOpacity>
            <View
              style={{
                marginTop: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 20,
                  color: colors.text,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {data?.currentItem?.foodInfo?.food_name}
              </Text>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15,
                marginBottom: 15,
                marginLeft: 0,
              }}
            >
              <Image
                style={styles.CurrentImage3}
                source={{
                  uri: data.currentItem?.foodInfo?.image,
                  cache: "force-cache",
                }}
              />
            </View>
            <View
              style={{
                marginTop: -10,
                marginBottom: 0,
                marginLeft: width * 0.1,
              }}
            >
              <Caption style={styles.titleStyle}>
                Is this picture matched your item which your ordered?
              </Caption>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 5,
              }}
            >
              <CheckBox
                // center
                onPress={() => {
                  setData({ ...data, isMatched: "yes" });
                }}
                containerStyle={{ width: width * 0.25 }}
                title="YES"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#00cc00"
                checked={data.isMatched === "yes"}
              />
              <CheckBox
                // center
                onPress={() => {
                  setData({ ...data, isMatched: "no" });
                }}
                containerStyle={{ width: width * 0.25 }}
                title="NO"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.isMatched === "no"}
              />
            </View>
            <AirbnbRating
              count={5}
              reviews={[
                "Terrible",
                "Not Too Bad",
                "Good",
                "Very Good",
                "Amazing",
              ]}
              defaultRating={0}
              size={25}
              onFinishRating={(Rate) => {
                calcRating(Rate);
              }}
            />
            <View
              style={{
                flexDirection: "row",
                marginLeft: 30,
                marginBottom: 0,
                marginTop: 25,
              }}
            >
              <Icon name="comment-text" size={30} style={{ marginTop: 5 }} />
              <View style={{ felx: 1 }}>
                <Input
                  containerStyle={{ width: width * 0.7, marginTop: -10 }}
                  inputStyle={styles.titleStyle6}
                  returnKeyType={"done"}
                  autoCorrect={false}
                  maxLength={100}
                  multiline
                  onEndEditing={() => {
                    Keyboard.dismiss();
                  }}
                  value={data.comment}
                  onChangeText={(onChangeText) => {
                    setData({ ...data, comment: onChangeText });
                  }}
                />
              </View>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: -10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  submitRatings();
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
                    <Text style={styles.buttonText}>Submit</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  cancelRatings();
                }}
                style={{ marginBottom: 30 }}
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
                    <Text style={styles.buttonText2}>Cancel</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal1>
        <Modal
          visible={data.isSeeCommments}
          swipeDirection={["down"]} // can be string or an array
          swipeThreshold={height / 2} // default 100
          // height={height* 0.90}
          onHardwareBackPress={() => {
            setData({ ...data, isSeeCommments: false });
          }}
          onSwipeOut={() => {
            setData({ ...data, isSeeCommments: false });
          }}
          modalAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          onTouchOutside={() => {
            setData({ ...data, isSeeCommments: false });
          }}
          modalStyle={{
            marginTop: 85,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <ModalContent>
            <View style={{ backgroundColor: "white", marginLeft: -25 }}>
              <FlatList
                ref={(flatList) => {
                  _flatList1 = flatList;
                }}
                data={data.commentsList}
                initialNumToRender={10}
                keyExtractor={(item) => item.dateComment.toString()}
                renderItem={_renderComments.bind(this)}
                onEndReachedThreshold={0.5}
                viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
              />
            </View>
          </ModalContent>
        </Modal>
        <Modal1
          isVisible={data.isSortByChange}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          swipeDirectio={"up"}
          onModalHide={() => {
            setData({ ...data, isSortByChange: false });
          }}
          onModalShow={() => {
            setData({ ...data, isSortByChange: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isSortByChange: false, sortBy: data.oldSortBy });
          }}
          onSwipeComplete={() => {
            setData({ ...data, isSortByChange: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isSortByChange: false });
          }}
          style={{
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            // borderBottomLeftRadius: 35,
            // borderBottomRightRadius: 35,
            overflow: "hidden",
            marginLeft: 0,
            marginTop: 0,
            marginBottom: -50,
            // marginRight: -10,
            // padding: -5,
            width,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              marginBottom: -height / 2,
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              backgroundColor: "white",
              height: height * 0.5,
              width,
              marginLeft: 0,
              width,
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: -15,
              }}
            >
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: "#EE5B64",
                }}
              >
                _____
              </Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: 25 }}>
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: colors.text,
                }}
              >
                Sort By
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginTop: 15,
              }}
            >
              <CheckBox
                // center
                onPress={() => {
                  setData({ ...data, sortBy: "sortByTotalView" });
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Most Popular"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.sortBy === "sortByTotalView"}
              />
              <CheckBox
                // center
                title="Best Food"
                onPress={() => {
                  setData({ ...data, sortBy: "sortByTotalRate" });
                }}
                containerStyle={{ width: width * 0.45 }}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.sortBy === "sortByTotalRate"}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginTop: 15,
              }}
            >
              <CheckBox
                // center
                onPress={() => {
                  setData({ ...data, sortBy: "worests" });
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Price: high to low"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.sortBy === "worests"}
              />
              <CheckBox
                // center
                onPress={() => {
                  setData({ ...data, sortBy: "sortByPrice" });
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Price: low to high"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.sortBy === "sortByPrice"}
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}
            >
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  searchByFood();
                }}
              >
                {/* <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}> */}
                <LinearGradient
                  colors={["#fb8389", "#f70814", "#C90611"]}
                  style={styles.linearGradient3}
                >
                  <Text style={styles.buttonText3}>Apply Sort</Text>
                </LinearGradient>
                {/* </View> */}
              </TouchableHighlight>
            </View>
          </View>
        </Modal1>
        <Modal1
          isVisible={data.isFilterChange}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          swipeDirectio={"up"}
          onModalHide={() => {
            setData({ ...data, isFilterChange: false });
          }}
          onModalShow={() => {
            setData({ ...data, isFilterChange: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isFilterChange: false });
          }}
          onSwipeComplete={() => {
            setData({ ...data, isFilterChange: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isFilterChange: false });
          }}
          style={{
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            // borderBottomLeftRadius: 35,
            // borderBottomRightRadius: 35,
            overflow: "hidden",
            marginLeft: 0,
            marginTop: 0,
            marginBottom: -50,
            // marginRight: -10,
            // padding: -5,
            width,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              marginBottom: -height / 2,
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              backgroundColor: "white",
              height: height * 0.65,
              width,
              marginLeft: 0,
              width,
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: -15,
              }}
            >
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: "#EE5B64",
                }}
              >
                _____
              </Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: 25 }}>
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: colors.text,
                }}
              >
                Filters
              </Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: 25 }}>
              <Text
                style={{
                  fontFamily: "MontserratSemiBold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Type
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Button
                mode="contained"
                onPress={() => setData({ ...data, foodType: "" })}
                labelStyle={{
                  fontFamily: "MontserratBold",
                  fontSize: 12,
                  color: "white",
                }}
                style={{
                  marginLeft: 25,
                  marginTop: 15,
                  borderRadius: 15,
                  backgroundColor: data.foodType === "" ? "#EE5B64" : "#707070",
                }}
              >
                All
              </Button>
              <Button
                mode="contained"
                onPress={() => setData({ ...data, foodType: "Drink" })}
                labelStyle={{ fontFamily: "MontserratBold", fontSize: 12 }}
                style={{
                  marginLeft: 10,
                  marginTop: 15,
                  borderRadius: 15,
                  backgroundColor:
                    data.foodType === "Drink" ? "#EE5B64" : "#707070",
                }}
              >
                Drink
              </Button>
              <Button
                mode="contained"
                onPress={() => setData({ ...data, foodType: "Appetizer" })}
                labelStyle={{ fontFamily: "MontserratBold", fontSize: 12 }}
                style={{
                  marginLeft: 10,
                  marginTop: 15,
                  borderRadius: 15,
                  backgroundColor:
                    data.foodType === "Appetizer" ? "#EE5B64" : "#707070",
                }}
              >
                Appetizer
              </Button>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Button
                mode="contained"
                onPress={() => setData({ ...data, foodType: "Dessert" })}
                labelStyle={{
                  fontFamily: "MontserratBold",
                  fontSize: 12,
                  color: "white",
                }}
                style={{
                  marginLeft: 25,
                  marginTop: 15,
                  borderRadius: 15,
                  backgroundColor:
                    data.foodType === "Dessert" ? "#EE5B64" : "#707070",
                }}
              >
                Dessert
              </Button>
              <Button
                mode="contained"
                onPress={() => setData({ ...data, foodType: "Entrée" })}
                labelStyle={{ fontFamily: "MontserratBold", fontSize: 12 }}
                style={{
                  marginLeft: 15,
                  marginTop: 15,
                  borderRadius: 15,
                  backgroundColor:
                    data.foodType === "Entrée" ? "#EE5B64" : "#707070",
                }}
              >
                Entrée
              </Button>
            </View>
            <View style={{ marginTop: 20, marginLeft: 25 }}>
              <Text
                style={{
                  fontFamily: "MontserratSemiBold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Location
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isLocationChange: true });
              }}
              style={{
                marginVertical: 10,
                marginLeft: 0,
                marginTop: 5,
                marginBottom: 5,
              }}
            >
              <View
                style={{ flexDirection: "row", marginLeft: 25, marginTop: 5 }}
              >
                <FontAwesome name="map-marker" color={"#EE5B64"} size={20} />
                <Text
                  style={{
                    fontFamily: "MontserratSemiBold",
                    fontSize: 14,
                    color: "#EE5B64",
                    marginLeft: 10,
                  }}
                >
                  {data.myLocation}
                </Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 30,
              }}
            >
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  searchByFood();
                }}
              >
                {/* <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}> */}
                <LinearGradient
                  colors={["#fb8389", "#f70814", "#C90611"]}
                  style={styles.linearGradient3}
                >
                  <Text style={styles.buttonText3}>Apply Filters</Text>
                </LinearGradient>
                {/* </View> */}
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  resetFilter();
                }}
              >
                {/* <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }} > */}
                <LinearGradient
                  colors={["white", "white", "white"]}
                  style={styles.linearGradient3}
                >
                  <Text
                    style={{
                      fontFamily: "MontserratBold",
                      fontSize: 14,
                      color: "#EE5B64",
                      marginLeft: 10,
                      marginRight: 30,
                      marginLeft: 30,
                    }}
                  >
                    Reset
                  </Text>
                </LinearGradient>
                {/* </View> */}
              </TouchableHighlight>
            </View>
          </View>
        </Modal1>
        <Modal1
          isVisible={data.isNoResults}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          onModalHide={() => {
            setData({ ...data, isNoResults: false });
          }}
          onModalShow={() => {
            setData({ ...data, isNoResults: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isNoResults: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isNoResults: false });
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
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 35,
              height: height * 0.75,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setData({ ...data, isNoResults: false });
              }}
              style={{ marginVertical: 10, marginLeft: 25, marginTop: 25 }}
            >
              <Feather name="x" color="grey" size={30} />
            </TouchableOpacity>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ marginTop: 10 }}>
                <Image
                  style={{ width: 150, height: 150, marginTop: 0 }}
                  source={require("../assets/icons/norest.png")}
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
                  No Restaurants
                </Title>
              </View>
              <View style={{ width: width * 0.8 }}>
                <Title style={styles.buttonText4}>
                  Unfortunately, we cannot find any restaurants or food around
                  your location matching your request.
                </Title>
              </View>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 30,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setData({ ...data, isNoResults: false });
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
                    <Text style={styles.buttonText}>Try Again</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => { setData({ ...data, isNoResults: false }) }} style={{ marginBottom: 30 }}>
                    <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient colors={['#fff', '#fff', '#fff']} style={styles.linearGradient2}>
                            <Text style={styles.buttonText2}>Available Locations</Text>
                        </LinearGradient>
                    </View>
                </TouchableOpacity> */}
            </View>
          </View>
        </Modal1>
        <Modal1
          isVisible={data.isLocationChange}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          onModalHide={() => {
            setData({ ...data, isLocationChange: false });
          }}
          onModalShow={() => {
            setData({ ...data, isLocationChange: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isLocationChange: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isLocationChange: false });
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
          <ScrollView
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={"interactive"}
            style={{ flex: 1, backgroundColor: "white", borderRadius: 35 }}
          >
            <TouchableOpacity
              onPress={() => {
                setData({
                  ...data,
                  isLocationChange: false,
                  myLocation: data.myOldLocation,
                });
              }}
              style={{ marginVertical: 10, marginLeft: 25, marginTop: 25 }}
            >
              <Feather name="x" color="grey" size={30} />
            </TouchableOpacity>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{ marginTop: 10 }}>
                <Image
                  style={{ width: 62, height: 73, marginTop: 0 }}
                  source={require("../assets/icons/pin.png")}
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
                  Search New Location
                </Title>
              </View>
              <View style={{ borderRadius: 35 }}>
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
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Paragraph style={styles.searchDescStyle3}>
                      Current Location
                    </Paragraph>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginTop: 5 }}>
                <FontAwesome name="map-marker" color={"#EE5B64"} size={20} />
                <Text
                  style={{
                    fontFamily: "MontserratSemiBold",
                    fontSize: 14,
                    color: "#EE5B64",
                    marginLeft: 10,
                  }}
                >
                  {data.myLocation}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginBottom: 20, marginTop: 20 }}>
              <GooglePlacesAutocomplete
                placeholder="Search here ..."
                scrollEnabled={false}
                minLength={2} // minimum length of text to search
                autoFocus={false}
                returnKeyType={"search"} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                // listViewDisplayed='auto'    // true/false/undefined
                // fetchDetails
                listViewDisplayed={"auto"}
                keyboardShouldPersistTaps="always"
                renderDescription={(row) => row.description} // custom description render
                onPress={(data1, details = null) => {
                  // 'details' is provided when fetchDetails = true
                  setData({ ...data, myLocation: data1.description });
                }}
                // getDefaultValue={() => {
                //   return ''; // text input default value
                // }}
                query={{
                  key: "AIzaSyBv-uuNSNVNETBl0ol-jyI8zUs2yHr0QL4",
                  language: "en", // language of the results
                  types: "(cities)", // default: 'geocode'
                }}
                styles={{
                  description: styles.descCitiesStyle,
                  predefinedPlacesDescription: styles.descCitiesStyle,
                  textInputContainer: {
                    marginLeft: 25,
                    backgroundColor: "#ffffff",
                    color: "black",
                    borderColor: "black",
                    width: width * 0.8,
                    // borderBottomWidth: 0
                  },
                  textInput: {
                    backgroundColor: "white",
                    marginLeft: 25,
                    borderColor: "gray",
                    borderWidth: 1,
                    marginLeft: 0,
                    marginRight: 0,
                    height: 40,
                    color: "black",
                    fontSize: 16,
                  },
                  poweredContainer: {
                    flex: 1,
                    // width: 0,
                    // height: 0,
                    // marginLeft: -50,
                    // backgroundColor: '#731c32'
                    // backgroundColor: '#f2f2f2'
                  },
                }}
                // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                // currentLocationLabel="Current location"
                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 30,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  saveMyLocation();
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
                    <Text style={styles.buttonText}>Save Search</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setData({
                    ...data,
                    isLocationChange: false,
                    myLocation: data.myOldLocation,
                  });
                }}
                style={{ marginBottom: 30 }}
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
                    <Text style={styles.buttonText2}>Cancel</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal1>
        <Modal1
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
                    style={{
                      width: width * 0.75,
                      marginTop: 0,
                      marginLeft: 15,
                    }}
                  >
                    <Paragraph style={styles.searchDescStyle}>
                      You are not signed into an account, which means you won’t
                      be able to use 100% of the apps functionalities.{" "}
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
                    style={{
                      width: width * 0.75,
                      marginTop: 0,
                      marginLeft: 15,
                    }}
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
                  <View
                    style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}
                  >
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
                  <View
                    style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}
                  >
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
                    NOTE: Your email address will be used to create an account
                    to store and keep track of your Reward Points earned and
                    redeemed as well as your saved restaurants.
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
        </Modal1>
        <Modal1
          isVisible={data.isSeeItem}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe={true}
          swipeDirectio={"up"}
          onModalHide={() => {
            setData({ ...data, isSeeItem: false });
          }}
          onModalShow={() => {
            setData({ ...data, isSeeItem: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isSeeItem: false });
          }}
          onBackButtonPress={() => {
            setData({ ...data, isSeeItem: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          // hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isSeeItem: false });
          }}
          // swipeDirection={"down"}
          // swipeThreshold={(height * 0.3)}
          // onSwipeStart={()=>{console.log('Start')}}
          // onSwipeMove={()=>{console.log('Move')}}
          // onSwipeComplete={()=>{console.log('Complete'); setData({ ...data, isSeeItem: false });}}
          // onSwipeCancel={()=>{setData({ ...data, isSeeItem: true });}}
          style={{
            flex: 1,
            zIndex: 0,
            marginLeft: 0,
            height: height * 0.9,
            marginTop: height * 0.1,
            marginBottom: 0,
            width,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            // borderBottomLeftRadius: 10,
            // borderBottomRightRadius: 10,
            overflow: "hidden",
            padding: 0,
            backgroundColor: "transparent",
          }}
        >
          {/* <Modal
              visible={data.isSeeItem}
              swipeDirection={['down']} // can be string or an array
              swipeThreshold={height/2} // default 100
              height={height* 0.90}
              onHardwareBackPress={() => {
                setData({ ...data, isSeeItem: false })
              }}
              onSwipeOut={() => {
                setData({ ...data, isSeeItem: false })
              }}
              modalAnimation={new SlideAnimation({
                slideFrom: 'bottom',
              })}
              onTouchOutside={() => {
                setData({ ...data, isSeeItem: false })
              }}
              modalStyle={{ marginTop: 85, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            > */}
          <ScrollView style={{ marginTop: 0, width, height, marginLeft: 0 }}>
            <TouchableWithoutFeedback>
              <Card
                elevation={10}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  margin: 0,
                  width,
                  borderRadius: 5,
                  marginTop: 0,
                  zIndex: -1,
                }}
              >
                <TouchableHighlight
                  onPress={() => {
                    setData({ ...data, isSeeItem: false });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#d7443e",
                    zIndex: 2,
                    borderBottomRightRadius: 25,
                    borderTopLeftRadius: 15,
                    width: 50,
                    height: 50,
                    marginTop: 0,
                    marginLeft: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 10,
                  }}
                >
                  <View
                    style={
                      {
                        // elevation: 10,
                        // shadowColor: '#000',
                        // shadowOffset: { width: 0, height: 2 },
                        // shadowOpacity: 0.5,
                        // shadowRadius: 2
                      }
                    }
                  >
                    <Image
                      style={{ width: 40, height: 40 }}
                      source={require("../assets/icons/close2.png")}
                    />
                  </View>
                </TouchableHighlight>
                {data.finalResults[data.currentIndex]?.foodInfo.image ===
                  oldImage ||
                data.finalResults[data.currentIndex]?.foodInfo.image ===
                  newImage ? (
                  <View />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      rateMeNow(
                        data.finalResults[data.currentIndex],
                        data.currentIndex
                      );
                    }}
                    style={{
                      flex: 1,
                      zIndex: 2,
                      borderRadius: 30,
                      width: 50,
                      height: 50,
                      marginTop:
                        data.finalResults[data.currentIndex]?.foodInfo.steps !==
                        undefined
                          ? -10
                          : -20,
                      marginLeft:
                        height / width > 1.5 ? width * 0.8 : width * 0.85,
                      justifyContent: "center",
                      alignItems: "center",
                      elevation: 10,
                      backgroundColor: "white",
                    }}
                  >
                    <View
                      style={{
                        elevation: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 2,
                      }}
                    >
                      <Image
                        style={{ width: 40, height: 40 }}
                        source={require("../assets/icons/star-plus3.png")}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                <View
                  ref={(flatList) => {
                    _flatListItem = flatList;
                  }}
                  style={{
                    flex: 1,
                    zIndex: -1,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop:
                      data.finalResults[data.currentIndex]?.foodInfo.image ===
                        oldImage ||
                      data.finalResults[data.currentIndex]?.foodInfo.image ===
                        newImage
                        ? -5
                        : -90,
                  }}
                >
                  <Card.Cover
                    style={{
                      flex: 1,
                      zIndex: -1,
                      width,
                      height: height * 0.4,
                      borderTopLeftRadius: 15,
                      borderTopRightRadius: 15,
                    }}
                    source={{
                      uri:
                        data.finalResults[data.currentIndex]?.foodInfo.image ===
                          oldImage ||
                        data.finalResults[data.currentIndex]?.foodInfo.image ===
                          newImage
                          ? newImage
                          : data.finalResults[data.currentIndex]?.foodInfo
                              .image,
                    }}
                  />
                </View>
                {data.finalResults[data.currentIndex]?.comments ? (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginTop: -20,
                      marginLeft: 25,
                      marginBottom: -10,
                    }}
                    onPress={() => {
                      const arr = Object.keys(
                        data.finalResults[data.currentIndex]?.comments
                      )
                        .map((key) => {
                          return data.finalResults[data.currentIndex]?.comments[
                            key
                          ];
                        })
                        .sort((a, b) => {
                          return b.dateComment - a.dateComment;
                        });
                      setData({
                        ...data,
                        isSeeCommments: true,
                        commentsList: arr,
                      });
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        elevation: 3,
                        width: 40,
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        name="message-bulleted"
                        size={30}
                        color={"#595959"}
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                {/* {data.finalResults[data.currentIndex]?.foodInfo.image ===
                  oldImage ||
                data.finalResults[data.currentIndex]?.foodInfo.image ===
                  newImage ? (
                  <View />
                ) : (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      elevation: 1,
                      marginLeft: width * 0.8,
                      backgroundColor: "white",
                      height: 50,
                      width: 50,
                      borderRadius: 25,
                      marginTop: data.finalResults[data.currentIndex]?.comments
                        ? -35
                        : -25,
                    }}
                    onPress={() => {
                      shareNow(
                        data.finalResults[data.currentIndex]?.foodInfo
                          .food_name,
                        data.finalResults[data.currentIndex]?.restName,
                        data.finalResults[data.currentIndex].restWebsite
                      );
                    }}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        marginLeft: -5,
                      }}
                    >
                      <FontAwesome
                        name="share-alt"
                        color={"#EE5B64"}
                        size={30}
                      />
                    </View>
                  </TouchableOpacity>
                )} */}
                {data.finalResults[data.currentIndex]?.foodInfo.steps !==
                undefined ? (
                  <View
                    style={{
                      flex: 1,
                      zIndex: 3,
                      marginTop: -35,
                      marginLeft: width * 0.3,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "flex-end",
                    }}
                  >
                    <View
                      style={{
                        elevation: 5,
                        textShadowColor: "white",
                        textShadowRadius: 5,
                      }}
                    >
                      <Image
                        style={{
                          flex: 1,
                          elevation: 5,
                          marginLeft: 50,
                          width: 60,
                          height: 60,
                          marginTop: 5,
                          borderRadius: 10,
                        }}
                        source={{ uri: imageUser }}
                        fadeDuration={100}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        gotoAccount(userPostId);
                      }}
                    >
                      <Text
                        style={{
                          color: "black",
                          fontFamily: "MontserratSemiBold",
                          marginLeft: 5,
                          marginTop: 0,
                          elevation: 2,
                          textShadowColor: "white",
                          textShadowRadius: 5,
                        }}
                      >
                        @{userPostId}
                      </Text>
                    </TouchableOpacity>
                    {/* {data.finalResults[data.currentIndex]?.userPostId !==
                  undefined ? (
                    <TouchableOpacity
                      onPress={() => {
                        gotoAccount(
                          getUserPostId(data.finalResults[data.currentIndex]?.uid)
                        );
                      }}
                    >
                      <Text
                        style={{
                          color: "black",
                          fontFamily: "MontserratSemiBold",
                          marginLeft: 5,
                          marginTop: -30,
                          elevation: 2,
                          textShadowColor: "white",
                          textShadowRadius: 5,
                        }}
                      >
                        @asdsadasd{getUserPostId(data.finalResults[data.currentIndex]?.uid)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )} */}
                  </View>
                ) : (
                  <View />
                )}
                {!isaddToFavorite ? (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      elevation: 1,
                      marginLeft:
                        data.finalResults[data.currentIndex]?.foodInfo.steps !==
                        undefined
                          ? 30
                          : width * 0.5 - 25,
                      backgroundColor: "white",
                      height: 50,
                      width: 50,
                      borderRadius: 5,
                      marginTop:
                        data.finalResults[data.currentIndex]?.foodInfo.steps !==
                        undefined
                          ? -55
                          : -25,
                    }}
                    onPress={() => {
                      addToFavorite(
                        data.finalResults[data.currentIndex]?.foodInfo
                          .food_name,
                        data.finalResults[data.currentIndex]?.foodInfo.foodType,
                        data.finalResults[data.currentIndex]?.restName,
                        data.finalResults[data.currentIndex]?.objectID
                      );
                    }}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        marginLeft: 0,
                      }}
                    >
                      <Image
                        style={{ width: 30, height: 30 }}
                        source={require("../assets/icons/heart-plus.png")}
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      elevation: 1,
                      marginLeft:
                        data.finalResults[data.currentIndex]?.foodInfo.steps !==
                        undefined
                          ? 30
                          : width * 0.5 - 25,
                      backgroundColor: "white",
                      height: 50,
                      width: 50,
                      borderRadius: 5,
                      marginTop:
                        data.finalResults[data.currentIndex]?.foodInfo.steps !==
                        undefined
                          ? -55
                          : -25,
                    }}
                    onPress={() => {
                      removeFromFavorites(
                        data.finalResults[data.currentIndex]?.objectID
                      );
                    }}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        marginLeft: 0,
                      }}
                    >
                      <Image
                        style={{ width: 30, height: 30 }}
                        source={require("../assets/icons/heart-delete.png")}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      margin: 15,
                      width: width * 0.57,
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* <Avatar.Image size={50} source={{ uri: data.restsImageList[index] }} /> */}
                    <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                      <Title
                        style={{
                          fontSize: 14,
                          fontFamily: "MontserratSemiBold",
                        }}
                      >
                        {
                          data.finalResults[data.currentIndex]?.foodInfo
                            .food_name
                        }
                      </Title>
                      {data.finalResults[data.currentIndex]?.foodInfo.steps !==
                      undefined ? (
                        <View>
                          <Paragraph
                            style={{
                              fontSize: 12,
                              fontFamily: "Montserrat",
                              marginTop: 0,
                            }}
                          >
                            {data.finalResults[data.currentIndex]?.restName}
                          </Paragraph>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "MontserratSemiBold",
                              marginTop: 5,
                            }}
                          >
                            {data.finalResults[data.currentIndex]?.foodInfo
                              .price !== 0
                              ? "$ "
                              : null}
                            {data.finalResults[data.currentIndex]?.foodInfo
                              .price !== 0
                              ? data.finalResults[data.currentIndex]?.foodInfo
                                  .price
                              : null}
                          </Text>
                        </View>
                      ) : (
                        <View />
                      )}
                    </Card.Content>
                  </View>
                  <View
                    style={{
                      marginTop: 15,
                      alignItems: "flex-start",
                      marginLeft: 35,
                    }}
                  >
                    <Caption
                      style={{
                        fontFamily: "MontserratBold",
                        fontSize: 11,
                        marginTop: 5,
                        marginLeft: -25,
                      }}
                    >
                      "{data.finalResults[data.currentIndex]?.foodInfo.foodType}
                      "
                    </Caption>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        marginLeft: -width * 0.12,
                      }}
                    >
                      {data.finalResults[data.currentIndex]?.totalView === 0 ? (
                        <View />
                      ) : (
                        <View
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginLeft: 1,
                            flexDirection: "row",
                            marginTop: -5,
                          }}
                        >
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 14,
                                fontFamily: "MontserratSemiBold",
                                color: colors.text,
                                marginLeft: 10,
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                              icon={require("../assets/icons/eye.png")}
                            />
                          </View>
                          <View>
                            <Text
                              style={{
                                fontFamily: "MontserratSemiBold",
                                fontSize: 11,
                                color: colors.text,
                                marginLeft: -28,
                                marginTop: -2,
                              }}
                            >
                              {data.finalResults[data.currentIndex]
                                ?.totalView === 0
                                ? "None"
                                : data.finalResults[data.currentIndex]
                                    ?.totalView}
                            </Text>
                          </View>
                        </View>
                      )}
                      {data.finalResults[data.currentIndex]?.foodInfo.Rate
                        .qualityRate === 0 ? (
                        <View />
                      ) : (
                        <View
                          style={{
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginLeft: -25,
                            flexDirection: "row",
                            marginTop: -5,
                          }}
                        >
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 14,
                                fontFamily: "MontserratSemiBold",
                                color: "#FFC607",
                                marginLeft: 0,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              icon={require("../assets/icons/star.png")}
                            />
                          </View>
                          <View>
                            <Text
                              style={{
                                fontFamily: "MontserratSemiBold",
                                fontSize: 11,
                                color: "#FFC607",
                                marginLeft: -22,
                                marginTop: -2,
                              }}
                            >
                              {data.finalResults[data.currentIndex]?.foodInfo
                                .Rate.qualityRate === 0
                                ? "None"
                                : data.finalResults[data.currentIndex]?.foodInfo
                                    .Rate.qualityRate}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 15,
                    marginTop: 5,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                >
                  {data.finalResults[data.currentIndex]?.foodInfo?.tags?.trim()
                    .length !== 0 ? (
                    tagSeperator(
                      data.finalResults[data.currentIndex]?.foodInfo?.tags
                    )
                  ) : (
                    <View />
                  )}
                </View>
                {data.finalResults[data.currentIndex]?.foodInfo.steps ===
                undefined ? (
                  <Card.Actions
                    style={{
                      flex: 1,
                      width,
                      marginLeft: -10,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(
                          `http://${
                            data.finalResults[data.currentIndex]?.restWebsite
                          }`
                        );
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          flexDirection: "row",
                          marginTop: -5,
                        }}
                      >
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 20,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 5,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon="web"
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 11,
                              color: colors.text,
                              marginLeft: -25,
                            }}
                          >
                            Website
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginLeft: 0 }}
                      onPress={() => {
                        goToLocation(
                          data.finalResults[data.currentIndex]?.restAddress
                        );
                        console.log("phone");
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          flexDirection: "row",
                          marginTop: -5,
                        }}
                      >
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 20,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 5,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon="map-marker-radius"
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 11,
                              color: colors.text,
                              marginLeft: -25,
                            }}
                          >
                            Locate
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginLeft: 0 }}
                      onPress={() => {
                        callNow(data.finalResults[data.currentIndex]?.phoneNum);
                        // console.log("phone");
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          flexDirection: "row",
                          marginTop: -5,
                        }}
                      >
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 20,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 5,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon="phone"
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 11,
                              color: colors.text,
                              marginLeft: -25,
                            }}
                          >
                            Call
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginLeft: 0 }}
                      onPress={() => {
                        orderOnline(
                          data.finalResults[data.currentIndex]?.restOrderWeb
                        );
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          flexDirection: "row",
                          marginTop: -5,
                        }}
                      >
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 20,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 5,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon={require("../assets/icons/order.png")}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 11,
                              color: colors.text,
                              marginLeft: -25,
                            }}
                          >
                            Order
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Card.Actions>
                ) : (
                  <View style={{ marginTop: -80 }}>
                    <View
                      style={{
                        flex: 1,
                        zIndex: 3,
                        marginTop: -35,
                        marginLeft: width * 0.3,
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "flex-end",
                      }}
                    >
                      {/* <View
                    style={{
                      elevation: 5,
                      textShadowColor: "white",
                      textShadowRadius: 5,
                    }}
                  >
                    <Image
                      style={{
                        flex: 1,
                        elevation: 5,
                        marginLeft: 10,
                        width: 60,
                        height: 60,
                        marginTop: 5,
                        borderRadius: 10,
                      }}
                      source={{ uri: getImageUser(data.finalResults[data.currentIndex]?.uid) }}
                      fadeDuration={100}
                    />
                  </View>
                  {data.finalResults[data.currentIndex]?.userPostId !==
                  undefined ? (
                    <TouchableOpacity
                      onPress={() => {
                        gotoAccount(
                          getUserPostId(data.finalResults[data.currentIndex]?.uid)
                        );
                      }}
                    >
                      <Text
                        style={{
                          color: "black",
                          fontFamily: "MontserratSemiBold",
                          marginLeft: 5,
                          marginTop: -30,
                          elevation: 2,
                          textShadowColor: "white",
                          textShadowRadius: 5,
                        }}
                      >
                        @{getUserPostId(data.finalResults[data.currentIndex]?.uid)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )} */}
                    </View>
                    <View
                      style={{
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginLeft: 5,
                        flexDirection: "row",
                        marginTop: 30,
                        marginBottom: 10,
                      }}
                    >
                      <View>
                        <Button
                          labelStyle={{
                            fontSize: 14,
                            fontFamily: "MontserratSemiBold",
                            color: colors.text,
                            marginLeft: 5,
                            justifyContent: "flex-start",
                            alignItems: "center",
                          }}
                          icon={require("../assets/icons/eye.png")}
                        />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontFamily: "MontserratSemiBold",
                            fontSize: 13,
                            color: colors.text,
                            marginLeft: -15,
                            marginTop: -2,
                          }}
                        >
                          {data.finalResults[data.currentIndex]?.totalView === 0
                            ? "None"
                            : data.finalResults[data.currentIndex]?.totalView}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, marginBottom: 30, marginLeft: 10 }}>
                      <Text style={styles.titleStyle9}>Ingredients: </Text>
                      <Text style={styles.titleStyle10}>
                        {
                          data.finalResults[data.currentIndex].foodInfo
                            .ingredients
                        }
                      </Text>
                    </View>
                    <View style={{ marginBottom: 50, marginLeft: 10 }}>
                      <Text style={styles.titleStyle9}>Instruction: </Text>
                      <Text style={styles.titleStyle10}>
                        {data.finalResults[data.currentIndex].foodInfo.steps}
                      </Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity 
                  onPress={()=>{reportItem(data.finalResults[data.currentIndex])}}
                  style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}
                >
                  <Image
                    style={{ "resizeMode": "stretch", "backgroundColor": "#ffffff", width: 30, height: 30 }}
                    source={require('../assets/icons/warning.png')}
                    fadeDuration={0}
                  />
                  <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: -5 }}>
                    <Text style={styles.titleStyle9}>Report</Text>
                  </View>
                </TouchableOpacity>
                {data.finalResults[data.currentIndex]?.foodInfo.steps ===
                undefined ? (
                  <View
                    style={{ height: height * 0.2, backgroundColor: "white" }}
                  />
                ) : (
                  <View />
                )}
              </Card>
            </TouchableWithoutFeedback>
          </ScrollView>
        </Modal1>
      </View>
    </SafeAreaView>
  );
};

// function mapStateToProps({ auth }) {
// 	return { token: auth.token };
// }

export default connect(null, actions)(FoodScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    backgroundColor: "#ffff1a",
    fontSize: 50,
    color: "black",
    margin: 16,
    right: 0,
    // bottom: width * 0.6,
  },
  descCitiesStyle: {
    color: "black",
    marginLeft: 15,
    // marginTop: -5,
    fontFamily: "MontserratSemiBold",
  },
  titleStyle10: {
    flex: 1,
    fontFamily: "Montserrat",
    fontSize: 15,
    marginLeft: 15,
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  titleStyle9: {
    flex: 1,
    fontFamily: "MontserratBold",
    fontSize: 14,
    marginLeft: 15,
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  scrollTop: {
    position: "absolute",
    backgroundColor: "gray",
    borderRadius: 20,
    fontSize: 50,
    color: "white",
    marginLeft: 0,
    right: width * 0.32,
    bottom: height - 190,
  },
  CurrentImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  CurrentImage3: {
    flex: 1,
    // width: 50,
    // height: 50,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  CurrentImage2: {
    // width: 50,
    // height: 50,
    width: catWidth,
    height: catHeight,
    borderRadius: 5,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  commentStyle: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  titleStyle: {
    fontFamily: "MontserratSemiBold",
    fontSize: 16,
    width: width * 0.7,
    // justifyContent: 'center',
    // alignItems: 'center',
    lineHeight: 25,
    textAlign: "center",
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle8: {
    fontFamily: "Montserrat",
    fontSize: 10,
    marginLeft: 5,
    marginBottom: 0,
    width: width * 0.6,
    marginTop: 0,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle6: {
    fontFamily: "Montserrat",
    fontSize: 16,
    marginLeft: 0,
    marginBottom: 0,
    width: width * 0.7,
    lineHeight: 20,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
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
    borderRadius: 25,
    width: width * 0.75,
  },
  linearGradient3: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    // width: width * 0.40,
    marginLeft: 10,
    marginTop: 10,
    elevation: 4,
    shadowColor: "black", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
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
  buttonText3: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    marginLeft: 50,
    marginRight: 50,
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
  buttonText4: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "gray",
    backgroundColor: "transparent",
  },
  linearGradient2: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    width: width * 0.75,
    borderColor: "#C90611",
    borderWidth: 1,
  },
});
