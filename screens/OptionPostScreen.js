import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Share,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Title, Paragraph, DefaultTheme, useTheme } from "react-native-paper";
import * as actions from "../actions";
import { connect } from "react-redux";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import uuid from "uuid-v4";
import Modal from "react-native-modal";
import algoliasearch from "algoliasearch";
import Feather from "react-native-vector-icons/Feather";
import Geocoder from "react-native-geocoding";
import * as Sharing from "expo-sharing";
import { captureRef, captureScreen } from "react-native-view-shot";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const catHeight1 = (height * 0.45) / 6;
const catHeight2 = (height / width) * 100;

const catWidth = width * 0.15;
const catHeight = height / width > 1.5 ? catHeight1 : catHeight2;

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

const createdDate = year * 10000 + month * 100 + day;

const attrToRetr = [
  "foodInfo.tags",
  "foodInfo.foodType",
  "foodInfo.food_name",
  "restaurantUid",
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

import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { ResponseType } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

const client = algoliasearch("", "", {
  timeouts: {
    connect: 1,
    read: 2, // The value of the former `timeout` parameter
    write: 30,
  },
});

let newSearchState = {
  food_name: "",
};

let searchState = {
  noResults: false,
  noResultsReq: false,
  resultsLength: 1,
  hitsLength: 1,
  takenPicture: "",
  food_name: "",
  searchingWord: "",
  nameRest: "",
  nameRestDesc: "",
};

let dateID = 0;

const avatorTheme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#EE5B64",
    accent: "#EE5B64",
  },
};

WebBrowser.maybeCompleteAuthSession();

