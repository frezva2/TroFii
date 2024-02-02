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
  Linking,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { connect } from "react-redux";
import { useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import * as actions from "../actions";
import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";
import { AuthContext } from "../components/context";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { ResponseType } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

import { ScrollView } from "react-native-gesture-handler";

const firebase = require("firebase/app").default;
require("firebase/auth");
require("firebase/database");

WebBrowser.maybeCompleteAuthSession();

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const SignInScreen = (props) => {
  const recaptchaVerifier = React.useRef(null);
  const [phoneNumber, setPhoneNumber] = React.useState();
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
  const firebaseConfig = firebase.apps.length
    ? firebase.app().options
    : undefined;

  const attemptInvisibleVerification = false;

  const [data, setData] = React.useState({
    email: "",
    password: "",
    errorMessage: "",
    check_textInputChange: false,
    secureTextEntry: true,
    isValidEmail: false,
    isReqResetPass: false,
    PrivacyPolicy: "",
    TermsConditions: "",
  });

  const { colors } = useTheme();

  const { signIn } = React.useContext(AuthContext);

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

  useEffect(() => {
    if (responseGoogleAuth === null && responseFacebookAuth === null) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user !== null) {
          props.navigation.navigate("HomeDrawer");
        }
      });
      setTimeout(() => {
        firebase
          .database()
          .ref("/worestsLists/")
          .once("value", (snap) => {
            if (snap.val() !== null) {
              setData({
                ...data,
                PrivacyPolicy: snap.val().PrivacyPolicy,
                TermsConditions: snap.val().TermsConditions,
              });
            }
          });
      }, 10);
    }
    if (responseGoogleAuth !== null) {
      props.googleLogin(responseGoogleAuth);
    }
    if (responseFacebookAuth !== null) {
      props.facebookLogin(responseFacebookAuth);
    }

    return () => {
      // console.log('unmounting...');
    };
  }, [responseGoogleAuth, responseFacebookAuth]);

  const textInputChange = (val) => {
    if (val.trim().length == 10) {
      setData({
        ...data,
        email: val,
        check_textInputChange: true,
        isValidPhone: true,
      });
    } else {
      setData({
        ...data,
        email: val,
        check_textInputChange: false,
        isValidPhone: false,
      });
    }
  };

  const handlePasswordChange = (val) => {
    if (val.trim().length == 6) {
      setData({
        ...data,
        password: val,
        isValidCode: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidCode: false,
      });
    }
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };
  const resendEmailVerif = () => {
    firebase.auth().currentUser.sendEmailVerification();
    setData({
      ...data,
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
      .sendPasswordResetEmail(data.email, null)
      .then(() => {
        setData({
          ...data,
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
  const loginHandle = async (email, password) => {
    Keyboard.dismiss();
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async () => {
        if (
          firebase.auth().currentUser.emailVerified === true &&
          firebase.auth().currentUser.providerData[0].providerId === "password"
        ) {
          props.navigation.navigate("Food");
          await AsyncStorage.setItem(
            "userToken",
            firebase.auth().currentUser.uid
          );
        } else {
          if (
            firebase.auth().currentUser.providerData[0].providerId ===
              "facebook.com" ||
            firebase.auth().currentUser.providerData[0].providerId ===
              "apple.com" ||
            firebase.auth().currentUser.providerData[0].providerId ===
              "google.com"
          ) {
            setData({
              ...data,
              email: "",
              isValidEmail: false,
              isReqResetPass: false,
              errorMessage: "",
              password: "",
            });
            props.navigation.navigate("HomeDrawer", {
              screen: "Food",
              params: {
                screen: "FoodSc",
                params: {
                  dataCame: createdDate,
                },
              },
            });
            await AsyncStorage.setItem(
              "userToken",
              firebase.auth().currentUser.uid
            );
          } else {
            setData({
              ...data,
              email: "",
              password: "",
              isValidEmail: true,
              isReqResetPass: false,
              errorMessage:
                "Please, verify your email, we already sent you a verification email.",
            });
          }
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/user-disabled") {
          setData({
            ...data,
            isValidEmail: false,
            isReqResetPass: false,
            errorMessage:
              "Your email is currently disabled, please contact us.",
          });
        } else if (errorCode === "auth/invalid-email") {
          setData({
            ...data,
            isValidEmail: false,
            isReqResetPass: false,
            errorMessage: "Your email address is not valid, please try again.",
          });
        } else if (errorCode === "auth/wrong-password") {
          setData({
            ...data,
            isReqResetPass: true,
            isValidEmail: false,
            errorMessage:
              "Your password is not correct, please try again or try to reset your password.",
          });
        } else if (errorCode === "auth/user-not-found") {
          setData({
            ...data,
            isValidEmail: false,
            isReqResetPass: false,
            errorMessage:
              "We cannot find your email, please create an account with us.",
          });
        } else if (errorCode === "auth/invalid-email-verified") {
          setData({
            ...data,
            isValidEmail: true,
            isReqResetPass: false,
            errorMessage:
              "Please, verify your email, we already sent you a verification email.",
          });
        }
      });
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/icons/signin_top.png")}
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
        <ScrollView>
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
              Sign In
            </Text>
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
                placeholder="Email"
                keyboardType="email-address"
                autoCompleteType="email"
                autoFocus={false}
                value={data.email}
                textContentType="emailAddress"
                placeholderTextColor="#666666"
                autoCapitalize="none"
                style={{
                  marginVertical: 10,
                  fontSize: 17,
                  marginLeft: 15,
                  width,
                  marginTop: -5,
                }}
                onChangeText={(val) => textInputChange(val)}
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
                  placeholder="Password"
                  keyboardType="default"
                  autoCompleteType="password"
                  autoFocus={false}
                  value={data.password}
                  secureTextEntry={data.secureTextEntry}
                  textContentType="password"
                  placeholderTextColor="#666666"
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
                {data.secureTextEntry ? (
                  <Feather name="eye-off" color="grey" size={20} />
                ) : (
                  <Feather name="eye" color="grey" size={20} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  loginHandle(data.email, data.password);
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
                    <Text style={styles.buttonText}>SIGN IN</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
            {data.errorMessage === "" ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>{data.errorMessage}</Text>
              </Animatable.View>
            )}
            {data.isValidEmail === false ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <TouchableOpacity
                  onPress={() => {
                    resendEmailVerif();
                  }}>
                  <Text style={styles.buttonAction}>
                    Resend Email Verification
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            )}
            {data.isReqResetPass === false ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <TouchableOpacity
                  onPress={() => {
                    resetMyPass();
                  }}>
                  <Text style={styles.buttonAction}>Reset My Password</Text>
                </TouchableOpacity>
              </Animatable.View>
            )}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  color: "rgba(0, 0, 0, 0.40)",
                  fontFamily: "MontserratSemiBold",
                }}>
                OR SIGN IN WITH
              </Text>
            </View>
            <View style={styles.button}>
              <TouchableOpacity
                onPress={() => {
                  promptAsyncGoogleAuth();
                }}>
                <View
                  style={{
                    marginTop: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 5,
                  }}>
                  <LinearGradient
                    colors={["#f2f2f2", "#f2f2f2", "#e6e6e6"]}
                    style={styles.linearGradientSocial}>
                    <Text style={styles.buttonTextBlack}>
                      Sign In With Google
                    </Text>
                    <Image
                      style={{
                        marginLeft: 0,
                        marginTop: 0,
                        width: 20,
                        height: 20,
                      }}
                      source={require("../assets/icons/google.png")}
                    />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
            {Platform.OS === "ios" ? (
              <View>
                <View style={styles.button}>
                  <TouchableOpacity
                    onPress={() => {
                      promptFacebookAuthAsync();
                    }}>
                    <View
                      style={{
                        marginTop: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 5,
                      }}>
                      <LinearGradient
                        colors={["#f2f2f2", "#f2f2f2", "#e6e6e6"]}
                        style={styles.linearGradientSocial}>
                        <Text style={styles.buttonTextBlack}>
                          Sign In With Facebook
                        </Text>
                        <Image
                          style={{
                            marginLeft: 0,
                            marginTop: 0,
                            width: 20,
                            height: 20,
                          }}
                          source={require("../assets/icons/fb.png")}
                        />
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.button}>
                  <TouchableOpacity onPress={props.appleLogin.bind(this)}>
                    <View
                      style={{
                        marginTop: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 5,
                      }}>
                      <LinearGradient
                        colors={["#f2f2f2", "#f2f2f2", "#e6e6e6"]}
                        style={styles.linearGradientSocial}>
                        <Text style={styles.buttonTextBlack}>
                          Sign In With Apple
                        </Text>
                        <Image
                          style={{
                            marginLeft: 0,
                            marginTop: 0,
                            width: 20,
                            height: 25,
                          }}
                          source={require("../assets/icons/apple.png")}
                        />
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                </View>
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
                  props.navigation.navigate("HomeDrawer", {
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
                Linking.openURL(data.TermsConditions);
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
                Linking.openURL(data.PrivacyPolicy);
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
                props.navigation.navigate("LogIn", {
                  screen: "SignUpScreen",
                });
              }}>
              <Text
                style={[styles.color_textPrivateBold2, { fontWeight: "bold" }]}>
                {" "}
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
};

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(SignInScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ed5962",
  },
  image: {
    flex: 1,
    justifyContent: "center",
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
  buttonText: {
    fontSize: 14,
    fontFamily: "MontserratSemiBold",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
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
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: width * 0.85,
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
