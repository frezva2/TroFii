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
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Keyboard,
  Input,
  Alert,
  TextInput,
  Share,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  DefaultTheme,
  List,
  RadioButton,
  useTheme,
} from "react-native-paper";
import * as actions from "../actions";
import { connect } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Camera } from "expo-camera";
import update from "immutability-helper";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Permissions from "expo-permissions";
import axios from "axios";
import uuid from "uuid-v4";
import Modal from "react-native-modal";
import algoliasearch from "algoliasearch";
import Feather from "react-native-vector-icons/Feather";
import FindRestaurantScreen from "./FindRestaurantScreen";
import Geocoder from "react-native-geocoding";
import ConfettiCannon from "react-native-confetti-cannon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckBox } from "react-native-elements";
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
  // connectRefinementList,
} from "react-instantsearch-native";
import * as Sharing from "expo-sharing";
import { captureRef, captureScreen } from "react-native-view-shot";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

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

const client = algoliasearch("K9M4MC44R0", "dfc4ea1c057d492e96b0967f050519c4", {
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

const PostPictureScreen = (props) => {
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
  const [foodType, setFoodType] = React.useState("Entree");
  const [isFoodTypeChange, setIsFoodTypeChange] = React.useState(false);

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

  const onSearchStateChange = (results) => {
    // console.log(results)
    if (!isEquivalent(data.stateNavigation, results)) {
      if (tempFoodName !== results.query) {
        setFoodName(results.query);
        setTempFoodName(results.query);
        setTimeout(() => {
          setData({
            ...data,
            stateNavigation: results,
            // tempFoodName: results.query,
            // food_name: results.query,
            isSelectRest: false,
          });
        }, 10);
      } else {
        setTimeout(() => {
          setFoodName(props?.route?.params?.food_name);
          setData({
            ...data,
            stateNavigation: results,
            // tempFoodName: results.query,
            // food_name: props?.route?.params?.food_name,
            isSelectRest: false,
          });
        }, 10);
      }
      //   setData({ ...data, food_name: searchState.foodInfo.food_name });
      //   setData({ ...data, noResults: searchState.noResults, initialState: true });
    }
  };
  useEffect(() => {
    Geocoder.init("AIzaSyC2sLkZAFtMIsOzFqGKDgmxKbSajNfz-7A");
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
    if (props?.route?.params?.food_name) {
      Keyboard.dismiss();
      setFoodName(props?.route?.params?.food_name);
      setData({
        ...data,
        // food_name: props?.route?.params?.food_name,
        isSelectRest: false,
      });
    }
    if (
      props?.route?.params?.place_id !== "" &&
      props?.route?.params?.place_id !== undefined
    ) {
      setTimeout(async () => {
        try {
          setIsLoading(true);
          await getNewRestInfo(
            props?.route?.params?.place_id,
            props?.route?.params?.restaurantName
          );
          checkFoodId();
          controller = null;
        } catch (e) {
          // Handle fetch error
        }
      }, 10);
    } else {
      if (
        props?.route?.params?.restaurantName !== "" &&
        props?.route?.params?.restaurantName !== undefined
      ) {
        setIsLoading(true);
      }
      Keyboard.dismiss();
      setTimeout(() => {
        setRestaurantName(props?.route?.params?.restaurantName);
        setRestaurantUid(props?.route?.params?.restaurantUid);
        setRestAddress(props?.route?.params?.restAddress);
        setPlaceId("");
        setData({
          ...data,
          // restaurantName: props?.route?.params?.restaurantName,
          // restaurantUid: props?.route?.params?.restaurantUid,
          // restAddress: props?.route?.params?.restAddress,
          // food_name: props?.route?.params?.food_name,
          // place_id: '',
          isSelectRest: false,
        });
        setIsLoading(false);
      }, 100);
      if (restaurantUid !== "") {
        checkFoodId();
      }
    }
    return () => {
      // console.log('unmounting...');
    };
  }, [props?.route?.params]);
  const useCameraHandler = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser === null || currentUser === undefined) {
      setTimeout(() => {
        setData({
          ...data,
          isLogin: true,
        });
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
        setData({
          ...data,
          isLogin: true,
        });
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
      setData({ ...data, isLogin: false });
      props.facebookLogin();
    } else if (type === "google") {
      setData({ ...data, isLogin: false });
      props.googleLogin();
    }
    if (type === "apple") {
      setData({ ...data, isLogin: false });
      props.appleLogin();
    }
  };
  const checkFoodId = () => {
    if (restAddress !== undefined && restAddress !== "") {
      Geocoder.from(restAddress).then((json) => {
        // setTimeout(() => {
        setRestLocation(json.results[0].geometry.location);
        setData({
          ...data,
          //   restLocation: json.results[0].geometry.location,
          //   food_name: props?.route?.params?.food_name,
          isSelectRest: false,
        });
        //   }, 10);
      });
    }
    // let query = '';
    // console.log('checkFoodId 2: ', data );
    if (restaurantName !== "" && food_name !== "" && food_name !== undefined) {
      // query = `${props?.route?.params?.restaurantName} ${data.food_name}`;
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
          //   console.log('checkFoodId 1: ',data.objectID);
          if (
            object[0] !== undefined &&
            object[0] !== null &&
            object.length !== 0
          ) {
            // setTimeout(() => {
            setFoodObjectId(object[0]?.objectID);
            setData({
              ...data,
              isSelectRest: false,
            });
            // }, 10);
          } else {
            // console.log('null 1');
            // setTimeout(() => {
            setFoodObjectId("");
            setData({
              ...data,
              // foodObjectId: '',
              // food_name: props?.route?.params?.food_name,
              isSelectRest: false,
            });
            // }, 10);
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
            //   console.log('checkFoodId 2: ',object[0]?.objectID);
            //   setTimeout(() => {
            setFoodObjectId(object[0]?.objectID);
            setData({
              ...data,
              //   foodObjectId: object[0]?.objectID,
              // food_name: props?.route?.params?.food_name,
              isSelectRest: false,
            });
            //   }, 10);
          } else {
            //   console.log('null 2');
            //   setTimeout(() => {
            setFoodObjectId("");
            setData({
              ...data,
              //   foodObjectId: '',
              // food_name: props?.route?.params?.food_name,
              isSelectRest: false,
            });
            //   }, 10);
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
        // restAxiosData: newResponse,
        // restaurantName: restaurantName,
        // restAddress: newResponse?.data?.result?.formatted_address,
        // restWebsite: newResponse?.data?.result?.website,
        // phoneNum: newResponse?.data?.result?.formatted_phone_number,
        // business_status: newResponse?.data?.result?.business_status,
        // food_name: props?.route?.params?.food_name,
        isSelectRest: false,
        // place_id,
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
                // expoToken: this.state.expoToken,
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
                    isNonRestaurantUpload: false,
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
                      foodType: foodType,
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
        setData({
          ...data,
          isLogin: true,
        });
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
              foodType: foodType,
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
                  foodType: foodType,
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
          isNonRestaurantUpload: false,
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
            foodType: foodType,
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
        setData({
          ...data,
          isLogin: true,
        });
      }, 10);
    }
  };
  const postPhoto = () => {
    //   console.log('postPhoto',data.foodObjectId);
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
    // console.log(restaurantUid, foodObjectId)
    //   restImageRef.once("value").then((snapshot) => {
    //     if(snapshot.val() !== null) {
    //       snapshot.forEach((data) => {
    // if (data.val().uidUser !== undefined && data.val().uidUser.toString() !== currentUser.uid.toString()) {
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
              foodType: foodType,
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
                foodType: foodType,
              });
              // shareNow();
              // setData({
              //   ...data,
              //     isSubmitImage: false,
              //     tempRestId: snapShot.key,
              //     restaurantName: '',
              //     food_name: '',
              //     restaurantUid: '',
              //     place_id: '',
              // })
              Sharing.isAvailableAsync().then(async (isAvailableAsync) => {
                if (isAvailableAsync) {
                  // await captureRef(_flatListItem, {
                  //     result: 'tmpfile',
                  //     quality: 0.25,
                  //     format: 'jpg',
                  // })
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
                            // setRestaurantName('');
                            // setRestaurantUid('');
                            // setRestAddress('');
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
    // } else {
    //     Alert.alert('Too Many Submissions Attempted', 'You allow to submit an image only one time for each menu item.', [{ text: 'OK',
    //         onPress: () => {},
    //         style: 'cancel' }], { cancelable: false });
    //   }
    //   })
    // }
    //   });
  };
  const whichPostFunc = () => {
    const { currentUser } = firebase.auth();
    if (currentUser === null || currentUser === undefined) {
      setTimeout(() => {
        setData({
          ...data,
          isLogin: true,
        });
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
    // const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    // const dateID = ((year * 10000000000000) + (month * 100000000000) +
    // (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
    const { currentUser } = firebase.auth();
    try {
      checkFoodId();
      if (!pickerResult.cancelled) {
        setIsLoading(true);
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        //   if (data.isSubmitImage === true) {
        // const newItem = data.finalResults;
        // const imageUrl = update(data.finalResults[data.activeSlide], { foodInfo: { image: { $set: uploadUrl } } });
        // newItem[data.activeSlide] = imageUrl;
        // setData({
        //   ...data,
        //     takenPicture: uploadUrl,
        //     finalResults: newItem,
        //     userSubmitImage: false
        // })
        // searchState = Object.assign({ ...searchState, takenPicture: uploadUrl });
        //   } else {

        // console.log('uploadUrl: ', uploadUrl)
        setTakenPicture(uploadUrl);
        // setTimeout(() => {
        //     setData({
        //       ...data,
        //         takenPicture: uploadUrl
        //     })
        // }, 1000);
        // .then(() =>{
        //     console.log('takenPicture: ',data.takenPicture)
        // })
        //   }
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      alert("Upload failed, sorry :(");
    } finally {
      setIsLoading(false);
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
  function handleSomeKindOfEvent() {
    explosion && explosion.start();
  }

  return (
    <View>
      <ScrollView keyboardShouldPersistTaps="always" style={{ marginTop: 25 }}>
        <View
          style={{
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 35,
          }}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <InstantSearch
              searchClient={client}
              indexName="worests"
              refresh
              stalledSearchDelay={0}
              // searchState={searchState}
              onSearchStateChange={(results) => onSearchStateChange(results)}>
              <Configure
                filters={`restaurantUid:${restaurantUid}`}
                facetFilters={["isImageUploaded:false"]}
                attributesToRetrieve={attrToRetr}
                hitsPerPage={25}
                typoTolerance={"strict"}
                // aroundLatLngViaIP
                // aroundLatLng={this.state.arndLatLng}
                // aroundRadius={this.state.aroundRadius}
              />
              <View style={{ marginTop: -25, marginBottom: 10 }}>
                <Image
                  style={{ width: 100, height: 100, marginTop: 35 }}
                  source={require("../assets/icons/pic_menu.png")}
                  fadeDuration={100}
                />
              </View>
              {/* <View style={styles.action}>
                  <Icon 
                      name="fast-food"
                      color={colors.text}
                      size={25}
                  />
                  <TextInput
                      placeholder="Item Name"
                      keyboardType="default"
                      autoCompleteType="name"
                      autoFocus={false}
                      value={data.email}
                      textContentType={"name"} 
                      onEndEditing={() =>{
                          checkFoodId();
                      }}
                      placeholderTextColor="#666666"
                      // style={[styles.textInput, {
                      //     color: colors.text
                      // }]}
                      autoCapitalize="none"
                      style={{ marginVertical: 10, fontSize: 17, marginLeft: 15, width: width * 0.70, marginTop: 0 }}
                      onChangeText={(val) => {
                          setData({
                              ...data,
                                  food_name: val
                          });
                      }}
                      // onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
                  />
              </View>  */}
              {/* <View>
                  <Title style={{ width: width * 0.80, color: 'black', fontFamily: 'MontserratBold', fontSize: 16, marginTop: 0 }}>{props?.route?.params?.restaurantName}</Title>
              </View> */}
              <TouchableOpacity
                onPress={() => {
                  setData({ ...data, isSelectRest: true });
                }}
                style={styles.action}>
                <Icon
                  name="ios-restaurant"
                  color={colors.text}
                  size={25}
                  style={{ marginTop: 10 }}
                />
                <TextInput
                  placeholder="Restaurant Name"
                  keyboardType="default"
                  autoCompleteType="name"
                  editable={false}
                  multiline={true}
                  value={restaurantName}
                  textContentType={"name"}
                  // onEndEditing={() =>{
                  //     checkFoodId();
                  // }}
                  placeholderTextColor="#666666"
                  // style={[styles.textInput, {
                  //     color: colors.text
                  // }]}
                  autoCapitalize="none"
                  style={{
                    fontFamily: "MontserratBold",
                    marginVertical: -5,
                    fontSize: 16,
                    width: width * 0.75,
                    marginTop: Platform.OS === "ios" ? 10 : 0,
                    color: "black",
                    marginLeft: 5,
                  }}
                  // onChangeText={(val) => {
                  //     setData({
                  //         ...data,
                  //             food_name: val
                  //     });
                  // }}
                  // onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: "flex-start",
                  flexDirection: "row",
                  marginTop: 15,
                  marginBottom: 5,
                  width: width * 0.85,
                }}>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    marginTop: -10,
                    marginLeft: 0,
                  }}
                  source={require("../assets/icons/coffee.png")}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: "MontserratBold",
                      fontSize: 16,
                      color: colors.text,
                      marginTop: -3,
                      marginLeft: 5,
                    }}>
                    Item Type:{" "}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsFoodTypeChange(true);
                  }}>
                  <Text
                    style={{
                      fontFamily: "MontserratSemiBold",
                      fontSize: 16,
                      color: "#EE5B64",
                      marginTop: -2,
                      marginLeft: 1,
                    }}>
                    {foodType}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.action}>
                <Icon
                  name="fast-food"
                  color={colors.text}
                  size={25}
                  style={{ marginTop: 10 }}
                />
                <TextInput
                  placeholder="Item Name"
                  keyboardType="default"
                  autoCompleteType="name"
                  editable={false}
                  value={food_name}
                  multiline={true}
                  textContentType={"name"}
                  // onEndEditing={() =>{
                  //     checkFoodId();
                  // }}
                  placeholderTextColor="#666666"
                  // style={[styles.textInput, {
                  //     color: colors.text
                  // }]}
                  autoCapitalize="none"
                  style={{
                    fontFamily: "MontserratBold",
                    marginVertical: 5,
                    fontSize: 16,
                    marginLeft: 15,
                    width: width * 0.75,
                    marginTop: 10,
                    color: "black",
                    marginLeft: 5,
                  }}
                  // onChangeText={(val) => {
                  //     setData({
                  //         ...data,
                  //             food_name: val
                  //     });
                  // }}
                  // onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
                />
              </View>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                  marginBottom: 5,
                  width,
                }}>
                <SearchBox />
              </View>
              <View style={{ height: 80, marginBottom: 5 }}>
                <Hits navigation={props.navigation} />
              </View>
              {/* <View>
                  <Title style={{ width: width * 0.80, color: 'black', fontFamily: 'MontserratBold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>{data.food_name}</Title>
              </View> */}
            </InstantSearch>
          </View>
          {takenPicture === "" ? (
            <View
              style={{
                height: width * 0.41,
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-evenly",
                marginTop: 10,
              }}>
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
            <View
              style={{
                height: width * 0.41,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-evenly",
                marginTop: 10,
              }}>
              <View style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                <TouchableOpacity onPress={() => useCameraHandler()}>
                  <Image
                    style={{
                      marginRight: 0,
                      width: 80,
                      height: 80,
                      marginTop: 0,
                    }}
                    source={require("../assets/icons/photo.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              </View>
              <Image
                style={styles.CurrentImage}
                source={{ uri: takenPicture }}
              />
              <View style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                <TouchableOpacity onPress={() => useLibraryHandler()}>
                  <Image
                    style={{
                      marginLeft: 0,
                      width: 80,
                      height: 80,
                      marginTop: 0,
                    }}
                    source={require("../assets/icons/image.png")}
                    fadeDuration={100}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              setData({ ...data, isSelectRest: true });
            }}
            style={{ marginTop: 25 }}>
            <View
              style={{
                marginTop: -20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40,
              }}>
              <LinearGradient
                colors={["#fb8389", "#f70814", "#C90611"]}
                style={styles.linearGradient}>
                <Text style={styles.buttonText2}>Find your Restaurant</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          {/* <View style={{ flex: 1, marginTop: -25 }}>
              <FindRestaurantScreen />
          </View> */}
          <TouchableOpacity
            onPress={() => {
              whichPostFunc();
            }}
            disabled={
              !(
                food_name !== "" &&
                restaurantName !== "" &&
                takenPicture !== "" &&
                restaurantName !== undefined
              )
                ? true
                : false
            }>
            <View
              style={{
                marginTop: -20,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 100,
              }}>
              <LinearGradient
                colors={
                  !(
                    food_name !== "" &&
                    restaurantName !== "" &&
                    takenPicture !== "" &&
                    restaurantName !== undefined
                  )
                    ? ["#cccccc", "#cccccc", "#cccccc"]
                    : ["#ff4d4d", "#e60000", "#990000"]
                }
                style={styles.linearGradient}>
                <Text style={styles.buttonText}>Post</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          {/* <View style={{ marginTop: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => { 
                  }} >
              <Title style={{ color: 'black', fontSize: 16, fontFamily: 'Montserrat' }}>Cancel</Title>
              </TouchableOpacity>
          </View> */}
        </View>
        <Modal
          isVisible={isLoading}
          animationInTiming={0}
          animationOutTiming={0}
          propagateSwipe
          animationIn={"fadeIn"}
          animationOut={"fadeOut"}
          // onModalHide={() => { setData({ ...data, isSelectRest: false }); }}
          // onModalShow={() => { setData({ ...data, isSelectRest: true }); }}
          // onBackdropPress={() => { setData({ ...data, isSelectRest: false }); }}
          backdropColor="white"
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
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator
              animating={isLoading}
              size="large"
              color="#C90611"
            />
          </View>
        </Modal>
        <Modal
          isVisible={data.isSelectRest}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          onModalHide={() => {
            setData({ ...data, isSelectRest: false });
          }}
          onModalShow={() => {
            setData({ ...data, isSelectRest: true });
          }}
          onBackdropPress={() => {
            setData({ ...data, isSelectRest: false });
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setData({ ...data, isSelectRest: false });
          }}
          style={{
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
            overflow: "hidden",
            backgroundColor: "transparent",
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 5,
            marginTop: 50,
          }}>
          <View style={{ flex: 1, marginTop: 0 }}>
            <View
              style={{
                height: 75,
                backgroundColor: "white",
                flexDirection: "row",
              }}>
              <TouchableOpacity
                onPress={() => {
                  setData({ ...data, isSelectRest: false });
                }}
                style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}>
                <Feather name="x" color="gray" size={30} />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -15,
                  marginLeft: -40,
                }}>
                <Text
                  style={{
                    color: "#C90611",
                    fontSize: 30,
                    textAlign: "center",
                    fontFamily: "BerkshireSwash",
                  }}>
                  TroFii
                </Text>
              </View>
            </View>
            <FindRestaurantScreen props={props} isEarnRewards={false} />
          </View>
        </Modal>
        <Modal
          isVisible={isFoodTypeChange}
          animationInTiming={550}
          animationOutTiming={550}
          propagateSwipe
          swipeDirectio={"up"}
          onModalHide={() => {
            setIsFoodTypeChange(false);
          }}
          onModalShow={() => {
            setIsFoodTypeChange(true);
          }}
          onBackdropPress={() => {
            // setData({ ...data, isSortByChange: , sortBy: data.oldSortBy });
            setIsFoodTypeChange(false);
          }}
          onSwipeComplete={() => {
            setIsFoodTypeChange(false);
          }}
          backdropColor="black"
          useNativeDriver={true}
          backdropOpacity={0.3}
          hideModalContentWhileAnimating
          onRequestClose={() => {
            setIsFoodTypeChange(false);
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
          }}>
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
            }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: -15,
              }}>
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: "#EE5B64",
                }}>
                _____
              </Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: 25 }}>
              <Text
                style={{
                  fontFamily: "MontserratBold",
                  fontSize: 24,
                  color: colors.text,
                }}>
                Item Type
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginTop: 15,
              }}>
              <CheckBox
                // center
                onPress={() => {
                  setFoodType("Entree");
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Entree"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={foodType === "Entree"}
              />
              <CheckBox
                // center
                title="Drink"
                onPress={() => {
                  setFoodType("Drink");
                }}
                containerStyle={{ width: width * 0.45 }}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={foodType === "Drink"}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginTop: 15,
              }}>
              <CheckBox
                // center
                onPress={() => {
                  setFoodType("Appetizer");
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Appetizer"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={foodType === "Appetizer"}
              />
              <CheckBox
                // center
                onPress={() => {
                  setFoodType("Dessert");
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Dessert"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={foodType === "Dessert"}
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}>
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  setIsFoodTypeChange(false);
                }}>
                {/* <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}> */}
                <LinearGradient
                  colors={["#fb8389", "#f70814", "#C90611"]}
                  style={styles.linearGradient3}>
                  <Text style={styles.buttonText5}>Done</Text>
                </LinearGradient>
                {/* </View> */}
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
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
                    style={{
                      width: width * 0.75,
                      marginTop: 0,
                      marginLeft: 15,
                    }}>
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
                  <View
                    style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
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
                  <View
                    style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
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
                  <Text style={styles.buttonText4}>Sign Up</Text>
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
                  <Text style={styles.buttonText3}>Sign In</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            <View style={styles.button3}>
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
            <View style={styles.button3}>
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
              <View style={styles.button3}>
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
                }}>
                <Text
                  style={[
                    styles.color_textPrivateBold,
                    { fontWeight: "bold" },
                  ]}>
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
                  style={[
                    styles.color_textPrivateBold,
                    { fontWeight: "bold" },
                  ]}>
                  {" "}
                  Terms And Conditions
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
        <ConfettiCannon
          count={200}
          explosionSpeed={2000}
          fallSpeed={1500}
          fadeOut={true}
          origin={{ x: width / 2, y: -200 }}
          autoStart={false}
          ref={(ref) => (explosion = ref)}
        />
      </ScrollView>
    </View>
  );
};

