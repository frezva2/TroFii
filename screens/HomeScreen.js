import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  FAB,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import openMap from "react-native-open-maps";
import algoliasearch from "algoliasearch";
import * as actions from "../actions";
import { connect } from "react-redux";
import Modal from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";
import uuid from "uuid-v4";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tags from "react-native-tags";

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

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const catHeight1 = (height * 0.45) / 6;
const catHeight2 = (height / width) * 110;

const catWidth = width * 0.2;
const catHeight = height / width > 1.5 ? catHeight1 : catHeight2;

const mexican = require("../assets/Foods/mexican.png");
const mexicanUri = Image.resolveAssetSource(mexican).uri;

const persian = require("../assets/Foods/persian.png");
const persianUri = Image.resolveAssetSource(persian).uri;

const italian = require("../assets/Foods/italian.png");
const italianUri = Image.resolveAssetSource(italian).uri;

const thai = require("../assets/Foods/thai.png");
const thaiUri = Image.resolveAssetSource(thai).uri;

const burger = require("../assets/Foods/burger.png");
const burgerUri = Image.resolveAssetSource(burger).uri;

const spanish = require("../assets/Foods/spanish.png");
const spanishUri = Image.resolveAssetSource(spanish).uri;

const sushi = require("../assets/Foods/sushi.png");
const sushiUri = Image.resolveAssetSource(sushi).uri;

const seafood = require("../assets/Foods/seafood.png");
const seafoodUri = Image.resolveAssetSource(seafood).uri;

const steak = require("../assets/Foods/steak.png");
const steakUri = Image.resolveAssetSource(steak).uri;

const chinese = require("../assets/Foods/chinese.png");
const chineseUri = Image.resolveAssetSource(chinese).uri;

const french = require("../assets/Foods/french.png");
const frenchUri = Image.resolveAssetSource(french).uri;

const vegetarian = require("../assets/Foods/vegetarian.png");
const vegetarianUri = Image.resolveAssetSource(vegetarian).uri;

const japanese = require("../assets/Foods/japanese.png");
const japaneseUri = Image.resolveAssetSource(japanese).uri;

const asian = require("../assets/Foods/asian.png");
const asianUri = Image.resolveAssetSource(asian).uri;

const indian = require("../assets/Foods/indian.png");
const indianUri = Image.resolveAssetSource(indian).uri;

