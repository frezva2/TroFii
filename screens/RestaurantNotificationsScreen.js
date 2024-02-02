import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as Location from "expo-location";
import Tags from "react-native-tags";
import axios from "axios";
import algoliasearch from "algoliasearch";
import { connect } from "react-redux";
import {
  Card,
  Title,
  Paragraph,
  DefaultTheme,
  useTheme,
  Button,
} from "react-native-paper";
import * as actions from "../actions";
import Modal from "react-native-modal";
import openMap from "react-native-open-maps";
import { ScrollView } from "react-native-gesture-handler";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();
// const newImage = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenuItem.png?alt=media&token=afea0680-37f2-4ce6-b429-8838796b747d';
const oldImage =
  "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d";

const createdDate = year * 10000 + month * 100 + day;

const restAttrToRetr = [
  "restaurantUid",
  "restName",
  "restAddress",
  "restWebsite",
  "isRestActive",
  "image",
  "RestNumFollowers",
  "restHours",
  "objectID",
  "Notifications",
  "restsList",
  "RestEntreeNum",
  "RestDrinkNum",
  "RestDessertNum",
  "RestApptNum",
  "restMaxPercentage",
  "phoneNum",
  "restDesc",
  "restOrderWeb",
];

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

const client = algoliasearch("", "", {
  timeouts: {
    connect: 1,
    read: 2, // The value of the former `timeout` parameter
    write: 30,
  },
});

const avatorTheme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#EE5B64",
    accent: "#EE5B64",
  },
};

const foodImage = require("../assets/images/2.png");
const foodImageUri = Image.resolveAssetSource(foodImage).uri;

const foodImage0 = require("../assets/images/0.png");
const foodImage0Uri = Image.resolveAssetSource(foodImage0).uri;

const foodImage1 = require("../assets/images/1.png");
const foodImage1Uri = Image.resolveAssetSource(foodImage1).uri;

