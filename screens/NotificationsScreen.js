import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Avatar, Title, Paragraph, DefaultTheme } from "react-native-paper";
import { Camera } from "expo-camera";
import axios from "axios";
import algoliasearch from "algoliasearch";
import * as actions from "../actions";
import { connect } from "react-redux";
import Modal from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
} from "react-instantsearch-native";

import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { ResponseType } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

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
  "Notifications",
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

const foodAttrToRetr = [
  "foodInfo.image",
  "restName",
  "publish",
  "isUndecided",
  "isRestActive",
  "isImageUploaded",
];

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
  "RestEntreeNum",
  "RestDrinkNum",
  "RestDessertNum",
  "RestApptNum",
  "restMaxPercentage",
  "phoneNum",
  "restDesc",
  "restOrderWeb",
];
let searchState = {
  noResults: false,
  noResultsReq: false,
  isLogin: false,
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
    connect: 2,
    read: 4, // The value of the former `timeout` parameter
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

WebBrowser.maybeCompleteAuthSession();

const NotificationsScreen = (props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState(Camera.Constants.Type.back);
  const onChangeSearch = (query) => setSearchQuery(query);

  const theme = useTheme();

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
    currentImage: " ",
    sortBy: "worests",
    refreshing: false,
    noResultsReq: false,
    isFoundItem: false,
    isFoundItemChange: false,
    algoliaVisible: false,
    userIcon: "",
    uid: "",
    activeButton: "Recommended",
  });

  const mounted = async () => {
    // searchByFood('');
    const { currentUser } = firebase.auth();
  };

  const [requestFacebookAuth, responseFacebookAuth, promptFacebookAuthAsync] =
    Facebook.useAuthRequest(
      {
        clientId: "",
        redirectUri: ``,
        expoClientId: "",
        responseType: ResponseType.Token,
        usePKCE: true,
      },
      {
        projectNameForProxy: "",
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
        shouldAutoExchangeCode: true,
        useProxy: false,
        selectAccount: true,
      }
    );

  async function refreshData() {
    try {
      setData({
        ...data,
        algoliaVisible: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (e) {
      console.warn(e);
    } finally {
      // Tell the application to render
      setTimeout(() => {
        setData({
          ...data,
          algoliaVisible: false,
        });
      }, 100);
    }
  }
  useEffect(() => {
    if (responseGoogleAuth !== null) {
      props.googleLogin(responseGoogleAuth);
    }
    if (responseFacebookAuth !== null) {
      props.facebookLogin(responseFacebookAuth);
    }

    setTimeout(() => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user !== null) {
          if (props?.route?.params?.date) {
            refreshData();
          }
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
                        uid: user.uid,
                        userIcon: snapshot.val().image,
                        isLogin: false,
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
                  PrivacyPolicy: snap.val().PrivacyPolicy,
                  TermsConditions: snap.val().TermsConditions,
                  userIcon: "",
                });
              }
            });
        }
      });
    }, 100);
    return () => {};
  }, [props?.route?.params, responseGoogleAuth, responseFacebookAuth]);

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
  const login = (type) => {
    if (type === "facebook") {
      promptFacebookAuthAsync();
      setData({ ...data, isLogin: false });
    } else if (type === "google") {
      promptAsyncGoogleAuth();
      setData({ ...data, isLogin: false });
    }
    if (type === "apple") {
      props.appleLogin();
      setData({ ...data, isLogin: false });
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
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
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
              }}>
              {data.userIcon !== "" ? (
                <TouchableOpacity
                  style={{ flex: 1, marginLeft: 0 }}
                  onPress={() => {
                    props.navigation.navigate("SettingsScreen");
                  }}>
                  <Image
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 5,
                      marginTop: 3,
                    }}
                    source={{
                      uri: Image.resolveAssetSource(
                        require("../assets/icons/settings.png")
                      ).uri,
                      cache: "force-cache",
                    }}
                    fadeDuration={1}
                  />
                </TouchableOpacity>
              ) : (
                <Image
                  style={{
                    width: 47,
                    height: 47,
                    borderRadius: 5,
                    marginTop: 3,
                  }}
                  source={{
                    uri: Image.resolveAssetSource(
                      require("../assets/icons/user2.png")
                    ).uri,
                    cache: "force-cache",
                  }}
                  fadeDuration={1}
                />
              )}
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
        <View style={{ flex: 1 }}>
          <InstantSearch
            searchClient={client}
            indexName={"users"}
            refresh={data.algoliaVisible}
            stalledSearchDelay={0}
            onSearchStateChange={(results) => onSearchStateChange(results)}>
            <Configure
              typoTolerance={"strict"}
              facetFilters={[`objectID:${data.uid}`]}
              attributesToRetrieve={userAttrToRetr}
              hitsPerPage={300}
            />
            <View>
              <View style={{ backgroundColor: "#f2f2f2", height: 1 }} />
              <View
                style={{
                  flex: 1,
                  marginBottom: 5,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginTop: 0,
                }}>
                <Hits colors={colors} navigation={props.navigation} />
              </View>
            </View>
          </InstantSearch>
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
                        You are not signed into an account, which means you
                        won’t be able to use 100% of the apps functionalities.{" "}
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
                        Search for your favorite food or restaurants in your
                        area.{" "}
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
              {Platform.OS === "ios" ? (
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
              ) : (
                <View />
              )}
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
                    style={{
                      width: width * 0.75,
                      marginTop: 0,
                      marginLeft: 0,
                    }}>
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
      </View>
    </SafeAreaView>
  );
};

