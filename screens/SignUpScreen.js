import React, { useEffect } from "react";
import {
  View,
  Text,
  Keyboard,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Platform,
  Dimensions,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as Location from "expo-location";
import axios from "axios";
import { connect } from "react-redux";
import { Title, Paragraph, useTheme } from "react-native-paper";
import * as actions from "../actions";
import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Modal from "react-native-modal";
import { AuthContext } from "../components/context";
import { ScrollView } from "react-native-gesture-handler";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

const createdDate = year * 10000 + month * 100 + day;

const SignUpScreen = ({ navigation }) => {
  const recaptchaVerifier = React.useRef(null);
  const [phoneNumber, setPhoneNumber] = React.useState();
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
  const firebaseConfig = firebase.apps.length
    ? firebase.app().options
    : undefined;

  const attemptInvisibleVerification = false;

  const [newData, setData] = React.useState({
    email: "",
    password: "",
    errorMessage: "",
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
    PrivacyPolicy: "",
    TermsConditions: "",
    followersList: { 0: "_" },
    followingList: { 0: "_" },
    restFollowingNum: 0,
    currentLocation: {
      latitude: 41.937705,
      longitude: -87.657607,
      latitudeDelta: 0.20546,
      longitudeDelta: 0.17854,
    },
  });

  const { colors } = useTheme();

  const { signIn } = React.useContext(AuthContext);

  useEffect(() => {
    setTimeout(() => {
      firebase
        .database()
        .ref("/worestsLists/")
        .once("value", (snap) => {
          if (snap.val() !== null) {
            setData({
              ...newData,
              PrivacyPolicy: snap.val().PrivacyPolicy,
              TermsConditions: snap.val().TermsConditions,
            });
          }
        });
    }, 10);
    return () => {};
  }, []);

  const emailInputChange = (val) => {
    if (val.trim().length == 10) {
      setData({
        ...newData,
        email: val,
        check_textInputChange: true,
      });
    } else {
      setData({
        ...newData,
        email: val,
        check_textInputChange: false,
      });
    }
  };
  const firstNameInputChange = (val) => {
    setData({
      ...newData,
      firstname: val,
    });
  };
  const lastNameInputChange = (val) => {
    setData({
      ...newData,
      lastname: val,
    });
  };
  const locationChange = (val) => {
    setData({
      ...newData,
      yourLocation: val,
    });
  };

  const handlePasswordChange = (val) => {
    if (val.trim().length == 6) {
      setData({
        ...newData,
        password: val,
        isValidCode: true,
      });
    } else {
      setData({
        ...newData,
        password: val,
        isValidCode: false,
      });
    }
  };

  const updateSecureTextEntry = () => {
    setData({
      ...newData,
      secureTextEntry: !newData.secureTextEntry,
    });
  };
  const resendEmailVerif = () => {
    firebase.auth().currentUser.sendEmailVerification();
    setData({
      ...newData,
      email: "",
      isValidEmail: false,
      isReqResetPass: false,
    });
    Alert.alert(
      "Verification Email Message",
      "Please check your email, we sent you a link to verify your email and then try to login.\n\nThank You. ",
      [{ text: "OK", onPress: () => {} }],
      { cancelable: false }
    );
  };
  const resetMyPass = () => {
    firebase
      .auth()
      .sendPasswordResetEmail(newData.email, null)
      .then(() => {
        setData({
          ...newData,
          isValidEmail: false,
          isReqResetPass: false,
        });
        Alert.alert(
          "Email Message",
          "Please check your email, we reset your password.",
          [{ text: "OK", onPress: () => {} }],
          { cancelable: false }
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/invalid-email") {
          Alert.alert(
            "Email Error",
            "Your email address is not valid, please try again.",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: false }
          );
        } else if (errorCode === "auth/user-not-found") {
          Alert.alert(
            "Email Error",
            "We cannot find your email, please create an account with us.",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            "Email Error",
            "Please try again.",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: false }
          );
        }
      });
  };
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
  const _getLocationAsync = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      let currentLocation = await Location.getCurrentPositionAsync({});
      getGeocode(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } else {
      setData({
        ...newData,
        errorMessage: "Permission to access location was denied",
      });
    }
  };

  const loginHandle = () => {
    Keyboard.dismiss();
    const emailListsLength = newData.bonusEmails.length;
    let i;
    for (i = 0; i < emailListsLength; i++) {
      if (newData.email.includes(newData.bonusEmails[i])) {
        setData({ ...newData, points: 100 });
      }
    }
    const {
      firstname,
      lastname,
      email,
      password,
      image,
      points,
      tempHours,
      aroundRadius,
      code,
      redeemedPoints,
      Notifications,
      iseGiftRequested,
      followingList,
      username,
      tokenPass,
      restName,
      yourLocation,
      followerNum,
      userTotalRate,
      restMaxPercentage,
      phoneNum,
      restDesc,
      egiftChoice,
      followersList,
      restFollowingNum,
      restAddress,
      isRestActive,
      restOrderWeb,
      restWebsite,
      isRecommended,
      restHours,
      egiftEarned,
      eGiftChoiceDate,
      boolToken,
    } = newData;
    if (
      newData.yourLocation === null ||
      newData.yourLocation === "" ||
      newData.yourLocation === " "
    ) {
      Alert.alert(
        `Location's Selection Error!`,
        "Please select your location.",
        [{ text: "OK", onPress: () => {}, style: "cancel" }],
        { cancelable: false }
      );
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
              const { currentUser } = firebase.auth();
              currentUser.sendEmailVerification().then(() => {
                if (currentUser.uid !== null) {
                  // console.log(currentUser)
                  firebase
                    .database()
                    .ref(`/users/${currentUser.uid}`)
                    .update({
                      firstname,
                      lastname,
                      email,
                      isUndecided: false,
                      image,
                      restFollowingNum,
                      followersList: { 0: "_" },
                      followingList: { 0: "_" },
                      eGiftChoiceDate,
                      iseGiftRequested,
                      egiftChoice,
                      Notifications,
                      code,
                      egiftEarned,
                      restDesc,
                      phoneNum,
                      restHours,
                      isRecommended,
                      username,
                      redeemedPoints,
                      userTotalRate,
                      tokenPass,
                      restMaxPercentage,
                      tempHours,
                      restName,
                      yourLocation,
                      followerNum,
                      followersList: { 0: "_" },
                      restsList: { 0: "_" },
                      points,
                      restAddress,
                      restOrderWeb,
                      restWebsite,
                      isRestActive,
                      aroundRadius,
                      boolToken,
                      createdAt: createdDate,
                    });
                  navigation.navigate("SignInScreen");
                }
              });
            });
          setData({
            ...newData,
            points: 0,
            firstname: "",
            lastname: "",
            location: "",
            email: "",
            password: "",
          });
        })
        .catch((error) => {
          const errorCode = error.code;
          console.log(errorCode);
          if (errorCode === "auth/user-disabled") {
            setData({
              ...newData,
              errorMessage:
                "Your email is currently disabled, please contact us.",
            });
          } else if (errorCode === "auth/invalid-email") {
            setData({
              ...newData,
              errorMessage:
                "Your email address is not valid, please try again.",
            });
          } else if (errorCode === "auth/wrong-password") {
            setData({
              ...newData,
              errorMessage: "Your password is not correct, please try again.",
            });
          } else if (errorCode === "auth/user-not-found") {
            setData({
              ...newData,
              errorMessage:
                "We cannot find your email, please create an account with us.",
            });
          } else if (errorCode === "auth/invalid-email-verified") {
            setData({
              ...newData,
              errorMessage:
                "Please, verify your email, we already sent you a verification email.",
            });
          } else if (errorCode === "auth/email-already-in-use") {
            setData({
              ...newData,
              errorMessage:
                "This email address is already exist, please try a different email address.",
            });
          } else if (errorCode === "auth/weak-password") {
            setData({
              ...newData,
              errorMessage:
                "Your password is week, please try a stronger password.",
            });
          }
        });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/icons/signup_top.png")}
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
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={"interactive"}>
          <View style={{ padding: 20, marginTop: -30, marginBottom: -35 }}>
            <FirebaseRecaptchaVerifierModal
              ref={recaptchaVerifier}
              firebaseConfig={firebaseConfig}
              attemptInvisibleVerification={attemptInvisibleVerification}
            />
            <Text
              style={{
                marginTop: 40,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 24,
                color: "black",
                marginLeft: -20,
              }}>
              Sign Up
            </Text>
            <Text
              style={{
                marginTop: 20,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#C90611",
              }}>
              FIRST NAME
            </Text>
            <View style={styles.action}>
              <FontAwesome name="user" color={colors.text} size={20} />
              <TextInput
                placeholder=""
                keyboardType="default"
                autoCompleteType="name"
                autoFocus={false}
                textContentType="name"
                placeholderTextColor="#666666"
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                  },
                ]}
                autoCapitalize="none"
                style={{
                  marginVertical: 10,
                  fontSize: 17,
                  marginLeft: 15,
                  width,
                  marginTop: -5,
                }}
                onChangeText={(val) => firstNameInputChange(val)}
              />
            </View>
            <Text
              style={{
                marginTop: 20,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#C90611",
              }}>
              LAST NAME
            </Text>
            <View style={styles.action}>
              <FontAwesome name="user-o" color={colors.text} size={20} />
              <TextInput
                placeholder=""
                keyboardType="default"
                autoCompleteType="name"
                autoFocus={false}
                textContentType="name"
                placeholderTextColor="#666666"
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                  },
                ]}
                autoCapitalize="none"
                style={{
                  marginVertical: 10,
                  fontSize: 17,
                  marginLeft: 15,
                  width,
                  marginTop: -5,
                }}
                onChangeText={(val) => lastNameInputChange(val)}
              />
            </View>
            <Text
              style={{
                marginTop: 20,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#C90611",
              }}>
              EMAIL
            </Text>
            <View style={styles.action}>
              <FontAwesome name="envelope" color={colors.text} size={20} />
              <TextInput
                placeholder=""
                keyboardType="email-address"
                autoCompleteType="email"
                autoFocus={false}
                textContentType="emailAddress"
                placeholderTextColor="#666666"
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                  },
                ]}
                autoCapitalize="none"
                style={{
                  marginVertical: 10,
                  fontSize: 17,
                  marginLeft: 15,
                  width,
                  marginTop: -5,
                }}
                onChangeText={(val) => emailInputChange(val)}
              />
            </View>
            <Text
              style={{
                marginTop: 20,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#C90611",
              }}>
              PASSWORD
            </Text>
            <View style={styles.action}>
              <FontAwesome name={"key"} color={colors.text} size={20} />
              <View>
                <TextInput
                  placeholder=""
                  keyboardType="default"
                  autoCompleteType="password"
                  autoFocus={false}
                  secureTextEntry={newData.secureTextEntry}
                  textContentType="password"
                  placeholderTextColor="#666666"
                  style={[
                    styles.textInput,
                    {
                      color: colors.text,
                    },
                  ]}
                  autoCapitalize="none"
                  style={{
                    marginVertical: 10,
                    fontSize: 17,
                    marginLeft: 15,
                    marginTop: -5,
                    width,
                  }}
                  onChangeText={(val) => handlePasswordChange(val)}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  updateSecureTextEntry();
                }}
                style={{
                  marginVertical: 10,
                  fontSize: 17,
                  marginLeft: -130,
                  marginTop: -5,
                }}>
                {newData.secureTextEntry ? (
                  <Feather name="eye-off" color="grey" size={20} />
                ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>
            <Text
              style={{
                marginTop: 20,
                marginBottom: 5,
                fontFamily: "MontserratSemiBold",
                fontSize: 14,
                color: "#C90611",
              }}>
              LOCATION
            </Text>
            <TouchableOpacity
              onPress={() => {
                setData({ ...newData, isChangeLocation: true });
              }}>
              <View style={styles.action}>
                <FontAwesome name="map-marker" color={colors.text} size={20} />
                <Text
                  style={{
                    marginLeft: 15,
                    marginBottom: 5,
                    fontFamily: "MontserratSemiBold",
                    fontSize: 14,
                    color: "black",
                  }}>
                  {newData.yourLocation}
                </Text>
              </View>
            </TouchableOpacity>
            {newData.isEnterLocation === false ? null : (
              <Animatable.View
                animation="fadeInLeft"
                duration={500}
                style={{ flex: 1, marginLeft: -10, marginTop: 10 }}>
                <GooglePlacesAutocomplete
                  placeholder="Search here ..."
                  scrollEnabled={false}
                  minLength={2} // minimum length of text to search
                  autoFocus={false}
                  returnKeyType={"search"} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                  listViewDisplayed={"auto"}
                  keyboardShouldPersistTaps="always"
                  renderDescription={(row) => row.description} // custom description render
                  onPress={(data, details = null) => {
                    setData({
                      ...newData,
                      yourLocation: data.description,
                      isChangeLocation: false,
                      isEnterLocation: false,
                    });
                  }}
                  query={{
                    key: "AIzaSyBZGm2V3DjsFEO_7qRFBk8UaPqjghLhnQo",
                    language: "en", // language of the results
                    types: "(cities)", // default: 'geocode'
                  }}
                  styles={{
                    description: styles.descCitiesStyle,
                    predefinedPlacesDescription: styles.descCitiesStyle,
                    textInputContainer: {
                      backgroundColor: "#ffffff",
                      color: "black",
                      borderColor: "black",
                    },
                    textInput: {
                      backgroundColor: "white",
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
                    },
                  }}
                  debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                />
              </Animatable.View>
            )}
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  loginHandle(newData.email, newData.password);
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
                    <Text style={styles.buttonText}>SIGN UP</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
            {newData.errorMessage === "" ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>{newData.errorMessage}</Text>
              </Animatable.View>
            )}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("HomeDrawer", {
                    screen: "Food",
                    params: {
                      screen: "FoodSc",
                    },
                  });
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
            {attemptInvisibleVerification && <FirebaseRecaptchaBanner />}
          </View>
          <View style={styles.textPrivate}>
            <Text style={styles.color_textPrivate}>
              By signing up you agree to our
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(newData.TermsConditions);
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
                Linking.openURL(newData.PrivacyPolicy);
              }}>
              <Text
                style={[styles.color_textPrivateBold, { fontWeight: "bold" }]}>
                {" "}
                Terms And Conditions
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.textPrivate2}>
            <Text style={styles.color_textPrivate2}>Dont have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("SignInScreen");
              }}>
              <Text
                style={[styles.color_textPrivateBold2, { fontWeight: "bold" }]}>
                {" "}
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Modal
              isVisible={newData.isChangeLocation}
              animationInTiming={550}
              animationOutTiming={550}
              propagateSwipe
              onModalHide={() => {
                setData({ ...newData, isChangeLocation: false });
              }}
              onModalShow={() => {
                setData({ ...newData, isChangeLocation: true });
              }}
              onBackdropPress={() => {
                setData({ ...newData, isChangeLocation: false });
              }}
              backdropColor="black"
              useNativeDriver={true}
              backdropOpacity={0.3}
              hideModalContentWhileAnimating
              onRequestClose={() => {
                setData({ ...newData, isChangeLocation: false });
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
                <TouchableOpacity
                  onPress={() => {
                    setData({ ...newData, isChangeLocation: false });
                  }}
                  style={{
                    marginVertical: 10,
                    marginLeft: -width / 2 - 60,
                    marginTop: 25,
                  }}>
                  <Feather name="x" color="grey" size={30} />
                </TouchableOpacity>
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}>
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
                      }}>
                      Enable Your Location
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
                          This app requires your location. You can manually
                          enter it or enable your location settings to
                          automatically detect your location.
                        </Paragraph>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    _getLocationAsync();
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
                      <Text style={styles.buttonText}>Search My Location</Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setData({
                      ...newData,
                      isEnterLocation: true,
                      isChangeLocation: false,
                    });
                  }}
                  style={{ marginBottom: 30 }}>
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
                      <Text style={styles.buttonText2}>Enter My Location</Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(SignUpScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ed5962",
  },
  image: {
    flex: 1,
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
    width: width * 0.85,
  },
  linearGradient: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.65,
  },
  linearGradient2: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.65,
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
  button: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
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
