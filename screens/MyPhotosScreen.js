import React, { useState, useEffect, useRef }  from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, Linking, FlatList, ActivityIndicator, TouchableHighlight, Alert, Keyboard } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme, Caption, Text } from 'react-native-paper';
// import * as Permissions from 'expo-permissions';
import { Rating, Header, Input } from 'react-native-elements';
import algoliasearch from 'algoliasearch';
// import * as firebase from 'firebase';
import update from 'immutability-helper';
import Tags from "react-native-tags";

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const firebase = require('firebase/app').default
require('firebase/auth')
require('firebase/database')

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;


const MyPhotosScreen = ({ navigation , route }) => {

    const { colors } = useTheme();
    const onChangeSearch = query => setSearchQuery(query);
    const theme = useTheme();
    let _flatList = useRef(null);
    const [data, setData] = useState({
        myPhotos: [],
        uid: '',
    });
    useEffect(() => { 
        setTimeout(() => {
            const { currentUser } = firebase.auth();
            if (currentUser !== null) {
                firebase.database().ref(`/userImage/${currentUser.uid}`)
                    .once('value', (snap) => {
                        if(snap.val() !== null) {
	      // 	snap.forEach((snapshot) => {
		    //     if (snapshot !== null) {
		    //     	this.setState({ imagesList: this.state.imagesList.concat(snapshot.val()) });
        //           	this.setState({ imagesList: this.state.imagesList.sort((a, b) => { return (b.dateID) - (a.dateID); }) });
        //   			// this.setState({ imagesList: this.state.imagesList.reverse() });
		    //     }
		    // });
                            const arr = Object.keys(snap.val()).map((key) => {
                                return (snap.val()[key]);
                            }).sort((a, b) => { return (b.dateID) - (a.dateID); });

                            // const arr = Object.keys(snap.val()).map((key) => {
                            //     return (snap.val()[key]);
                            // })
                            setData({ ...data, 
                                uid: currentUser.uid,
                                myPhotos: arr
                            });

                        }
                });
            }
        }, 10);
        return () => { }
    }, [route?.params?.cameFromDate]);


    const calcTime = (CreateAt) => {
        const minutes = Number(CreateAt.substring(10, 12));
        const hours = Number(CreateAt.substring(8, 10));

        if (CreateAt.substring(4, 6) === '01') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '02') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '03') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '04') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '05') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '06') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '07') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '08') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '09') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '10') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '11') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
        if (CreateAt.substring(4, 6) === '12') {
          return (`${hours > 12 ? hours-12 : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ hours > 12 ? 'PM' : 'AM' }`);
        }
    }
    const calcDate = (CreateAt) => {
        const day = Number(CreateAt.substring(6, 8));
        const year = Number(CreateAt.substring(0, 4));
        // console.log(CreateAt)
        if (CreateAt.substring(4, 6) === '01') {
          return (`Jan ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '02') {
          return (`Feb ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '03') {
          return (`Mar ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '04') {
          return (`Apr ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '05') {
          return (`May ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '06') {
          return (`Jun ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '07') {
          return (`Jul ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '08') {
          return (`Aug ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '09') {
          return (`Sep ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '10') {
          return (`Oct ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '11') {
          return (`Nov ${day}, ${year}`);
        }
        if (CreateAt.substring(4, 6) === '12') {
          return (`Dec ${day}, ${year}`);
        }
    }

    const _renderItem = ({ item, index }) => {
        // getRestLogo(index, item.restaurantUid);
        // console.log(item, index)
      return (
        <View style={{ width, marginTop: 15, justifyContent: 'center', alignItems: 'center', }}>
            <View>
                <Caption style={styles.titleStyle3}>
                    {calcDate(item?.dateID?.toString())}
                </Caption>
                <Card elevation={10} style={{ width: width * 0.90, justifyContent: 'center', alignItems: 'center', borderRadius: 15, elevation: 3, marginBottom: 10 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Card.Cover style={{ width: width * 0.90, borderTopLeftRadius: 15, borderTopRightRadius: 15 }} source={{ uri: item.takenPicture }} />
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-start', marginBottom: 10, marginLeft: 20, marginTop: 15 }}>
                            <Text style={styles.titleStyle1}>
                                {item.restName}
                            </Text>
                            <Caption style={styles.titleStyle4}>
                                {item.foodType}
                            </Caption>
                            <Text style={styles.titleStyle2}>
                                Submited: {calcTime(item?.dateID?.toString())}
                            </Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 10, marginLeft: (item.isApproved === true && item.isViewed === true) ? 10 : ((item.isApproved === false && item.isViewed === true) ? 25 : 15) }}>
                            <View>
                                <Image 
                                    style={{ width: 50, height: 50 }}
                                    source={(item.isApproved === true && item.isViewed === true) ? require('../assets/icons/approve.png') : ((item.isApproved === false && item.isViewed === true) ? require('../assets/icons/deny.png') : require('../assets/icons/pending.png'))}
                                />
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 16, color: (item.isApproved === true && item.isViewed === true) ? 'green' : ((item.isApproved === false && item.isViewed === true) ? 'red' : '#EEC15B') }}>
                                    {(item.isApproved === true && item.isViewed === true) ? 'Approved' : ((item.isApproved === false && item.isViewed === true) ? 'Denied' : 'Pending')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {
                      item.reason !== '' ?
                        <View style={{ flexDirection: 'row' ,width: width * 0.7 }}>
                          <Text style={styles.titleStyle5}>
                              Reason: 
                          </Text>
                          <Text style={styles.titleStyle6}>
                              {item.reason}
                          </Text>
                        </View>
                      : null
                    }
                </Card>
            </View>
        </View>
      )
    }
    const renderEmpty = () => {
        return (
            <View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                      style={{ "resizeMode": "contain", "backgroundColor": "#ffffff", width, height: height - 85 }}
                      source={require('../assets/NoPictureYet.png')}
                  />
                </View>
            </View>
        )
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, marginTop: Platform.OS === 'ios' ? -10 : 0 }}>
            <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
            <View style={{ height: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <TouchableOpacity style={{ marginLeft: 0 }} onPress={() => { navigation.openDrawer(); }} >
                    <Image
                        style={{ flex: 1, marginLeft: 10, width: 50 , height: 5, marginTop: 5 }}
                        source={require('../assets/icons/menu.png')}
                        fadeDuration={100}
                    />
                </TouchableOpacity> 
                <Text style={styles.titleStyle7}>
                    My Photos
                </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)' , elevation: 1 }} />
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <FlatList
                    // ref={this.props.scrollRef}
                    ref={(flatList) => { _flatList = flatList }}
                    data={data.myPhotos}
                    extraData={data.myPhotos}
                    initialNumToRender={10} 
                    keyExtractor={(item) => (item?.dateID?.toString())}
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
        </View>
      </SafeAreaView>
    ); 
}

const styles = {
    titleStyle7: { 
        flex: 1,
        fontFamily: 'MontserratSemiBold',
        fontSize: 14, 
        marginLeft: (height / width) > 1.5 ? width * 0.3 - 25 : width * 0.4 - 25,
        justifyContent: 'center'
    },
    titleStyle3: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      marginTop: 10,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start'
    //   width: width * 0.70
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle4: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      justifyContent: 'flex-start'
    //   width: width * 0.70
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle2: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 12, 
      width: width * 0.50
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle5: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 15, 
      // width: width * 0.8,
      marginLeft: 20,
      marginBottom: 20
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle6: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      // width: width * 0.8,
      marginLeft: 5,
      marginTop: 2,
      marginBottom: 20
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle1: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 17, 
      width: width * 0.55
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
}

export default MyPhotosScreen;