export default connect(null, actions)(NotificationsScreen);

let searchStateHitsLength = 0;
const Hits = connectInfiniteHits(
  ({ hits, hasMore, refine, colors, navigation }) => {
    let notifList = [];

    const renderEmpty = () => {
      return (
        <View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              style={{
                resizeMode: "contain",
                backgroundColor: "#ffffff",
                width,
                height: height - 185,
              }}
              source={require("../assets/NoNotifications.png")}
            />
          </View>
        </View>
      );
    };
    if (hits.length !== 0) {
      notifList = Object.values(
        hits[0]?.Notifications?.notificationsList
      ).slice(1, hits[0]?.Notifications?.notificationsList?.length);
    }
    const oldImage =
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2FMenu%20Item%20Pic%203.png?alt=media&token=f9013e91-faa1-40dc-bcab-aff29efb5c8d";
    const newImage =
      "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea";

    const onEndReached = function () {
      if (hasMore) {
        refine();
      }
    };

    const changeIsSeen = (idx) => {
      const listLength = notifList.length;
      const { currentUser } = firebase.auth();
      firebase
        .database()
        .ref(
          `/users/${currentUser.uid}/Notifications/notificationsList/${[
            listLength - idx,
          ]}`
        )
        .update({ isSeen: true });
      notifList[idx].isSeen = true;
      refine();
    };
    async function isOpen(restName) {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${restName}&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU`
      );
      const newResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${response?.data?.results[0]?.place_id}&fields=name,rating,type,opening_hours,formatted_phone_number&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`
      );
      return newResponse?.data?.result?.opening_hours?.open_now;
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
    const colorDetector = (type) => {
      if (type === "TroFii") {
        return "#0c1355";
      } else if (type === "PictureApproved") {
        return "green";
      } else if (type === "PictureDenied") {
        return "red";
      } else if (type === "ReceiptApproved") {
        return "#006600";
      } else if (type === "ReceiptDenied") {
        return "#e60000";
      } else if (type === "RestNewPic") {
        return "gray";
      } else if (type === "RestApproved") {
        return "#3366cc";
      } else if (type === "eGift") {
        return "#ff8c1a";
      }
    };
    const fetchRestData = (restaurantUid, isOpenNow, restName) => {
      const client = algoliasearch("", "", {
        timeouts: {
          connect: 1,
          read: 1, // The value of the former `timeout` parameter
          write: 30,
        },
      });
      client
        .initIndex("restsList")
        .search(restaurantUid, {
          attributesToRetrieve: restAttrToRetr,
          hitsPerPage: 1,
          facetFilters: [`isRestActive:${true}`],
          restrictSearchableAttributes: ["restaurantUid", "objectID"],
        })
        .then((responses) => {
          const str = JSON.stringify(responses.hits);
          const object = JSON.parse(str);
          client
            .initIndex("foodsList")
            .search(restaurantUid, {
              attributesToRetrieve: foodAttrToRetr,
              hitsPerPage: 20,
              facetFilters: [
                `isRestActive:${true}`,
                `publish:${true}`,
                `isImageUploaded:${true}`,
              ],
            })
            .then((responses1) => {
              const str1 = JSON.stringify(responses1.hits);
              const object1 = JSON.parse(str1);
              shuffle(object1);
              if (object[0] !== undefined && object1[0] !== undefined) {
                navigation.navigate("RestaurantNotificationsTab", {
                  params: {
                    restaurantUid: restaurantUid,
                    restName: restName,
                    restAddress: object[0].restAddress,
                    RestNumFollowers: object[0].RestNumFollowers,
                    objectID: object[0].objectID,
                    restDesc: object[0].restDesc,
                    restOrderWeb: object[0].restOrderWeb,
                    phoneNum: object[0].phoneNum,
                    foodImage: object1[0].foodInfo.image,
                    compCameFrom: "Notification",
                    isOpenNow: isOpenNow,
                  },
                });
              } else if (object[0] !== undefined && object1[0] === undefined) {
                navigation.navigate("RestaurantNotificationsTab", {
                  restaurantUid: restaurantUid,
                  restName: restName,
                  restAddress: object[0].restAddress,
                  RestNumFollowers: object[0].RestNumFollowers,
                  objectID: object[0].objectID,
                  restDesc: object[0].restDesc,
                  restOrderWeb: object[0].restOrderWeb,
                  phoneNum: object[0].phoneNum,
                  compCameFrom: "Notification",
                  foodImage: undefined,
                  isOpenNow: isOpenNow,
                });
              }
            });
        });
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
    const goTo = async (item, idx) => {
      changeIsSeen(idx);
      if (item.type === "PictureApproved" || item.type === "PictureDenied") {
        navigation.navigate("MyPhotosScreen");
      } else if (item.type === "RestNewPic") {
        navigation.navigate("SeeMenuNotificationsTab", {
          restaurantUid: item.restaurantUid,
          restaurantName: item.restName,
          food_name: item.food_name,
          cameFrom: "Notification",
        });
      } else if (
        item.type === "ReceiptApproved" ||
        item.type === "ReceiptDenied"
      ) {
        navigation.navigate("EarnRewardsScreen");
      } else if (item.type === "RestApproved") {
        let isOpenNow = await isOpen(item.restName);
        fetchRestData(item.restaurantUid, isOpenNow, item.restName);
      } else if (item.type === "eGift") {
        navigation.navigate("MyeGiftsScreen");
      }
    };
    const hitsLength = hits.length;

    if (searchStateHitsLength != hitsLength) {
      searchStateHitsLength = hitsLength;
      if (hits.length === 0) {
        searchState = Object.assign({ ...searchState, resultsLength: 0 });
      } else if (hits.length != 0) {
        searchState = Object.assign({
          ...searchState,
          resultsLength: hits.length,
        });
      }
    }
    if (hits.length !== 0) {
      notifList = Object.values(hits[0]?.Notifications?.notificationsList)
        .slice(1, hits[0]?.Notifications?.notificationsList.length)
        .sort((a, b) => {
          return b.dateID - a.dateID;
        });
      return (
        <View style={{ flex: 1, marginBottom: 5, marginTop: 0 }}>
          <FlatList
            data={notifList}
            scrollEventThrottle={1}
            showsHorizontalScrollIndicator={true}
            extraData={notifList}
            onEndReached={onEndReached}
            ItemSeparatorComponent={ItemSeperator}
            initialNumToRender={11}
            onEndReachedThreshold={3}
            ListEmptyComponent={renderEmpty()}
            keyExtractor={(item, index) => item?.dateID?.toString()}
            renderItem={({ item, index }) => {
              return (
                <View style={{ flex: 1, marginBottom: 0 }}>
                  <TouchableOpacity
                    onPress={() => {
                      goTo(item, index);
                    }}>
                    <View
                      style={{
                        backgroundColor: item.isSeen ? "white" : "#e6f7ff",
                        marginRight: 10,
                        width,
                        justifyContent: "center",
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          marginLeft: 15,
                          marginRight: 10,
                          marginBottom: 10,
                          marginTop: 20,
                        }}>
                        {item?.image ? (
                          <View
                            style={{
                              marginRight: 5,
                              borderRadius: 20,
                              justifyContent: "center",
                            }}>
                            <Avatar.Image
                              size={50}
                              theme={avatorTheme}
                              source={{ uri: item?.image }}
                            />
                          </View>
                        ) : null}
                        <View
                          style={{
                            marginRight: 10,
                            marginLeft: 5,
                            width: item?.restImage ? width * 0.6 : width * 0.7,
                          }}>
                          <View
                            style={{ alignItems: "flex-start", marginLeft: 1 }}>
                            <Paragraph
                              style={{
                                letterSpacing: -0.5,
                                fontFamily: "MontserratSemiBold",
                                fontSize: 12,
                                lineHeight: 15,
                              }}>
                              {item?.message}
                            </Paragraph>
                            {item?.food_name ? (
                              <Paragraph
                                style={{
                                  fontFamily: "MontserratSemiBold",
                                  fontSize: 12,
                                  marginTop: -5,
                                }}>
                                {" "}
                                "{item?.food_name}"
                              </Paragraph>
                            ) : null}
                          </View>
                          <View
                            style={{
                              justifyContent: "flex-end",
                              marginLeft: 1,
                              marginTop: -5,
                            }}>
                            <Paragraph
                              style={{
                                fontFamily: "Montserrat",
                                fontSize: 10,
                                color: "rgba(000, 000, 000, 0.40)",
                              }}>
                              {calcNow(item?.dateID?.toString())}
                            </Paragraph>
                          </View>
                        </View>
                        {item?.restImage ? (
                          <View
                            style={{
                              alignItems: "flex-start",
                              justifyContent: "center",
                            }}>
                            <Image
                              style={{
                                width: 60,
                                height: 60,
                                marginRight: 5,
                                borderRadius: 5,
                              }}
                              source={{ uri: item?.restImage }}
                            />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: "rgba(000, 000, 000, 0.10)",
                      height: 1,
                      width: width * 0.9,
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 20,
                    }}
                  />
                </View>
              );
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              style={{
                resizeMode: "contain",
                backgroundColor: "#ffffff",
                width,
                height: height - 85,
              }}
              source={require("../assets/NoNotifications.png")}
            />
          </View>
        </View>
      );
    }
  }
);
const ItemSeperator = () => <View style={styles.seperator} />;

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
  descCitiesStyle: {
    color: "black",
    marginLeft: 15,
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
  CurrentImage2: {
    width: catWidth,
    height: catHeight,
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
