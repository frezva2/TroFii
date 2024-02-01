import React, { useState, useEffect, useRef }  from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, Keyboard, Linking, FlatList, ActivityIndicator, TouchableHighlight, Input } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme } from 'react-native-paper';
// import * as Analytics from 'expo-firebase-analytics';
import axios from 'axios';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as actions from '../actions';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import openMap from 'react-native-open-maps';
import algoliasearch from 'algoliasearch';
// import * as firebase from 'firebase';
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
  // connectRefinementList,
} from 'react-instantsearch-native'; 
// import { CommonActions } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
const firebase = require('firebase/app').default
require('firebase/auth')

const attrToRetr = ['restaurantUid', 'restName', 'restAddress', 'restWebsite', 'isRestActive', 'image', 'RestNumFollowers', 'restHours', 'objectID', 'Notifications',
                    'RestEntreeNum', 'RestDrinkNum', 'RestDessertNum', 'RestApptNum', 'restMaxPercentage', 'phoneNum', 'restDesc', 'restOrderWeb'];

const foodAttrToRetr = ['foodInfo.image', 'restName', 'publish', 'isUndecided','isRestActive', 'isImageUploaded'];

const restAttrToRetr = ['restaurantUid', 'restName', 'restAddress', 'restWebsite', 'isRestActive', 'image', 'RestNumFollowers', 'restHours', 'objectID', 'Notifications',
                        'RestEntreeNum', 'RestDrinkNum', 'RestDessertNum', 'RestApptNum', 'restMaxPercentage', 'phoneNum', 'restDesc', 'restOrderWeb'];

let searchState = {
  noResults: false,
  nameRest: '',
  nameRestDesc: ''
}; 
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const catHeight1 = (height * 0.45) / 6;
const catHeight2 = (height / width) * 100;

