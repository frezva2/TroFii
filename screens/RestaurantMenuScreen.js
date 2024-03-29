import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  DefaultTheme,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import update from "immutability-helper";
import algoliasearch from "algoliasearch";
import uuid from "uuid-v4";
import Modal from "react-native-modal";
import Tags from "react-native-tags";
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectHighlight,
} from "react-instantsearch-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const userAttrToRetr = [
  "email",
  "isRestActive",
  "createdAt",
  "firstname",
  "image",
  "lastname",
  "restDesc",
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

let searchState = {
  noResults: false,
  noResultsReq: false,
  resultsLength: 1,
  hitsLength: 1,
  takenPicture: "",
  searchingWord: "",
  nameRest: "",
  nameRestDesc: "",
};
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const catHeight1 = (height * 0.45) / 6;
const catHeight2 = (height / width) * 100;

const catWidth = width * 0.15;
const catHeight = height / width > 1.5 ? catHeight1 : catHeight2;

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

let index;

const RestaurantMenuNotificationsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState(Camera.Constants.Type.back);
  const onChangeSearch = (query) => setSearchQuery(query);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [data, setData] = React.useState({
    oldImage:
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d",
    newImage:
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenuItem.png?alt=media&token=afea0680-37f2-4ce6-b429-8838796b747d",
    PrivacyPolicy: "",
    TermsConditions: "",
    results: [],
    activeSlide: 0,
    isSubmitImage: false,
    food_name: "",
    restaurantUid: "",
    restaurantName: "",
    compCameFrom: "",
    takenPicture: "",
    comments: "",
    finalResults: null,
    restsList: null,
    isUserUnsignedVisible: false,
    loadingStateVisible: false,
    userSubmitImage: false,
    placeHolder: "Burger",
    placeholderTextColor: "#cccccc",
    searchingWord: "",
    isClickedImage: false,
    foodRequestedType: "",
    stateNavigation: { 0: "a" },
    foodType: "",
    currentImage: "_",
    sortBy: "worests",
    refreshing: false,
    noResultsReq: false,
    isFoundItem: false,
    isFoundItemChange: false,
    activeButton: "Recommended",
    managmentExpoToken: "",
    managmentUid: "",
    tempRestId: "",
  });
  useEffect(() => {
    setTimeout(() => {
      const userRef = firebase.database().ref(`/users/`);
      userRef.once("value", (snapshot) => {
        if (snapshot.val() !== null) {
          if (route.params.isSubmitImage !== undefined) {
            if (route.params.isSubmitImage === true) {
              setData({
                ...data,
                isSubmitImage: true,
                food_name: route.params.food_name,
                activeSlide: route.params.activeSlide,
                finalResults: route.params.hits,
                managmentExpoToken: snapshot.val().expoToken,
                managmentUid: "",
              });
            }
          } else if (
            route.params.noResultsReq !== undefined &&
            route.params.noResultsReq === true &&
            searchState.resultsLength === 0
          ) {
            setData({
              ...data,
              noResultsReq: true,
              requestFoodName: route.params.requestFoodName,
              managmentExpoToken: snapshot.val().expoToken,
              managmentUid: "",
            });
          } else {
            setData({
              ...data,
              managmentExpoToken: snapshot.val().expoToken,
              managmentUid: "",
            });
          }
        }
      });
    }, 100);
    return () => {};
  }, [route.params]);

  const renderFooter = () => {
    if (!data.loading) return null;
    return (
      <View style={{ height: 50, marginTop: -15 }}>
        <ActivityIndicator size="large" color="#C90611" />
      </View>
    );
  };

  const handleRefresh = () => {
    setData({
      ...data,
      numOfItems: 0,
      finalResults: [],
      restUidIndex: 0,
      refreshing: true,
    });
  };

  const handleLoadMore = () => {
    setData({
      ...data,
      loading: true,
    });
  };

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
  const onSearchStateChange = (results) => {
    if (!isEquivalent(data.stateNavigation, results)) {
      setData({ ...data, stateNavigation: results });
      setData({ ...data, searchingWord: searchState.searchingWord });
    }
  };
  const renderEmpty = () => {
    return <View style={{ flex: 1 }} />;
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
              takenPicture: searchState.takenPicture,
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
                takenPicture: searchState.takenPicture,
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
              sendPushNotification(
                "New Picture",
                "A user submitted a new picture for your approval.",
                "NewPic",
                searchState.takenPicture,
                user.uid,
                snapShot.key
              );
            });
        });
      }
    });
  };
  const askPermissionsAsync = async () => {
    await Camera.getCameraPermissionsAsync();
    await Camera.requestCameraPermissionsAsync();
    // you would probably do something to verify that permissions
    // are actually granted, but I'm skipping that for brevity
  };
  const _handleImagePicked = async (pickerResult) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hrs = new Date().getHours();
    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const milsec = new Date().getMilliseconds();
    const { currentUser } = firebase.auth();
    try {
      if (!pickerResult.cancelled) {
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        if (data.isSubmitImage === true) {
          const newItem = data.finalResults;
          const imageUrl = update(data.finalResults[data.activeSlide], {
            foodInfo: { image: { $set: uploadUrl } },
          });
          newItem[data.activeSlide] = imageUrl;
          setData({
            ...data,
            takenPicture: uploadUrl,
            finalResults: newItem,
            userSubmitImage: false,
          });
          searchState = Object.assign({
            ...searchState,
            takenPicture: uploadUrl,
          });
        } else {
          setData({
            ...data,
            takenPicture: uploadUrl,
          });
        }
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
  const cancelUpdate = () => {
    // Delete the file
    if (searchState.takenPicture !== "") {
      var the_string = searchState.takenPicture;
      var imageFirstPart = the_string.split("preApprovalImage%2F", 2);
      var imageSecPart = imageFirstPart[1].split("?", 1);
      var finalImageName = imageSecPart[0];

      var storage = firebase.storage();
      var storageRef = storage.ref();
      let userImage = storageRef.child(`preApprovalImage/${finalImageName}`);
      userImage.delete();
      const newItem = data.finalResults;
      const imageUrl = update(data.finalResults[data.activeSlide], {
        foodInfo: { image: { $set: data.oldImage } },
      });
      newItem[data.activeSlide] = imageUrl;
      setData({
        ...data,
        takenPicture: "",
        finalResults: newItem,
        isSubmitImage: false,
      });
      searchState = Object.assign({ ...searchState, takenPicture: "" });
    } else {
      const newItem = data.finalResults;
      const imageUrl = update(data.finalResults[data.activeSlide], {
        foodInfo: { image: { $set: data.oldImage } },
      });
      newItem[data.activeSlide] = imageUrl;
      setData({
        ...data,
        takenPicture: "",
        finalResults: newItem,
        isSubmitImage: false,
      });
      searchState = Object.assign({ ...searchState, takenPicture: "" });
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
  }
  return (
    <SafeAreaView style={{ flex: 1, marginTop: -insets.top }}>
      <View style={styles.container}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
        <View style={{ flex: 1 }}>
          <InstantSearch
            searchClient={client}
            indexName={data.sortBy}
            refresh
            stalledSearchDelay={0}
            onSearchStateChange={(results) => onSearchStateChange(results)}>
            <Configure
              query={data.food_name}
              facetFilters={[
                "isRestActive:true",
                `restName:${route.params.restaurantName}`,
                `foodInfo.foodType:${data.foodType}`,
              ]}
              attributesToRetrieve={attrToRetr}
              typoTolerance={"strict"}
              hitsPerPage={300}
            />
            <ScrollView>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                  width,
                }}>
                <View>
                  <Searchbar
                    placeholder="Find restaurant "
                    onChangeText={(text) => {
                      setData({ ...data, food_name: text });
                    }}
                    value={data.food_name}
                    maxLength={100}
                    returnKeyType={"done"}
                    keyboardType={"default"}
                    selectionColor="#EE5B64"
                    style={{
                      marginLeft: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 15,
                      height: 50,
                      marginTop: Platform.OS === " ios" ? -10 : 0,
                      width: width * 0.9,
                    }}
                    inputStyle={{ fontFamily: "Montserrat", fontSize: 14 }}
                  />
                </View>
                <ScrollView
                  scrollEventThrottle={1}
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  style={{ flexDirection: "row", marginTop: 5, height: 70 }}>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Recommended",
                        sortBy: "worests",
                        foodType: "",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Recommended"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Recommended"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Recommended
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Popular",
                        sortBy: "sortByTotalView",
                        foodType: "",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Popular"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Popular"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Popular
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Starters",
                        sortBy: "foodsList",
                        foodType: "Appetizer",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Starters"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Starters"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Starters
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Entrées",
                        sortBy: "foodsList",
                        foodType: "Entrée",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Entrées"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Entrées"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Entrées
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Desserts",
                        sortBy: "foodsList",
                        foodType: "Dessert",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Desserts"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Desserts"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Desserts
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 20, marginTop: 10, marginRight: 25 }}
                    onPress={() => {
                      setData({
                        ...data,
                        activeButton: "Drinks",
                        sortBy: "foodsList",
                        foodType: "Drink",
                      });
                    }}>
                    <LinearGradient
                      colors={
                        data.activeButton === "Drinks"
                          ? ["#fb8389", "#f70814", "#C90611"]
                          : ["white", "white", "white"]
                      }
                      style={styles.linearGradient3}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "MontserratBold",
                          textAlign: "center",
                          margin: 10,
                          marginLeft: 20,
                          marginRight: 20,
                          color:
                            data.activeButton === "Drinks"
                              ? "#ffffff"
                              : "black",
                          backgroundColor: "transparent",
                        }}>
                        Drinks
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              <View
                style={{
                  flex: 1,
                  marginBottom: 5,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginTop: 0,
                }}>
                <Hits colors={colors} navigation={navigation} />
              </View>
            </ScrollView>
          </InstantSearch>
          <View style={{ flex: 1 }}>
            <Modal
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
                setData({ ...data, isSubmitImage: false });
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
              }}>
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 35,
                }}>
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}>
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
                      }}>
                      {data.food_name}
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
                          width: width * 0.95,
                          marginTop: 0,
                          marginLeft: 15,
                        }}>
                        <Paragraph style={styles.searchDescStyle}>
                          Submit your picture for {data.food_name} by uploading
                          your picture, or taking one.
                        </Paragraph>
                      </View>
                    </View>
                  </View>
                </View>
                {searchState.takenPicture === "" ? (
                  <View
                    style={{
                      height: width * 0.41,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-evenly",
                      marginTop: 10,
                    }}>
                    <View
                      style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
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
                    <View
                      style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
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
                    source={{ uri: searchState.takenPicture }}
                  />
                )}
                <TouchableOpacity
                  onPress={() => {
                    postPhoto();
                  }}
                  disabled={searchState.takenPicture === "" ? true : false}>
                  <View
                    style={{
                      marginTop: searchState.takenPicture === "" ? -20 : 10,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 5,
                    }}>
                    <LinearGradient
                      colors={
                        searchState.takenPicture === ""
                          ? ["#cccccc", "#cccccc", "#cccccc"]
                          : ["#fb8389", "#f70814", "#C90611"]
                      }
                      style={styles.linearGradient}>
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
                  }}>
                  <TouchableOpacity
                    style={{ justifyContent: "center", alignItems: "center" }}
                    onPress={() => {
                      cancelUpdate();
                    }}>
                    <Title
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Montserrat",
                      }}>
                      Cancel
                    </Title>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={data.noResultsReq}
              animationInTiming={550}
              animationOutTiming={550}
              propagateSwipe
              onModalHide={() => {
                setData({ ...data, noResultsReq: false });
              }}
              onModalShow={() => {
                setData({ ...data, noResultsReq: true });
              }}
              onBackdropPress={() => {
                setData({ ...data, noResultsReq: false });
              }}
              backdropColor="black"
              useNativeDriver={true}
              backdropOpacity={0.3}
              hideModalContentWhileAnimating
              onRequestClose={() => {
                setData({ ...data, noResultsReq: false });
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
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 35,
                }}>
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}>
                  <View style={{ marginTop: 10 }}>
                    <Image
                      style={{ width: 100, height: 100, marginTop: 35 }}
                      source={require("../assets/icons/not_pic_menu.png")}
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
                      Item Not Found
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
                          width: width * 0.95,
                          marginTop: 0,
                          marginLeft: 15,
                        }}>
                        <Paragraph style={styles.searchDescStyle}>
                          The item you are searching for does not exist in our
                          menu. You can request this item by uploading your
                          picture, or taking one and selecting the item’s
                          category.
                        </Paragraph>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      backgroundColor: "#ffffff",
                      paddingBottom: 8,
                      justifyContent: data.isSeeMenu ? "center" : "flex-start",
                    }}>
                    <View style={{ marginLeft: height < 601 ? 0 : -5 }}>
                      <Text style={styles.titleStyle}>Item Category: </Text>
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
                    }}>
                    <View
                      style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                      <TouchableHighlight>
                        <Image
                          style={{
                            marginRight: -30,
                            width: 120,
                            height: 120,
                            marginTop: 0,
                          }}
                          source={require("../assets/icons/photo.png")}
                          fadeDuration={100}
                        />
                      </TouchableHighlight>
                    </View>
                    <View
                      style={{ flex: 1, marginTop: 2, alignItems: "center" }}>
                      <TouchableHighlight>
                        <Image
                          style={{
                            marginLeft: -30,
                            width: 120,
                            height: 120,
                            marginTop: 0,
                          }}
                          source={require("../assets/icons/image.png")}
                          fadeDuration={100}
                        />
                      </TouchableHighlight>
                    </View>
                  </View>
                ) : (
                  <Image
                    style={styles.CurrentImage}
                    source={{ uri: data.takenPicture }}
                  />
                )}
                <View
                  style={{
                    marginTop: -20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}>
                  <LinearGradient
                    colors={["#fb8389", "#f70814", "#C90611"]}
                    style={styles.linearGradient}>
                    <Text style={styles.buttonText}>Post Photo</Text>
                  </LinearGradient>
                </View>
                <View
                  style={{
                    marginTop: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 15,
                  }}>
                  <TouchableOpacity
                    style={{ justifyContent: "center", alignItems: "center" }}
                    onPress={() => {
                      setData({ ...data, noResultsReq: false });
                    }}>
                    <Title
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Montserrat",
                      }}>
                      Cancel
                    </Title>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
