import React, { useState, useEffect, useRef }  from 'react';
import { View, Dimensions, StyleSheet, Image, TouchableOpacity, TouchableHighlight, TextInputBase, Alert, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme, Text, List, RadioButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from 'expo-status-bar';
import{ AuthContext } from '../components/context';
// import { Slider, Icon } from 'react-native-elements';
import uuid from 'uuid-v4';
import Modal from 'react-native-modal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { marginTop } from 'styled-system';
import Slider from '@react-native-community/slider';
import algoliasearch from 'algoliasearch';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const defaultImage = 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/users%2FGroup%2056289.png?alt=media&token=ff47255e-e324-49da-b922-afc91f65996e';
const oldDefaultImage = 'https://cdn0.iconfinder.com/data/icons/education-2-27/32/user_staff_person_man_profile_boss_circle-512.png';

const thumbImageComp = require('../assets/icons/slider.png');

const userAttrToRetr = ['email', 'userPostId'];

const avatorTheme = {
  ...DefaultTheme,
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C90611',
  },
};

const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
  timeouts: {
    connect: 1,
    read: 2, // The value of the former `timeout` parameter
    write: 30
  }
});

const SettingsScreen = (props) => {
  
  const { colors } = useTheme();
  const theme = useTheme();
  // const firstNameRef = useRef(null);
  // const lastNameRef = useRef(null);
  const { signOut } = React.useContext(AuthContext);

  const firebase = require('firebase/app').default
  require('firebase/auth')
  require('firebase/database')

  const [data, setData] = useState({
    isRequestChangePic: false,
    isFirstNameFocused: false,
    isLastNameFocused: false,
    isLocationChange: false,
    isIdFocused: false,
    isPostIdAllowed: true,
    postError: '',
    toggleeGift: false,
    isRequesteGift: false,
    iseGiftRequested: true,
    takenPicture: '',
    image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2Fuser2.png?alt=media&token=ddda0d54-fa87-4400-8e97-6b3702d54345',
    oldImage: "https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/assets%2Fuser2.png?alt=media&token=ddda0d54-fa87-4400-8e97-6b3702d54345", 
    uid: '',
    email: '',
    createAt: 0,
    firstname: '',
    lastname: '',
    egiftEarned: 0,
    aroundRadius: 16094,
    aroundRadiusMile: 10,
    egiftChoice: 'grub',
    points: 0,
    myLocation: '',
    myOldLocation: '',
    userPostId: ''
  });

  useEffect(() => { 
    
    const { currentUser } = firebase.auth();
      // firebase.auth().onAuthStateChanged((user) => {
        if (currentUser !== null) {
          const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
              userRef.once('value', (snapshot) => {
                if (snapshot.val() !== null) {
                  setData({ 
                    ...data, 
                      uid: currentUser.uid,
                      email: snapshot.val().email,
                      image: snapshot.val().image,
                      oldImage: snapshot.val().image,
                      firstname: snapshot.val().firstname,
                      lastname: snapshot.val().lastname,
                      egiftEarned: snapshot.val().egiftEarned,
                      points: snapshot.val().points,
                      myLocation: snapshot.val().yourLocation,
                      myOldLocation: snapshot.val().yourLocation,
                      egiftChoice: snapshot.val().egiftChoice,
                      iseGiftRequested: snapshot.val().iseGiftRequested,
                      userPostId: snapshot?.val()?.userPostId,
                      aroundRadiusMile: parseInt(snapshot.val().aroundRadius * 0.00062137)
                  })
                }
              })
        }
      // })
    return () => {}
  }, [props?.route?.params?.cameFromDate]);
  const logOut = () => {
    signOut();
    firebase.auth().onAuthStateChanged((user) => {
          if (user === null) {
            props.navigation.navigate(
              'HomeDrawer', 
            {
            screen: 'HomeSc',
            params: {
                newData: 'Home',
              },
            }
            );
          }
    })
  }
  
  const useCameraHandler = async () => {
    await askPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        quality: 0.5
    });
      // setTimeout(() => {
      //      this.setState({ loadingStateVisible: false });
      // }, 1000);
      _handleImagePicked(result);
    // if (result.cancelled) {
    //   setTimeout(() => {
    //        this.setState({ loadingStateVisible: false });
    //   }, 1000);
    // }
  
  };
  const useLibraryHandler = async () => {
    await askPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        quality: 0.5
    });
    // this.setState({ loadingOverlayVisible: true });
    _handleImagePicked(result);
  };
  const postPhoto = () => {
    const { currentUser } = firebase.auth();
    Alert.alert('Congratulations!', 'Your image successfully uploaded.', [{ text: 'OK', 
      onPress: () => {}, 
      style: 'cancel' }], { cancelable: false });
      setData({ ...data, isRequestChangePic: false, oldImage: data.image })
      firebase.database().ref(`/users/${currentUser.uid}`).update({ image: data.image });
  }
  const cancelUpdate = () => {
    // Delete the file
    if (data.takenPicture !== '') {
      var the_string = data.takenPicture;
      var imageFirstPart = the_string.split('users%2F', 2);
      var imageSecPart =  imageFirstPart[1].split('?', 1);
      var finalImageName = imageSecPart[0];
      var storage = firebase.storage();
      var storageRef = storage.ref();
      let userImage = storageRef.child(`users/${finalImageName}`);
      userImage.delete();

      setData({ 
        ...data, 
          isRequestChangePic: false, 
          image: data.oldImage
      });
    } else {
      setData({ 
        ...data, 
        isRequestChangePic: false, 
        image: data.oldImage
      });
    }
  }
  const askPermissionsAsync = async () => {
      await Camera.getCameraPermissionsAsync()
      await Camera.requestCameraPermissionsAsync();
      // you would probably do something to verify that permissions
      // are actually granted, but I'm skipping that for brevity
  }; 
  const _handleImagePicked = async pickerResult => {
    // console.log(pickerResult);
    try {
      if (!pickerResult.cancelled) {
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        // console.log('uploadUrl', uploadUrl);
        
      setTimeout(() => {
        setData({ 
          ...data,
            oldImage: data.image,
            image: uploadUrl,
            takenPicture: uploadUrl
        })
      }, 100);
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {

    }
  };
  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    const ref = firebase
      .storage()
      .ref('users')
      .child(uuid());
    const snapshot = await ref.put(blob);
    // We're done with the blob, close and release it
    blob.close();

    return await snapshot.ref.getDownloadURL();
    // return await snapshot.downloadURL;
  }
  const deleteMyAccount = () => {
    Alert.alert(
            'Delete My Account',
            'Are you sure you want to delete your account? ',
            [
              { text: 'No', onPress: () => {

              }, style: 'cancel' },
              { text: 'Yes', onPress: () => {
                  const user = firebase.auth().currentUser;
                  const firebaseUser = firebase.database().ref(`/users/${user.uid}`)

                  user.delete().then(() => {
                    // User deleted.
                    firebaseUser.delete();
                    logOut();
                    Alert.alert('Deletion Allert: ',`Sadly, your account deleted from TroFii.`,
                      [
                          {text: 'OK', onPress: () => {}},
                        ],
                        { cancelable: false }
                        );
                  }).catch((error) => {
                    // An error ocurred
                    Alert.alert('Deletion Error: ',`${error}`,
                      [
                          {text: 'OK', onPress: () => {}},
                        ],
                        { cancelable: false }
                        );
                    // ...
                  });
                } 
              },
            ],
            { cancelable: false }
        );
  }
  const resetMyPass = () => {
    Alert.alert(
            'Rest My Password',
            'Are you sure you want to reset your password? ',
            [
              { text: 'No', onPress: () => {

              }, style: 'cancel' },
              { text: 'Yes', onPress: () => {
                firebase.auth().sendPasswordResetEmail(data.email, null)
                  .then(() => {
                    //this.setState({ isVisible: false });
                    Alert.alert('Email Message','Please check your email, your password has been reset.',
                      [
                          {text: 'OK', onPress: () => {}},
                        ],
                        { cancelable: false }
                        );
                    })
                } 
              },
            ],
            { cancelable: false }
        );
  }
  const sendRequest = () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const day = new Date().getDate();
      const hrs = new Date().getHours();
      const min = new Date().getMinutes();
      const time = `${month}/${day}/${year} ${hrs}:${min}`;
      const sec = new Date().getSeconds();
      const milsec = new Date().getMilliseconds();
      let dateID = ((year * 10000000000000) + (month * 100000000000) + 
        (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
  
      let uniqID = ((hrs * 10000000000000) + (month * 100000000000) + 
        (day * 1000000000) + (year * 10000000) + (min * 100000) + (sec * 1000) + milsec);
  
      const { currentUser } = firebase.auth();
      // const userRequesteGift = firebase.database().ref(`/userRequesteGift/`);
      const userEgifts = firebase.database().ref(`/userEgifts/${currentUser.uid}`);
      const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
      userRef.once("value", (snap) => {
          // userRequesteGift.push({ 
          //     egiftChoice: this.state.egiftChoice,
          //     egiftEarned: snap.val().egiftEarned,
          //     requester: `${snap.val().firstname} ${snap.val().lastname}`,
          //     email: snap.val().email,
          //     iseGiftRequestApproved: false,
          //     uid: currentUser.uid,
          //     dateID,
          //     uniqID
          //   });
          userEgifts.push({ 
              egiftChoice: data.egiftChoice,
              egiftEarned: snap.val().egiftEarned,
              requester: `${snap.val().firstname} ${snap.val().lastname}`,
              email: snap.val().email,
              iseGiftRequestApproved: false,
              uid: currentUser.uid,
              dateID,
              uniqID
            });
        });
       firebase.database().ref(`/users/${currentUser.uid}`).update({ iseGiftRequested: true });
       setData({ ...data, iseGiftRequested: true });
      Alert.alert('Congratulations !', 'Your request is successfully submited. We will notify you in 24 to 48 hours.',
      [
        {text: 'OK', onPress: () => {}, style: 'cancel'}
        ],
        { cancelable: false }
      );
  }
   const requestEgift = () => {
      if (data.egiftEarned > 14) {
        if (!data.iseGiftRequested) {
          Alert.alert(
              'WARNING !!!',
              `Are you sure you want to redeem your $${data.egiftEarned} ${data.egiftChoice === 'grub' ? 'GrubHub' : (data.egiftChoice === 'door' ? 'DoorDash' : 'UberEats')} eGift?`,
              [
                { text: 'No', onPress: () => {}, style: 'cancel' },
                { text: 'Yes', onPress: () => { 
                  sendRequest();
                }
              },
            ],
            { cancelable: false }
          );
        } 
        else {
          Alert.alert('Rejection Alert !', 'You have already submited your request. Your request is currently under review.', [{ text: 'OK', 
          onPress: () => {}, 
          style: 'cancel' }], { cancelable: false });
        }
      } else {
        Alert.alert('Rejection Alert !', 'You would need at least $15 to redeem your eGift.', [{ text: 'OK', 
        onPress: () => {}, 
        style: 'cancel' }], { cancelable: false });
      }
    }

  const changeEgiftChoice = (Choice) => {
      if (!data.iseGiftRequested) {
        setData({ ...data, egiftChoice: Choice, toggleeGift: false })
      } else if (data.iseGiftRequested && data.egiftCurrentChoice !== Choice) {
        setData({ ...data, toggleeGift: false })
        Alert.alert('Request Error !', `Sorry, you've already sent your eGift request. Please come back after you received your eGift to change your type of eGift, if necessary.`, [{ text: 'OK', 
        onPress: () => {}, 
        style: 'cancel' }], { cancelable: false });
      }
    }
  const updateMyPoints = (myAvailPoints, myRemainPoints) => {
    const { currentUser } = firebase.auth();
        if (currentUser !== null) {
          const userRef = firebase.database().ref(`/users/${currentUser.uid}`);
              userRef.once('value', (snapshot) => {
                if (snapshot.val() !== null) {
                  userRef.update({ 
                    points: myRemainPoints,
                    egiftEarned: snapshot.val().egiftEarned + myAvailPoints,
                    redeemedPoints: snapshot.val().redeemedPoints + (myAvailPoints*10)
                  });
                  setTimeout(() => {
                    userRef.once('value', (snapshot) => {
                      if (snapshot.val() !== null) {
                        setData({ 
                          ...data, 
                            uid: currentUser.uid,
                            email: snapshot.val().email,
                            image: snapshot.val().image,
                            oldImage: snapshot.val().image,
                            firstname: snapshot.val().firstname,
                            lastname: snapshot.val().lastname,
                            egiftEarned: snapshot.val().egiftEarned,
                            points: snapshot.val().points,
                            myLocation: snapshot.val().yourLocation,
                            myOldLocation: snapshot.val().yourLocation,
                            egiftChoice: snapshot.val().egiftChoice,
                            iseGiftRequested: snapshot.val().iseGiftRequested,
                            userPostId: snapshot?.val()?.userPostId,
                            aroundRadiusMile: parseInt(snapshot.val().aroundRadius * 0.00062137)
                        })
                      }
                    })
                  }, 1000);
                }
              })
        }
  }
  const convertMyPoints = () => {
    const myAvailPoints = Math.trunc(data.points/10);
    const myRemainPoints = data.points - (myAvailPoints*10);
    if (data.points > 9) {
        Alert.alert(
            'WARNING !!!',
            `Are you sure you want to redeem your ${data.points} points? \n(You will receive $${myAvailPoints} eGift${myRemainPoints !== 0 ? ` and you will still have ${myRemainPoints} reward points left` : ''}.)`,
            [
              { text: 'No', onPress: () => {}, style: 'cancel' },
              { text: 'Yes', onPress: () => { 
                updateMyPoints(myAvailPoints, myRemainPoints);
              }
            },
          ],
          { cancelable: false }
        );
    } else {
      Alert.alert('Rejection Alert !', 'You would need at least 10 points to redeem your Reward Points. \nEarn reward points by: \n\n1- Rating your favorite food. \n2- Upload your receipt from participating restaurants.', [{ text: 'OK', 
      onPress: () => {}, 
      style: 'cancel' }], { cancelable: false });
    }
  }
  const saveMyLocation = () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
        firebase.database().ref(`/users/${currentUser.uid}`).update({ yourLocation: data.myLocation });
        setData({ ...data, isLocationChange: false, myOldLocation: data.myLocation });
    } else {
      setData({ ...data, isLocationChange: false, myOldLocation: data.myLocation });
    }
  }
  
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {/* <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/> */}
        <View style={styles.container}>
          <View style={{ width, height: 56, justifyContent: 'center' }}>
            <View style={{ marginTop: Platform.OS === 'ios' ? -20 : 0, height: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ marginLeft: 0 }} onPress={() => { props.navigation.openDrawer(); }} >
                    <Image
                        style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
                        source={require('../assets/icons/menu.png')}
                        fadeDuration={100}
                    />
                </TouchableOpacity> 
                <Text style={styles.titleStyle7}>
                    Settings
                </Text>
                <TouchableOpacity style={{ marginRight: 10 }}  onPress={() => { logOut() }}>
                  <Image
                    style={{ flex: 1, width: 50, marginTop: 5, borderRadius: 5 }}
                    source={{ uri: Image.resolveAssetSource(require('../assets/icons/power.png')).uri, cache: 'force-cache' }}
                    fadeDuration={1}
                  />
                </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)', elevation: 1, width }} />
          </View>
          <ScrollView>
            <View style={{ flex: 1, marginLeft: width * 0.5 - 50 , marginTop: 25, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 15 }}>
              <Avatar.Image 
                theme={newStyle.theme}
                source={{
                    uri: data.image === defaultImage ? Image.resolveAssetSource(require('../assets/icons/user2.png')).uri : (data.image === oldDefaultImage ?  Image.resolveAssetSource(require('../assets/icons/user2.png')).uri : data.image)
                }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                size={100}
              />
              <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 60, marginTop: -25 }}  onPress={() => { setData({ ...data, isRequestChangePic: true }) }}>
                <Avatar.Image 
                  theme={newStyle.theme}
                  source={{
                      uri: Image.resolveAssetSource(require('../assets/icons/edit.png')).uri
                  }}
                  // style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 70, marginTop: -25 }}
                  size={30}
                />
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: width * 0.075, width: width * 0.85, marginTop: 20 }}>
              <TextInput
                // ref={firstNameRef}
                mode="outlined"
                label={"First Name"}
                value={data.firstname}
                theme={avatorTheme}
                onChangeText={(text) => { setData({ ...data, firstname: text }) }}
                onFocus={() => { setData({ ...data, isFirstNameFocused: true }) }}
                onBlur={() => { 
                  firebase.database().ref(`/users/${firebase.auth().currentUser.uid}`).update({ firstname: data.firstname });
                  setData({ ...data, isFirstNameFocused: false }) 
                }}
                style={{ fontFamily: 'Montserrat', fontSize: 18 }}
              />
            </View>
            <View style={{ marginLeft: width * 0.075, width: width * 0.85, marginTop: 20 }}>
              <TextInput
                // ref={lastNameRef}
                mode="outlined"
                label={"Last Name"}
                value={data.lastname}
                theme={avatorTheme}
                onChangeText={(text) => { setData({ ...data, lastname: text }) }}
                onFocus={() => { setData({ ...data, isLastNameFocused: true }) }}
                onBlur={() => { 
                  firebase.database().ref(`/users/${firebase.auth().currentUser.uid}`).update({ lastname: data.lastname });
                  setData({ ...data, isLastNameFocused: false }) 
                }}
                style={{ fontFamily: 'Montserrat', fontSize: 18 }}
              />
            </View>
            <View style={{ marginLeft: width * 0.075, width: width * 0.85, marginTop: 20 }}>
              <TextInput
                mode="outlined"
                label={"Email"}
                value={data.email}
                editable={false}
                theme={avatorTheme}
                style={{ fontFamily: 'Montserrat', fontSize: 16 }}
              />
            </View>
            <View style={{ marginLeft: width * 0.075, width: width * 0.85, marginTop: 20 }}>
              <TextInput
                // ref={lastNameRef}
                mode="outlined"
                label={"ID"}
                maxLength={10}
                value={data.userPostId}
                theme={avatorTheme}
                onChangeText={(text) => { 
                  if (text.length !== 10) {
                    setData({ ...data, isPostIdAllowed: false, postError: 'ID most be 10 character long', userPostId: text })
                  } else {
                    setData({ ...data, userPostId: text })
                    const index = client.initIndex('users');
                        index.search(text, {
                          attributesToRetrieve: userAttrToRetr,
                          hitsPerPage: 1,
                          minWordSizefor1Typo: 1,
                          minWordSizefor2Typos: 1,
                          typoTolerance: 'false',
                          // filters: `userPostId:${text}`,
                          // facetFilters: [`userPostId:${text}`]  
                        }).then(responses => {
                            const str = JSON.stringify(responses.hits);
                            let object = JSON.parse(str);
                            if (object[0]?.email !== undefined) {
                              if (object[0]?.email === data.email) {
                                console.log(object[0]?.email)
                                setData({ ...data, isPostIdAllowed: true, postError: '', userPostId: text });
                              } else {
                                setData({ ...data, isPostIdAllowed: false, postError: 'This ID is not available', userPostId: text })
                              }
                            } else {
                              setData({ ...data, isPostIdAllowed: true, postError: '', userPostId: text }) 
                            }
                        });
                  }
                }}
                onFocus={() => { setData({ ...data, isIdFocused: true }) }}
                onBlur={() => { 
                  if (data.isPostIdAllowed === true) {
                      firebase.database().ref(`/users/${firebase.auth().currentUser.uid}`).update({ userPostId: data.userPostId });
                      setData({ ...data, isIdFocused: false }) 
                  } else {
                    setData({ ...data, isIdFocused: false }) 
                  }
                }}
                style={{ fontFamily: 'Montserrat', fontSize: 18 }}
              />
            </View>
            {
              !data.isPostIdAllowed ? 
              <Text style={{ fontFamily: 'Montserrat', fontSize: 12, color: 'red', marginLeft: width * 0.075 }}>{data.postError}</Text> :
              <View/>
            } 
            <Button  
              theme={avatorTheme} mode="outlined" 
              onPress={() => { resetMyPass() }} 
              uppercase={false}
              style={{ marginLeft: width * 0.075, width: width * 0.85, marginTop: 25, height: 55, borderColor: '#C90611' }}
              contentStyle={{ height: 55 }}
            >
              Reset My Password
            </Button>
            {/* <View style={{ flexDirection: 'row', marginTop: 30, marginLeft: 25 }}>
              <Image
                  style={{ width: 19, height: 23.65, marginLeft: 5 }}
                  source={require('../assets/icons/award.png')}
              />  
              <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 10, marginTop: -2 }}>Reward Points: {data.points}</Text>
            </View>
            <Button 
              uppercase={false}
              color='#C90611'
              contentStyle={{ height: 55 }}
              style={{ height: 55, borderColor: '#C90611', marginTop: 10, width: width * 0.85, marginLeft: width * 0.075, marginBottom: 10, borderRadius: 10 }}
              mode="outlined" 
              onPress={() => convertMyPoints()}
            >
              Convert My Points to eGift
            </Button>
            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25 }}>
              <Image
                  style={{ width: 18, height: 18, marginLeft: 5 }}
                  source={require('../assets/icons/egift.png')}
              />  
              <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 10, marginTop: -2 }}>eGift Earned: ${data.egiftEarned}</Text>
            </View>
            <View style={{ marginBottom: 10, marginTop: -5 }}>
              <List.Section
                style={{
                  width: width * 0.65
                }}
              >
                <List.Accordion
                  titleStyle={{
                    fontSize: 14,
                    color: 'black',
                    fontFamily: 'MontserratSemiBold',
                  }}
                  title="eGift Selected"
                  left={props => 
                    <Image
                    style={{ width: 25, height: 19, marginLeft: 25 }}
                    source={data.egiftChoice === 'grub' ? require('../assets/icons/grub.png') : (data.egiftChoice === 'uber' ? require('../assets/icons/uber.png') : require('../assets/icons/dash.png'))}
                    />
                  }
                  expanded={data.toggleeGift}
                  onPress={() => { setData({ ...data, toggleeGift: !data.toggleeGift }) }}
                >
                  <TouchableOpacity
                    onPress={() => { changeEgiftChoice('grub') }}
                  >
                    <List.Item 
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', borderTopLeftRadius: 15, borderTopRightRadius: 15, marginLeft: -25, elevation: 1 }} 
                      title=" GrubHub"
                      titleStyle={{
                        fontSize: 14,
                        marginTop: -5,
                        color: 'black',
                        fontFamily: 'MontserratBold',
                      }} 
                      left={props => 
                        <View style={{ flexDirection: 'row' }}> 
                          <RadioButton
                            value="grub"
                            status={data.egiftChoice === 'grub' ? 'checked' : 'unchecked'}
                            color={"#C90611"}
                            uncheckedColor={"#C90611"}
                            // onPress={() => {}}
                          />
                          <Image
                            style={{ width: 25, height: 19, marginLeft: 10, marginTop: 7 }}
                            source={require('../assets/icons/grub.png')}
                          />
                        </View>
                    }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { changeEgiftChoice('door') }}
                  >
                  <List.Item 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', marginLeft: -25, elevation: 1, marginTop: -1 }} 
                    title=" DoorDash" 
                    titleStyle={{
                      fontSize: 14,
                      color: 'black',
                      fontFamily: 'MontserratBold',
                    }}
                    left={props => 
                      <View style={{ flexDirection: 'row' }}> 
                        <RadioButton
                          value="door"
                          status={data.egiftChoice === 'door' ? 'checked' : 'unchecked'}
                          color={"#C90611"}
                          uncheckedColor={"#C90611"}
                          // onPress={() => {}}
                        />
                        <Image
                          style={{ width: 25, height: 19, marginLeft: 10, marginTop: 7 }}
                          source={require('../assets/icons/dash.png')}
                        />
                      </View>
                    }
                  />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { changeEgiftChoice('uber') }}
                  >
                    <List.Item 
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, marginLeft: -25, elevation: 1, marginTop: -1 }} 
                      title=" Uber Eats" 
                      titleStyle={{
                        fontSize: 14,
                        color: 'black',
                        fontFamily: 'MontserratBold',
                      }}
                      left={props => 
                        <View style={{ flexDirection: 'row' }}> 
                          <RadioButton
                            value="uber"
                            status={data.egiftChoice === 'uber' ? 'checked' : 'unchecked'}
                            color={"#C90611"}
                            uncheckedColor={"#C90611"}
                            // onPress={() => {}}
                          />
                          <Image
                            style={{ width: 25, height: 19, marginLeft: 10, marginTop: 7 }}
                            source={require('../assets/icons/uber.png')}
                          />
                        </View>
                      }
                    />
                  </TouchableOpacity>
                </List.Accordion>
              </List.Section>
            </View>
            <TouchableOpacity style={{ marginLeft: width * 0.075 }} onPress={() => { requestEgift() }} disabled={data.iseGiftRequested} > 
              <LinearGradient colors={ data.iseGiftRequested === true ? ['#cccccc', '#cccccc', '#cccccc'] : ['#fb8389', '#f70814', '#C90611']} style={styles.linearGradient2}>
                <Text style={styles.buttonText}>Request my eGift</Text>
              </LinearGradient>
            </TouchableOpacity> */}
            <View style={{ marginLeft: width * 0.075 }}>
              <Text style={styles.buttonText2}>Distance Radius:</Text>  
            </View>
            <View style={{ alignItems: 'stretch', justifyContent: 'center', marginBottom: 50, marginLeft: width * 0.075, width: width * 0.82, marginTop: 15 }}>
              <Slider
                value={data.aroundRadiusMile}
                onSlidingComplete={(aroundRadiusMile) => { 
                  firebase.database().ref(`/users/${firebase.auth().currentUser.uid}`).update({ aroundRadius: ((aroundRadiusMile / 0.00062137) + 1) });
                  // console.log(aroundRadiusMile) 
                  setData({ 
                    ...data, 
                      aroundRadiusMile: aroundRadiusMile, 
                      aroundRadius: ((aroundRadiusMile / 0.00062137) + 1) 
                  });
                }}
                // onValueChange={(aroundRadiusMile) => { 
                //   console.log(aroundRadiusMile)
                //   setData({ 
                //     ...data, 
                //       aroundRadiusMile: aroundRadiusMile, 
                //       aroundRadius: ((aroundRadiusMile / 0.00062137) + 1) 
                //   });
                // }} 
                maximumValue={100}
                minimumValue={5}
                allowTouchTrack
                // tapToSeek
                animateTransitions
                // thumbTintColor='blue'
                animationType={'timing'}
                thumbTintColor={'#C90611'}
                minimumTrackTintColor={'#C90611'}
                step={1}
                // style={{ backgroundColor: 'blue' }}
                // trackStyle={{ height: 20, backgroundColor: 'transparent' }}
                // thumbStyle={{ height: 20, width: 10, backgroundColor: 'red' }}
                // thumbImageActive={thumbImageComp}
                // thumbImage={thumbImageComp}
              />
              <Text style={styles.buttonText3}>Miles: {data.aroundRadiusMile}</Text>
              <Text style={styles.buttonText2}>My Primary Location:</Text>  
              <TouchableOpacity
                onPress={() => { setData({ ...data, isLocationChange: true }) }} 
                style={{ flexDirection: 'row', marginBottom: 5, marginTop: 15 }}
              >
                <FontAwesome 
                    name="map-marker"
                    color={'#C90611'}
                    size={20}
                />
                <Text style={{ fontFamily: 'Montserrat', fontSize: 14, color: '#C90611', marginLeft: 10, marginRight: 10, marginTop: 2 }}>{data.myLocation}</Text>
                <FontAwesome 
                    name="pencil"
                    color={'#C90611'}
                    size={20}
                />
              </TouchableOpacity>
              <Button  
                theme={avatorTheme} mode="outlined" 
                onPress={() => { deleteMyAccount() }} 
                uppercase={false}
                style={{ marginLeft: 0, width: width * 0.85, marginTop: 25, height: 55, borderColor: 'black' }}
                contentStyle={{ height: 55 }}
              >
                Delete My Account
              </Button>
            </View>
          </ScrollView>
            <View style={{ flex: 1 }}>
              <Modal  
                isVisible={data.isRequestChangePic}
                animationInTiming={550}
                animationOutTiming={550} 
                propagateSwipe
                onModalHide={() => { setData({ ...data, isRequestChangePic: false }); }}
                onModalShow={() => { setData({ ...data, isRequestChangePic: true }) }}
                onBackdropPress={() => { cancelUpdate() }} 
                backdropColor='black'
                useNativeDriver={true}
                backdropOpacity={0.3}
                hideModalContentWhileAnimating
                onRequestClose={() => { setData({ ...data, isRequestChangePic: false }); }} 
                style={{
                  borderTopLeftRadius: 35,
                  borderTopRightRadius: 35,
                  borderBottomLeftRadius: 35,
                  borderBottomRightRadius: 35,
                  overflow: 'hidden',
                  padding: -5,
                  backgroundColor: 'transparent'
                }}
              >
              <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' , borderRadius: 35 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {/* <View style={{ marginTop: 10 }}>
                    <Image
                      style={{ width: 100 , height: 100, marginTop: 35 }}
                      source={require('../assets/icons/not_pic_menu.png')}
                      fadeDuration={100}
                    />
                  </View> */}
                  <View>
                    <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 20 }}>Update Your Image</Title>
                  </View>
                  {/* <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                    <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                      <View style={{ width: width * 0.95, marginTop: 0, marginLeft: 15 }}>
                        <Paragraph style={styles.searchDescStyle}>The item you</Paragraph>
                      </View>
                    </View>
                  </View> */}
                </View>
                {
                  data.takenPicture === '' ?
                    <View style={{ height: width * 0.41, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-evenly', marginTop: 10 }}>
                      <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                        <TouchableOpacity 
                          onPress={useCameraHandler}
                        > 
                          <Image
                            style={{ marginRight: -30, width: 120 , height: 120, marginTop: 0 }}
                            source={require('../assets/icons/photo.png')}
                            fadeDuration={100}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{flex: 1,  marginTop: 2, alignItems: 'center' }}>
                        <TouchableOpacity 
                          onPress={useLibraryHandler}
                        >
                          <Image
                            style={{ marginLeft: -30, width: 120 , height: 120, marginTop: 0 }}
                            source={require('../assets/icons/image.png')}
                            fadeDuration={100}
                          />
                        </TouchableOpacity>
                      </View>
                    </View> : 
                    <Image
                      style={styles.CurrentImage}
                      source={{ uri: data.takenPicture }}
                    />
                }
                <TouchableOpacity onPress={() => { postPhoto() }} disabled={data.takenPicture === '' ? true : false}>
                  <LinearGradient colors={ data.takenPicture === '' ? ['#cccccc', '#cccccc', '#cccccc'] : ['#fb8389', '#f70814', '#C90611']} style={styles.linearGradient}>
                    <Text style={styles.buttonText}>Update</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ marginTop: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                  <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => { cancelUpdate() }} >
                    <Title style={{ color: 'black', fontSize: 16, fontFamily: 'Montserrat' }}>Cancel</Title>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal  
                isVisible={data.isLocationChange}
                animationInTiming={550}
                animationOutTiming={550} 
                propagateSwipe
                onModalHide={() => { setData({ ...data, isLocationChange: false }); }}
                onModalShow={() => { setData({ ...data, isLocationChange: true }) }}
                onBackdropPress={() => { setData({ ...data, isLocationChange: false }); }} 
                backdropColor='black'
                useNativeDriver={true}
                backdropOpacity={0.3}
                hideModalContentWhileAnimating
                onRequestClose={() => { setData({ ...data, isLocationChange: false }); }} 
                style={{
                    borderTopLeftRadius: 35,
                    borderTopRightRadius: 35,
                    borderBottomLeftRadius: 35,
                    borderBottomRightRadius: 35,
                    overflow: 'hidden',
                    padding: -5,
                    backgroundColor: 'transparent'
                }}
            >
            <ScrollView
                keyboardShouldPersistTaps='always'
                keyboardDismissMode={'interactive'} 
                style={{ flex: 1, backgroundColor: 'white' , borderRadius: 35 }}
              >
              <TouchableOpacity
                    onPress={() => { setData({ ...data, isLocationChange: false, myLocation: data.myOldLocation }); }}
                    style={{ marginVertical: 10, marginLeft: 25, marginTop: 25 }}
                >
                    <Feather 
                        name="x"
                        color="grey"
                        size={30}
                    />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ marginTop: 10, marginLeft: 0 }}>
                      <Image
                      style={{ width: 62 , height: 73, marginTop: 0 }}
                      source={require('../assets/icons/pin.png')}
                      fadeDuration={100}
                      />
                  </View>
                  <View>
                      <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 10 }}>Search New Location</Title>
                  </View>
                  <View style={{ borderRadius: 35 }}>
                      <View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              <Paragraph style={styles.searchDescStyle3}>Current Location</Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <FontAwesome 
                        name="map-marker"
                        color={'#EE5B64'}
                        size={20}
                    />
                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: '#EE5B64', marginLeft: 10 }}>{data.myLocation}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, marginBottom: 20, marginTop: 20 }}>
                  <GooglePlacesAutocomplete
                    placeholder='Search here ...'
                    scrollEnabled={false}
                    minLength={2} // minimum length of text to search
                    autoFocus={false}
                    returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                    // listViewDisplayed='auto'    // true/false/undefined
                        // fetchDetails
                    listViewDisplayed={'auto'}
                    keyboardShouldPersistTaps='always'
                    renderDescription={(row) => row.description} // custom description render
                    onPress={(data1, details = null) => { // 'details' is provided when fetchDetails = true
                        setData({ ...data, myLocation: data1.description });
                    }}
                    // getDefaultValue={() => {
                    //   return ''; // text input default value
                    // }}
                    query={{
                        key: 'AIzaSyBZGm2V3DjsFEO_7qRFBk8UaPqjghLhnQo',
                        language: 'en', // language of the results
                        types: '(cities)' // default: 'geocode'
                    }}
                    styles={{
                        description: styles.descCitiesStyle,
                        predefinedPlacesDescription: styles.descCitiesStyle,
                        textInputContainer: {
                            marginLeft: 25,
                            height: 55,
                            backgroundColor: '#ffffff',
                            color: 'black',
                            borderColor: 'black',
                            width: width * 0.8,
                            // borderBottomWidth: 0
                        },
                        textInput: {
                            backgroundColor: 'white',
                            marginLeft: 25,
                            borderColor: 'gray',
                            borderWidth: 1,
                            marginLeft: 0,
                            marginRight: 0,
                            height: 40,
                            color: 'black',
                            fontSize: 16
                        },
                        poweredContainer: {
                        flex: 1,
                        // width: 0,
                        // height: 0,
                        // marginLeft: -50,
                        // backgroundColor: '#731c32'
                        // backgroundColor: '#f2f2f2'
                        }
                    }}
                    // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                    // currentLocationLabel="Current location"
                    debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                  />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 0 }}>
                  <TouchableOpacity onPress={() => { saveMyLocation() }} >
                      <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                          <LinearGradient colors={['#fb8389', '#f70814', '#C90611']} style={styles.linearGradient}>
                              <Text style={styles.buttonText}>Save Search</Text>
                          </LinearGradient>
                      </View>
                  </TouchableOpacity>  
                  <TouchableOpacity onPress={() => { setData({ ...data, isLocationChange: false, myLocation: data.myOldLocation }) }} style={{ marginBottom: 30 }}>
                      <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                          <LinearGradient colors={['#fff', '#fff', '#fff']} style={styles.linearGradient2}>
                              <Text style={styles.buttonText2}>Cancel</Text>
                          </LinearGradient>
                      </View>
                  </TouchableOpacity>
                </View>
            </ScrollView>
            </Modal>
          </View>
        </View>
      </SafeAreaView>
    );
};