const catWidth = width * 0.15;
const catHeight = (height / width) > 1.5 ? catHeight1 : catHeight2;

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
let searchWord = '';
let preLoad = true;
const RestaurantSearchScreen = (props) => {

  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);

  const theme = useTheme();
  
  const [data, setData] = React.useState({
    foodNameArr: [],
    finalResults: [],
    refreshing: false,
    isLogin: false, 
    loading: false,
    noResults: false,
    restUidIndex: 0,
    tempIndex: [],
    restsImage: [],
    numOfItems: 0,
    restsUidArr: [],
    dateIdList: [],
    tempRestsUidArr: [],
    userIcon: '', 
    nameRest: '',
    nameRestDesc: '',
    stateNavigation: { 0: 'abc' },
    restsImageList: [],
    // searchQuery: ''
  });

  const mounted = async () => {
    // searchByFood('');
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
      // await Analytics.setUserId(currentUser.uid);
    } 
    
  }
  useEffect(() => {
    // mounted();
    // isOpen('kabobi grill')
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user !== null) {
        firebase.database().ref(`/users/${user.uid}`).once('value').then((snapshot) => {
          if (snapshot.val() !== null) {
              firebase.database().ref('/worestsLists/').once('value', (snap) => {
                if (snap.val() !== null) {
                    setData({ 
                        ...data, 
                            PrivacyPolicy: snap.val().PrivacyPolicy,
                            TermsConditions: snap.val().TermsConditions,
                            userIcon: snapshot.val().image
                        })
                }
            });
          }
        })
      } else {
        firebase.database().ref('/worestsLists/').once('value', (snap) => {
          if (snap.val() !== null) {
              setData({ 
                  ...data, 
                      PrivacyPolicy: snap.val().PrivacyPolicy,
                      TermsConditions: snap.val().TermsConditions,
                      userIcon: ''
                  })
          }
        });
      }
    })
    return () => { 
      // console.log('unmounting...');
    }
  }, []);
    
        // _shouldItemUpdate = (prev, next) => {
        //     return prev.item !== next.item;
        // }
    // const renderHeader = () => {
    //   return (
    //     <View style={{ flex: 1, marginLeft: 25, marginRight: 25, marginTop: 15, marginBottom: 15 }}>
    //       <Searchbar
    //         placeholder="Find restaurant "
    //         onIconPress={() => { handleSearch(searchQuery); }}
    //         onChangeText={onChangeSearch}
    //         value={searchQuery}
    //         // defaultValue={data.searchQuery}
    //         onEndEditing={() => { handleSearch(searchQuery); }}
    //         maxLength={100}
    //         returnKeyType={'search'}
    //         keyboardType={'default'}
    //         selectionColor= '#EE5B64'
    //         style={{ borderRadius: 15 }}
    //         inputStyle={{ fontFamily: 'Montserrat', fontSize: 14 }}
    //       />
    //     </View>
    //     )
    // }
   const renderFooter = () => {
      if (!data.loading) return null;
      return(
          <View style={{ height: 50, marginTop: -15 }}>
              <ActivityIndicator  
                size="large" 
                color="#C90611"
              />
          </View>
        )
    }
    
        // _getItemLayout = (data, index) => {
        //   console.log(heightItem, index);
        //     return { length: heightItem, offset:(heightItem + 25) * index, index }
        // }
        const handleRefresh = () => {
          setData({ 
            ...data,
            numOfItems: 0,
            finalResults: [],
            restUidIndex: 0,
            refreshing: true
          });
        }
    
  const handleLoadMore = () => {  
    // console.log(data.restUidIndex, data.restsUidArr);
      setData({
        ...data,
        loading: true
      });
    }
    
    //  const _shouldItemUpdate = (props, nextProps) => {
    //     if (this.isEquivalent(props, nextProps)) {
    //       return false;
    //     }
    //     else {
    //       return true;
    //     }
    //   }
    
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
  }
  const onSearchStateChange = (results) => {
    if (!(isEquivalent(data.stateNavigation, results))) {
      setData({ ...data, stateNavigation: results });
      setData({ ...data, nameRest: searchState.nameRest });
      setData({ ...data, nameRestDesc: searchState.nameRestDesc });
      setData({ ...data, noResults: searchState.noResults, initialState: true });
    }
  }
    const renderEmpty = () => {
        return (
            <View style={{ flex: 1 }} />
      )
    }
    const isLoginYet = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken !== null) {
        props.navigation.openDrawer();
      } else {
        setData({ ...data, isLogin: true });
      }
    }
  
    const login = (type) => {
      if (type === 'facebook') {
        props.facebookLogin();
        setData({ ...data, isLogin: false });
      } 
      else if (type === 'google') {
        props.googleLogin();
        setData({ ...data, isLogin: false });
      } 
      if (type === 'apple') {
        props.appleLogin();
        setData({ ...data, isLogin: false });
      } 
    }
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
          <View style={{ width, height: 56, justifyContent: 'center' }}>
            <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ flex: 1, marginLeft: 0 }} onPress={() => { isLoginYet() }} >
                    <Image
                        style={{ flex: 1, marginLeft: 10, width: 55 , height: 55, marginTop: 5 }}
                        source={require('../assets/icons/menu.png')}
                        fadeDuration={100}
                    />
                </TouchableOpacity> 
                <Text style={{ color: '#C90611', fontSize: 30, textAlign: 'center',  fontFamily: 'BerkshireSwash', marginLeft: (height / width) > 1.5 ? width * 0.25 : width * 0.375}}>TroFii</Text>
                <View style={{flex: 1, marginLeft: (height / width) > 1.5 ? width * 0.25 : width * 0.375, marginRight: 10, marginTop: 3 }} >
                  <Image
                    style={{ resizeMode: "contain", width: 47, height: 47, borderRadius: 5 }}
                    source={{ uri: data.userIcon === '' ? Image.resolveAssetSource(require('../assets/icons/user2.png')).uri : data.userIcon, cache: 'force-cache' }}
                    fadeDuration={1}
                  />
                </View>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)', elevation: 1, width }} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', marginLeft: 25, marginTop: 15, marginBottom: 10 }}>
              <View>
                <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 22, color: colors.text }}>Search for </Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 22, color: 'red' }}>Restaurants </Text>
              </View>
            </View>
            <InstantSearch
              searchClient={client}
              indexName="restsList"
              refresh
              stalledSearchDelay={0}
              // searchState={searchState}
              onSearchStateChange={(results) => onSearchStateChange(results)}
            >  
            <Configure 
              // filters="isRestActive=1" 
              facetFilters= {['isRestActive:true']}
              typoTolerance={'strict'}
              attributesToRetrieve={attrToRetr} 
              hitsPerPage={10}
              // aroundLatLngViaIP
              // aroundLatLng={this.state.arndLatLng}
              // aroundRadius={this.state.aroundRadius}
            />
            
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 60, width }}>
                  <SearchBox />
                </View>
                <View style={{ marginTop: 5, marginLeft: 25, marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'MontserratSemiBold', fontSize: 16, color: colors.text }}>Search Results</Text>
                </View>
                <View style={{ backgroundColor: '#f2f2f2', height: 1 }} />
              {/* { 
                (data.noResults) ? 
                    <View style={{ marginLeft: 10, width: width * 0.95, backgroundColor: 'white', borderRadius: 5 }}>
                      <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>
                        <View style={{ marginTop: 10, marginLeft: 15 }}>
                          <Text style={styles.searchTitleStyle}>{searchState.nameRest}</Text>
                        </View>
                        <View style={{ marginTop: 10, marginLeft: 15 }}>
                          <Text style={styles.searchTextStyle}>{searchState.nameRestDesc}</Text>
                        </View>
                      </View>
                      <View style={{ marginTop: 25 , justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                        <SocialIcon 
                            title='Request This Restaurant'
                            button
                            // fontStyle={{ fontFamily: 'SourceSansPro', fontSize: 14 }}
                            style={{ backgroundColor: '#0c1355', width: width * 0.85, height: 45, justifyContent: 'center', alignItems: 'center' }}
                            // onPress={() => { requestRestFunc(); Keyboard.dismiss(); }} 
                        />
                      </View> 
                    </View>
                :  */}
                <View>
                  <View style={{ flex: 1, height: height, marginBottom: 5 }}> 
                    <Hits colors={colors} navigation={props.navigation} /> 
                  </View>
                </View>
              {/* } */}
              <Modal  
              isVisible={data.isLogin}
              animationInTiming={550}
              animationOutTiming={550} 
              propagateSwipe
              onModalHide={() => { setData({ ...data, isLogin: false }); }}
              onModalShow={() => { setData({ ...data, isLogin: true }); }}
              onBackdropPress={() => { setData({ ...data, isLogin: false }); }} 
              backdropColor='black'
              useNativeDriver={true}
              backdropOpacity={0.3}
              hideModalContentWhileAnimating
              onRequestClose={() => { setData({ ...data, isLogin: false }); }} 
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
            <ScrollView style={{ backgroundColor: 'white' }}>
                  <View>
                    <TouchableOpacity
                        onPress={() => { setData({ ...data, isLogin: false }); }}
                        style={{ marginVertical: 10, marginLeft: 15, marginTop: 15 }}
                      >
                        <Feather 
                            name="x"
                            color="gray"
                            size={30}
                        />
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ marginTop: 10 }}>
                        <Image
                        style={{ width: 54.03, height: 47.49, marginTop: 0 }}
                        source={require('../assets/icons/danger.png')}
                        fadeDuration={100}
                        />
                    </View>
                    <View>
                        <Title style={{ color: 'black', fontFamily: 'MontserratBold', fontSize: 18, marginTop: 10 }}>Guest User Alert</Title>
                    </View>
                    <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                        <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                            <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                                <Paragraph 
                                  style={styles.searchDescStyle}
                                >You are not signed into an account, which means you won’t be able to use 100% of the apps functionalities. </Paragraph>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                        <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white' }}>               
                            <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 15 }}>
                                <Paragraph 
                                  style={styles.searchDescStyle}
                                >As a Guest User you can: </Paragraph>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                        <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                            <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                                <Image
                                style={{ width: 9, height: 9, marginTop: 0 }}
                                source={require('../assets/icons/circle.png')}
                                fadeDuration={100}
                                />
                            </View>              
                            <View style={{ width: width * 0.70 }}>
                                <Paragraph 
                                  style={styles.searchDescStyle2}
                                >Search for your favorite food or restaurants in your area. </Paragraph>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90, borderRadius: 35 }}>
                        <View style={{ marginTop: 5, alignItems: 'flex-start', justifyContent: 'flex-start',  marginBottom: 5, backgroundColor: 'white', flexDirection: 'row' }}> 
                            <View style={{ marginTop: 7, marginLeft: 30, marginRight: 2 }}>
                                <Image
                                style={{ width: 9, height: 9, marginTop: 0 }}
                                source={require('../assets/icons/circle.png')}
                                fadeDuration={100}
                                />
                            </View>              
                            <View style={{ width: width * 0.70 }}>
                                <Paragraph 
                                  style={styles.searchDescStyle2}
                                >Look at item ratings and comments. </Paragraph>
                            </View>
                        </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => { 
                    // props.navigation.navigate({name:'SignUpScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false });
                      setData({ ...data, isLogin: false });
                      props.navigation.navigate(
                        'LogIn', 
                      {
                        screen: 'SignUpScreen',
                        // params: {
                        //   screen: 'SignUpScreen',
                          // params: {
                          //   screen: 'Media',
                          // },
                        // },
                      }
                      );
                    }} 
                  >
                      <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                          <LinearGradient colors={['#fb8389', '#f70814', '#C90611']} 
                          style={styles.linearGradient}
                          >
                              <Text 
                              style={styles.buttonText}
                              >Sign Up</Text>
                          </LinearGradient>
                      </View>
                  </TouchableOpacity>  
                  <TouchableOpacity 
                  onPress={() => { 
                    // props.navigation.navigate({name:'SignInScreen', params:{ routeCameFrom: 'MainTab', merge: true }}); setData({ ...data, isLogin: false }); 
                    setData({ ...data, isLogin: false });
                    props.navigation.navigate(
                        'LogIn', 
                      {
                        screen: 'SignInScreen'
                      }
                    );
                    }} 
                    style={{ marginBottom: 10 }}>
                      <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                          <LinearGradient colors={['#fff', '#fff', '#fff']} 
                          style={styles.linearGradient2}
                          >
                              <Text 
                              style={styles.buttonText2}
                              >Sign In</Text>
                          </LinearGradient>
                      </View>
                  </TouchableOpacity>
                  <View style={styles.button} >
                      <TouchableOpacity 
                          onPress={() =>{ setData({ ...data, isLogin: false }); login('facebook'); }}
                      >
                          <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                              <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6']} style={styles.linearGradientSocial}>
                                  <Image
                                      style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                      source={require('../assets/icons/fb.png')}
                                  />
                                  <Text style={styles.buttonTextBlack}>Sign in with Facebook</Text>
                              </LinearGradient>
                          </View>
                      </TouchableOpacity>
                  </View>
                  <View style={styles.button} >
                      <TouchableOpacity 
                      onPress={() =>{ setData({ ...data, isLogin: false }); login('google') }}
                      >
                          <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                              <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6'] } style={styles.linearGradientSocial}>
                                  <Image
                                      style={{ marginLeft: 0, marginTop: 0, width: 20, height: 20 }}
                                      source={require('../assets/icons/google.png')}
                                  />
                                  <Text style={styles.buttonTextBlack}>Sign in with Google</Text>
                              </LinearGradient>
                          </View>
                      </TouchableOpacity>
                  </View>
                  {
                    Platform.OS === 'ios' ? 
                        <View style={styles.button} >
                            <TouchableOpacity 
                              onPress={() =>{ setData({ ...data, isLogin: false }); login('apple') }}
                            >
                                <View style={{ marginTop: 0, justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                                    <LinearGradient colors={Platform.OS === 'ios' ? ['#fff', '#fff', '#fff'] : ['#f2f2f2', '#f2f2f2', '#e6e6e6'] } style={styles.linearGradientSocial}>
                                        <Image
                                            style={{ marginLeft: 0, marginTop: 0, width: 20, height: 25 }}
                                            source={require('../assets/icons/apple.png')}
                                        />
                                        <Text style={styles.buttonTextBlack}>Sign in With Apple</Text>
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        </View>
                    : null
                  }         
                  {/* {
                    Platform.OS === 'ios' ? 
                    <View style={styles.button} >
                      <AppleAuthentication.AppleAuthenticationButton
                          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                          cornerRadius={20}
                          style={{ width: (width * 0.75), height: 50, marginTop: 5 }}
                          onPress={() =>{ login('apple')}}
                        /> 
                    </View>
                    : <View />
                  } */}
                  <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => { setData({ ...data, isLogin: false }); }}>
                          <Text style={{ fontSize: 12, justifyContent: 'center', alignItems: 'center', color: '#EE5B64', fontFamily: 'MontserratSemiBold' }}>CONTINUE AS A GUEST</Text>
                      </TouchableOpacity>
                  </View>
                  <View style={{ marginTop: 0, marginLeft: 0, width: width * 0.90 }}>
                      <View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center',  marginBottom: 5, backgroundColor: 'white' }}>               
                          <View style={{ width: width * 0.75, marginTop: 0, marginLeft: 0 }}>
                              <Paragraph 
                                style={styles.searchDescStyle3}
                              >NOTE: Your email address will be used to create an account to store and keep track of your Reward Points earned and redeemed as well as your saved restaurants.</Paragraph>
                          </View>
                      </View>
                  </View>
                  <View style={styles.textPrivate}>
                      <Text style={styles.color_textPrivate}>
                          By signing up you agree to our
                      </Text>
                      <TouchableOpacity onPress={() => { Linking.openURL(data.PrivacyPolicy); }}>
                        <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
                      </TouchableOpacity>
                      <Text style={styles.color_textPrivate}>{" "}and</Text>
                      <TouchableOpacity onPress={() => { Linking.openURL(data.TermsConditions); }}>
                        <Text style={[styles.color_textPrivateBold, {fontWeight: 'bold'}]}>{" "}Terms And Conditions</Text>
                      </TouchableOpacity>
                  </View>
            </ScrollView>
          </Modal>
            </InstantSearch>
            {/* <FlatList
              // ref={this.props.scrollRef}
              // ref={(flatList) => { this._flatList = flatList }}
              data={data.finalResults}
              extraData={data.finalResults}
              initialNumToRender={10} 
              keyExtractor={(item) => (item.dateId.toString())}
              // renderItem={_renderItem.bind(this)}
              // ListHeaderComponent={renderHeader()}
              // ListFooterComponent={renderFooter}
              ListHeaderComponentStyle={{ width, height: 100 }}
              ListFooterComponentStyle={{ width, height: 50 }}
              refreshing={data.refreshing}
              onRefresh={handleRefresh}
              // onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
              // ListEmptyComponent={renderEmpty.bind(this)}
              // shouldItemUpdate={_shouldItemUpdate.bind(this)}
            /> */}
          </View>
        </View>
      </SafeAreaView>
    ); 
};
let hitsLen = 0;
let isOpenNowList = [];
const Hits = connectInfiniteHits(({ hits, hasMore, refine, colors, navigation, refineNext }) => {

  let _flatList = useRef(null);
    if (hits.length !== hitsLen) {
      setTimeout(async() => {
        const promises = hits.map(async hit => {
          const isOpenHit = await isOpen(hit)
          return isOpenHit
        })
        isOpenNowList = await Promise.all(promises)
        refine()
        // console.log(isOpenNowList)
      }, 1);
        hitsLen = hits.length;
    } 
  let nameRest = searchState.nameRest;
          // console.log(hits[0].restName);
// searchState = Object.assign({ restaurantUid: hits[0].restaurantUid, restaurantName: hits[0].restName, searchingWord: hits[0].restName });
          // navigate('main', { dataReceived: true, restaurantUid: hits[0].restaurantUid, restaurantName: hits[0].restName, results: hits, height: hits.length, loadingStateVisible: true, compCameFrom: 'Main' });  
async function onEndReached() {
    if (hasMore) {
      refineNext()
      // refine();
    }
};
  // const [newData, setNewData] = React.useState({
  //   tempIndex: [],
  //   isOpenNowList: []
  //   // searchQuery: ''
  // });
   async function isOpen (item) {
    // let newIndexList = newData.tempIndex;
    // if (newData.tempIndex.indexOf(idx) === -1) {
      // newIndexList.push(idx);
      // let tempisOpenNowList = newData.isOpenNowList;
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${item.restName}&key=AIzaSyAMJHXbpRk3AA7BBxoxrLp29JUGiLoXkjU`)
      // .then(response => {
      const newResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${response?.data?.results[0]?.place_id}&fields=name,rating,type,opening_hours,formatted_phone_number&key=AIzaSyA-oS7mH8dVWFSXwSKfICEN0wefwhSi0Eo`)
          // .then(newResponse => {
              return(newResponse?.data?.result?.opening_hours?.open_now);
              // return(item.restName);
            // console.log(item.restName,': ',newResponse?.data?.result?.opening_hours?.open_now, ', ',idx)
      // console.log(isOpenNowList)
            // isOpenNowList = isOpenNowList.concat(newResponse?.data?.result?.opening_hours?.open_now);
            // restList = restList.concat(item.restName)
            // setNewData({ ...newData, isOpenNowList: tempisOpenNowList })
        // })
      // });
    // }
  }
  const shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
      // this.setState({ restsImage: this.state.restsImage.concat(array[randomIndex].image) });
    }

    return array;
  }
  const fetchRestData = (restaurantUid, isOpenNow) => {
    const client = algoliasearch('K9M4MC44R0', 'dfc4ea1c057d492e96b0967f050519c4', {
      // timeouts: {
      //   connect: 1,
      //   read: 1, // The value of the former `timeout` parameter
      //   write: 30
      // }
    });
    client.initIndex('restsList').search(restaurantUid, {
      attributesToRetrieve: restAttrToRetr,
      hitsPerPage: 1,
      facetFilters: [`isRestActive:${true}`],
      restrictSearchableAttributes: ['restaurantUid', 'objectID']
    } ).then(responses => {
      const str = JSON.stringify(responses.hits);
      const object = JSON.parse(str);
      client.initIndex('foodsList').search(restaurantUid, {
        attributesToRetrieve: foodAttrToRetr,
        hitsPerPage: 20,
        facetFilters: [`isRestActive:${true}`, `publish:${true}`, `isImageUploaded:${true}`],
        // restrictSearchableAttributes: ['restaurantUid', 'objectID']
      } ).then(responses1 => {
        const str1 = JSON.stringify(responses1.hits);
        const object1 = JSON.parse(str1);
        shuffle(object1);
        if (object[0] !== undefined && object1[0] !== undefined) { 
          navigation.navigate('HomeDrawer', 
          {
            screen: 'Restaurants',
            params: {
              screen: 'RestaurantInfo',
              params: {
                restaurantUid: restaurantUid,
                finalResults: object[0],
                foodImage: object1[0].foodInfo.image,
                isOpenNow: isOpenNow
              },
            },
          }
          );
        } 
        else if (object[0] !== undefined && object1[0] === undefined) { 
          navigation.navigate('HomeDrawer', 
          {
            screen: 'Restaurants',
            params: {
              screen: 'RestaurantInfo',
              params: {
                restaurantUid: restaurantUid,
                finalResults: object[0],
                foodImage: undefined,
                isOpenNow: isOpenNow,
                compCameFrom: 'RestaurantSearch'
              },
            },
          }
          );
        } 
      });
    });
  }
  const emptryComponent = () => {
    if (hits.length === 0 && !preLoad) {
      return (
        <View style={{ flex: 1, marginLeft: 5, width }}>
          <GooglePlacesAutocomplete
            // ref={r => {ref = r}}
            scrollEnabled={false}
            ref={(flatList) => { _flatList = flatList }}
            placeholder={searchWord}
            // placeholder={'Press Here ...'}
            minLength={0} // minimum length of text to search
            keyboardShouldPersistTaps={'handled'}
          // onSubmitEditing={this.unvisibleUnsignedUser.bind(this)}
            // returnKeyType={'done'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
            listViewDisplayed={'auto'}   // true/false/undefined
            // predefinedPlacesAlwaysVisible={true}  
            textInputProps={{
              value: searchWord,
              onChangeText: (text) => { refine(text); searchWord = text; },
              autoFocus: true
            }}
            renderDescription={(row) => row.description} // custom description render
            onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
              // this.setState({ yourLocation: data.description });
              
              navigation.navigate('HomeDrawer', 
              {
                screen: 'Restaurants',
                params: {
                  screen: 'RequestNewRest',
                  params: {
                    place_id: data.place_id,
                    cameFrom: 'Restaurant'
                  },
                },
              }
              );
              // requestNewRes(data.place_id);
              // console.log(data.place_id)
              Keyboard.dismiss();
            // console.log(data.structured_formatting)
              //   nameRest = data.structured_formatting.main_text,
              //   nameRestDesc = data.structured_formatting.secondary_text  
              // searchState = Object.assign({ nameRest: data.structured_formatting.main_text, nameRestDesc: data.structured_formatting.secondary_text, noResults: true }); 
              // navigation.navigate('RestSearchComp', { noResults: true });           
              // this.unvisibleUnsignedUser();
            }}
            GooglePlacesSearchQuery={{
              // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
              rankby: 'distance',
              type: ['food', 'restaurant']
            }}
            getDefaultValue={() => {
              if (searchWord !== '') {
                return searchWord;
              } else {
                return ''; // text input default value
              }
            }}
            query={{
              key: 'AIzaSyBZGm2V3DjsFEO_7qRFBk8UaPqjghLhnQo',
              language: 'en', // language of the results
              types: 'establishment' // default: 'geocode'
            }}
            styles={{
              description: {
                fontFamily: 'MontserratBold',
                width: width * 0.90,
                textAlign: 'left',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 20,
                height: 45
              },
              predefinedPlacesDescription: {
                color: '#1faadb'
              },
              textInputContainer: {
                backgroundColor: 'rgba(0,0,0,0)',
                borderTopWidth: 0,
                width: width * 0.90,
                marginLeft: 15,
                alignItems: 'center',
                justifyContent: 'center',
                height: 65,
                borderBottomWidth: 0
              },
              textInput: {
                marginLeft: 0,
                marginRight: 0,
                width: width * 0.90,
                height: 40,
                color: '#5d5d5d',
                fontSize: 16
              },
              poweredContainer: {
                flex: 1,
                width,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                borderRadius: 0,
                //   height: 0,
                marginLeft: 0
                //   backgroundColor: 'white'
              }
            }}
            // currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
            // currentLocationLabel="Current location"
            debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
          />
        </View>
      )
    }
  }
    return (    
        <View style={{ flex: 1, height: 65 }}>
          <FlatList
            data={hits}
            extraData={hits}
            onEndReached={onEndReached}
            ItemSeparatorComponent={ItemSeperator}
            initialNumToRender={9}
            keyboardShouldPersistTaps={'handled'}
            onEndReachedThreshold={0.01}
            keyExtractor={(item, index) => item.objectID}
            ListEmptyComponent={emptryComponent()}
            renderItem={({ item, index }) => {
              // let isOpenNow = isOpen(item.restName);
              // console.log(isOpenNow)
              // const isOpenNow = isOpen('HIDE - London');
              // console.log(isOpenNow)
              return (
                <View style={{ marginBottom: (hits.length === index + 1 ) ? 200 : 0 }}>
                  {/* <View style={{ backgroundColor: 'black', height: index === 0 ? 1 : 0 }} /> */}
                  <TouchableOpacity
                    onPress={() => { 
                      // console.log(newData.isOpenNowList[index], ' ', index)
                      fetchRestData(item.restaurantUid, isOpenNowList[index]);
                    // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
                    // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                    // navigation.navigate('MenuItem', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                    // navigation.dispatch({
                    //   ...CommonActions.setParams({ restaurantName: item.restName })
                    // });
                  }}
                  > 
                    <View style={{ backgroundColor: 'white', width: width * 0.90, justifyContent: 'center', alignItems: 'center', marginLeft: 25, marginBottom: 10, marginTop: 15 }}>
                      <View style={{ marginTop: -5, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 0, marginBottom: -5 }}>
                            <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 5, marginLeft: -5, position: 'absolute',  height: 95, width: 95, borderRadius: 20, backgroundColor: '#e6e6e6', zIndex: 0 }} />
                            <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', height: 50, width: 50, marginTop: 10, marginBottom: 60 }}>
                              <Image
                                // size={50}
                                // theme={avatorTheme}
                                style={{ height: 85, width: 85, borderRadius: 20 }}
                                source={{ uri: item.image }}
                              />
                            </View>
                          <View style={{ marginTop: 5, flexDirection: 'row', flex: 1, alignItems: 'flex-start', width: width * 0.70, justifyContent: 'flex-start', marginLeft: 40 }}>  
                            <View style={{ flex: 1, alignItems: 'flex-start', width: width * 0.70, justifyContent: 'flex-start', marginLeft: 10, marginRight: 5 }}>
                              <Text style={{ fontFamily: 'MontserratBold', fontSize: 14, color: colors.text, marginRight: 5, marginLeft: 5 }}>
                                <Highlight attribute="restName" hit={item} />
                              </Text>
                              <Paragraph style={{ fontFamily: 'Montserrat', fontSize: 12, color: 'rgba(0, 0, 0, 0.20)', marginRight: 5, marginLeft: 5 }}>
                                <Highlight attribute="restAddress" hit={item} /> 
                              </Paragraph>
                              <Text style={{ fontFamily: 'Montserrat', fontSize: 14, color: (isOpenNowList[index] === true ? '#06C906' : (isOpenNowList[index] == undefined ? '#06C906' : '#C90611')), marginRight: 5, marginLeft: 5 }}>
                                {isOpenNowList[index] === true ? 'Open' : (isOpenNowList[index] == undefined ? '' :'Closed')}
                              </Text>
                            </View>
                          </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
    );
  // }
  // if (hits.length === 0) {
  //   searchState = Object.assign({ noResults: true });
  // }
  // if (hits.length !== 0) {
  //   searchState = Object.assign({ noResults: false });
  // }
  // searchState = Object.assign({ hasMore });
  // searchState = Object.assign({ results: hits });
  // searchState = Object.assign({ height: hits.length });
});
const ItemSeperator = () => <View style={{ backgroundColor: '#f2f2f2', height: 1 }} />;
const Highlight = connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({
      attribute,
      hit,
      highlightProperty: '_highlightResult',
    });
    const highlightedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted)
        return (
          <Text key={idx} style={{ backgroundColor: '#e6e6e6' }}>
            {part.value}
          </Text>
        );
      return part.value;
    });
    return <Text>{highlightedHit}</Text>;
  }
);

