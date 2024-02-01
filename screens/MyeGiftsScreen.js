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


const uber = require('../assets/icons/uber.png');
const uberUri = Image.resolveAssetSource(uber).uri;

const grub = require('../assets/icons/grub.png');
const grubUri = Image.resolveAssetSource(grub).uri;

const dash = require('../assets/icons/dash.png');
const dashUri = Image.resolveAssetSource(dash).uri;

const approved = require('../assets/icons/approve.png');
const approvedUri = Image.resolveAssetSource(approved).uri;

const pending = require('../assets/icons/pending.png');
const pendingUri = Image.resolveAssetSource(pending).uri;

const deny = require('../assets/icons/deny.png');
const denyUri = Image.resolveAssetSource(deny).uri;

const MyeGiftsScreen = ({ navigation , route }) => {

    const { colors } = useTheme();
    const onChangeSearch = query => setSearchQuery(query);
    const theme = useTheme();
    let _flatList = useRef(null);
    const [data, setData] = useState({
        myeGifts: [],
        uid: '',
    });
    useEffect(() => { 
        setTimeout(() => {
            const { currentUser } = firebase.auth();
            if (currentUser !== null) {
                firebase.database().ref(`/userEgifts/${currentUser.uid}`)
                    .once('value', (snapshot) => {
                        if(snapshot.val() !== null) {
                            const arr = Object.keys(snapshot.val()).map((key) => {
                                return (snapshot.val()[key]);
                            }).sort((a, b) => { return (b.dateID) - (a.dateID); });
                            setData({ ...data, 
                                uid: currentUser.uid,
                                myeGifts: arr
                            });
                        }
                });
            }
        }, 10);
        return () => { 
            
        }
    }, []);


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
        <View style={{ width, justifyContent: 'center', alignItems: 'center', marginTop: 15, marginBottom: 15 }}>
            <View style={{ flexDirection: 'row' , width: width * 0.90, alignItems: 'center', justifyContent: 'space-around' }}>
                <View style={{ flex: 1 }}>
                    <Image 
                        style={{ flex: 1 , "resizeMode": "contain", "backgroundColor": "#ffffff", width: width * 0.30 }}
                        source={{ uri: item.egiftChoice === 'grub' ? grubUri : (item.egiftChoice === 'door' ? dashUri : uberUri) }}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 25, justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <Text style={styles.titleStyle3}>
                            {item.egiftChoice === 'grub' ? 'GrubHub' : (item.egiftChoice === 'door' ? 'DoorDash' : 'Uber Eats')}
                        </Text>
                        <Image 
                            style={{ width: 20, height: 20, marginLeft: 10, marginTop: -3 }}
                            source={{ uri: item.iseGiftRequestApproved ? approvedUri : pendingUri }}
                        />
                    </View>
                    <Text style={styles.titleStyle6}>
                        {calcDate(item.dateID.toString())}
                    </Text>
                    <Text style={styles.titleStyle5}>
                        ID: {item.uniqID}
                    </Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <Caption style={styles.titleStyle4}>
                        Amount
                    </Caption>
                    <Caption style={styles.titleStyle4}>
                        Earned
                    </Caption>
                    <Text style={styles.titleStyle2}>
                        ${item.egiftEarned}
                    </Text>
                </View>
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
                      source={require('../assets/Egift.png')}
                  />
                </View>
            </View>
      )
    }
    const ItemSeperator = () => <View style={{ height: 1, width: width * 0.84, backgroundColor: 'rgba(0, 0, 0, 0.15)', elevation: 0, marginLeft: width * 0.08 }} />;
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
                    My eGifts
                </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)', elevation: 1 }} />
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <FlatList
                    // ref={this.props.scrollRef}
                    ref={(flatList) => { _flatList = flatList }}
                    data={data.myeGifts}
                    extraData={data.myeGifts}
                    initialNumToRender={10} 
                    keyExtractor={(item) => (item.dateID.toString())}
                    renderItem={_renderItem.bind(this)}
                    ItemSeparatorComponent={ItemSeperator}
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
        marginLeft: (height / width) > 1.5 ? width * 0.3 - 20 : width * 0.40 - 20,
        justifyContent: 'center'
    },
    titleStyle6: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      marginTop: -5,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start',
    //   width: width * 0.50
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle3: { 
      fontFamily: 'MontserratBold',
      fontSize: 14, 
      marginTop: -5,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start',
    //   width: width * 0.50
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle5: { 
      fontFamily: 'MontserratBold',
      fontSize: 13, 
      marginTop: -5,
      marginBottom: 10,
      marginLeft: -5,
      justifyContent: 'flex-start',
      width: width * 0.40
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle4: { 
      fontFamily: 'Montserrat',
      fontSize: 14, 
      justifyContent: 'flex-end',
      marginTop: -7,
      alignItems: 'flex-end',
    //   width: width * 0.70
      // fontWeight: 'bold', 
      // textShadowRadius: 5, 
      // textShadowColor: 'rgba(0, 0, 0, 0.75)', 
      // textShadowOffset: { width: -1, height: 1 } 
    },
    titleStyle2: { 
      fontFamily: 'MontserratSemiBold',
      fontSize: 16, 
      marginTop: -5,
      color: '#EE5B64',
      justifyContent: 'flex-end', 
      alignItems: 'flex-end'
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

export default MyeGiftsScreen;