const OptionPostScreen = (props) => {
  const { colors } = useTheme();
  let explosion = useRef(null);
  let _flatListItem = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [restaurantName, setRestaurantName] = React.useState("");
  const [restaurantUid, setRestaurantUid] = React.useState("");
  const [food_name, setFoodName] = React.useState("");
  const [restAddress, setRestAddress] = React.useState("");
  const [foodObjectId, setFoodObjectId] = React.useState("");
  const [tempFoodName, setTempFoodName] = React.useState("");
  const [takenPicture, setTakenPicture] = React.useState("");
  const [place_id, setPlaceId] = React.useState("");
  const [restAxiosData, setRestAxiosData] = React.useState("");
  const [restWebsite, setRestWebsite] = React.useState("");
  const [phoneNum, setPhoneNum] = React.useState("");
  const [business_status, setBusinessStatus] = React.useState("");
  const [restLocation, setRestLocation] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);

  const [data, setData] = React.useState({
    oldImage:
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d",
    newImage:
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea",
    PrivacyPolicy: "",
    TermsConditions: "",
    isSubmitImage: false,
    food_name: "",
    restaurantUid: "",
    restaurantName: "",
    restName: "",
    takenPicture: "",
    foodRequestedType: "Entrée",
    stateNavigation: { 0: "a" },
    foodType: "",
    restOrderWeb: "",
    restWebsite: "",
    isFoundItem: false,
    tempUserId: "",
    userPostId: "",
    toggleFoodType: true,
    restLocation: null,
    managmentExpoToken: "",
    restAddress: "",
    tempRestId: "",
    managmentUid: "uE1OWGdOQRfPna29DnQ9yGUTvIF3",
    place_id: "",
    business_status: "OPERATIONAL", // CLOSED_TEMPORARILY,
    restAxiosData: null,
    isSelectRest: false,
    isLogin: false,
    foodObjectId: "",
    tempFoodName: "",
    isFoundItemChange: false,
  });

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
        projectNameForProxy: "@frezva2/trofii",
        shouldAutoExchangeCode: true,
        useProxy: false,
      }
    );
  const [requestGoogleAuth, responseGoogleAuth, promptAsyncGoogleAuth] =
    Google.useIdTokenAuthRequest(
      {
        androidClientId: "",
        iosClientId: "",
        expoClientId: "",
      },
      {
        projectNameForProxy: "@frezva2/trofii",
        shouldAutoExchangeCode: true,
        useProxy: true,
        selectAccount: true,
      }
    );

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
  }

  const onSearchStateChange = (results) => {
    if (!isEquivalent(data.stateNavigation, results)) {
      if (tempFoodName !== results.query) {
        setFoodName(results.query);
        setTempFoodName(results.query);
        setTimeout(() => {
          setData({
            ...data,
            stateNavigation: results,
            isSelectRest: false,
          });
        }, 10);
      } else {
        setTimeout(() => {
          setFoodName(props?.route?.params?.food_name);
          setData({
            ...data,
            stateNavigation: results,
            isSelectRest: false,
          });
        }, 10);
      }
    }
  };
  useEffect(() => {
    Geocoder.init("AIzaSyC2sLkZAFtMIsOzFqGKDgmxKbSajNfz-7A");

    if (responseGoogleAuth !== null) {
      props.googleLogin(responseGoogleAuth);
    }
    if (responseFacebookAuth !== null) {
      props.facebookLogin(responseFacebookAuth);
    }

    if (data.PrivacyPolicy === "") {
      firebase
        .database()
        .ref("/worestsLists/")
        .once("value", (snap) => {
          if (snap.val() !== null) {
            setTimeout(() => {
              setData({
                ...data,
                PrivacyPolicy: snap.val().PrivacyPolicy,
                TermsConditions: snap.val().TermsConditions,
              });
            }, 3000);
          }
        });
    }

    return () => {};
  }, [responseGoogleAuth, responseFacebookAuth]);
  const useCameraHandler = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser === null || currentUser === undefined) {
      setTimeout(() => {
        setIsLogin(true);
      }, 10);
    } else {
      await askPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        quality: 0.5,
      });
      _handleImagePicked(result);
    }
  };
  const useLibraryHandler = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser === null || currentUser === undefined) {
      setTimeout(() => {
        setIsLogin(true);
      }, 10);
    } else {
      await askPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        quality: 0.5,
      });
      _handleImagePicked(result);
    }
  };
  const login = (type) => {
    if (type === "facebook") {
      setIsLogin(false);
      promptFacebookAuthAsync();
    } else if (type === "google") {
      setIsLogin(false);
      promptAsyncGoogleAuth();
    }
    if (type === "apple") {
      setIsLogin(false);
      props.appleLogin();
    }
  };
  const checkFoodId = () => {
    if (restAddress !== undefined && restAddress !== "") {
      Geocoder.from(restAddress).then((json) => {
        setRestLocation(json.results[0].geometry.location);
        setData({
          ...data,
          isSelectRest: false,
        });
      });
    }
    if (restaurantName !== "" && food_name !== "" && food_name !== undefined) {
      const index = client.initIndex("worests");
      index
        .search(`${restaurantName} ${food_name}`, {
          attributesToRetrieve: attrToRetr,
          hitsPerPage: 1,
          typoTolerance: false,
          filters: `restaurantUid:${restaurantUid}`,
          facetFilters: [`isImageUploaded:${false}`],
        })
        .then((responses) => {
          const str = JSON.stringify(responses.hits);
          let object = JSON.parse(str);
          if (
            object[0] !== undefined &&
            object[0] !== null &&
            object.length !== 0
          ) {
            setFoodObjectId(object[0]?.objectID);
            setData({
              ...data,
              isSelectRest: false,
            });
          } else {
            setFoodObjectId("");
            setData({
              ...data,
              isSelectRest: false,
            });
          }
        });
    } else {
      const index = client.initIndex("worests");
      index
        .search("", {
          attributesToRetrieve: attrToRetr,
          hitsPerPage: 1,
          typoTolerance: false,
          filters: `restaurantUid:${restaurantUid}`,
          facetFilters: [`isImageUploaded:${false}`],
        })
        .then((responses) => {
          const str = JSON.stringify(responses.hits);
          let object = JSON.parse(str);
          if (object !== undefined && object !== null && object.length !== 0) {
            setFoodObjectId(object[0]?.objectID);
            setData({
              ...data,
              isSelectRest: false,
            });
          } else {
            setFoodObjectId("");
            setData({
              ...data,
              isSelectRest: false,
            });
          }
        });
    }
  };
  async function getNewRestInfo(place_id, restaurantName) {
    const newResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,type,opening_hours,formatted_phone_number,formatted_address,geometry,website,business_status&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`
    );
    setTimeout(() => {
      setRestaurantName(restaurantName);
      setPlaceId(place_id);
      setRestAddress(newResponse?.data?.result?.formatted_address);
      setRestAxiosData(newResponse);
      setRestWebsite(newResponse?.data?.result?.website);
      setPhoneNum(newResponse?.data?.result?.formatted_phone_number);
      setBusinessStatus(newResponse?.data?.result?.business_status);
      setData({
        ...data,
        isSelectRest: false,
      });
      setIsLoading(false);
    }, 10);
  }
  const AddNewRest = () => {
    const { currentUser } = firebase.auth();
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    dateID =
      year * 10000000000000 +
      month * 100000000000 +
      day * 1000000000 +
      hrs * 10000000 +
      min * 100000 +
      sec * 1000 +
      milsec;

    if (currentUser !== null && currentUser !== undefined) {
      firebase
        .database()
        .ref(`/users/`)
        .push({
          email: `@${restaurantName
            .toString()
            .replace(/\s/g, "")
            .replace(/-/g, "")}`,
          restName: `${restaurantName}`,
          restAddress: `${restAddress}`,
          restHours: restAxiosData?.data?.result?.opening_hours?.weekday_text
            .toString()
            .replace(/,/g, "\n\n"),
          phoneNum: phoneNum,
          restDesc: "",
          firstname: "",
          lastname: "",
          isUndecided: true,
          image:
            "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FnewRestLogo.jpg?alt=media&token=69cdad07-6e87-4022-bb9f-3024c7b8de4e",
          code: 0,
          isRecommended: false,
          username: "",
          redeemedPoints: 0,
          userTotalRate: 0,
          tokenPass: "",
          restMaxPercentage: 0,
          tempHours: 0,
          yourLocation: "",
          followerNum: 0,
          followingNum: 0,
          followersList: { 0: "_" },
          followingList: { 0: "_" },
          restsList: { 0: "_" },
          points: 0,
          restOrderWeb: "",
          restWebsite: restWebsite.slice(restWebsite.indexOf("://") + 3),
          isRestActive: true,
          aroundRadius: 40234,
          boolToken: true,
          egiftEarned: 0,
          createdAt: createdDate,
        })
        .then((snapshot) => {
          if (snapshot !== null && snapshot !== undefined) {
            firebase
              .database()
              .ref(`/restsList/`)
              .push({
                isRestActive: true,
                isUndecided: true,
                restaurantUid: `${snapshot.key}`,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FnewRestLogo.jpg?alt=media&token=69cdad07-6e87-4022-bb9f-3024c7b8de4e",
                restName: `${restaurantName}`,
                restDesc: "",
                restAddress: `${restAddress}`,
                phoneNum: phoneNum,
                restHours:
                  restAxiosData?.data?.result?.opening_hours?.weekday_text
                    .toString()
                    .replace(/,/g, "\n\n"),
                restMaxPercentage: 0,
                restWebsite: restWebsite.slice(restWebsite.indexOf("://") + 3),
                restOrderWeb: "",
                followerNum: 0,
                followingNum: 0,
                followersList: { 0: "_" },
                followingList: { 0: "_" },
                RestNumFollowers: 0,
                RestApptNum: 0,
                RestDrinkNum: 0,
                RestEntreeNum: 0,
                RestDessertNum: 0,
              })
              .then(() => {
                firebase
                  .database()
                  .ref(`/food/`)
                  .push({
                    _geoloc: {
                      lat: restAxiosData?.data?.result?.geometry?.location?.lat,
                      lng: restAxiosData?.data?.result?.geometry?.location?.lng,
                    },
                    dateId: dateID,
                    createdBy: currentUser.email,
                    totalView: 0,
                    publish: true,
                    isRestActive: true,
                    isUndecided: true,
                    restAddress: restAddress,
                    restWebsite: restWebsite.slice(
                      restWebsite.indexOf("://") + 3
                    ),
                    restDesc: "",
                    restOrderWeb: "",
                    restaurantUid: `${snapshot.key}`,
                    isImageUploaded: false,
                    phoneNum: phoneNum,
                    restName: `${restaurantName}`,
                    tempChecker: {
                      hour: 0,
                      uids: { 0: "_" },
                    },
                    foodLocation: {
                      latitude:
                        restAxiosData?.data?.result?.geometry?.location?.lat,
                      longitude:
                        restAxiosData?.data?.result?.geometry?.location?.lng,
                    },
                    foodInfo: {
                      foodType: "Entrée",
                      price: 0,
                      food_name: food_name,
                      Rate: {
                        totalRate: 0,
                        overallRate: 0,
                        qualityRate: 0,
                        matchingPicRate: 0,
                        priceToPortionRate: 0,
                      },
                      image:
                        "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea",
                      tags: "",
                      Calorie: "N/A",
                    },
                  })
                  .then((snap) => {
                    postPhotoForNewRest(snapshot.key, snap.key);
                  });
              });
          }
        });
    } else {
      setTimeout(() => {
        setIsLogin(true);
      }, 10);
    }
  };
  const motionEvent = () => {
    handleSomeKindOfEvent();
    setTimeout(() => {
      handleSomeKindOfEvent();
    }, 4001);
  };
  const postPhotoForNewRest = (restaurantUid, objectID) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const time = `${month}/${day}/${year} ${hrs}:${min}`;
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    dateID =
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
      .ref(`/restImage/${restaurantUid}/${objectID}`);

    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        const userRef = firebase.database().ref(`/users/${user.uid}`);
        userRef.once("value", (snap) => {
          restImageRef
            .push({
              takenPicture: takenPicture,
              uidUser: currentUser.uid,
              firstname: snap.val().firstname,
              lastname: snap.val().lastname,
              restName: `${restaurantName}`,
              userEmail: snap.val().email,
              userPostId:
                snap?.val()?.userPostId !== undefined
                  ? snap?.val()?.userPostId
                  : "",
              tags: "",
              dateID: dateID,
              submissionTime: time,
              approvedBy: "",
              deniedBy: "",
              isNewItem: true,
              deniedTime: "",
              reason: "",
              approvedTime: "",
              isApproved: false,
              isViewed: false,
              food_name: food_name,
              foodType: "Entrée",
            })
            .then((snapShot) => {
              userImageRef
                .push({
                  takenPicture: takenPicture,
                  restName: `${restaurantName}`,
                  tags: "",
                  restaurantUid: restaurantUid,
                  userPostId:
                    snap?.val()?.userPostId !== undefined
                      ? snap?.val()?.userPostId
                      : "",
                  dateID: dateID,
                  submissionTime: time,
                  approvedBy: "",
                  deniedBy: "",
                  isNewItem: true,
                  deniedTime: "",
                  reason: "",
                  approvedTime: "",
                  isApproved: false,
                  isViewed: false,
                  foodObjectId: objectID,
                  food_name: food_name,
                  foodType: "Entrée",
                })
                .then(() => {
                  Alert.alert(
                    "Congratulations!",
                    "Your image successfully uploaded, please wait 48 hours to approve your image. After we approve your image, you will receive 1 Reward Point.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          sendPushNotification(
                            "New Picture",
                            "A user submitted a new picture for your approval.",
                            "NewPic",
                            takenPicture,
                            user.uid,
                            snapShot.key
                          );
                          setRestaurantName("");
                          setRestaurantUid("");
                          setRestAddress("");
                          setPlaceId("");
                          setFoodName("");
                          setTempFoodName("");
                          setTakenPicture("");
                          motionEvent();
                          setIsLoading(false);
                        },
                        style: "cancel",
                      },
                    ],
                    { cancelable: false }
                  );
                });
            });
        });
      }
    });
  };
  const sendPushNotification = async (
    title,
    body,
    type,
    image,
    uid,
    tempRestId
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
      managmentUid: data.managmentUid,
      restImageRefID: tempRestId,
      isSeen: false,
    };
    firebase
      .database()
      .ref(`/users/${data.managmentUid}`)
      .once("value", (snapshot) => {
        firebase
          .database()
          .ref(`/users/${data.managmentUid}`)
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
        to: data.managmentExpoToken,
        title: title,
        body: body,
        subtitle: body,
        data: {
          type,
          title,
          message: body,
          image,
          uid,
          managmentUid: data.managmentUid,
          restImageRefID: tempRestId,
          dateID: createdDate,
          isSeen: false,
        },
        priority: "high",
        sound: "default",
        channelId: "default",
      }),
    });
  };
  const postNewItemPhoto = () => {
    const { currentUser } = firebase.auth();
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    dateID =
      year * 10000000000000 +
      month * 100000000000 +
      day * 1000000000 +
      hrs * 10000000 +
      min * 100000 +
      sec * 1000 +
      milsec;

    if (currentUser !== null && currentUser !== undefined) {
      firebase
        .database()
        .ref(`/food/`)
        .push({
          _geoloc: {
            lat: restLocation?.lat,
            lng: restLocation?.lng,
          },
          dateId: dateID,
          createdBy: currentUser.email,
          totalView: 0,
          publish: true,
          isRestActive: true,
          isUndecided: true,
          restAddress: restAddress,
          restWebsite: restWebsite.slice(restWebsite.indexOf("://") + 3),
          restDesc: "",
          restOrderWeb: "",
          restaurantUid: restaurantUid,
          isImageUploaded: false,
          phoneNum: phoneNum,
          restName: `${restaurantName}`,
          tempChecker: {
            hour: 0,
            uids: { 0: "_" },
          },
          foodLocation: {
            latitude: restLocation?.lat,
            longitude: restLocation?.lng,
          },
          foodInfo: {
            foodType: "Entrée",
            price: 0,
            food_name: food_name,
            Rate: {
              totalRate: 0,
              overallRate: 0,
              qualityRate: 0,
              matchingPicRate: 0,
              priceToPortionRate: 0,
            },
            image:
              "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea",
            tags: "",
            Calorie: "N/A",
          },
        })
        .then((snap) => {
          postPhotoForNewRest(restaurantUid, snap.key);
        });
    } else {
      setTimeout(() => {
        setIsLogin(true);
      }, 10);
    }
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
    dateID =
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
      .ref(`/restImage/${restaurantUid}/${foodObjectId}`);
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        const userRef = firebase.database().ref(`/users/${user.uid}`);
        userRef.once("value", (snap) => {
          restImageRef
            .push({
              takenPicture: takenPicture,
              uidUser: currentUser.uid,
              firstname: snap.val().firstname,
              lastname: snap.val().lastname,
              restName: restaurantName,
              userEmail: snap.val().email,
              userPostId:
                snap?.val()?.userPostId !== undefined
                  ? snap?.val()?.userPostId
                  : "",
              tags: " ",
              restaurantUid: restaurantUid,
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
              food_name: food_name,
              foodType: "Entrée",
            })
            .then((snapShot) => {
              userImageRef.push({
                takenPicture: takenPicture,
                restName: restaurantName,
                userPostId:
                  snap?.val()?.userPostId !== undefined
                    ? snap?.val()?.userPostId
                    : "",
                tags: " ",
                restaurantUid: restaurantUid,
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
                foodObjectId: foodObjectId,
                food_name: food_name,
                foodType: "Entrée",
              });
              Sharing.isAvailableAsync().then(async (isAvailableAsync) => {
                if (isAvailableAsync) {
                  captureScreen({
                    result: "tmpfile",
                    quality: 0.25,
                    format: "jpg",
                  }).then(async (uri) => {
                    let uploadUrl = await uploadImageShareAsync(uri);
                    Alert.alert(
                      "Congratulations!",
                      "Your image successfully uploaded, please wait 48 hours to approve your image. After we approve your image, you will receive 1 Reward Point.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            sendPushNotification(
                              "New Picture",
                              "A user submitted a new picture for your approval.",
                              "NewPic",
                              takenPicture,
                              user.uid,
                              snapShot.key
                            );
                            setPlaceId("");
                            setFoodName("");
                            setTempFoodName("");
                            setTakenPicture("");
                            setIsLoading(false);
                            Alert.alert(
                              "Share",
                              "Do you want to share this item? ",
                              [
                                {
                                  text: "No",
                                  onPress: () => {},
                                  style: "cancel",
                                },
                                {
                                  text: "Yes",
                                  onPress: async () => {
                                    const result = await Share.share({
                                      url: uri,
                                      message: `I recommend you ${food_name} from ${restaurantName}. Find more about this item with TroFii App: \nhttps://www.TroFii.Net \n\n${restWebsite} \n\n${uploadUrl}`,
                                    });
                                    motionEvent();
                                    setIsLoading(false);
                                  },
                                },
                              ]
                            );
                          },
                          style: "cancel",
                        },
                      ],
                      { cancelable: false }
                    );
                  });
                }
              });
            });
        });
      }
    });
  };
  const whichPostFunc = () => {
    const { currentUser } = firebase.auth();
    if (currentUser === null || currentUser === undefined) {
      setTimeout(() => {
        setIsLogin(true);
      }, 100);
    } else {
      Alert.alert(
        "Rate Submission Alert",
        "Are you sure about your submission? ",
        [
          { text: "No", onPress: () => {}, style: "cancel" },
          {
            text: "Yes",
            onPress: () => {
              setTimeout(() => {
                setIsLoading(true);
                if (place_id !== "") {
                  AddNewRest();
                } else {
                  if (foodObjectId !== "") {
                    postPhoto();
                  } else {
                    postNewItemPhoto();
                  }
                }
              }, 101);
            },
          },
        ]
      );
    }
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
      checkFoodId();
      if (!pickerResult.cancelled) {
        setIsLoading(true);
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        setTakenPicture(uploadUrl);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      alert("Upload failed, sorry :(");
    } finally {
      setIsLoading(false);
    }
  };

  function handleSomeKindOfEvent() {
    explosion && explosion.start();
  }

  const canPostPictureScreen = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      props.navigation.navigate("PostPictureScreen");
    } else {
      setIsLogin(true);
    }
  };
  const canPostHomemadePictureScreen = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      props.navigation.navigate("PostHomemadePictureScreen");
    } else {
      setIsLogin(true);
    }
  };
  return (
    <View>
      <StatusBar barStyle={"light-content"} />
      <Image
        style={{
          resizeMode: "stretch",
          backgroundColor: "#ffffff",
          width,
          height,
          zIndex: 1,
        }}
        source={require("../assets/blur2.jpg")}
        fadeDuration={0}
      />
      <View
        style={{
          marginTop: -height * 0.35,
          zIndex: 3,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
        }}>
        <View>
          <TouchableOpacity
            onPress={() => {
              canPostHomemadePictureScreen();
            }}>
            <Image
              style={{
                width: width * 0.3,
                height: width * 0.3,
                elevation: 5,
                borderRadius: 10,
                marginTop: 0,
              }}
              source={require("../assets/images/homeItem.png")}
              fadeDuration={0}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              canPostPictureScreen();
            }}>
            <Image
              style={{
                width: width * 0.3,
                height: width * 0.3,
                elevation: 5,
                borderRadius: 10,
                marginTop: 0,
              }}
              source={require("../assets/images/restItem.png")}
              fadeDuration={0}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        isVisible={false}
        animationInTiming={10}
        animationOutTiming={10}
        propagateSwipe
        onBackdropPress={() => {
          setData({ ...data, isLogin: false });
        }}
        backdropColor="black"
        useNativeDriver={true}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: "hidden",
          marginTop: height * 0.45,
          backgroundColor: "transparent",
        }}>
        <View />
      </Modal>
      <Modal
        isVisible={isLogin}
        animationInTiming={550}
        animationOutTiming={550}
        propagateSwipe
        onModalHide={() => {
          setIsLogin(false);
        }}
        onModalShow={() => {
          setIsLogin(true);
        }}
        backdropColor="black"
        useNativeDriver={true}
        backdropOpacity={0.3}
        hideModalContentWhileAnimating
        onRequestClose={() => {
          setIsLogin(false);
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
                setIsLogin(false);
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
                  style={{
                    width: width * 0.75,
                    marginTop: 0,
                    marginLeft: 15,
                  }}>
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
                  style={{
                    width: width * 0.75,
                    marginTop: 0,
                    marginLeft: 15,
                  }}>
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
              setIsLogin(false);
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
              setIsLogin(false);
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
                  setIsLogin(false);
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
                setIsLogin(false);
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
                  setIsLogin(false);
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
                setIsLogin(false);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  CurrentImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  linearGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.75,
  },
  color_textPrivateBold: {
    color: "#C90611",
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
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
  color_textPrivate: {
    color: "grey",
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
  },
  action: {
    flexDirection: "row",
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
    marginLeft: -5,
  },
  buttonTextBlack: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#000",
    backgroundColor: "transparent",
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
  searchDescStyle: {
    textAlign: "left",
    fontSize: 14,
    marginLeft: 15,
    width: width * 0.75,
    borderRadius: 40,
    fontFamily: "MontserratReg",
    color: "rgba(0, 0, 0, 0.39)",
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
  buttonText4: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  buttonText2: {
    fontSize: 13,
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
    color: "#C90611",
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
  buttonText: {
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 40,
    marginBottom: 30,
    width: width * 0.75,
  },
  button3: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "MontserratSemiBold",
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
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  CurrentImage2: {
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
    lineHeight: 25,
    textAlign: "center",
  },
  titleStyle8: {
    fontFamily: "Montserrat",
    fontSize: 10,
    marginLeft: 5,
    marginBottom: 0,
    width: width * 0.6,
    marginTop: 0,
  },
  titleStyle6: {
    fontFamily: "Montserrat",
    fontSize: 16,
    marginLeft: 0,
    marginBottom: 0,
    width: width * 0.7,
    lineHeight: 20,
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

export default connect(null, actions)(OptionPostScreen);