const SearchBox = connectSearchBox(({ refine, currentRefinement }) => {
  // if (Searched_Word !== '' && Searched_Word !== searchingWord) {
    // refine(searchState.nameRest)
  // }
  return (
    <View>
      <Searchbar
        placeholder="Find restaurant "
        // onIconPress={() => { handleSearch(searchQuery); }}
        onChangeText={
          (text) => { 
            // refine(event.currentTarget.value)
            refine(text); 
            searchWord = text;
            preLoad = false;
            searchState = Object.assign({ nameRest: text }); 
          }
        }
        // value={searchQuery}
        value={currentRefinement}
        // onFocus={onFocus}
        // onBlur={onBlur}
        // defaultValue={data.searchQuery}
        maxLength={100}
        returnKeyType={'done'}
        keyboardType={'default'}
        selectionColor= '#EE5B64'
        style={{ marginLeft: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 15, height: 50, marginTop: Platform.OS === ' ios' ? -10 : 0, width: width * 0.90 }}
        inputStyle={{ fontFamily: 'Montserrat', fontSize: 14 }}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'flex-start', 
    justifyContent: 'center'
  },
  CurrentImage2: {
    // width: 50, 
    // height: 50,
    width: catWidth, 
    height: catHeight,
    borderRadius: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  searchDescStyle: {
    textAlign: 'left',
    fontSize: 14, 
    marginLeft: 15,
    width: width * 0.75,
    borderRadius: 40,
    fontFamily: 'MontserratReg',
    color: 'rgba(0, 0, 0, 0.39)',
  },
  color_textPrivateBold: {
      color: '#C90611', 
      fontFamily: 'MontserratSemiBold',
      fontSize: 12
  },
  color_textPrivate: {
      color: 'grey', 
      fontFamily: 'MontserratSemiBold',
      fontSize: 12
  },
  textPrivate: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginLeft: 40,
      marginBottom: 30,
      width: width * 0.75
  },
  searchDescStyle2: {
    textAlign: 'left',
    fontSize: 12, 
    marginLeft: 15,
    width: width * 0.70,
    borderRadius: 40,
    fontFamily: 'Poppins',
    color: 'black',
  },
  searchDescStyle3: {
    textAlign: 'center',
    fontSize: 12, 
    marginLeft: 15,
    width: width * 0.70,
    borderRadius: 40,
    fontFamily: 'Poppins',
    color: 'rgba(0, 0, 0, 0.39)',
  },
  linearGradientSocial: {
      flexDirection: 'row',
      height: 50,
      borderWidth: 1,
      borderColor: Platform.OS === 'ios' ? 'black' : 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      width: width * 0.75
  },
  buttonTextBlack: {
      fontSize: 14,
      fontFamily: 'MontserratSemiBold',
      textAlign: 'center',
      margin: 10,
      color: '#000',
      backgroundColor: 'transparent',
  },
  linearGradient: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      width: width * 0.75
  },
  button: {
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  buttonText2: {
    fontSize: 14,
    fontFamily: 'MontserratSemiBold',
    textAlign: 'center',
    margin: 10,
    color: '#C90611',
    backgroundColor: 'transparent',
  },
  linearGradient2: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      width: width * 0.75,
      borderColor: '#C90611',
      borderWidth: 1
  },
});

export default connect(null, actions)(RestaurantSearchScreen);