const Hits = connectInfiniteHits(
  ({ hits, hasMore, refine, colors, navigation }) => {
    let _flatList = useRef(null);
    const onEndReached = function () {
      if (hasMore) {
        refine();
      }
    };
    const emptryComponent = () => {
      return (
        <View style={{ backgroundColor: "white", width, height: 50 }}>
          <TouchableOpacity
            onPress={() => {
              // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
              // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
              navigation?.navigate("PostPictureScreen", {
                food_name: newSearchState.food_name,
              });
              //   refine(item.foodInfo.food_name)
              // navigation.dispatch({
              //   ...CommonActions.setParams({ restaurantName: item.restName })
              // });
            }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                marginLeft: 20,
                marginBottom: 5,
                marginTop: 5,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  alignItems: "flex-start",
                  width: width * 0.6,
                  justifyContent: "flex-start",
                }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-start",
                    width: width * 0.6,
                    justifyContent: "flex-start",
                    marginLeft: 10,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: "Montserrat",
                      fontSize: 15,
                      marginRight: 30,
                      marginLeft: 5,
                    }}>
                    {newSearchState.food_name}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };
    return (
      <View style={{ flex: 1, height: 65 }}>
        <FlatList
          data={hits}
          extraData={hits}
          onEndReached={onEndReached}
          ItemSeparatorComponent={ItemSeperator}
          keyboardShouldPersistTaps={"handled"}
          ListEmptyComponent={emptryComponent()}
          initialNumToRender={11}
          onEndReachedThreshold={3}
          keyExtractor={(item, index) => item.objectID}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{ marginBottom: hits.length === index + 1 ? 200 : 0 }}>
                {/* <View style={{ backgroundColor: 'black', height: index === 0 ? 1 : 0 }} /> */}
                <TouchableHighlight
                  onPress={() => {
                    // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
                    // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                    navigation?.navigate("PostPictureScreen", {
                      food_name: item.foodInfo.food_name,
                    });
                    //   refine(item.foodInfo.food_name)
                    // navigation.dispatch({
                    //   ...CommonActions.setParams({ restaurantName: item.restName })
                    // });
                  }}>
                  <View style={{ backgroundColor: "white", width }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        marginLeft: 20,
                        marginBottom: 5,
                        marginTop: 5,
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          flex: 1,
                          alignItems: "flex-start",
                          width: width * 0.6,
                          justifyContent: "flex-start",
                        }}>
                        <View
                          style={{
                            flex: 1,
                            alignItems: "flex-start",
                            width: width * 0.6,
                            justifyContent: "flex-start",
                            marginLeft: 10,
                            marginRight: 5,
                          }}>
                          <Text
                            style={{
                              fontFamily: "Montserrat",
                              fontSize: 12,
                              marginRight: 30,
                              marginLeft: width * 0.04,
                            }}>
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
  }
);
const ItemSeperator = () => (
  <View
    style={{
      height: 1,
      backgroundColor: "black",
      width: width * 0.84,
      marginLeft: width * 0.08,
    }}
  />
);