const RestaurantNotificationsScreen = (props) => {
  useEffect(() => {
    let timerId = setTimeout(async () => {
      try {
        await isOpen(
          props.route.params.restName,
          props.route.params.restaurantUid
        );
        controller = null;
      } catch (e) {
        // Handle fetch error
      }
    }, 10);
    return () => {};
  }, [props.route.params]);

  const [newData, setData] = React.useState({
    restAxiosData: null,
    isLogin: false,
    email: "",
    farAway: "",
    password: "",
    errorMessage: "",
    cardIcon: "heart",
    isLiked: false,
    cardRestNumFollowers: 0,
    check_textInputChange: false,
    secureTextEntry: true,
    isChangeLocation: false,
    isEnterLocation: false,
    isValidEmail: false,
    isReqResetPass: false,
    bonusEmails: [],
    points: 0,
    tempHours: 0,
    firstname: "",
    lastname: "",
    restName: "",
    followerNum: 0,
    aroundRadius: 16094,
    code: 0,
    userTotalRate: 0,
    userHour: 0,
    userDateNum: 0,
    egiftEarned: 0,
    Drink: 0,
    restAddress: "",
    foodMenu: [],
    finalResults: [],
    restDesc: "",
    restMaxPercentage: 0,
    restHours: "",
    isRecommended: false,
    redeemedPoints: 0,
    iseGiftRequested: false,
    Appetizer: 0,
    Entrée: 0,
    phoneNum: "",
    Dessert: 0,
    isRestActive: false,
    boolToken: true,
    foodImage: foodImageUri,
    image:
      "https://cdn0.iconfinder.com/data/icons/education-2-27/32/user_staff_person_man_profile_boss_circle-512.png",
    username: "",
    tokenPass: "",
    error: "",
    yourLocation: "Chicago, IL",
    restWebsite: "",
    restOrderWeb: "",
    RestNumFollowers: 0,
    RestApptNum: 0,
    RestDrinkNum: 0,
    RestEntreeNum: 0,
    RestDessertNum: 0,
    eGiftChoiceDate: 202012,
    isPasswordSecure: true,
    Notifications: {
      tempBadgeNum: 0,
      notificationsList: { 0: "_" },
    },
    egiftChoice: "grub",
    currentLocation: {
      latitude: 41.937705,
      longitude: -87.657607,
      latitudeDelta: 0.20546,
      longitudeDelta: 0.17854,
    },
  });

  const { colors } = useTheme();

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
    }

    return array;
  };
  async function isOpen(restName, restaurantUid) {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${restName}&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU`
    );
    const newResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${response?.data?.results[0]?.place_id}&fields=name,geometry,rating,type,opening_hours,formatted_phone_number&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`
    );
    let strFarAway;
    // return(item.restName);
    const { currentUser } = firebase.auth();
    const client = algoliasearch("", "", {
      timeouts: {
        connect: 1,
        read: 1, // The value of the former `timeout` parameter
        write: 30,
      },
    });
    client
      .initIndex("foodsList")
      .search(restaurantUid, {
        attributesToRetrieve: attrToRetr,
        hitsPerPage: 20,
        facetFilters: [
          `isRestActive:${true}`,
          `publish:${true}`,
          `isImageUploaded:${true}`,
        ],
      })
      .then(async (responses) => {
        const str = JSON.stringify(responses.hits);
        const object = JSON.parse(str);
        shuffle(object);
        if (currentUser !== null) {
          firebase
            .database()
            .ref(`/users/${currentUser.uid}`)
            .once("value", async (snapshot) => {
              if (snapshot.val() !== null) {
                if (props.route.params.compCameFrom === "Notification") {
                  if (
                    snapshot
                      .val()
                      .restsList.indexOf(props.route.params.restaurantUid) !==
                    -1
                  ) {
                    strFarAway = await distance(
                      newResponse?.data?.result?.geometry?.location?.lat,
                      newResponse?.data?.result?.geometry?.location?.lng
                    );
                    setData({
                      ...newData,
                      farAway: strFarAway,
                      foodMenu: object,
                      restAxiosData: newResponse,
                      cardRestNumFollowers: props.route.params.RestNumFollowers,
                      cardIcon: "heart",
                      isLiked: true,
                    });
                  } else {
                    strFarAway = await distance(
                      newResponse?.data?.result?.geometry?.location?.lat,
                      newResponse?.data?.result?.geometry?.location?.lng
                    );
                    setData({
                      ...newData,
                      farAway: strFarAway,
                      foodMenu: object,
                      restAxiosData: newResponse,
                      cardRestNumFollowers: props.route.params.RestNumFollowers,
                      cardIcon: "heart-o",
                      isLiked: false,
                    });
                  }
                }
              } else {
                strFarAway = await distance(
                  newResponse?.data?.result?.geometry?.location?.lat,
                  newResponse?.data?.result?.geometry?.location?.lng
                );
                setData({
                  ...newData,
                  farAway: strFarAway,
                  foodMenu: object,
                  restAxiosData: newResponse,
                  cardRestNumFollowers: props.route.params.RestNumFollowers,
                });
              }
            });
        } else {
          strFarAway = await distance(
            newResponse?.data?.result?.geometry?.location?.lat,
            newResponse?.data?.result?.geometry?.location?.lng
          );
          setData({
            ...newData,
            farAway: strFarAway,
            foodMenu: object,
            restAxiosData: newResponse,
            cardRestNumFollowers: props.route.params.RestNumFollowers,
          });
        }
      });
  }
  const getGeocode = (lat, lng) => {
    axios
      .get(
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          lat +
          "," +
          lng +
          "&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU"
      ) // be sure your api key is correct and has access to the geocode api
      .then((response) => {
        setData({
          ...newData,
          yourLocation: response.data.results[0].formatted_address,
          isChangeLocation: false,
        });
      })
      .catch((error) => {
        // catch is called after then
        setData({
          ...newData,
          error: error.message,
        });
      });
  };
  const callNow = async (phoneNum) => {
    Linking.openURL(`tel:${phoneNum}`);
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

  const distance = async (lat2, lon2) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const newStrFarAway = await Location.getCurrentPositionAsync({
          accuracy: 1,
        }).then(async (currentLocation) => {
          const lat1 = currentLocation.coords.latitude;
          const lon1 = currentLocation.coords.longitude;
          var radlat1 = (Math.PI * lat1) / 180;
          var radlat2 = (Math.PI * lat2) / 180;
          var theta = lon1 - lon2;
          var radtheta = (Math.PI * theta) / 180;
          var dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist);
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515;
          dist = dist * 0.8684;
          const strFarAway = `${Math.ceil(dist)} M Away`;
          return strFarAway;
        });
        return newStrFarAway;
      }
    } catch {}
  };

  const openUntil = (periods) => {
    if ((periods !== undefined) & (periods !== null)) {
      const today = new Date().getDay();
      const hr = new Date().getHours();
      const minute = new Date().getMinutes();
      let timeNow = hr * 100 + minute;

      for (var i = 0; i < periods.length; i++) {
        if (periods[i].open.day === today) {
          let yesterday = i - 1;
          let time = periods[i]?.close?.time;
          let timeOpen = periods[i]?.open?.time;
          let timeNum = Number(timeOpen);
          if (timeNow < timeNum) {
            if (yesterday === -1) {
              yesterday = 6;
              time = periods[yesterday]?.close?.time;
              timeNum = Number(time);
              if ((time !== undefined) & (time !== null)) {
                const hour = Number(time?.toString().substring(0, 2));
                const min = Number(time?.toString().substring(2, 4));
                return `${
                  hour > 12
                    ? `${hour === 24 ? "00" : `${hour - 12}`}`
                    : `${hour}`
                }:${min < 10 ? `0${min}` : `${min}`} ${
                  hour >= 12 ? `${hour === 24 ? "AM" : "PM"}` : "AM"
                }`;
              }
            } else {
              time = periods[yesterday]?.close?.time;
              timeNum = Number(time);
              if ((time !== undefined) & (time !== null)) {
                const hour = Number(time?.toString().substring(0, 2));
                const min = Number(time?.toString().substring(2, 4));
                return `${
                  hour > 12
                    ? `${hour === 24 ? "00" : `${hour - 12}`}`
                    : `${hour}`
                }:${min < 10 ? `0${min}` : `${min}`} ${
                  hour >= 12 ? `${hour === 24 ? "AM" : "PM"}` : "AM"
                }`;
              }
            }
          } else {
            if ((time !== undefined) & (time !== null)) {
              const hour = Number(time?.toString().substring(0, 2));
              const min = Number(time?.toString().substring(2, 4));
              return `${
                hour > 12 ? `${hour === 24 ? "00" : `${hour - 12}`}` : `${hour}`
              }:${min < 10 ? `0${min}` : `${min}`} ${
                hour >= 12 ? `${hour === 24 ? "AM" : "PM"}` : "AM"
              }`;
            }
          }
        }
      }
    }
  };
  const closedUntil = (periods) => {
    if ((periods !== undefined) & (periods !== null)) {
      const today = new Date().getDay();
      const hr = new Date().getHours();
      const minute = new Date().getMinutes();
      const timeNow = hr * 100 + minute;

      for (var i = 0; i < periods.length; i++) {
        if (periods[i].open.day === today) {
          let time = periods[i]?.open?.time;
          let timeNum = Number(time);
          if ((time !== undefined) & (time !== null)) {
            if (timeNow < timeNum) {
              const hour = Number(time?.toString().substring(0, 2));
              const min = Number(time?.toString().substring(2, 4));
              return `${
                hour > 12 ? `${hour === 24 ? "00" : `${hour - 12}`}` : `${hour}`
              }:${min < 10 ? `0${min}` : `${min}`} ${
                hour >= 12 ? `${hour === 24 ? "AM" : "PM"}` : "AM"
              }`;
            } else {
              const tomorrow = today + 1;
              time = periods[tomorrow]?.open?.time;
              const hour = Number(time?.toString().substring(0, 2));
              const min = Number(time?.toString().substring(2, 4));
              return `tomorrow ${
                hour > 12 ? `${hour === 24 ? "00" : `${hour - 12}`}` : `${hour}`
              }:${min < 10 ? `0${min}` : `${min}`} ${
                hour >= 12 ? `${hour === 24 ? "AM" : "PM"}` : "AM"
              }`;
            }
          }
        }
      }
    }
  };
  const tagSeperator = (tags) => {
    if (tags !== undefined) {
      const tagsArr = tags.split(", ");
      return (
        <Tags
          initialTags={tagsArr}
          containerStyle={{ justifyContent: "center" }}
          inputContainerStyle={{ height: 0, width: 0 }}
          renderTag={({ tag, index }) => (
            <View
              key={`${tag}-${index}`}
              style={{
                marginLeft: 2,
                marginTop: -10,
                marginRight: 3,
                marginBottom: 20,
                backgroundColor: "rgba(238, 91, 100, 0.14)",
                borderRadius: 10,
                height: tag.length > width / 13.71 ? 50 : 30,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Paragraph
                style={{
                  fontFamily: "MontserratSemiBold",
                  fontSize: 12,
                  color: "#C90611",
                  marginLeft: 10,
                  marginRight: 10,
                }}>
                {tag}
              </Paragraph>
            </View>
          )}
        />
      );
    }
  };

  const checkIsFollow = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase
          .database()
          .ref(`/users/${user.uid}`)
          .once("value", (snapshot) => {
            if (snapshot.val() !== null) {
              // console.log('checkIsFollow');
              if (
                snapshot
                  .val()
                  .restsList.indexOf(props.route.params.restaurantUid) !== -1
              ) {
                setData({
                  ...newData,
                  cardIcon: "heart",
                  isLiked: true,
                  isLogin: false,
                });
              } else if (
                snapshot
                  .val()
                  .restsList.indexOf(props.route.params.restaurantUid) === -1
              ) {
                setData({
                  ...newData,
                  cardIcon: "heart-o",
                  isLiked: false,
                  isLogin: false,
                });
              }
            }
          });
      }
    });
  };
  const login = (type) => {
    if (type === "facebook") {
      props.facebookLogin().then(() => {
        setTimeout(() => {
          checkIsFollow();
        }, 100);
      });
    } else if (type === "google") {
      props.googleLogin().then(() => {
        setTimeout(() => {
          checkIsFollow();
        }, 100);
      });
    }
    if (type === "apple") {
      props.appleLogin().then(() => {
        setTimeout(() => {
          checkIsFollow();
        }, 100);
      });
    }
  };
  const followingFunc = () => {
    const { currentUser } = firebase.auth();
    let userRef;
    if (currentUser !== null) {
      userRef = firebase.database().ref(`/users/${currentUser.uid}`);
      const restListRef = firebase
        .database()
        .ref(`/restsList/${props.route.params.objectID}`);
      const restRef = firebase
        .database()
        .ref(`/users/${props.route.params.restaurantUid}`);
      let restFollowersList = [];
      let idxOfFollowerList = [];
      restRef.once("value", (snapFirst) => {
        restFollowersList = snapFirst?.val()?.followersList;
        if (newData.cardIcon === "heart-o") {
          userRef.once("value", (snapshot) => {
            if (
              snapshot !== null &&
              restFollowersList !== undefined &&
              restFollowersList !== null
            ) {
              const ListOfRests = snapshot.val().restsList;
              ListOfRests.push(props.route.params.restaurantUid);
              userRef.update({
                restsList: ListOfRests,
                followerNum: snapshot.val().followerNum + 1,
              });
              restListRef.update({
                RestNumFollowers: snapFirst?.val()?.followerNum + 1,
              });
              restRef.update({
                followerNum: snapFirst?.val()?.followerNum + 1,
                followersList: restFollowersList.concat(`${currentUser.uid}`),
              });
              return setData({
                ...newData,
                cardIcon: "heart",
                isLiked: true,
                cardRestNumFollowers: snapFirst?.val()?.followerNum + 1,
              });
            } else {
              const ListOfRests = snapshot.val().restsList;
              ListOfRests.push(props.route.params.restaurantUid);
              userRef.update({
                restsList: ListOfRests,
                followerNum: snapshot.val().followerNum + 1,
              });
              restListRef.update({
                RestNumFollowers: snapFirst?.val()?.followerNum + 1,
              });
              restRef.update({
                followerNum: snapFirst?.val()?.followerNum + 1,
                followersList: restFollowersList.concat(`${currentUser.uid}`),
              });
              return setData({
                ...newData,
                cardIcon: "heart",
                isLiked: true,
                cardRestNumFollowers: snapFirst?.val()?.followerNum + 1,
              });
            }
          });
        }
        if (
          newData.cardIcon === "heart" &&
          snapFirst?.val()?.followerNum !== 0
        ) {
          userRef.once("value", (snapshot) => {
            if (snapshot !== null) {
              const ListOfRests = snapshot.val().restsList;
              const idx = ListOfRests.indexOf(props.route.params.restaurantUid);
              if (restFollowersList !== undefined) {
                idxOfFollowerList = restFollowersList.indexOf(
                  `${currentUser.uid}`
                );
                restFollowersList.splice(idxOfFollowerList, 1);
                if (idx !== -1) {
                  ListOfRests.splice(idx, 1);
                  if (ListOfRests.length === 0) {
                    if (restFollowersList.length === 0) {
                      userRef.update({ restsList: { 0: "_" }, followerNum: 0 });
                      restRef.update({
                        followerNum: 0,
                        followersList: { 0: "_" },
                      });
                      restListRef.update({ RestNumFollowers: 0 });
                      return setData({
                        ...newData,
                        cardIcon: "heart-o",
                        isLiked: false,
                        cardRestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                    } else {
                      userRef.update({ restsList: { 0: "_" }, followerNum: 0 });
                      restRef.update({
                        followerNum: snapFirst?.val()?.followerNum - 1,
                        followersList: restFollowersList,
                      });
                      restListRef.update({
                        RestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                      return setData({
                        ...newData,
                        cardIcon: "heart-o",
                        isLiked: false,
                        cardRestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                    }
                  } else {
                    if (restFollowersList.length === 0) {
                      userRef.update({
                        restsList: ListOfRests,
                        followerNum: snapFirst?.val()?.followerNum - 1,
                      });
                      restListRef.update({ RestNumFollowers: 0 });
                      restRef.update({
                        followerNum: 0,
                        followersList: { 0: "_" },
                      });
                      return setData({
                        ...newData,
                        cardIcon: "heart-o",
                        isLiked: false,
                        cardRestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                    } else {
                      userRef.update({
                        restsList: ListOfRests,
                        followerNum: snapFirst?.val()?.followerNum - 1,
                      });
                      restRef.update({
                        followerNum: snapFirst?.val()?.followerNum - 1,
                        followersList: restFollowersList,
                      });
                      restListRef.update({
                        RestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                      return setData({
                        ...newData,
                        cardIcon: "heart-o",
                        isLiked: false,
                        cardRestNumFollowers: snapFirst?.val()?.followerNum - 1,
                      });
                    }
                  }
                }
              }
            }
          });
        }
      });
    } else {
      setData({ ...newData, isLogin: true });
    }
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          props.route.params.foodImage === undefined ? "#ed5962" : "white",
      }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}>
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            height: 50,
            zIndex: 1,
            marginTop: 60,
          }}>
          <View>
            <TouchableOpacity
              style={{ flex: 2, marginLeft: 15 }}
              onPress={() => {
                props.navigation.navigate("NotificationsSc");
              }}>
              <Image
                style={{ flex: 1, width: 50, height: 50 }}
                source={require("../assets/icons/goback.png")}
                fadeDuration={1}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={{ flex: 1, marginRight: 15 }}
              onPress={() => {
                followingFunc();
              }}>
              {newData.isLiked === true ? (
                <Image
                  style={{ flex: 1, width: 50, height: 50 }}
                  source={require("../assets/icons/heart.png")}
                  fadeDuration={100}
                />
              ) : (
                <Image
                  style={{ flex: 1, width: 50, height: 50 }}
                  source={require("../assets/icons/un-heart.png")}
                  fadeDuration={100}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <ImageBackground
          source={{
            uri:
              props.route.params.foodImage !== undefined
                ? props.route.params.foodImage
                : foodImageUri,
            cache: "force-cache",
          }}
          resizeMode="cover"
          style={styles.image}
        />
        <Animatable.View
          animation="fadeInUpBig"
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <View
            style={{
              padding: 20,
              marginTop: -30,
              marginBottom: 35,
              justifyContent: "flex-start",
              marginLeft: -10,
              marginRight: -30,
            }}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                width: 50,
                marginTop: -15,
                marginLeft: 20,
              }}>
              <Image
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 100,
                  width: 100,
                  borderRadius: 50,
                }}
                source={{ uri: props?.route?.params?.finalResults?.image }}
              />
            </View>
            <Text
              style={{
                marginTop: 40,
                marginBottom: 5,
                fontFamily: "MontserratBold",
                fontSize: 22,
                color: "black",
              }}>
              {props.route.params.restName}
            </Text>
            <Paragraph
              style={{
                fontSize: 14,
                fontFamily: "Montserrat",
                marginTop: 0,
                justifyContent: "flex-start",
              }}>
              {props.route.params.restAddress}
            </Paragraph>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <View>
                <Text
                  style={{
                    fontFamily: "MontserratSemiBold",
                    fontSize: 14,
                    color: props.route.params.isOpenNow
                      ? "#06C906"
                      : props.route.params.isOpenNow == undefined
                      ? "#06C906"
                      : "#C90611",
                    marginRight: 5,
                    marginLeft: 0,
                    marginTop: 5,
                  }}>
                  {props.route.params.isOpenNow
                    ? `Open Now`
                    : props.route.params.isOpenNow === undefined
                    ? ""
                    : "Closed"}
                </Text>
              </View>
              <View>
                {newData.restAxiosData?.data?.result?.opening_hours !==
                undefined ? (
                  <Text
                    style={{
                      fontFamily: "MontserratSemiBold",
                      fontSize: 14,
                      color: "rgba(0, 0, 0, 0.30)",
                      marginRight: 5,
                      marginLeft: 0,
                      marginTop: 5,
                    }}>
                    {props.route.params.isOpenNow
                      ? `${
                          openUntil(
                            newData.restAxiosData?.data?.result?.opening_hours
                              ?.periods
                          ) !== undefined
                            ? ` until ${openUntil(
                                newData.restAxiosData?.data?.result
                                  ?.opening_hours?.periods
                              )}`
                            : ""
                        }`
                      : `${
                          closedUntil(
                            newData.restAxiosData?.data?.result?.opening_hours
                              ?.periods
                          ) !== undefined
                            ? ` until ${closedUntil(
                                newData.restAxiosData?.data?.result
                                  ?.opening_hours?.periods
                              )}`
                            : ""
                        }`}
                  </Text>
                ) : null}
              </View>
            </View>
            {props?.route?.params?.restDesc?.length !== 0 ? (
              <View style={{ flexDirection: "row" }}>
                <FontAwesome name="cutlery" color={"#EE5B64"} size={20} />
                <Paragraph
                  style={{
                    fontSize: 12,
                    fontFamily: "Montserrat",
                    justifyContent: "flex-start",
                    color: "rgba(0, 0, 0, 0.50)",
                    marginBottom: 10,
                    marginLeft: 10,
                  }}>
                  {props.route.params.restDesc}
                </Paragraph>
              </View>
            ) : null}
            <View style={{ marginTop: 10 }}>
              <View>
                {newData.cardRestNumFollowers === 0 ? (
                  <View style={{ flexDirection: "row" }}>
                    <FontAwesome name="heart" color={"#EE5B64"} size={20} />
                    <Paragraph
                      style={{
                        fontSize: 12,
                        fontFamily: "Montserrat",
                        marginTop: 0,
                        justifyContent: "flex-start",
                        color: "rgba(0, 0, 0, 0.50)",
                        marginBottom: 20,
                        marginLeft: 10,
                      }}>
                      Be the First Follower
                    </Paragraph>
                  </View>
                ) : (
                  <TouchableOpacity disabled={true} onPress={() => {}}>
                    <View style={{ flexDirection: "row" }}>
                      {newData.cardRestNumFollowers === 0 ? (
                        <FontAwesome
                          name="heart-o"
                          color={"#EE5B64"}
                          size={20}
                        />
                      ) : (
                        <FontAwesome name="heart" color={"#EE5B64"} size={20} />
                      )}
                      <Paragraph
                        style={{
                          fontSize: 12,
                          fontFamily: "Montserrat",
                          marginTop: 0,
                          justifyContent: "flex-start",
                          color: "rgba(0, 0, 0, 0.50)",
                          marginBottom: 20,
                          marginLeft: 10,
                        }}>
                        {newData.cardRestNumFollowers}{" "}
                        {newData.cardRestNumFollowers === 1
                          ? "Follower"
                          : "Followers"}
                      </Paragraph>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginRight: 30,
                }}>
                <View>
                  {props.route.params.RestNumFollowers === 0 ? (
                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome name="heart" color={"#EE5B64"} size={20} />
                      <Paragraph
                        style={{
                          fontSize: 12,
                          fontFamily: "Montserrat",
                          marginTop: 0,
                          justifyContent: "flex-start",
                          color: "rgba(0, 0, 0, 0.50)",
                          marginBottom: 20,
                          marginLeft: 10,
                        }}>
                        Be the First Follower
                      </Paragraph>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(
                          `http://${props.route.params.restOrderWeb}`
                        );
                      }}>
                      <View style={{ flexDirection: "row" }}>
                        <FontAwesome
                          name="shopping-cart"
                          color={"#EE5B64"}
                          size={20}
                        />
                        <Paragraph
                          style={{
                            fontSize: 12,
                            fontFamily: "Montserrat",
                            marginTop: 0,
                            justifyContent: "flex-start",
                            color: "rgba(0, 0, 0, 0.50)",
                            marginBottom: 20,
                            marginLeft: 10,
                          }}>
                          Order Online
                        </Paragraph>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      goToLocation(props.route.params.restAddress);
                    }}>
                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome
                        name="map-marker"
                        color={"#EE5B64"}
                        size={20}
                      />
                      <Paragraph
                        style={{
                          fontSize: 12,
                          fontFamily: "Montserrat",
                          marginTop: 0,
                          justifyContent: "flex-start",
                          color: "rgba(0, 0, 0, 0.50)",
                          marginBottom: 20,
                          marginLeft: 10,
                        }}>
                        {newData.farAway}
                      </Paragraph>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginRight: 30,
                }}>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(
                        `http://${props.route.params.restWebsite}`
                      );
                    }}>
                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome name="globe" color={"#EE5B64"} size={20} />
                      <Paragraph
                        style={{
                          fontSize: 12,
                          fontFamily: "Montserrat",
                          marginTop: 0,
                          justifyContent: "flex-start",
                          color: "rgba(0, 0, 0, 0.50)",
                          marginBottom: 20,
                          marginLeft: 10,
                        }}>
                        Go to Website
                      </Paragraph>
                    </View>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      callNow(props.route.params.phoneNum);
                    }}>
                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome name="phone" color={"#EE5B64"} size={20} />
                      <Paragraph
                        style={{
                          fontSize: 12,
                          fontFamily: "Montserrat",
                          marginTop: 0,
                          justifyContent: "flex-start",
                          color: "rgba(0, 0, 0, 0.50)",
                          marginBottom: 20,
                          marginLeft: 10,
                        }}>
                        Call
                      </Paragraph>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 5, marginLeft: 0, marginBottom: 15 }}>
              <Text
                style={{
                  fontFamily: "MontserratSemiBold",
                  fontSize: 16,
                  color: colors.text,
                }}>
                Popular Items
              </Text>
            </View>
            <View style={{ flexDirection: "row", zIndex: 0 }}>
              <View
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginBottom: 30,
                  marginTop: 20,
                  marginLeft: 0,
                }}>
                <Card
                  elevation={10}
                  style={{
                    justifyContent: "flex-start",
                    width: width * 0.7,
                    borderRadius: 15,
                  }}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <Card.Cover
                      style={{
                        width: width * 0.7,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                      }}
                      source={{
                        uri:
                          newData?.foodMenu[0]?.foodInfo?.image === undefined
                            ? foodImage0Uri
                            : newData?.foodMenu[0]?.foodInfo?.image,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      width: width * 0.5,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}>
                    <View style={{ flexDirection: "row", marginTop: 20 }}>
                      <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "MontserratSemiBold",
                          }}>
                          {newData?.foodMenu[0]?.foodInfo?.food_name ===
                          undefined
                            ? "Delicious"
                            : newData?.foodMenu[0]?.foodInfo?.food_name}
                        </Text>
                        <Paragraph
                          style={{
                            fontSize: 12,
                            fontFamily: "Montserrat",
                            marginTop: 0,
                          }}>
                          {newData?.foodMenu[0]?.foodInfo?.foodType ===
                          undefined
                            ? "Entree"
                            : newData?.foodMenu[0]?.foodInfo?.foodType}
                        </Paragraph>
                      </Card.Content>
                    </View>
                    <View
                      style={{
                        width: width * 0.2,
                        marginTop: 15,
                        flexDirection: "column",
                        marginLeft: 10,
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                      }}>
                      <View
                        style={{
                          alignItems: "center",
                          marginRight: 15,
                          flexDirection: "row",
                          marginTop: -5,
                          justifyContent: "flex-end",
                        }}>
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 18,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 10,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon={require("../assets/icons/eye.png")}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 14,
                              color: colors.text,
                              marginLeft: -20,
                              marginRight: 1,
                            }}>
                            {newData?.foodMenu[0]?.totalView === 0
                              ? "None"
                              : newData?.foodMenu[0]?.totalView === undefined
                              ? 235
                              : newData?.foodMenu[0]?.totalView}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          alignItems: "center",
                          marginRight: 15,
                          flexDirection: "row",
                          marginTop: -5,
                          justifyContent: "flex-end",
                        }}>
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 18,
                              fontFamily: "MontserratSemiBold",
                              color: "#FFC607",
                              marginLeft: 10,
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
                              fontSize: 14,
                              color: "#FFC607",
                              marginLeft: -20,
                              marginRight: 1,
                            }}>
                            {newData?.foodMenu[0]?.foodInfo?.Rate
                              ?.qualityRate === 0
                              ? "None"
                              : newData?.foodMenu[0]?.foodInfo?.Rate
                                  ?.qualityRate === undefined
                              ? 4.6
                              : newData?.foodMenu[0]?.foodInfo?.Rate
                                  ?.qualityRate}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{ margin: 10 }}>
                    {tagSeperator(newData?.foodMenu[0]?.foodInfo?.tags)}
                  </View>
                </Card>
              </View>
              <View
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginBottom: 30,
                  marginTop: 20,
                  marginLeft: 25,
                }}>
                <Card
                  elevation={10}
                  style={{
                    justifyContent: "flex-start",
                    width: width * 0.7,
                    borderRadius: 15,
                  }}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <Card.Cover
                      style={{
                        width: width * 0.7,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                      }}
                      source={{
                        uri:
                          newData?.foodMenu[1]?.foodInfo?.image === undefined
                            ? foodImage1Uri
                            : newData?.foodMenu[1]?.foodInfo?.image,
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flexDirection: "row", marginTop: 20 }}>
                      <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "MontserratSemiBold",
                          }}>
                          {newData?.foodMenu[1]?.foodInfo?.food_name ===
                          undefined
                            ? "Yummy"
                            : newData?.foodMenu[1]?.foodInfo?.food_name}
                        </Text>
                        <Paragraph
                          style={{
                            fontSize: 12,
                            fontFamily: "Montserrat",
                            marginTop: 0,
                          }}>
                          {newData?.foodMenu[1]?.foodInfo?.foodType ===
                          undefined
                            ? "Appetizer"
                            : newData?.foodMenu[1]?.foodInfo?.foodType}
                        </Paragraph>
                      </Card.Content>
                    </View>
                    <View
                      style={{
                        width: width * 0.2,
                        marginTop: 15,
                        flexDirection: "column",
                        marginLeft: -15,
                      }}>
                      <View
                        style={{
                          alignItems: "center",
                          marginLeft: 15,
                          flexDirection: "row",
                          marginTop: -5,
                        }}>
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 18,
                              fontFamily: "MontserratSemiBold",
                              color: colors.text,
                              marginLeft: 10,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            icon={require("../assets/icons/eye.png")}
                          />
                        </View>
                        <View>
                          <Text
                            style={{
                              fontFamily: "MontserratSemiBold",
                              fontSize: 14,
                              color: colors.text,
                              marginLeft: -20,
                            }}>
                            {newData?.foodMenu[1]?.totalView === 0
                              ? "None"
                              : newData?.foodMenu[1]?.totalView === undefined
                              ? 65
                              : newData?.foodMenu[1]?.totalView}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          alignItems: "center",
                          marginLeft: 15,
                          flexDirection: "row",
                          marginTop: -5,
                          marginLeft: -10,
                        }}>
                        <View>
                          <Button
                            labelStyle={{
                              fontSize: 18,
                              fontFamily: "MontserratSemiBold",
                              color: "#FFC607",
                              marginLeft: 10,
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
                              fontSize: 14,
                              color: "#FFC607",
                              marginLeft: -20,
                            }}>
                            {newData?.foodMenu[1]?.foodInfo?.Rate
                              ?.qualityRate === 0
                              ? "None"
                              : newData?.foodMenu[1]?.foodInfo?.Rate
                                  ?.qualityRate === undefined
                              ? 4.9
                              : newData?.foodMenu[1]?.foodInfo?.Rate
                                  ?.qualityRate}
                          </Text>
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
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("SeeMenuNotificationsTab", {
                    restaurantUid: props.route.params.restaurantUid,
                    restaurantName: props.route.params.restName,
                    objectID: props.route.params.objectID,
                    food_name: "",
                    cameFrom: "Notification",
                  });
                }}>
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 10,
                  }}>
                  <LinearGradient
                    colors={["#fb8389", "#f70814", "#C90611"]}
                    style={styles.linearGradient}>
                    <Text style={styles.buttonText}>
                      See Restaurant's Full Menu
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
      <Modal
        isVisible={newData.isLogin}
        animationInTiming={550}
        animationOutTiming={550}
        propagateSwipe
        onModalHide={() => {
          setData({ ...newData, isLogin: false });
        }}
        onModalShow={() => {
          setData({ ...newData, isLogin: true });
        }}
        backdropColor="black"
        useNativeDriver={true}
        backdropOpacity={0.3}
        hideModalContentWhileAnimating
        onRequestClose={() => {
          setData({ ...newData, isLogin: false });
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
                setData({ ...newData, isLogin: false });
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
              setData({ ...newData, isLogin: false });
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
              setData({ ...newData, isLogin: false });
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
          <View style={styles.button2}>
            <TouchableOpacity
              onPress={() => {
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
          <View style={styles.button2}>
            <TouchableOpacity
              onPress={() => {
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
            <View style={styles.button2}>
              <TouchableOpacity
                onPress={() => {
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
                setData({ ...newData, isLogin: false });
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
            <Text
              style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}>
              {" "}
              Privacy policy
            </Text>
            <Text style={styles.color_textPrivate}> and</Text>
            <Text
              style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}>
              {" "}
              Terms And Conditions
            </Text>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default connect(null, actions)(RestaurantNotificationsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ed5962",
  },
  image: {
    flex: 1,
    marginTop: -120,
    zIndex: 0,
    height: height / 2,
    justifyContent: "center",
  },
  descCitiesStyle: {
    color: "black",
    fontFamily: "MontserratSemiBold",
  },
  header: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: -15,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonTextBlack: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#000",
    backgroundColor: "transparent",
  },
  buttonAction: {
    fontSize: 18,
    fontFamily: "MontserratBold",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 15,
    color: "black",
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
  searchDescStyle: {
    textAlign: "center",
    fontSize: 14,
    marginLeft: 15,
    width: width * 0.75,
    borderRadius: 40,
    fontFamily: "MontserratReg",
    color: "black",
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
  footer: {
    flex: 3,
    backgroundColor: "#fff",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 1,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  text_footer: {
    color: "#05375a",
    fontFamily: "MontserratSemiBold",
    fontSize: 18,
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
  text_footer2: {
    color: "#05375a",
    fontFamily: "MontserratSemiBold",
    fontSize: 18,
  },
  color_textPrivateBold2: {
    color: "#C90611",
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
  },
  color_textPrivate2: {
    color: "grey",
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
  },
  linearGradientSocial: {
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.75,
  },
  linearGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.75,
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
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 30,
    width: width * 0.85,
  },
  textPrivate2: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginLeft: 20,
    marginTop: 30,
    marginBottom: 30,
    width: width * 0.8,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  errorMsg: {
    color: "#FF0000",
    fontFamily: "Montserrat",
    marginBottom: 15,
    fontSize: 12,
  },
  button2: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    zIndex: 1,
    width,
    marginTop: -200,
    marginLeft: -25,
    marginBottom: 160,
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
