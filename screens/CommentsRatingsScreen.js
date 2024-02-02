import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Keyboard,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Avatar,
  Button,
  Card,
  DefaultTheme,
  Caption,
  Text,
} from "react-native-paper";
import { Rating, Header, Input, AirbnbRating } from "react-native-elements";
import algoliasearch from "algoliasearch";
import update from "immutability-helper";
import Tags from "react-native-tags";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

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

const CommentsRatingsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const onChangeSearch = (query) => setSearchQuery(query);
  const theme = useTheme();
  let _flatList = useRef(null);
  const [data, setData] = useState({
    commentsList: [],
    isCommentEditList: [],
    uid: "",
    isLiked: true,
  });
  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 100);
    return () => {};
  }, [route?.params?.cameFromDate]);
  const getData = () => {
    const { currentUser } = firebase.auth();
    let arrBool = [];
    if (currentUser !== null) {
      firebase
        .database()
        .ref(`/users/${currentUser.uid}`)
        .once("value", (snapshot) => {
          if (
            snapshot.val() !== null &&
            snapshot.val()?.comments !== undefined
          ) {
            const arr = Object.keys(snapshot.val().comments)
              .map((key) => {
                return snapshot.val().comments[key];
              })
              .sort((a, b) => {
                return b.dateComment - a.dateComment;
              });

            for (let i = 0; i < arr.length; i++) {
              arrBool = arrBool.concat({ isCommentEdit: true });
            }
            setData({
              ...data,
              uid: currentUser.uid,
              commentsList: arr,
              isCommentEditList: arrBool,
            });
          }
        });
    }
  };
  const calcNow = (CreateAt) => {
    const minutes = Number(CreateAt.substring(10, 12));
    const hours = Number(CreateAt.substring(8, 10));
    const day = Number(CreateAt.substring(6, 8));
    const year = Number(CreateAt.substring(0, 4));
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
  };

  const tagSeperator = (tags) => {
    if (tags !== undefined) {
      const tagsArr = tags.split(",");
      return (
        <Tags
          initialTags={tagsArr}
          containerStyle={{ justifyContent: "flex-start" }}
          inputContainerStyle={{ height: 0, width: 0 }}
          renderTag={({ tag, index }) => {
            if (index === 0) {
              return (
                <View key={`${tag}-${index}`}>
                  <Text style={styles.titleStyle3}>{tag}</Text>
                </View>
              );
            }
          }}
        />
      );
    }
  };
  const changeIsCommentEditList = (idx) => {
    const newItem = data.isCommentEditList;
    const newIsCommentEdit = update(data.isCommentEditList[idx], {
      isCommentEdit: { $set: false },
    });
    newItem[idx] = newIsCommentEdit;
    setData({ ...data, isCommentEditList: newItem });
  };
  const endIsCommentEditList = (idx) => {
    getData();
    const newItem = data.isCommentEditList;
    const newIsCommentEdit = update(data.isCommentEditList[idx], {
      isCommentEdit: { $set: true },
    });
    newItem[idx] = newIsCommentEdit;
    setData({ ...data, isCommentEditList: newItem });
  };
  const updateNow = (idx) => {
    const { currentUser } = firebase.auth();
    firebase
      .database()
      .ref(`/food/${data.commentsList[idx].itemID}`)
      .once("value", (snap) => {
        if (snap.val().comments !== undefined) {
          const arr = Object.keys(snap.val().comments).map((key) => {
            return snap.val().comments[key];
          });
          const keys = Object.keys(snap.val().comments).map((key) => {
            return key;
          });
          arr.forEach((data1) => {
            if (data1.Uid === currentUser.uid) {
              firebase
                .database()
                .ref(
                  `/food/${data.commentsList[idx].itemID}/comments/${keys[idx]}`
                )
                .update({ comment: data.commentsList[idx].comment });

              firebase
                .database()
                .ref(`/users/${currentUser.uid}/comments/${data1.key}`)
                .update({ comment: data.commentsList[idx].comment });
            }
          });
          endIsCommentEditList(idx);
        }
      });
  };
  const CommentEditFunc = (comment, idx) => {
    const newItem = data.commentsList;
    const newComment = update(data.commentsList[idx], {
      comment: { $set: comment },
    });
    newItem[idx] = newComment;
    setData({ ...data, commentsList: newItem });
  };
  const _renderItem = ({ item, index }) => {
    return (
      <Card
        style={{
          flex: 1,
          width: width * 0.95,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          borderRadius: 15,
          elevation: 5,
          marginLeft: 10,
          marginBottom: 10,
        }}>
        <View
          style={{
            alignItems: "flex-start",
            borderRadius: 10,
            justifyContent: "flex-start",
            marginTop: 10,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              marginLeft: 25,
              flexDirection: "row",
              borderRadius: 5,
            }}>
            <View style={{ height: 60, width: 60 }}>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 5,
                  marginLeft: -5,
                  position: "absolute",
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  backgroundColor: "#e6e6e6",
                  zIndex: 0,
                }}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "center",
                  marginTop: 10,
                  zIndex: 1,
                }}>
                <Avatar.Image
                  size={50}
                  theme={styles.theme}
                  source={{ uri: item.restLogo }}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", width: width * 0.7 }}>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginLeft: 5,
                  marginTop: 5,
                }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "flex-start",
                    marginBottom: 0,
                  }}>
                  <Text style={styles.titleStyle1}>{item.restName}</Text>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "flex-start",
                    marginBottom: 0,
                  }}>
                  <Caption style={styles.titleStyle}>
                    {item.restAddress}
                  </Caption>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "flex-start",
                    marginBottom: 5,
                  }}>
                  <Text style={styles.time}>
                    {calcNow(item.dateComment.toString())}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
              marginBottom: 15,
              marginLeft: 25,
            }}>
            <Image
              style={styles.CurrentImage2}
              source={{ uri: item.foodPic, cache: "force-cache" }}
            />
          </View>
          <View
            style={{
              width: width * 0.9,
              justifyContent: "space-evenly",
              alignItems: "flex-start",
              marginBottom: 10,
              marginLeft: 30,
              flexDirection: "row",
            }}>
            <Text style={styles.titleStyle5}>{item.food_name}</Text>
            <View style={{ flex: 1, flexDirection: "row", marginLeft: 5 }}>
              {item.restDesc !== "" ? (
                <Icon name="silverware-fork-knife" size={20} />
              ) : (
                <View />
              )}
              {tagSeperator(item.restDesc)}
            </View>
          </View>
          <View style={{ flexDirection: "row", marginLeft: 30, marginTop: -5 }}>
            <Caption style={styles.titleStyle4}>Your Rating:</Caption>
            <Rating
              readonly
              fractions={2}
              showRating={false}
              ratingCount={5}
              imageSize={21}
              startingValue={item.Quality_Rate}
              style={{ margin: 5, marginTop: 2 }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              changeIsCommentEditList(index);
            }}>
            <View
              style={{
                flexDirection: "row",
                marginLeft: 30,
                marginBottom: 0,
                marginTop: 5,
              }}>
              <Icon name="comment-text" size={20} />
              {/* <Text style={styles.titleStyle6}>
                                "{item.comment}"
                            </Text> */}
              <View style={{ felx: 1 }}>
                <Input
                  containerStyle={{ width: width * 0.75, marginTop: -10 }}
                  inputStyle={styles.titleStyle6}
                  returnKeyType={"done"}
                  autoCorrect={false}
                  maxLength={100}
                  disabled={data?.isCommentEditList[index]?.isCommentEdit}
                  // onEndEditing={() => {endIsCommentEditList(index)}}
                  // multiline
                  onEndEditing={() => {
                    Keyboard.dismiss();
                  }}
                  value={item.comment}
                  onChangeText={(onChangeText) => {
                    CommentEditFunc(onChangeText, index);
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
          {!data?.isCommentEditList[index]?.isCommentEdit ? (
            <View
              style={{
                flexDirection: "row",
                marginLeft: width * 0.35,
                marginTop: -10,
                marginBottom: 10,
              }}>
              <Button
                onPress={() => {
                  endIsCommentEditList(index);
                }}
                mode="contained"
                uppercase={false}
                style={{ backgroundColor: "white", margin: 10 }}
                labelStyle={{
                  fontSize: 14,
                  fontFamily: "MontserratSemiBold",
                  color: colors.text,
                  marginLeft: 10,
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}>
                Cancel
              </Button>
              <Button
                onPress={() => {
                  updateNow(index);
                }}
                mode="contained"
                uppercase={false}
                style={{ backgroundColor: "white", margin: 10 }}
                labelStyle={{
                  fontSize: 14,
                  fontFamily: "MontserratSemiBold",
                  color: colors.text,
                  marginLeft: 10,
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}>
                Update
              </Button>
            </View>
          ) : null}
        </View>
      </Card>
    );
  };
  const renderEmpty = () => {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Image
          style={{
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            width,
            height: height - 150,
          }}
          source={require("../assets/nocomments.png")}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, marginTop: Platform.OS === "ios" ? -10 : 0 }}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
        <View
          style={{
            height: 55,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}>
          <TouchableOpacity
            style={{ marginLeft: 0 }}
            onPress={() => {
              navigation.openDrawer();
            }}>
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
          <Text style={styles.titleStyle7}>Comments & Ratings</Text>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            elevation: 1,
          }}
        />
        <FlatList
          ref={(flatList) => {
            _flatList = flatList;
          }}
          data={data.commentsList}
          initialNumToRender={10}
          keyExtractor={(item) => item.dateComment.toString()}
          renderItem={_renderItem.bind(this)}
          onEndReachedThreshold={0.5}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          ListEmptyComponent={renderEmpty.bind(this)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = {
  input: {
    flex: 1,
    width,
    marginTop: -30,
    color: "black",
    textDecorationColor: "black",
    paddingTop: 7,
  },
  CurrentImage2: {
    width: width * 0.85,
    height: height * 0.2,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  linearGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    width: width * 0.65,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  TopImage: {
    flex: 1,
    zIndex: 1,
    alignSelf: "stretch",
    backgroundColor: "white",
    width,
    height,
  },
  theme: {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: "white",
      accent: "white",
    },
  },
  textStyle: {
    fontSize: 17,
    alignItems: "center",
    justifyContent: "center",
    color: "black",
    marginLeft: -25,
  },
  catNumStyle: {
    fontSize: 12,
    fontFamily: "Montserrat",
    width: width * 0.5,
  },
  titleStyle7: {
    flex: 1,
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
    marginLeft: height / width > 1.5 ? width * 0.17 : width * 0.35,
    justifyContent: "center",
  },
  titleStyle6: {
    fontFamily: "Montserrat",
    fontSize: 14,
    marginLeft: 0,
    marginBottom: 0,
    width: width * 0.75,
  },
  titleStyle: {
    fontFamily: "MontserratSemiBold",
    fontSize: 10,
    width: width * 0.7,
    lineHeight: 11,
  },
  time: {
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
    width: width * 0.7,
  },
  titleStyle5: {
    fontFamily: "MontserratSemiBold",
    fontSize: 16,
    width: width * 0.6,
  },
  titleStyle1: {
    fontFamily: "MontserratBold",
    fontSize: 15,
    width: width * 0.7,
  },
  titleStyle4: {
    fontFamily: "MontserratSemiBold",
    fontSize: 12,
  },
  titleStyle2: {
    fontFamily: "MontserratBold",
    fontSize: 15,
    width: width * 0.6,
  },
  buttonStyle: {
    color: "white",
    fontSize: 30,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  titleStyle3: {
    fontFamily: "MontserratSemiBold",
    fontSize: 11,
    width: width * 0.17,
    marginLeft: 5,
  },
  numStyle: {
    fontSize: 18,
    marginLeft: 2,
    marginTop: 7,
  },
  descStyle: {
    fontSize: 16,
    marginLeft: 2,
    marginTop: 7,
    color: "#0c1355",
  },
};
export default CommentsRatingsScreen;