const Highlight = connectHighlight(({ highlight, attribute, hit }) => {
  const parsedHit = highlight({
    attribute,
    hit,
    highlightProperty: "_highlightResult",
  });
  //   console.log('parsedHit: ',parsedHit)
  const highlightedHit = parsedHit.map((part, idx) => {
    if (part.isHighlighted)
      return (
        <Text key={idx} style={{ backgroundColor: "black" }}>
          {part.value}
        </Text>
      );
    return part.value;
  });
  return <Text>{highlightedHit}</Text>;
});
const SearchBox = connectSearchBox(
  ({ onFocus, onBlur, refine, currentRefinement }) => {
    // if (Searched_Word !== '' && Searched_Word !== searchingWord) {
    // refine(searchState.nameRest)
    // }
    return (
      <View>
        <Searchbar
          placeholder={"Search an item ..."}
          // onIconPress={() => { handleSearch(searchQuery); }}
          onChangeText={(text) => {
            // refine(event.currentTarget.value)
            refine(text);
            //   preLoad = false;
            //   searchWord = text;
            newSearchState = Object.assign({ food_name: text });
          }}
          // value={searchQuery}
          value={currentRefinement}
          // onFocus={onFocus}
          // onBlur={onBlur}
          // defaultValue={data.searchQuery}
          maxLength={100}
          returnKeyType={"done"}
          keyboardType={"default"}
          selectionColor="#EE5B64"
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 15,
            height: 45,
            marginTop: Platform.OS === " ios" ? -10 : 0,
            width: width * 0.85,
          }}
          inputStyle={{ fontFamily: "Montserrat", fontSize: 16 }}
        />
      </View>
    );
  }
);
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
  buttonText5: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
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
  linearGradient3: {
    height: 50,
    width: width / 4,
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
});

export default connect(null, actions)(PostPictureScreen);
