import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableHighlight,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckBox } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import { Card, DefaultTheme, Caption, Text } from "react-native-paper";
import Carousel from "react-native-snap-carousel-v4";
import update from "immutability-helper";
import algoliasearch from "algoliasearch";
import Modal from "react-native-modal";
// import * as firebase from 'firebase';
import Tags from "react-native-tags";

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

const MyUploadedTroFiiScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const onChangeSearch = (query) => setSearchQuery(query);
  const theme = useTheme();
  let _flatList = useRef(null);
  const [isFoodTypeChange, setIsFoodTypeChange] = React.useState(false);
  const [foodType, setFoodType] = React.useState("Entree");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentObjectID, setcurrentObjectID] = React.useState("");
  const [data, setData] = useState({
    restsList: [],
    myFavRestList: [],
    uidArr: [],
    objectIDs: [],
    myFavRestList: [],
    uid: "",
    userImage: "",
    isLiked: true,
  });
  useEffect(() => {
    setTimeout(() => {
      let objectIDs = [];
      let myFavRestList = [];
      const { currentUser } = firebase.auth();
      if (currentUser !== null) {
        firebase
          .database()
          .ref(`/users/${currentUser.uid}`)
          .once("value", (snap) => {
            if (snap.val()?.restsList !== undefined) {
              snap.val().restsList.forEach((snapshot) => {
                if (snapshot !== 0) {
                  firebase
                    .database()
                    .ref("/userNonRestImage/")
                    .once("value", (snap2) => {
                      if (snap2.val() !== null) {
                        snap2.forEach((data1) => {
                          const arr = Object.keys(data1.val()).map((key) => {
                            return data1.val()[key];
                          });
                          const uidArr = Object.keys(data1.val()).map((key) => {
                            return key;
                          });
                          setData({
                            ...data,
                            userImage: snap.val().image,
                            uid: currentUser.uid,
                            uidArr,
                            myFavRestList: arr,
                          });
                        });
                      }
                    });
                }
              });
            }
          });
      }
    }, 10);
    return () => {};
  }, [route?.params?.dateID]);

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
                marginTop: -12,
                marginRight: 0,
                marginBottom: 0,
                borderRadius: 10,
                height: tag.length > width / 10.5 ? 50 : 30,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Caption
                style={{
                  fontFamily: "MontserratSemiBold",
                  fontSize: 12,
                  marginLeft: 1,
                  marginRight: 1,
                }}>
                {index === 0 ? null : "•"}
                {tag}
              </Caption>
            </View>
          )}
        />
      );
    }
  };

  const followingFunc = (restName, restaurantUid, index) => {
    const { currentUser } = firebase.auth();
    let userRef;
    let restFollowersList = [];
    let idxOfFollowerList = 0;
    let RestNumFollowers = 0;
    let listTemp = data.myFavRestList;
    let tempObjectIDs = data.objectIDs;

    const restListRef = firebase
      .database()
      .ref(`/restsList/${data.objectIDs[index]}`);
    const restRef = firebase.database().ref(`/users/${restaurantUid}`);

    if (currentUser !== null) {
      userRef = firebase.database().ref(`/users/${currentUser.uid}`);

      Alert.alert(
        "Deletion Alert!",
        `Are you sure you want to delete ${restName} from your favorite restaurants' list? `,
        [
          { text: "No", onPress: () => {}, style: "cancel" },
          {
            text: "Yes",
            onPress: () => {
              restRef.once("value", (snap) => {
                restFollowersList = snap.val().followersList;
              });
              restListRef.once("value", (snap) => {
                RestNumFollowers = snap.val().RestNumFollowers;
              });
              userRef.once("value", (snapshot) => {
                if (snapshot !== null && restFollowersList !== undefined) {
                  const ListOfRests = snapshot.val().restsList;
                  const idx = ListOfRests.indexOf(restaurantUid);
                  ListOfRests.splice(idx, 1);
                  idxOfFollowerList = restFollowersList.indexOf(
                    `${currentUser.uid}`
                  );
                  restFollowersList.splice(idxOfFollowerList, 1);
                  if (ListOfRests.length === 0) {
                    if (snapshot?.val()?.restFollowingNum !== undefined) {
                      userRef.update({
                        restsList: { 0: "_" },
                        restFollowingNum:
                          snapshot?.val()?.restFollowingNum === 0
                            ? 0
                            : snapshot?.val()?.restFollowingNum - 1,
                      });
                    } else {
                      userRef.update({
                        restsList: { 0: "_" },
                        restFollowingNum:
                          snapshot?.val()?.restsList.length === 0
                            ? 0
                            : snapshot?.val()?.restsList.length - 1,
                      });
                    }

                    restListRef.update({
                      RestNumFollowers: RestNumFollowers - 1,
                    });
                    if (idxOfFollowerList !== -1) {
                      restRef.update({
                        followerNum: RestNumFollowers - 1,
                        followersList: restFollowersList,
                      });
                    } else {
                      restRef.update({ followerNum: RestNumFollowers - 1 });
                    }
                    restListRef.once("value", (snap) => {
                      if (snap.val() !== null) {
                        RestNumFollowers = snap.val().RestNumFollowers;
                      }
                    });
                    listTemp.splice(index, 1);
                    tempObjectIDs.splice(index, 1);
                    setData({
                      ...data,
                      myFavRestList: listTemp,
                      objectIDs: tempObjectIDs,
                    });
                  } else {
                    if (snapshot?.val()?.restFollowingNum !== undefined) {
                      userRef.update({
                        restsList: ListOfRests,
                        restFollowingNum:
                          snapshot?.val()?.restFollowingNum === 0
                            ? 0
                            : snapshot?.val()?.restFollowingNum - 1,
                      });
                      restListRef.update({
                        RestNumFollowers: RestNumFollowers - 1,
                      });
                      if (idxOfFollowerList !== -1) {
                        restRef.update({
                          followerNum: RestNumFollowers - 1,
                          followersList: restFollowersList,
                        });
                      } else {
                        restRef.update({ followerNum: RestNumFollowers - 1 });
                      }
                      restListRef.once("value", (snap) => {
                        if (snap.val() !== null) {
                          RestNumFollowers = snap.val().RestNumFollowers;
                        }
                      });
                      listTemp.splice(index, 1);
                      tempObjectIDs.splice(index, 1);
                      setData({
                        ...data,
                        myFavRestList: listTemp,
                        objectIDs: tempObjectIDs,
                      });
                    } else {
                      userRef.update({
                        restsList: ListOfRests,
                        restFollowingNum:
                          snapshot?.val()?.restsList.length === 0
                            ? 0
                            : snapshot?.val()?.restsList.length - 1,
                      });
                      restListRef.update({
                        RestNumFollowers: RestNumFollowers - 1,
                      });
                      if (idxOfFollowerList !== -1) {
                        restRef.update({
                          followerNum: RestNumFollowers - 1,
                          followersList: restFollowersList,
                        });
                      } else {
                        restRef.update({ followerNum: RestNumFollowers - 1 });
                      }
                      restListRef.once("value", (snap) => {
                        if (snap.val() !== null) {
                          RestNumFollowers = snap.val().RestNumFollowers;
                        }
                      });
                      listTemp.splice(index, 1);
                      tempObjectIDs.splice(index, 1);

                      setData({
                        ...data,
                        myFavRestList: listTemp,
                        objectIDs: tempObjectIDs,
                      });
                    }
                  }
                }
              });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const _renderItem = ({ item, index }) => {
    return (
      <Card
        elevation={10}
        style={{
          justifyContent: "center",
          margin: 20,
          marginLeft: 10,
          width: width * 0.82,
          borderRadius: 15,
          marginTop: 0,
        }}>
        <ScrollView>
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
            }}>
            <Card.Cover
              style={{
                flex: 1,
                zIndex: -1,
                width: width * 0.82,
                height: height * 0.4,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}
              source={{ uri: item.takenPicture }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 15,
              marginTop: 5,
              justifyContent: "flex-start",
            }}>
            <Card.Content style={{ marginTop: 5, marginLeft: -30 }}>
              <TextInput
                clearButtonMode="always"
                placeholder="Item Name"
                keyboardType="default"
                autoCompleteType="name"
                editable={true}
                value={data.myFavRestList[index].food_name}
                multiline={true}
                textContentType={"name"}
                placeholderTextColor="#666666"
                autoCapitalize="none"
                style={styles.titleStyle9}
                onChangeText={(value) => {
                  updateItem("food_name", value, item.foodObjectId, index);
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setIsFoodTypeChange(true);
                  setCurrentIndex(index);
                  setcurrentObjectID(item.foodObjectId);
                }}>
                <Text
                  style={{
                    fontFamily: "MontserratSemiBold",
                    fontSize: 12,
                    color: "gray",
                    marginTop: -10,
                    marginLeft: 15,
                  }}>
                  {data.myFavRestList[index].foodType}
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.titleStyle9}>Ingredients: </Text>
            <TextInput
              clearButtonMode="always"
              placeholder="Ingredients"
              keyboardType="default"
              autoCompleteType="name"
              editable={true}
              value={data.myFavRestList[index].ingredients}
              multiline={true}
              textContentType={"name"}
              placeholderTextColor="#666666"
              autoCapitalize="none"
              style={styles.titleStyle8}
              onChangeText={(value) => {
                updateItem("ingredients", value, item.foodObjectId, index);
              }}
            />
          </View>
          <View style={{ marginBottom: 50 }}>
            <Text style={styles.titleStyle9}>Instruction: </Text>
            <TextInput
              clearButtonMode="always"
              placeholder="Steps"
              keyboardType="default"
              autoCompleteType="name"
              editable={true}
              value={data.myFavRestList[index].steps}
              multiline={true}
              textContentType={"name"}
              placeholderTextColor="#666666"
              autoCapitalize="none"
              style={styles.titleStyle8}
              onChangeText={(value) => {
                updateItem("steps", value, item.foodObjectId, index);
              }}
            />
          </View>
        </ScrollView>
      </Card>
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
            source={require("../assets/NoFollowYet.png")}
          />
        </View>
      </View>
    );
  };
  const updateItem = (type, value, objectID, idx) => {
    if (type === "food_name") {
      const newItem = data.myFavRestList;
      const itemUpdated = update(data.myFavRestList[idx], {
        food_name: { $set: value },
      });
      newItem[idx] = itemUpdated;
      setData({
        ...data,
        myFavRestList: newItem,
      });
      firebase.database().ref(`/food/${objectID}/foodInfo`).update({
        food_name: value,
      });
      firebase
        .database()
        .ref(`/userNonRestImage/${data.uid}/${data.uidArr[currentIndex]}`)
        .update({
          food_name: value,
        });
    } else if (type === "steps") {
      const newItem = data.myFavRestList;
      const itemUpdated = update(data.myFavRestList[idx], {
        steps: { $set: value },
      });
      newItem[idx] = itemUpdated;
      setData({
        ...data,
        myFavRestList: newItem,
      });
      firebase.database().ref(`/food/${objectID}/foodInfo`).update({
        steps: value,
      });
      firebase
        .database()
        .ref(`/userNonRestImage/${data.uid}/${data.uidArr[currentIndex]}`)
        .update({
          steps: value,
        });
    } else if (type === "ingredients") {
      const newItem = data.myFavRestList;
      const itemUpdated = update(data.myFavRestList[idx], {
        ingredients: { $set: value },
      });
      newItem[idx] = itemUpdated;
      setData({
        ...data,
        myFavRestList: newItem,
      });
      firebase.database().ref(`/food/${objectID}/foodInfo`).update({
        ingredients: value,
      });
      firebase
        .database()
        .ref(`/userNonRestImage/${data.uid}/${data.uidArr[currentIndex]}`)
        .update({
          ingredients: value,
        });
    } else if (type === "foodType") {
      const newItem = data.myFavRestList;
      const itemUpdated = update(data.myFavRestList[idx], {
        foodType: { $set: value },
      });
      newItem[idx] = itemUpdated;
      setData({
        ...data,
        myFavRestList: newItem,
      });
      firebase.database().ref(`/food/${objectID}/foodInfo`).update({
        foodType: value,
      });
      firebase
        .database()
        .ref(`/userNonRestImage/${data.uid}/${data.uidArr[currentIndex]}`)
        .update({
          foodType: value,
        });
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, marginTop: -25 }}>
        {/* <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/> */}
        <View
          style={{
            marginTop: Platform.OS === "ios" ? -10 : 25,
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
          <Text style={styles.titleStyle7}>My Favorite TroFii</Text>
        </View>
        <Carousel
          ref={(flatList) => {
            _flatList = flatList;
          }}
          data={data.myFavRestList}
          extraData={data.myFavRestList}
          ListEmptyComponent={renderEmpty.bind(this)}
          renderItem={_renderItem.bind(this)}
          sliderWidth={width}
          itemWidth={width * 0.85}
          callbackOffsetMargin={10}
          activeSlideAlignment={"center"}
          layout={"default"}
          firstItem={0}
          enableSnap
          useScrollView={false}
          inactiveSlideOpacity={1.0}
          inactiveSlideScale={1.0}
          initialScrollIndex={0}
          shouldOptimizeUpdates={true}
          initialNumToRender={15}
          decelerationRate={0.85}
          onEndReachedThreshold={6}
          viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
          removeClippedSubviews={Platform.OS === "ios" ? false : true}
        />
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
            overflow: "hidden",
            marginLeft: 0,
            marginTop: 0,
            marginBottom: -50,
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
                  updateItem(
                    "foodType",
                    "Entree",
                    currentObjectID,
                    currentIndex
                  );
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Entree"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={
                  data.myFavRestList[currentIndex]?.foodType === "Entree"
                }
              />
              <CheckBox
                // center
                title="Drink"
                onPress={() => {
                  updateItem(
                    "foodType",
                    "Drink",
                    currentObjectID,
                    currentIndex
                  );
                }}
                containerStyle={{ width: width * 0.45 }}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={data.myFavRestList[currentIndex]?.foodType === "Drink"}
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
                  updateItem(
                    "foodType",
                    "Appetizer",
                    currentObjectID,
                    currentIndex
                  );
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Appetizer"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={
                  data.myFavRestList[currentIndex]?.foodType === "Appetizer"
                }
              />
              <CheckBox
                // center
                onPress={() => {
                  updateItem(
                    "foodType",
                    "Dessert",
                    currentObjectID,
                    currentIndex
                  );
                }}
                containerStyle={{ width: width * 0.45 }}
                title="Dessert"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="#EE5B64"
                checked={
                  data.myFavRestList[currentIndex]?.foodType === "Dessert"
                }
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
                <LinearGradient
                  colors={["#fb8389", "#f70814", "#C90611"]}
                  style={styles.linearGradient3}>
                  <Text style={styles.buttonText5}>Done</Text>
                </LinearGradient>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
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
  titleStyle7: {
    flex: 1,
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
    marginLeft: height / width > 1.5 ? width * 0.3 - 25 : width * 0.4 - 25,
    justifyContent: "center",
  },
  titleStyle8: {
    flex: 1,
    fontFamily: "Montserrat",
    fontSize: 15,
    marginLeft: 15,
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  linearGradient3: {
    height: 50,
    width: width / 4,
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
  buttonText5: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
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
  titleStyle: {
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
    width: width * 0.5,
  },
  buttonStyle: {
    color: "white",
    fontSize: 30,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
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
export default MyUploadedTroFiiScreen;