export default SettingsScreen;
const newStyle = {
  theme: {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: 'white',
      accent: 'white',
    }
  },
}
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'flex-start', 
    justifyContent: 'center'
  },
  titleStyle7: { 
      // flex: 1,
      fontFamily: 'MontserratSemiBold',
      fontSize: 14, 
      // marginLeft: width * 0.2,
      // justifyContent: 'center'
  },
  descCitiesStyle: { 
    color: 'black',
    marginLeft: 15,
    // marginTop: -5,
    fontFamily: 'MontserratSemiBold',
  },
  linearGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: width * 0.60
  },
  searchDescStyle3: {
    textAlign: 'center',
    fontSize: 12, 
    marginLeft: 0,
    width: width * 0.70,
    borderRadius: 40,
    fontFamily: 'Poppins',
    color: 'rgba(0, 0, 0, 0.39)',
  },
  linearGradient2: {
    marginBottom: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: width * 0.85, 
    // marginLeft:  width * 0.075
    marginLeft:  0
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'MontserratSemiBold',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  buttonText2: {
    fontSize: 15,
    fontFamily: 'MontserratSemiBold',
    marginTop: 15,
    // marginLeft: width * 0.075,
  },
  buttonText3: {
    fontSize: 12,
    fontFamily: 'MontserratBold',
    marginLeft: width * 0.65,
    marginTop: -5
  },
  CurrentImage: {
    width: width * 0.40, 
    height: width * 0.40,
    borderRadius: 5,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchDescStyle: {
    textAlign: 'center',
    fontSize: 14, 
    marginLeft: 15,
    width: width * 0.75,
    borderRadius: 40,
    fontFamily: 'MontserratReg',
    color: 'black',
  },
});
