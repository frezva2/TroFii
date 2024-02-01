import React, { useState, useEffect }  from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, Linking } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import{ AuthContext } from '../components/context';
import { flexDirection } from 'styled-system';

const firebase = require('firebase/app').default
require('firebase/auth')

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
// Math.floor(Math.random() * 100)
export function DrawerContent(props) {

    const paperTheme = useTheme();

    const { signOut, toggleTheme } = React.useContext(AuthContext);

    const [data, setData] = React.useState({
        uid: '',
        email: '',
        isThereRewardsRest: false,
        image: 'https://firebasestorage.googleapis.com/v0/b/worests.appspot.com/o/preApprovalImage%2FTake%20A%20Picture%20Earn%20%241%20eGift.png?alt=media&token=01f26be4-7ba9-40fc-b6bc-ac68451d23ea',
        CreatedDate : '',
        createAt: 0,
        firstname: '',
        lastname: '',
        egiftEarned: 0,
        points: 0,
        redeemedPoints: 0,
        TermsConditions: '',
        PrivacyPolicy: ''
      });

     const calcSince = (CreateAt) => {
        const day = Number(CreateAt.substring(6));
        const year = Number(CreateAt.substring(0, 4));
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
            return (`Dec ${day}, ${year}`)
        }
    }
    useEffect(() => { 
        setTimeout(() => {
          firebase.auth().onAuthStateChanged((user) => {
          if (user !== null) {
            const userRef = firebase.database().ref(`/users/${user.uid}`);
                userRef.once('value', (snapshot) => {
                    firebase.database().ref('/worestsLists/').once('value', (snap) => {
                        if (snapshot.val() !== null && snap.val() !== null) {
                            setData({ 
                                ...data, 
                                    uid: user.uid,
                                    CreatedDate: calcSince(snapshot.val().createdAt.toString()),
                                    email: snapshot.val().email,
                                    isThereRewardsRest: snap.val().isThereRewardsRest,
                                    image: snapshot.val().image,
                                    createAt: snapshot.val().createAt,
                                    firstname: snapshot.val().firstname,
                                    lastname: snapshot.val().lastname,
                                    egiftEarned: snapshot.val().egiftEarned,
                                    points: snapshot.val().points,
                                    redeemedPoints: snapshot.val().redeemedPoints,
                                    PrivacyPolicy: snap.val().PrivacyPolicy,
                                    TermsConditions: snap.val().TermsConditions
                                })
                        }
                    });
                })
            }
        })
        }, 10);
        return () => { 
          // console.log('unmounting...');
        }
      }, []);

    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{flexDirection:'column',marginTop: 15}}>
                            <Avatar.Image 
                                source={{
                                    uri: data.image
                                }}
                                size={80}
                            />
                            <View style={{marginLeft:5, flexDirection:'column', marginTop: 25}}>
                                <Text style={styles.title}>{data.firstname} {data.lastname}</Text>
                                <Caption style={styles.caption}>{data.email}</Caption>
                                <Text style={[styles.paragraph, styles.caption2]}>Joined: {data.CreatedDate}</Text>
                            </View>
                        </View>
                        {/* <View style={{ flexDirection: 'row', marginBottom: 5, marginTop: 20 }}>
                            <Image
                                style={{ width: 18, height: 18, marginLeft: 5 }}
                                source={require('../assets/icons/egift.png')}
                            />  
                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>eGift Earned: ${data.egiftEarned}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 5, marginTop: 10 }}>
                            <Image
                                style={{ width: 19, height: 23.65, marginLeft: 5 }}
                                source={require('../assets/icons/award.png')}
                            />  
                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Reward Points: {data.points}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
                            <Image
                                style={{ width: 20, height: 20, marginLeft: 5 }}
                                source={require('../assets/icons/redeem-points.png')}
                            />  
                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Redeemed Points: {data.redeemedPoints}</Text>
                        </View> */}
                        <View style={{ height: 1, backgroundColor: 'rgba(000, 000, 000, 0.10)', width: width * 0.7, marginTop: 10 }} />
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        {/* <TouchableOpacity onPress={() => { props.navigation.navigate('HomeDrawer') }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 21, height: 20, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/home.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Home</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity> */}
                        <TouchableOpacity 
                            onPress={() => { 
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth() + 1;
                                const day = new Date().getDate();
                                const hrs = new Date().getHours();
                                const min = new Date().getMinutes();
                                const time = `${month}/${day}/${year} ${hrs}:${min}`;
                                const sec = new Date().getSeconds();
                                const milsec = new Date().getMilliseconds();
                                let dateID = ((year * 10000000000000) + (month * 100000000000) + (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
                                props.navigation.navigate('MyAccountScreen', { dateID: dateID }) 
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20, height: 20, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/account.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My Account</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { 
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth() + 1;
                                const day = new Date().getDate();
                                const hrs = new Date().getHours();
                                const min = new Date().getMinutes();
                                const time = `${month}/${day}/${year} ${hrs}:${min}`;
                                const sec = new Date().getSeconds();
                                const milsec = new Date().getMilliseconds();
                                let dateID = ((year * 10000000000000) + (month * 100000000000) + (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
                                props.navigation.navigate('Food', { dateID: dateID }) 
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20, height: 20, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/burgers.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>TroFii</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* {
                            data.isThereRewardsRest ? 
                                <TouchableOpacity onPress={() => { props.navigation.navigate('EarnRewardsScreen') }}>
                                    <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                            <Image
                                                style={{ width: 19, height: 23.65, marginLeft: 5, marginTop: 2 }}
                                                source={require('../assets/icons/receipt.png')}
                                            />  
                                            <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Upload Receipts</Text>
                                        </View>
                                        <View style={{ marginRight: 20, marginTop: 7 }}>
                                            <Image
                                                style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                                source={require('../assets/icons/arrow.png')}
                                            /> 
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            : <View />
                        } */}
                        <TouchableOpacity 
                            onPress={() => { 
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth() + 1;
                                const day = new Date().getDate();
                                const hrs = new Date().getHours();
                                const min = new Date().getMinutes();
                                const time = `${month}/${day}/${year} ${hrs}:${min}`;
                                const sec = new Date().getSeconds();
                                const milsec = new Date().getMilliseconds();
                                let dateID = ((year * 10000000000000) + (month * 100000000000) + (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
                                    props.navigation.navigate('MyUploadedTroFiiScreen', { dateID: dateID }) 
                                }}
                            >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20, height: 15, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/foodlover.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My Uploaded TroFii</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { 
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth() + 1;
                                const day = new Date().getDate();
                                const hrs = new Date().getHours();
                                const min = new Date().getMinutes();
                                const time = `${month}/${day}/${year} ${hrs}:${min}`;
                                const sec = new Date().getSeconds();
                                const milsec = new Date().getMilliseconds();
                                let dateID = ((year * 10000000000000) + (month * 100000000000) + (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
                                    props.navigation.navigate('MyFavTroFiiScreen', { dateID: dateID }) 
                                }}
                            >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20, height: 20, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/ramen.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My Favorite TroFii</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => { 
                                const year = new Date().getFullYear();
                                const month = new Date().getMonth() + 1;
                                const day = new Date().getDate();
                                const hrs = new Date().getHours();
                                const min = new Date().getMinutes();
                                const time = `${month}/${day}/${year} ${hrs}:${min}`;
                                const sec = new Date().getSeconds();
                                const milsec = new Date().getMilliseconds();
                                let dateID = ((year * 10000000000000) + (month * 100000000000) + (day * 1000000000) + (hrs * 10000000) + (min * 100000) + (sec * 1000) + milsec);
                                    props.navigation.navigate('MyFavRests', { dateID: dateID }) 
                                }}
                            >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 18.5, height: 17.79, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/restlover.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My Favorite Restaurant</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => { 
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

                                props.navigation.navigate('CommentsRatingsScreen', { cameFromDate: dateID }); 
                            }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20.65, height: 18.49, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/rate.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Comments & Ratings</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => { 
                            
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

                                props.navigation.navigate('MyPhotosScreen', { cameFromDate: dateID }); 
                            }}> 
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 21.15, height: 19.39, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/image2.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My Photos</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => { 
                            
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

                            props.navigation.navigate('MyeGiftsScreen'), { cameFromDate: dateID } }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 18, height: 18, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/egift.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>My eGifts</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity> */}
                        <View style={{ height: 1, backgroundColor: 'rgba(000, 000, 000, 0.10)', width: width * 0.7, marginTop: 5, marginLeft: 20 }} />
                        {/* <TouchableOpacity onPress={() => { }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 21.15, height: 21.17, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/Page-1.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Tutorial</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => { Linking.openURL(`https://trofii.net/contact`); }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20.15, height: 22.93, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/headphones.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Support</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { Linking.openURL(`https://trofii.net/#faq`); }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 20.15, height: 20.15, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/help.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>FAQ</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            
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

                             props.navigation.navigate('SettingsScreen'), { cameFromDate: dateID } }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                                    <Image
                                        style={{ width: 19.01, height: 18, marginLeft: 5, marginTop: 2 }}
                                        source={require('../assets/icons/setting.png')}
                                    />  
                                    <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 15 }}>Settings</Text>
                                </View>
                                <View style={{ marginRight: 20, marginTop: 7 }}>
                                    <Image
                                        style={{ width: 6.51, height: 10.54, marginLeft: 5 }}
                                        source={require('../assets/icons/arrow.png')}
                                    /> 
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: 'rgba(000, 000, 000, 0.10)', width: width * 0.7, marginTop: 0, marginLeft: 20 }} />
                        <TouchableOpacity onPress={() => { Linking.openURL(data.PrivacyPolicy); }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20, justifyContent: 'space-between' }}> 
                                <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 20 }}>Privacy Policy</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { Linking.openURL(data.TermsConditions); }}>
                            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 0, justifyContent: 'space-between' }}> 
                                <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 14, marginLeft: 20 }}>Terms & Conditions</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ marginLeft: 20, marginBottom: 20, marginTop: 10 }}>
                            <Caption style={styles.caption}>Version 2.9.1</Caption>
                        </View>
                        {/* <DrawerItem 
                            labelStyle={{ fontFamily: 'MontserratSemiBold', fontSize: 14, color: 'black', marginLeft: -15 }}
                            style={{ marginLeft: 20, marginTop: 0 }}
                            icon={({color, size}) => (
                                <Image
                                    style={{ width: 18.5, height: 17.79 }}
                                    source={require('../assets/icons/heart1.png')}
                                />
                            )}
                            label={`Favorite Restaurants`}
                            onPress={() => { }}
                        /> */}
                    </Drawer.Section>
                    {/* <Drawer.Section title="Preferences">
                        <TouchableRipple onPress={() => {toggleTheme()}}>
                            <View style={styles.preference}>
                                <Text>Dark Theme</Text>
                                <View pointerEvents="none">
                                    <Switch value={paperTheme.dark}/>
                                </View>
                            </View>
                        </TouchableRipple>
                    </Drawer.Section> */}
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem 
                    icon={({color, size}) => (
                        <Icon 
                        name="exit-to-app" 
                        color={color}
                        size={size}
                        />
                    )}
                    label="Sign Out"
                    onPress={() => { 
                        signOut()
                        props.navigation.closeDrawer();
                        // props.navigation.navigate('HomeDrawer');
                        props.navigation.navigate(
                            'HomeDrawer', 
                        {
                        screen: 'HomeSc',
                        params: {
                            newData: 'Home',
                          },
                        }
                        );
                    }}
                />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: 20,
    },
    title: {
      fontSize: 20,
      marginTop: 3,
      fontFamily: 'MontserratSemiBold',
    },
    caption: {
      fontSize: 12,
    //   color: 'rgba(000, 000, 000, 0.30)',
      fontFamily: 'Montserrat',
    },
    caption2: {
      fontSize: 12,
      marginTop: 5,
      fontFamily: 'MontserratSemiBold',
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
      fontWeight: 'bold',
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });
