import React, { useState, useEffect, useRef }  from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, Linking, FlatList, ActivityIndicator, TouchableHighlight, Input, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from 'expo-status-bar';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme, Caption, Text } from 'react-native-paper';
// import * as Analytics from 'expo-firebase-analytics';
import * as ImagePicker from 'expo-image-picker';
import * as AppleAuthentication from 'expo-apple-authentication';
// import * as Permissions from 'expo-permissions';
import { SocialIcon, Header } from 'react-native-elements';
import { Camera } from 'expo-camera';
import axios from 'axios';
import update from 'immutability-helper';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import openMap from 'react-native-open-maps';
import algoliasearch from 'algoliasearch';
import uuid from 'uuid-v4';
import Modal from 'react-native-modal';
// import * as firebase from 'firebase';
import Tags from "react-native-tags";

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const firebase = require('firebase/app').default
require('firebase/auth')
require('firebase/database')

const userAttrToRetr = ['email', 'isRestActive', 'createdAt', 'firstname', 'image', 'lastname', 'restDesc',
                        'username', 'restName', 'tokenPass', 'yourLocation', 'restUpdateslist', 'restaurantUid',
                        'restWebsite', 'restAddress', 'restOrderWeb', 'code'];

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
                    
const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
    timeouts: {
      connect: 1,
      read: 2, // The value of the former `timeout` parameter
      write: 30
    }
  });
  const avatorTheme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#EE5B64',
      accent: '#EE5B64',
    },
  };
  
  let index;

  const MyFavRestsScreen = ({ navigation , route }) => {

    const { colors } = useTheme();
    const onChangeSearch = query => setSearchQuery(query);
    const theme = useTheme();
    let _flatList = useRef(null);
    const [data, setData] = useState({
        restsList: [],
        myFavRestList: [],
        objectIDs: [],
        myFavRestList: [],
        uid: '',
        isLiked: true
    });
    useEffect(() => { 
      // console.log(route)
        setTimeout(() => {
            let objectIDs = [];
            let myFavRestList = [];
            const { currentUser } = firebase.auth();
            if (currentUser !== null) {
                firebase.database().ref(`/users/${currentUser.uid}`)
                      .once('value', (snap) => {
                            if (snap.val()?.restsList !== undefined) {
                                snap.val().restsList.forEach((snapshot) => {
                                    if (snapshot !== 0) {
                                        firebase.database().ref('/restsList/')
                                            .once('value', (snap2) => {
                                                snap2.forEach((data1) => {
                                                    if (data1.val().restaurantUid === snapshot && data1.val().isRestActive) {
                                                        objectIDs = objectIDs.concat(data1.key);
                                                        myFavRestList= myFavRestList.concat(data1.val());
                                                        setData({ ...data, 
                                                            uid: currentUser.uid,
                                                            objectIDs,
                                                            myFavRestList
                                                        });
                                                    }
                                            })
                                        });
                                    }
                              })
                            }
                      });
            }
        }, 10);
        return () => { }
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
                    <View key={`${tag}-${index}`} style={{ marginLeft: 0, marginTop: -12, marginRight: 0, marginBottom: 0, borderRadius: 10, height: tag.length > width / 10.5 ? 50 : 30, justifyContent: 'center', alignItems: 'center' }}> 
                    <Caption style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, marginLeft: 1, marginRight: 1 }}>{index === 0 ? null : '•' }{tag}</Caption>
                    </View>
                )}
                />
            )
        }
    }

        const followingFunc = (restName, restaurantUid, index) => {

            const { currentUser } = firebase.auth();
            let userRef;
              let restFollowersList = [];
              let idxOfFollowerList = 0;
              let RestNumFollowers = 0;
              let listTemp = data.myFavRestList;
              let tempObjectIDs = data.objectIDs;
        
              const restListRef = firebase.database().ref(`/restsList/${data.objectIDs[index]}`);
              const restRef = firebase.database().ref(`/users/${restaurantUid}`);
        
            if (currentUser !== null) {
                userRef = firebase.database().ref(`/users/${currentUser.uid}`);
        
                  Alert.alert(
                  'Deletion Alert!',
                  `Are you sure you want to delete ${restName} from your favorite restaurants' list? `,
                    [
                          {text: 'No', onPress: () => {
                      }, style: 'cancel'},
                      {text: 'Yes', onPress: () => {
                            restRef.once('value', (snap) => {
                                restFollowersList = snap.val().followersList;
                            });
                            restListRef.once('value', (snap) => {
                                RestNumFollowers = snap.val().RestNumFollowers;
                            });
                        userRef.once('value', (snapshot) => {
                        if (snapshot !== null && restFollowersList !== undefined) {
                            const ListOfRests = snapshot.val().restsList;
                        const idx = ListOfRests.indexOf(restaurantUid);
                               ListOfRests.splice(idx, 1);
                              idxOfFollowerList = restFollowersList.indexOf(`${currentUser.uid}`);
                              restFollowersList.splice(idxOfFollowerList, 1);
                              if (ListOfRests.length === 0) {

                                if (snapshot?.val()?.restFollowingNum !== undefined) {
                                  userRef.update({ restsList: {0: '_' }, restFollowingNum: snapshot?.val()?.restFollowingNum === 0 ? 0 : snapshot?.val()?.restFollowingNum- 1 });  
                                } else {
                                  userRef.update({ restsList: {0: '_' }, restFollowingNum: snapshot?.val()?.restsList.length === 0 ? 0 : snapshot?.val()?.restsList.length - 1 });
                                }

                                restListRef.update({ RestNumFollowers: (RestNumFollowers - 1) });
                                if (idxOfFollowerList !== -1) {
                                  restRef.update({ followerNum: (RestNumFollowers - 1), followersList: restFollowersList });
                                } 
                                else {
                                  restRef.update({ followerNum: (RestNumFollowers - 1) });
                                }
                                restListRef.once('value', (snap) => {
                                  if (snap.val() !== null) {
                                      RestNumFollowers = snap.val().RestNumFollowers;
                                    } 
                                });
                                        // this.setState({ myFavRestList: [] });
                                        // this.setState({ objectIDs: [] });
                                          listTemp.splice(index, 1);
                                          tempObjectIDs.splice(index, 1);
                                        //   this.setState({ myFavRestList: listTemp });
                                        //   this.setState({ objectIDs: tempObjectIDs });
                                          setData({ ...data, myFavRestList: listTemp, objectIDs: tempObjectIDs })
                              } 
                              else {
                                if (snapshot?.val()?.restFollowingNum !== undefined) {
                                  userRef.update({ restsList: ListOfRests, restFollowingNum: snapshot?.val()?.restFollowingNum === 0 ? 0 : snapshot?.val()?.restFollowingNum - 1 }); 
                                  restListRef.update({ RestNumFollowers: (RestNumFollowers - 1) });
                                  if (idxOfFollowerList !== -1) {
                                    restRef.update({ followerNum: (RestNumFollowers - 1), followersList: restFollowersList });
                                  } 
                                  else {
                                    restRef.update({ followerNum: (RestNumFollowers - 1) });
                                  }
                                  restListRef.once('value', (snap) => {
                                    if (snap.val() !== null) {
                                        RestNumFollowers = snap.val().RestNumFollowers;
                                      }
                                  });
                                          // this.setState({ myFavRestList: [] });
                                          // this.setState({ objectIDs: [] });
                                            listTemp.splice(index, 1);
                                            tempObjectIDs.splice(index, 1);
                                          //   this.setState({ myFavRestList: listTemp });
                                          //   this.setState({ objectIDs: tempObjectIDs });
                                            
                                            setData({ ...data, myFavRestList: listTemp, objectIDs: tempObjectIDs })
                                } else {
                                  userRef.update({ restsList: ListOfRests, restFollowingNum: snapshot?.val()?.restsList.length === 0 ? 0 : snapshot?.val()?.restsList.length - 1 });
                                  restListRef.update({ RestNumFollowers: (RestNumFollowers - 1) });
                                  if (idxOfFollowerList !== -1) {
                                    restRef.update({ followerNum: (RestNumFollowers - 1), followersList: restFollowersList });
                                  } 
                                  else {
                                    restRef.update({ followerNum: (RestNumFollowers - 1) });
                                  }
                                  restListRef.once('value', (snap) => {
                                    if (snap.val() !== null) {
                                        RestNumFollowers = snap.val().RestNumFollowers;
                                      }
                                  });
                                          // this.setState({ myFavRestList: [] });
                                          // this.setState({ objectIDs: [] });
                                            listTemp.splice(index, 1);
                                            tempObjectIDs.splice(index, 1);
                                          //   this.setState({ myFavRestList: listTemp });
                                          //   this.setState({ objectIDs: tempObjectIDs });
                                            
                                            setData({ ...data, myFavRestList: listTemp, objectIDs: tempObjectIDs })
                                }
                              }
                            }
                          });
                      }
                    },
                    ],
                  { cancelable: false }
                )
            }
          }

    const _renderItem = ({ item, index }) => {
        // getRestLogo(index, item.restaurantUid);
      return (
        <Card style={{ width: width * 0.95, justifyContent: 'center', alignItems: 'center', marginTop: 10, borderRadius: 15, elevation: 5, marginLeft: 10, marginBottom: 10 }}>
            <View style={{ alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, marginRight: 15, padding: 5, width: width * 0.9, justifyContent: 'center' }}>
              <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 15, flexDirection: 'row', borderRadius: 5 }}>
                  <View style={{ height: 60, width: 60 }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5, marginLeft: -5, position: 'absolute', height: 60, width: 60, borderRadius: 30, backgroundColor: '#e6e6e6', zIndex: 0 }} />
                    <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', marginTop: 10, zIndex: 1 }}>  
                        <Avatar.Image
                          size={50}
                          theme={styles.theme}
                          // rounded
                          // style={{ width: 50, height: 50, borderRadius: 25 }}
                          source={{ uri: item.image }}
                          // activeOpacity={1.0}
                          // onPress={() => { console.log(this.getRestLogo(item.restaurantUid)) }}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', width: width * 0.7 }}>
                    <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 5, marginTop: 5 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', marginBottom: 10 }}>
                            <Text style={styles.titleStyle}>
                                {item.restName}
                            </Text>
                        </View>                
                        <View style={{ flex: 1, marginTop: -5, marginBottom: 5 , width: width * 0.75 }}>
                            {tagSeperator(item.restDesc)}
                        </View>
                    </View>
                    <View style={{ marginLeft: 5, marginTop: 10, marginLeft: 0 }}>
                        <Text style={{ fontFamily: 'MontserratBold', fontSize: 10 }}>
                            {item.RestNumFollowers} {item.RestNumFollowers === 1 ? 'Follower' : 'Followers'}
                        </Text>
                    </View>
                  </View>
              </View>
                <Card.Actions style={{ marginLeft: -10, marginTop: -10, justifyContent: 'space-evenly', flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => { Linking.openURL(`http://${item.restWebsite}`); }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: -5 }}>
                    <View>
                        <Button labelStyle={{ fontSize: 20, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }} icon="web" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, color: colors.text, marginLeft: -20 }}>Website</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity  style={{ marginLeft: 5 }} onPress={() => { goToLocation(item.restAddress) }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: -5 }}>
                    <View>
                        <Button labelStyle={{ fontSize: 20, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }} icon="map-marker-radius" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, color: colors.text, marginLeft: -20 }}>Locate</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => { callNow(item.phoneNum) }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: -5 }}>
                    <View>
                        <Button labelStyle={{ fontSize: 20, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }} icon="phone" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, color: colors.text, marginLeft: -20 }}>Call</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => { orderOnline(item.restOrderWeb) }}>
                    <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: -5 }}>
                    <View>
                        <Button labelStyle={{ fontSize: 20, fontFamily: 'MontserratSemiBold', color: colors.text, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }} icon={require('../assets/icons/order.png')} />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 12, color: colors.text, marginLeft: -20 }}>Order</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                </Card.Actions>
                <Card.Actions>
                    <TouchableOpacity 
                    onPress={() => { 
                        navigation.navigate('FavRestMenu', { 
                            restaurantUid: item.restaurantUid, 
                            restaurantName: item.restName,
                            objectID: item.objectID,
                            food_name: '',
                            RestNumFollowers: item.RestNumFollowers
                        });
                    }} 
                    >
                        <View style={{  marginLeft: 10, marginTop: -20, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                            <LinearGradient colors={['#fb8389', '#f70814', '#C90611']} 
                            style={styles.linearGradient}
                            >
                                <Text 
                                style={styles.buttonText}
                                >See Restaurants Full Menu</Text>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>  
                    <TouchableOpacity style={{flex: 1, marginLeft: 10, marginTop: -20 }} onPress={() => {
                        //  await isOpen(props.route.params.finalResults.restName)
                        followingFunc(item.restName, item.restaurantUid, index)
                    }} >
                        {
                            data.isLiked === true ? 
                                <Image
                                    style={{ flex: 1, width: 75 , height: 75 }}
                                    source={require('../assets/icons/heart.png')}
                                    fadeDuration={100}
                                /> 
                            :
                                <Image
                                    style={{ flex: 1, width: 75 , height: 75 }}
                                    source={require('../assets/icons/un-heart.png')}
                                    fadeDuration={100}
                                />
                        }
                    </TouchableOpacity> 
                </Card.Actions>
            </View>
        </Card>
        );
    }
    const renderEmpty = () => {
        return (
            <View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                      style={{ "resizeMode": "contain", "backgroundColor": "#ffffff", width, height: height - 85 }}
                      source={require('../assets/NoFollowYet.png')}
                  />
                </View>
            </View>
      )
    }
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, marginTop: -25 }}>
            <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
            <FlatList
                // ref={this.props.scrollRef}
                ref={(flatList) => { _flatList = flatList }}
                data={data.myFavRestList}
                extraData={data.myFavRestList}
                initialNumToRender={10} 
                keyExtractor={(item) => (item.restaurantUid.toString())}
                renderItem={_renderItem.bind(this)}
                // ListHeaderComponent={renderHeader()}
                // ListFooterComponent={renderFooter}
                // ListFooterComponentStyle={{ width, height: 50 }}
                // refreshing={data.refreshing}
                // onRefresh={handleRefresh}
                // onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
                ListEmptyComponent={renderEmpty.bind(this)}
                // shouldItemUpdate={_shouldItemUpdate.bind(this)}
            />
        </View>
      </SafeAreaView>
    ); 
}  

const styles = {
    input: {
      flex: 1, 
      width,
      marginTop: -30,
      color: 'black',
      textDecorationColor: 'black',
    //   fontFamily: 'SourceSansPro',
        // fontFamily: 'times',
      paddingTop: 7
    }, 
    linearGradient: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        width: width * 0.65
    },
    buttonText: {
      fontSize: 12,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    TopImage: {
        flex: 1,
        // position: 'absolute',
        zIndex: 1,
        // opacity: 0.8,
        // marginTop: -15,
        alignSelf: 'stretch',
        backgroundColor: 'white',
        width,
        height,
    },
    theme: {
      ...DefaultTheme,
      roundness: 2,
      colors: {
        ...DefaultTheme.colors,
        primary: 'white',
        accent: 'white',
      },
    },
    textStyle: { 
      fontSize: 17, 
      // fontWeight: 'bold',
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'black',
      marginLeft: -25,
    //   fontFamily: 'SourceSansPro-SemiBold',
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(153, 153, 153, 0.55)', 
      // textShadowOffset: { width: -1, height: 1 }
      },
    catNumStyle: {
      fontSize: 12, 
      fontFamily: 'Montserrat',
      width: width * 0.5
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 14, 
      width: width * 0.5
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    buttonStyle: {
      color: 'white',
      fontSize: 30,
      marginTop: 8,
      // marginLeft: -1,
      // backgroundColor: 'white',
      // width: (width / 2) - 60,
      justifyContent: 'center', 
      // borderRadius: 10,
      alignItems: 'center'
      // marginBottom: 20
    },
    numStyle: { 
        fontSize: 18, 
        marginLeft: 2,
        marginTop: 7,
        // textShadowRadius: 5, 
        // fontFamily: 'SourceSansPro',
        // color: 'black',
        // textShadowColor: 'rgba(153, 153, 153, 0.55)', 
        // textShadowOffset: { width: -1, height: 1 } 
      },
    descStyle: { 
        fontSize: 16, 
        marginLeft: 2,
        marginTop: 7,
        // textShadowRadius: 5, 
        // fontFamily: 'SourceSansPro-SemiBold',
        color: '#0c1355',
        // textShadowColor: 'rgba(153, 153, 153, 0.55)', 
        // textShadowOffset: { width: -1, height: 1 } 
      }
  };
export default MyFavRestsScreen;