let searchStateHitsLength = 0;
const Hits = connectInfiniteHits(
  ({ hits, hasMore, refine, colors, navigation }) => {
    const oldImage =
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d";
    const newImage =
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea";

    const onEndReached = function () {
      if (hasMore) {
        refine();
      }
    };
    const hitsLength = hits.length;

    if (searchStateHitsLength != hitsLength) {
      searchStateHitsLength = hitsLength;
      if (hits.length === 0) {
        setTimeout(() => {
          searchState = Object.assign({ ...searchState, resultsLength: 0 });
        }, 1000);
      } else if (hits.length != 0) {
        setTimeout(() => {
          searchState = Object.assign({
            ...searchState,
            resultsLength: hits.length,
          });
        }, 1000);
      }
    }

    return (
      <View style={{ flex: 1, marginBottom: 20, marginTop: 10 }}>
        <FlatList
          data={hits}
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={true}
          horizontal
          extraData={hits}
          onEndReached={onEndReached}
          ItemSeparatorComponent={ItemSeperator}
          initialNumToRender={11}
          onEndReachedThreshold={3}
          keyExtractor={(item, index) => item.objectID}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginRight: hits.length - 1 === index ? 100 : 15,
                  marginLeft: index === 0 ? 15 : 0,
                  marginBottom: 25,
                }}>
                <Card
                  elevation={10}
                  style={{ width: width * 0.75, borderRadius: 15 }}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <Card.Cover
                      style={{
                        width: width * 0.75,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                      }}
                      source={{
                        uri:
                          item.foodInfo.image === oldImage
                            ? newImage
                            : item.foodInfo.image,
                      }}
                    />
                    {item.foodInfo.image === oldImage ? (
                      <TouchableOpacity
                        style={{ flex: 1, marginLeft: 0 }}
                        onPress={() => {
                          searchState = Object.assign({
                            ...searchState,
                            takenPicture: "",
                          });
                          navigation.navigate("RestMenu", {
                            isSubmitImage: true,
                            food_name: item.foodInfo.food_name,
                            hits: hits,
                            activeSlide: index,
                          });
                        }}>
                        <View>
                          <Button
                            style={{
                              backgroundColor: "#C90611",
                              borderRadius: 10,
                              marginTop: -30,
                              elevation: 3,
                            }}>
                            <Icon
                              name="camera-plus"
                              size={35}
                              color={"white"}
                            />
                          </Button>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View />
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: width * 0.75,
                      justifyContent: "flex-start",
                    }}>
                    <View
                      style={{
                        flexDirection: "row",
                        margin: 5,
                        width: width * 0.4,
                        marginTop: 15,
                        marginRight: 10,
                      }}>
                      <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "MontserratSemiBold",
                          }}>
                          {item.foodInfo.food_name}
                        </Text>
                        <Paragraph
                          style={{
                            color: "gray",
                            fontSize: 12,
                            fontFamily: "Montserrat",
                            marginTop: 0,
                          }}>
                          {item.foodInfo.foodType}
                        </Paragraph>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "MontserratSemiBold",
                          }}>
                          {item.foodInfo.price !== 0 ? "$ " : null}
                          {item.foodInfo.price !== 0
                            ? item.foodInfo.price
                            : null}
                        </Text>
                      </Card.Content>
                    </View>
                    <View
                      style={{
                        alignItems: "flex-start",
                        flexDirection: "row",
                        marginLeft: -45,
                        justifyContent: "flex-start",
                      }}>
                      {item.totalView === 0 ? (
                        <View />
                      ) : (
                        <View
                          style={{
                            alignItems: "center",
                            marginLeft: 15,
                            flexDirection: "row",
                            marginTop: 0,
                          }}>
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 20,
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
                                fontSize: 13,
                                color: colors.text,
                                marginLeft: -20,
                              }}>
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
                            alignItems: "center",
                            marginLeft: -5,
                            flexDirection: "row",
                            marginTop: 0,
                          }}>
                          <View>
                            <Button
                              labelStyle={{
                                fontSize: 20,
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
                                fontSize: 13,
                                color: "#FFC607",
                                marginLeft: -20,
                              }}>
                              {item.foodInfo.Rate.qualityRate === 0
                                ? "None"
                                : item.foodInfo.Rate.qualityRate}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={{ margin: 10 }}>
                    {tagSeperator(item.foodInfo.tags)}
                  </View>
                </Card>
              </View>
            );
          }}
        />
      </View>
    );
  }
);
const tagSeperator = (tags) => {
  const tagsArr = tags.split(",");
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
            height: tag.length > width / 10.5 ? 50 : 30,
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
};
const ItemSeperator = () => <View style={styles.seperator} />;
const Highlight = connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({
      attribute,
      hit,
      highlightProperty: "_highlightResult",
    });
    const highlightedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted)
        return (
          <Text key={idx} style={{ backgroundColor: "#e6e6e6" }}>
            {part.value}
          </Text>
        );
      return part.value;
    });
    return <Text>{highlightedHit}</Text>;
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  CurrentImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    color: "black",
    textDecorationColor: "black",
    fontFamily: "Montserrat",
    paddingTop: 7,
  },
  currentItem: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  descStyle: {
    color: "black",
    paddingTop: 10,
    fontFamily: "Montserrat",
  },
  rateStyle: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
  searchTitleStyle: {
    fontSize: 17,
    width: width * 0.9,
    fontFamily: "MontserratBold",
    color: "black",
  },
  linearGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.6,
  },
  linearGradient3: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "black", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  buttonText3: {
    fontSize: 13,
    fontFamily: "MontserratBold",
    textAlign: "center",
    margin: 10,
    marginLeft: 20,
    marginRight: 20,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  textRateStyle: {
    color: "black",
    fontFamily: "MontserratBold",
    fontSize: 15,
    textAlign: "center",
  },
  titleStyle: {
    color: "black",
    paddingTop: 10,
    fontFamily: "MontserratSemiBold",
    marginBottom: -15,
    fontSize: 16,
    textAlign: "center",
  },
  numberRateStyle: {
    color: "black",
    fontFamily: "Montserrat",
  },
  unsignModalStyle: {
    flex: 1,
    width: width - width * 0.1,
    backgroundColor: "white",
  },
  catTextStyle: {
    color: "black",
    fontSize: 16,
    fontFamily: "MontserratBold",
  },
  catNumStyle: {
    color: "black",
    fontSize: 16,
    fontFamily: "Montserrat",
    textAlign: "left",
  },
});

export default RestaurantMenuNotificationsScreen;
