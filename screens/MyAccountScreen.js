import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Alert,
  Keyboard,
  Animated,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  Searchbar,
  DefaultTheme,
  Caption,
  Text,
} from "react-native-paper";
// import * as Permissions from 'expo-permissions';
import { Rating, Header, Input } from "react-native-elements";
import algoliasearch from "algoliasearch";
import * as actions from "../actions";
import { connect } from "react-redux";
// import * as firebase from 'firebase';
import update from "immutability-helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tags from "react-native-tags";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  SharedElement,
  SharedElementTransition,
  nodeFromRef,
} from "react-native-shared-element";
// import {SharedElement} from 'react-native-shared-element';
import TouchableScale from "react-native-touchable-scale";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const position = new Animated.Value(0);

let startAncestor;
let startNode;
let endAncestor;
let endNode;

const MyAccountScreen = (props) => {
  const { colors } = useTheme();
  const onChangeSearch = (query) => setSearchQuery(query);
  const theme = useTheme();
  let _flatList = useRef(null);
  const [data, setData] = React.useState({
    uid: "",
    email: "",
    image: "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea",
    CreatedDate: "",
    createAt: 0,
    firstname: "",
    lastname: "",
    egiftEarned: 0,
    followerNum: 0,
    followingNum: 0,
    points: 0,
    followers: 0,
    following: 0,
    restFollowing: 0,
    TermsConditions: "",
    PrivacyPolicy: "",
    accountUid: "",
    isLogin: false,
    isOwn: false,
    isFollow: false,
    followersList: { 0: "_" },
    followingList: { 0: "_" },
    myPhotos: [],
  });
  useEffect(() => {
    setTimeout(() => {
      const { currentUser } = firebase.auth();
      const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
      if (currentUser !== null) {
        firebase
          .database()
          .ref(`/userImage/${currentUser.uid}`)
          .once("value", (snap) => {
            if (snap.val() !== null) {
              userRef.once("value", (snapshot) => {
                if (snapshot.val() !== null) {
                  // 	snap.forEach((snapshot) => {
                  //     if (snapshot !== null) {
                  //     	this.setState({ imagesList: this.state.imagesList.concat(snapshot.val()) });
                  //           	this.setState({ imagesList: this.state.imagesList.sort((a, b) => { return (b.dateID) - (a.dateID); }) });
                  //   			// this.setState({ imagesList: this.state.imagesList.reverse() });
                  //     }
                  // });
                  let arr = Object.keys(snap.val())
                    .map((key) => {
                      return snap.val()[key];
                    })
                    .sort((a, b) => {
                      return b.dateID - a.dateID;
                    });
                  let newArr = [];
                  firebase
                    .database()
                    .ref("/userNonRestImage/")
                    .once("value", (snap2) => {
                      if (snap2.val() !== null) {
                        snap2.forEach((data1) => {
                          newArr = Object.keys(data1.val()).map((key) => {
                            return data1.val()[key];
                          });
                          newArr = arr.concat(newArr).sort((a, b) => {
                            return b.dateID - a.dateID;
                          });
                          setTimeout(() => {
                            if (currentUser.uid === snapshot.key) {
                              setData({
                                ...data,
                                uid: currentUser.uid,
                                accountUid: snapshot.key,
                                isOwn: true,
                                myPhotos: newArr,
                                CreatedDate: calcSince(
                                  snapshot?.val().createdAt?.toString()
                                ),
                                email: snapshot.val().email,
                                image: snapshot.val().image,
                                isLogin: true,
                                createAt: snapshot.val().createAt,
                                firstname: snapshot.val().firstname,
                                lastname: snapshot.val().lastname,
                                followerNum: snapshot?.val()?.followerNum,
                                followingNum: snapshot?.val()?.followingNum,
                                restFollowing:
                                  snapshot.val().restsList.length - 1,
                                // followers: snapshot?.val().followersList?.length,
                                // following: snapshot?.val()?.followingList.length - 1,
                                followersList: snapshot?.val()?.followersList,
                                followingList: snapshot?.val()?.followingList,
                              });
                            } else {
                              setData({
                                ...data,
                                uid: currentUser.uid,
                                accountUid: snapshot.key,
                                isOwn: false,
                                myPhotos: newArr,
                                CreatedDate: calcSince(
                                  snapshot?.val().createdAt?.toString()
                                ),
                                email: snapshot.val().email,
                                image: snapshot.val().image,
                                isLogin: true,
                                createAt: snapshot.val().createAt,
                                firstname: snapshot.val().firstname,
                                lastname: snapshot.val().lastname,
                                restFollowing:
                                  snapshot.val().restsList.length - 1,
                                // followers: snapshot?.val().followersList?.length,
                                // following: snapshot?.val()?.followingList.length - 1,
                                followersList: snapshot?.val()?.followersList,
                                followingList: snapshot?.val()?.followingList,
                              });
                            }
                          }, 10);
                        });
                      }
                    });
                  // const arr = Object.keys(snap.val()).map((key) => {
                  //     return (snap.val()[key]);
                  // })
                  // setData({ ...data,
                  //     uid: currentUser.uid,
                  //     myPhotos: arr
                  // });
                  // console.log(snapshot?.val()?.followingList)
                }
              });
            } else {
              userRef.once("value", (snapshot) => {
                if (snapshot.val() !== null) {
                  setData({
                    ...data,
                    uid: currentUser.uid,
                    accountUid: snapshot.key,
                    isOwn: true,
                    CreatedDate: calcSince(
                      snapshot?.val().createdAt?.toString()
                    ),
                    email: snapshot.val().email,
                    image: snapshot.val().image,
                    isLogin: true,
                    createAt: snapshot.val().createAt,
                    firstname: snapshot.val().firstname,
                    lastname: snapshot.val().lastname,
                    restFollowing: snapshot.val().restsList.length - 1,
                    // followers: snapshot?.val().followersList?.length,
                    // following: snapshot?.val()?.followingList.length - 1,
                    followersList: snapshot?.val()?.followersList,
                    followingList: snapshot?.val()?.followingList,
                  });
                }
              });
            }
          });
      } else {
        setTimeout(() => {
          setData({
            ...data,
            isLogin: false,
          });
        }, 10);
      }
    }, 5000);
    return () => {};
  }, [props?.route?.params?.dateID]);

  const calcSince = (CreateAt) => {
  if (CreateAt !== undefined) {
      const day = Number(CreateAt.substring(6));
      const year = Number(CreateAt.substring(0, 4));
      if (CreateAt.substring(4, 6) === "01") {
        return `Jan ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "02") {
        return `Feb ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "03") {
        return `Mar ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "04") {
        return `Apr ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "05") {
        return `May ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "06") {
        return `Jun ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "07") {
        return `Jul ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "08") {
        return `Aug ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "09") {
        return `Sep ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "10") {
        return `Oct ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "11") {
        return `Nov ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "12") {
        return `Dec ${day}, ${year}`;
      }
    }
  };
  const calcTime = (CreateAt) => {
  if (CreateAt !== undefined) {
      const minutes = Number(CreateAt.substring(10, 12));
      const hours = Number(CreateAt.substring(8, 10));

      if (CreateAt.substring(4, 6) === "01") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "02") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "03") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "04") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "05") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "06") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "07") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "08") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "09") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "10") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "11") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
      if (CreateAt.substring(4, 6) === "12") {
        return `${hours > 12 ? hours - 12 : hours}:${
          minutes < 10 ? `0${minutes}` : minutes
        } ${hours > 12 ? "PM" : "AM"}`;
      }
    }
  };
  const calcDate = (CreateAt) => {
    if (CreateAt !== undefined) {
      const day = Number(CreateAt.substring(6, 8));
      const year = Number(CreateAt.substring(0, 4));
      // console.log(CreateAt)
      if (CreateAt.substring(4, 6) === "01") {
        return `Jan ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "02") {
        return `Feb ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "03") {
        return `Mar ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "04") {
        return `Apr ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "05") {
        return `May ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "06") {
        return `Jun ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "07") {
        return `Jul ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "08") {
        return `Aug ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "09") {
        return `Sep ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "10") {
        return `Oct ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "11") {
        return `Nov ${day}, ${year}`;
      }
      if (CreateAt.substring(4, 6) === "12") {
        return `Dec ${day}, ${year}`;
      }
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

  const _renderItem = ({ item, index }) => {
    // getRestLogo(index, item.restaurantUid);
    // console.log(item)
    return (
      <View
        style={{
          marginTop:
            index % 3 === 0
              ? 0
              : index % 3 === 1
              ? -width * 0.62 + 22
              : -width * 0.62 + 22,
          marginLeft:
            index % 3 === 0
              ? 10
              : index % 3 === 1
              ? width * 0.3 + 20
              : width * 0.6 + 30,
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <View>
          <Caption style={styles.titleStyle3}>
            {calcDate(item?.dateID?.toString())}
          </Caption>
          <Card
            elevation={10}
            style={{
              width: width * 0.3,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 15,
              elevation: 3,
              marginBottom: 10,
            }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Card.Cover
                style={{
                  width: width * 0.3,
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                  height: width * 0.3,
                }}
                source={{ uri: item.takenPicture }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 5,
                height: width * 0.15,
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "flex-start",
                  marginBottom: 10,
                  marginLeft: 10,
                  marginTop: 15,
                }}
              >
                <Text style={styles.titleStyle1}>{item.food_name}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 1,
                    marginBottom: 0,
                  }}
                >
                  <Caption style={styles.titleStyle4}>{item.foodType}</Caption>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 5,
                    }}
                  >
                    <View>
                      {
                        item.ingredients === undefined ?
                        <Image
                          style={{ width: 10, height: 10 }}
                          source={
                            item.isApproved === true && item.isViewed === true
                              ? require("../assets/icons/approve.png")
                              : item.isApproved === false &&
                                item.isViewed === true
                              ? require("../assets/icons/deny.png")
                              : require("../assets/icons/pending.png")
                          }
                        /> : 
                        <View />
                      }
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </View>
    );
  };
  const renderEmpty = () => {
    return (
      <View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            style={{
              resizeMode: "contain",
              backgroundColor: "#ffffff",
              width,
              height: height - 85,
            }}
            source={require("../assets/NoPictureYet.png")}
          />
        </View>
      </View>
    );
  };
  const renderHeader = () => {
    return (
      <View>
        <View
          style={{
            flexDirection: "column",
            marginTop: 15,
            marginLeft: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginLeft: 10,
              justifyContent: "space-evenly",
              marginRight: 30,
            }}
          >
            <Avatar.Image
              source={{
                uri: data.image,
              }}
              size={75}
              style={{ marginTop: 15 }}
            />
            <View
              style={{
                marginLeft: 20,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.title2}>{data.myPhotos.length}</Text>
                <Text style={styles.title1}>Posts</Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 15,
                }}
              >
                <Text style={styles.title2}>{data?.followerNum}</Text>
                <Text style={styles.title1}>Followers</Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 15,
                }}
              >
                <Text style={styles.title2}>{data?.followingNum}</Text>
                <Text style={styles.title1}>Following</Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 15,
                  marginTop: 20,
                }}
              >
                <Text style={styles.title2}>{data.restFollowing}</Text>
                <Text style={styles.title1}>Restaurant</Text>
                <Text style={styles.title1}>Following</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{ marginLeft: 5, flexDirection: "column", marginTop: 5 }}
            >
              <Text style={styles.title}>
                {data.firstname} {data.lastname}
              </Text>
              <Text style={[styles.paragraph, styles.caption2]}>
                Joined {data.CreatedDate}
              </Text>
            </View>
            {!data.isOwn ? (
              <View>
                {data.isFollow ? (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      followingFunc();
                    }}
                    uppercase={false}
                    color={"gray"}
                    style={{
                      height: 40,
                      marginLeft: 40,
                      marginTop: 15,
                      width: 170,
                    }}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      followingFunc();
                    }}
                    uppercase={false}
                    color={"#C90611"}
                    style={{
                      height: 40,
                      marginLeft: 40,
                      marginTop: 15,
                      width: 170,
                    }}
                  >
                    Follow
                  </Button>
                )}
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
      </View>
    );
  };
  const followingFunc = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      const accountListRef = firebase
        .database()
        .ref(`/users/${data.accountUid}`);
      const userRef = firebase.database().ref(`/users/${data.uid}`);
      let ListOfFollowers = [];
      let ListOfFollowing = [];
      userRef.once("value", (snapFirst) => {
        if (data.isFollow === false) {
          // if not following this page yet
          accountListRef.once("value", (snapshot) => {
            if (
              snapshot !== null &&
              snapFirst?.val()?.followersList !== undefined &&
              snapFirst?.val()?.followersList !== null
            ) {
              if (
                snapshot !== null &&
                snapFirst?.val()?.followingList !== undefined &&
                snapFirst?.val()?.followingList !== null
              ) {
                ListOfFollowers = snapshot?.val()?.followersList;
                ListOfFollowing = snapFirst?.val()?.followingList;
                ListOfFollowers.push(data.uid);
                ListOfFollowing.push(data.accountUid);
                accountListRef.update({
                  followersList: ListOfFollowers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  followingList: ListOfFollowing,
                  followingNum: snapFirst?.val()?.followingNum + 1,
                });
                return setData({
                  ...data,
                  isFollow: true,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
              } else {
                ListOfFollowers = snapshot?.val()?.followersList;
                ListOfFollowers.push(data.uid);
                ListOfFollowing.push(data.accountUid);
                accountListRef.update({
                  followersList: ListOfFollowers,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
                userRef.update({
                  followingList: ListOfFollowing,
                  followingNum: snapFirst?.val()?.followingNum + 1,
                });
                return setData({
                  ...data,
                  isFollow: true,
                  followerNum: snapshot?.val()?.followerNum + 1,
                });
              }
            } else {
              ListOfFollowers.push(data.uid);
              ListOfFollowing.push(data.accountUid);
              accountListRef.update({
                followersList: ListOfFollowers,
                followerNum: snapshot?.val()?.followerNum + 1,
              });
              userRef.update({
                followingList: ListOfFollowing,
                followingNum: snapFirst?.val()?.followingNum + 1,
              });
              return setData({
                ...data,
                isFollow: true,
                followerNum: snapshot?.val()?.followerNum + 1,
              });
            }
          });
        }
        if (data.isFollow === true) {
          accountListRef.once("value", (snapshot) => {
            if (snapshot !== null) {
              ListOfFollowers = snapshot?.val()?.followersList;
              ListOfFollowing = snapFirst?.val()?.followingList;

              const idxOfListOfFollowers = ListOfFollowers.indexOf(
                `${data.uid}`
              );
              const idxOfListOfFollowing = ListOfFollowing.indexOf(
                `${data.accountUid}`
              );

              ListOfFollowers.splice(idxOfListOfFollowers, 1);
              ListOfFollowing.splice(idxOfListOfFollowing, 1);

              accountListRef.update({
                followersList: ListOfFollowers,
                followerNum: snapshot?.val()?.followerNum - 1,
              });
              userRef.update({
                followingList: ListOfFollowing,
                followingNum: snapFirst?.val()?.followingNum - 1,
              });
              return setData({
                ...data,
                isFollow: false,
                followerNum: snapshot?.val()?.followerNum - 1,
              });
            }
          });
        }
      });
    } else {
      setData({ ...data, isLogin: true });
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>  */}
      <View
        style={{
          marginTop: Platform.OS === "ios" ? -10 : 0,
          height: 55,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <TouchableOpacity
          style={{ marginLeft: 0 }}
          onPress={() => {
            props.navigation.openDrawer();
          }}
        >
          <Image
            style={{
              flex: 1,
              marginLeft: 10,
              width: 50,
              height: 5,
              marginTop: 5,
            }}
            source={require("../assets/icons/menu.png")}
            fadeDuration={100}
          />
        </TouchableOpacity>
        <Text style={styles.titleStyle7}>My Account</Text>
      </View>
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          elevation: 1,
        }}
      />
      <View style={{ backgroundColor: "white", flex: 1, marginBottom: 0 }}>
        <FlatList
          // ref={this.props.scrollRef}
          ref={(flatList) => {
            _flatList = flatList;
          }}
          data={data.myPhotos}
          extraData={data.myPhotos}
          initialNumToRender={12}
          keyExtractor={(item) => item?.dateID?.toString()}
          renderItem={_renderItem.bind(this)}
          ListHeaderComponent={renderHeader()}
          // ListFooterComponent={renderFooter}
          // ListFooterComponentStyle={{ width, height: 50 }}
          // refreshing={data.refreshing}
          // onRefresh={handleRefresh}
          // onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          // ListEmptyComponent={renderEmpty.bind(this)}
          // shouldItemUpdate={_shouldItemUpdate.bind(this)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = {
  titleStyle7: {
    flex: 1,
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
    marginLeft: height / width > 1.5 ? width * 0.3 - 25 : width * 0.4 - 25,
    justifyContent: "center",
  },
  titleStyle3: {
    fontFamily: "Montserrat",
    fontSize: 10,
    marginTop: 10,
    marginBottom: 0,
    marginLeft: 5,
    justifyContent: "flex-start",
    //   width: width * 0.70
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle4: {
    fontFamily: "Montserrat",
    fontSize: 10,
    marginTop: 0,
    justifyContent: "flex-start",
    //   width: width * 0.70
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle2: {
    fontFamily: "MontserratSemiBold",
    fontSize: 10,
    width: width * 0.29,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle5: {
    fontFamily: "MontserratSemiBold",
    fontSize: 15,
    // width: width * 0.8,
    marginLeft: 20,
    marginBottom: 20,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle6: {
    fontFamily: "Montserrat",
    fontSize: 14,
    // width: width * 0.8,
    marginLeft: 5,
    marginTop: 2,
    marginBottom: 20,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  titleStyle1: {
    fontFamily: "MontserratSemiBold",
    fontSize: 10,
    width: width * 0.27,
    // fontWeight: 'bold',
    // textShadowRadius: 5,
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    // textShadowOffset: { width: -1, height: 1 }
  },
  title: {
    fontSize: 20,
    marginTop: 3,
    fontFamily: "MontserratSemiBold",
  },
  title1: {
    fontSize: 10,
    justifyContent: "center",
    marginTop: 3,
    fontFamily: "Montserrat",
    //   marginLeft: 20
  },
  title2: {
    fontSize: 15,
    justifyContent: "center",
    marginTop: 3,
    fontFamily: "MontserratSemiBold",
    //   marginLeft: 10
  },
  title3: {
    fontSize: 12,
    marginTop: 3,
    fontFamily: "Montserrat",
    marginLeft: 10,
  },
};

export default connect(null, actions)(MyAccountScreen);