const HomeScreen = (props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  const theme = useTheme();
  let _flatList = useRef(null);

  const [data, setData] = React.useState({
    foodNameArr: [],
    finalResults: [],
    refreshing: false,
    isScrollUpShows: false,
    loading: false,
    restUidIndex: 0,
    tempIndex: [],
    userIcon: "",
    restsImage: [],
    numOfItems: 0,
    restsUidArr: [],
    dateIdList: [],
    tempRestsUidArr: [],
    restsImageList: [],
    isLogin: false,
  });

  const mounted = async () => {
    searchByFood("");
    const { currentUser } = firebase.auth();
  };
  useEffect(() => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      firebase
        .database()
        .ref(`/users/${currentUser.uid}`)
        .once("value", (snap) => {
          if (snap.val() !== undefined) {
            if (
              snap?.val()?.email !== undefined &&
              snap?.val().email !== null
            ) {
              if (snap?.val()?.userPostId === undefined) {
                let uid = snap
                  .val()
                  .email?.slice(0, snap?.val()?.email?.indexOf("@"))
                  .slice(0, 10);
                if (uid !== undefined && uid !== null && uid !== "") {
                  let newUID = uid.concat(uuid().slice(0, 10 - uid.length));
                  firebase
                    .database()
                    .ref(`/users/${currentUser.uid}`)
                    .update({ userPostId: newUID });
                }
              }
            }
          }
        });
    }

    searchByFood("");
    return () => {
      // console.log('unmounting...');
    };
  }, []);

  const getRestLogo = (idx, restaurantUid) => {
    const client = algoliasearch("", "", {
      timeouts: {
        connect: 1,
        read: 1, // The value of the former `timeout` parameter
        write: 30,
      },
    });
    let newIndexList = data.tempIndex;
    if (data.tempIndex.indexOf(idx) === -1) {
      newIndexList.push(idx);
      setData({ ...data, tempIndex: newIndexList });
      let tempRestsImageList = data.restsImageList;
      client
        .initIndex("restsList")
        .search(restaurantUid, {
          attributesToRetrieve: userAttrToRetr,
          hitsPerPage: 1,
          restrictSearchableAttributes: ["restaurantUid", "objectID"],
        })
        .then((responses) => {
          const str = JSON.stringify(responses.hits);
          const object = JSON.parse(str);
          tempRestsImageList.push(object[0].image);

          setData({ ...data, restsImageList: tempRestsImageList });
        });
    }
  };

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
  const orderOnline = (restOrderWeb) => {
    const { currentUser } = firebase.auth();
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
    Linking.openURL(`http://${restOrderWeb}`);
  };
  const searchByFood = (query) => {
    const client = algoliasearch("", "", {
      timeouts: {
        connect: 1,
        read: 1, // The value of the former `timeout` parameter
        write: 30,
      },
    });
    const index = client.initIndex("foodsList");
    const { currentUser } = firebase.auth();
    index
      .search(query, {
        attributesToRetrieve: attrToRetr,
        hitsPerPage: 300,
        typoTolerance: false,
        facetFilters: [
          `isRestActive:${true}`,
          `publish:${true}`,
          `isImageUploaded:${true}`,
        ],
      })
      .then((responses) => {
        const str = JSON.stringify(responses.hits);
        let object = JSON.parse(str);
        shuffle(object);
        firebase.auth().onAuthStateChanged((user) => {
          if (user !== null) {
            firebase
              .database()
              .ref(`/users/${user.uid}`)
              .once("value")
              .then((snapshot) => {
                if (snapshot.val() !== null) {
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
                          userIcon: snapshot.val().image,
                          finalResults: object,
                          refreshing: false,
                          isLogin: false,
                          loading: false,
                          restUidIndex: 1,
                          tempIndex: [],
                          restsImageList: [],
                        });
                      }
                    });
                }
              });
          } else {
            firebase
              .database()
              .ref("/worestsLists/")
              .once("value", (snap) => {
                if (snap.val() !== null) {
                  setData({
                    ...data,
                    finalResults: object,
                    userIcon: "",
                    refreshing: false,
                    loading: false,
                    isLogin: false,
                    restUidIndex: 1,
                    tempIndex: [],
                    restsImageList: [],
                    PrivacyPolicy: snap.val().PrivacyPolicy,
                    TermsConditions: snap.val().TermsConditions,
                  });
                }
              });
          }
        });
      });
  };
  const gotoAccount = (realUserPostId) => {
    props.navigation.navigate("MyAccountScreen", {
      realUserPostId: realUserPostId,
      dateID: Math.floor(Math.random() * 100),
    });
  };
  const _renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 30,
          marginTop: 20,
        }}>
        <Card elevation={10} style={{ width: width * 0.9, borderRadius: 15 }}>
          <View style={{ flexDirection: "row", margin: 15 }}>
            <Card.Content style={{ marginTop: -5, marginLeft: -5 }}>
              <Title style={{ fontSize: 14, fontFamily: "MontserratSemiBold" }}>
                {item.foodInfo.food_name}
              </Title>
              <Paragraph
                style={{
                  fontSize: 12,
                  fontFamily: "Montserrat",
                  marginTop: 0,
                }}>
                {item.restName}
              </Paragraph>
            </Card.Content>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            {item?.userPostId !== undefined ? (
              <TouchableOpacity
                onPress={() => {
                  gotoAccount(item?.realUserPostId);
                }}
                style={{
                  flex: 1,
                  zIndex: 3,
                  marginTop: 10,
                  elevation: 10,
                  marginLeft: -width * 0.5,
                }}>
                <Text
                  style={{
                    color: "white",
                    fontFamily: "MontserratBold",
                    marginLeft: 10,
                    elevation: 10,
                    textShadowColor: "black",
                    textShadowRadius: 5,
                  }}>
                  @{item?.userPostId}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <Card.Cover
              style={{
                resizeMode: "contain",
                width: width * 0.8,
                height: height / 3,
                borderRadius: 25,
                marginTop: item?.userPostId !== undefined ? -35 : 0,
              }}
              source={{ uri: item.foodInfo.image }}
            />
          </View>
          <View
            style={{ flexDirection: "row", marginLeft: 5, marginBottom: 10 }}>
            {item.totalView === 0 ? (
              <View />
            ) : (
              <View
                style={{
                  alignItems: "center",
                  marginLeft: 15,
                  flexDirection: "row",
                  marginTop: 5,
                  marginBottom: -10,
                }}>
                <View>
                  <Button
                    labelStyle={{
                      fontSize: 24,
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
                  marginLeft: 15,
                  flexDirection: "row",
                  marginTop: 5,
                  marginBottom: -10,
                }}>
                <View>
                  <Button
                    labelStyle={{
                      fontSize: 24,
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
                    {item.foodInfo.Rate.qualityRate === 0
                      ? "None"
                      : item.foodInfo.Rate.qualityRate}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={{ marginLeft: 25, marginTop: -5, marginRight: 10 }}>
            {tagSeperator(item.foodInfo.tags)}
          </View>
          <Card.Actions style={{ marginLeft: -10 }}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`http://${item.restWebsite}`);
              }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  marginTop: -5,
                }}>
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
                      fontSize: 12,
                      color: colors.text,
                      marginLeft: -20,
                    }}>
                    Website
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: -5 }}
              onPress={() => {
                goToLocation(item.restAddress);
              }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  marginTop: -5,
                }}>
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
                      fontSize: 12,
                      color: colors.text,
                      marginLeft: -20,
                    }}>
                    Locate
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: -5 }}
              onPress={() => {
                callNow(item.phoneNum);
              }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  marginTop: -5,
                }}>
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
                      fontSize: 12,
                      color: colors.text,
                      marginLeft: -20,
                    }}>
                    Call
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: -5 }}
              onPress={() => {
                orderOnline(item.restOrderWeb);
              }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  marginTop: -5,
                }}>
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
                      fontSize: 12,
                      color: colors.text,
                      marginLeft: -20,
                    }}>
                    Order
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
      </View>
    );
  };

  const callNow = async (phoneNum) => {
    Linking.openURL(`tel:${phoneNum}`);
  };
  const totalViewFunc = (index) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hours = new Date().getHours();
    hrs = year * 1000000 + month * 10000 + day * 100 + hours;

    const emptyList = [];
    const { currentUser } = firebase.auth();
    if (this.props.results[index] !== undefined) {
      if (this.props.results[index].tempChecker !== undefined) {
        const list = Object.values(this.props.results[index].tempChecker.uids);
        if (currentUser !== null) {
          if (list !== undefined) {
            if (this.props.results[index].tempChecker.uids !== undefined) {
              if (
                hrs !== this.props.results[index].tempChecker.hour &&
                list.indexOf(`${currentUser.uid}`) === -1 &&
                currentUser.uid !== this.props.results[index].restaurantUid
              ) {
                firebase
                  .database()
                  .ref(`/food/${this.props.results[index].objectID}`)
                  .update({
                    totalView: this.props.results[index].totalView + 1,
                    tempChecker: {
                      hour: hrs,
                      uids: list.concat(`${currentUser.uid}`),
                    },
                  });
                firebase
                  .database()
                  .ref(`/users/${currentUser.uid}`)
                  .update({ tempHours: hrs });
              }
              if (
                this.props.results[index].tempChecker.hour !== hrs &&
                list.indexOf(`${currentUser.uid}`) !== -1 &&
                currentUser.uid !== this.props.results[index].restaurantUid
              ) {
                firebase
                  .database()
                  .ref(`/food/${this.props.results[index].objectID}`)
                  .update({
                    totalView: this.props.results[index].totalView + 1,
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
  const renderHeader = () => {
    return (
      <View>
        <View style={{ marginTop: 15, marginLeft: 25, marginBottom: 5 }}>
          <Text
            style={{ fontFamily: "Montserrat", fontSize: 16, color: "gray" }}>
            Welcome back!
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginLeft: 25 }}>
          <View>
            <Text
              style={{
                fontFamily: "MontserratBold",
                fontSize: 24,
                color: colors.text,
              }}>
              What are you{" "}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: "MontserratBold",
                fontSize: 24,
                color: "#EE5B64",
              }}>
              craving?{" "}
            </Text>
          </View>
        </View>
        <View
          style={{
            marginLeft: 25,
            marginRight: 25,
            marginTop: 15,
            marginBottom: 15,
          }}>
          <Searchbar
            placeholder="Search anything..."
            onIconPress={() => {
              handleSearch(searchQuery);
            }}
            onChangeText={onChangeSearch}
            value={searchQuery}
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
        <View style={{ height: height / 5 }}>
          <ScrollView
            scrollEventThrottle={1}
            showsHorizontalScrollIndicator={false}
            horizontal
            style={{ flexDirection: "row", marginTop: 5 }}>
            <View style={{ marginLeft: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Mexican");
                  handleSearch("Mexican");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: mexicanUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Mexican
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Italian");
                  handleSearch("Italian");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: italianUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Italian
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Burger");
                  handleSearch("Burger");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: burgerUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Burger
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Vegetarian");
                  handleSearch("Vegetarian");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: vegetarianUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Vegetarian
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Sushi");
                  handleSearch("Sushi");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: sushiUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Sushi
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Persian");
                  handleSearch("Persian");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: persianUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Persian
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Chinese");
                  handleSearch("Chinese");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: chineseUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Chinese
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Steak");
                  handleSearch("Steak");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: steakUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Steak
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Seafood");
                  handleSearch("Seafood");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: seafoodUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Seafood
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Asian");
                  handleSearch("Asian");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: asianUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Asian
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Indian");
                  handleSearch("Indian");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: indianUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Indian
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Thai");
                  handleSearch("Thai");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: thaiUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Thai
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Spanish");
                  handleSearch("Spanish");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: spanishUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Spanish
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 5, marginRight: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  onChangeSearch("Japanese");
                  handleSearch("Japanese");
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}>
                  <View>
                    <Image
                      style={styles.CurrentImage2}
                      source={{ uri: japaneseUri, cache: "force-cache" }}
                    />
                  </View>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ marginTop: 15 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratSemiBold",
                          fontSize: 12,
                          color: colors.text,
                        }}>
                        Japanese
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            marginTop: height / width > 1.5 ? -25 : 5,
            marginLeft: 25,
            marginBottom: 5,
          }}>
          <Text
            style={{
              fontFamily: "MontserratSemiBold",
              fontSize: 16,
              color: colors.text,
            }}>
            Popular Items
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
  const handleSearch = (query) => {
    setData({
      ...data,
      numOfItems: 0,
      finalResults: [],
      restUidIndex: 0,
    });
    searchByFood(query);
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
    searchByFood("");
    // }
    // );
  };

  const handleLoadMore = () => {
    setData({
      ...data,
      loading: true,
    });
  };

  const renderEmpty = () => {
    return <View style={{ flex: 1 }} />;
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

  const tagSeperator = (tags) => {
    if (tags !== null && tags !== undefined) {
      const tagsArr = tags.split(",");
      return (
        <Tags
          initialTags={tagsArr}
          containerStyle={{ justifyContent: "flex-start" }}
          inputContainerStyle={{ height: 0, width: 0 }}
          renderTag={({ tag, index }) => (
            <View
              key={`${tag}-${index}`}
              style={{
                marginLeft: 0,
                marginTop: -5,
                marginRight: 2,
                marginBottom: 0,
                borderRadius: 10,
                height: tag.length > width / 10.5 ? 50 : 30,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Text
                style={{
                  fontFamily: "Montserrat",
                  fontSize: 14,
                  marginLeft: 1,
                  marginRight: 1,
                }}>
                {index === 0 ? null : "•"}
                {tag}
              </Text>
            </View>
          )}
        />
      );
    }
  };

  const checkAddPic = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      props.navigation.navigate("FindRestaurant");
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  const isLoginYet = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken !== null) {
      props.navigation.openDrawer();
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={{ width, height: 56, justifyContent: "center" }}>
          <View
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 0 }}
              onPress={() => {
                isLoginYet();
              }}>
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
              }}>
              TroFii
            </Text>
            <View
              style={{
                flex: 1,
                marginLeft: height / width > 1.5 ? width * 0.25 : width * 0.375,
                marginRight: 10,
                marginTop: 3,
              }}>
              <Image
                style={{
                  resizeMode: "contain",
                  width: 47,
                  height: 47,
                  borderRadius: 5,
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
        <View style={{ flex: 1, marginTop: 0 }}>
          <FlatList
            ref={(flatList) => {
              _flatList = flatList;
            }}
            data={data.finalResults}
            extraData={data.finalResults}
            initialNumToRender={10}
            keyExtractor={(item) => item?.dateId?.toString()}
            renderItem={_renderItem.bind(this)}
            ListHeaderComponent={renderHeader()}
            ListFooterComponentStyle={{ width, height: 50 }}
            onEndReachedThreshold={0.5}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            onScroll={(event) => {
              if (event.nativeEvent.contentOffset.y > 600) {
                setData({ ...data, isScrollUpShows: true });
              }
              if (event.nativeEvent.contentOffset.y === 0) {
                setData({ ...data, isScrollUpShows: false });
              }
            }}
          />
        </View>
        {data.isScrollUpShows ? (
          <Button
            style={styles.scrollTop}
            underlayColor="red"
            color="transparent"
            contentStyle={{ borderRadius: 20 }}
            labelStyle={{
              fontSize: 15,
              fontFamily: "MontserratSemiBold",
              color: "white",
              marginLeft: 15,
              marginBottom: 10,
            }}
            small={false}
            uppercase={false}
            onPress={() => {
              _flatList.scrollToOffset({ offset: 0, animated: true });
              setTimeout(() => {
                setData({ ...data, isScrollUpShows: false });
              }, 1);
            }}>
            <Text>Back to top</Text>
          </Button>
        ) : null}
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
                setData({ ...data, isLogin: false });
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
                  <Text style={styles.buttonText2}>Sign In</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            <View style={styles.button}>
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
            <View style={styles.button}>
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
              <View style={styles.button}>
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
      </View>
    </SafeAreaView>
  );
};

export default connect(null, actions)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    backgroundColor: "#C90611",
    fontSize: 50,
    color: "black",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  scrollTop: {
    position: "absolute",
    backgroundColor: "gray",
    borderRadius: 20,
    fontSize: 50,
    color: "white",
    marginLeft: 0,
    right: height / width > 1.5 ? width * 0.33 : width * 0.42,
    bottom: height - 190,
  },
  CurrentImage2: {
    width: catWidth,
    height: catHeight,
    resizeMode: "contain",
    borderRadius: 5,
    justifyContent: "flex-end",
    alignItems: "flex-end",
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
  buttonText2: {
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
});
