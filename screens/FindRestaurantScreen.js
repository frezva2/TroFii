import React, { useState, useEffect, useRef }  from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, Linking, FlatList, ActivityIndicator, TouchableHighlight, Input, Keyboard } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {  Avatar, Button, Card, Title, Paragraph, Searchbar, DefaultTheme } from 'react-native-paper';
// import * as Analytics from 'expo-firebase-analytics';
import axios from 'axios';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import openMap from 'react-native-open-maps';
import algoliasearch from 'algoliasearch';;
// import * as firebase from 'firebase';
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
  // connectRefinementList,
} from 'react-instantsearch-native'; 
import { CommonActions } from '@react-navigation/native';

const firebase = require('firebase/app').default
require('firebase/auth')

const attrToRetr = ['restaurantUid', 'restName', 'restAddress', 'restWebsite', 'isRestActive', 'image', 'RestNumFollowers', 'restHours', 'objectID', 'Notifications',
                    'RestEntreeNum', 'RestDrinkNum', 'RestDessertNum', 'RestApptNum', 'restMaxPercentage', 'phoneNum', 'restDesc', 'restOrderWeb', 'isUndecided'];

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
let preLoad = true;
let searchWord = '';

const FindRestaurantScreen = (props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);

  const theme = useTheme();
  
  const [data, setData] = React.useState({
    foodNameArr: [],
    finalResults: [],
    refreshing: false,
    loading: false,
    noResults: false,
    restUidIndex: 0,
    tempIndex: [],
    restsImage: [],
    numOfItems: 0,
    restsUidArr: [],
    dateIdList: [],
    tempRestsUidArr: [],
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
  
    return (
      <SafeAreaView style={{ flex: 1, marginTop: -25 }}>
        <View style={styles.container}>
          <StatusBar barStyle= { theme.dark ? "light-content" : "dark-content" }/>
          <View style={{ flex: 1 }}>
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
              facetFilters= {props.isEarnRewards ? ['isRestActive:true','isUndecided:false'] : ['isRestActive:true']}
              attributesToRetrieve={attrToRetr} 
              hitsPerPage={300}
              typoTolerance={'strict'}
              // aroundLatLngViaIP
              // aroundLatLng={this.state.arndLatLng}
              // aroundRadius={this.state.aroundRadius}
            />
            
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 50, width }}>
                  <SearchBox searchingWord={searchQuery} />
                </View>
                <View style={{ backgroundColor: '#f2f2f2', height: 1 }} />
              { 
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
                : 
                <View>
                  <View style={{ flex: 1, height: height, marginBottom: 5 }}> 
                    <Hits colors={colors} navigation={props.props.navigation} isEarnRewards={props.isEarnRewards}/> 
                  </View>
                </View>
              }
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

const Hits = connectInfiniteHits(({ hits, hasMore, refine, colors, navigation, isEarnRewards }) => {
  let nameRest = searchState.nameRest;
  let _flatList = useRef(null);
          // console.log(hits[0].restName);
// searchState = Object.assign({ restaurantUid: hits[0].restaurantUid, restaurantName: hits[0].restName, searchingWord: hits[0].restName });
          // navigate('main', { dataReceived: true, restaurantUid: hits[0].restaurantUid, restaurantName: hits[0].restName, results: hits, height: hits.length, loadingStateVisible: true, compCameFrom: 'Main' });  
const onEndReached = function() {
    if (hasMore) {
      refine();
    }
};
// const setAddressText = function(nr) {
//   if (ref.current !== undefined) {
//     ref.current?.setAddressText(nr)
//   }
// };
  // if (hits.length === 0 && nameRest !== '' && nameRest !== undefined) {

  // if (isMounted && hits.length === 0 && nameRest !== undefined && nameRest !== null && initialState) {
  //   // if (navigation.state.params.compCameFrom !== 'NewItems' && !hasMore) {
  //   //   navigate('main', { dataReceived: true, nameRest: '', nameRestDesc: '', compCameFrom: 'Main', restaurantUid: '', restaurantName: '' });
  //   // searchState = Object.assign({ restaurantUid: '', searchingWord: '', loadingStateVisible: false });
  //   // }
  //   // setAddressText(nameRest);
  //   let nameRestDesc = '';
  //   // let restaurantUid = '';
  //     return ( 
  //       <View style={{ flex: 1, marginLeft: 5, width }}>
  //         <GooglePlacesAutocomplete
  //           // ref={r => {ref = r}}
  //           placeholder={nameRest}
  //           // placeholder={'Press Here ...'}
  //           minLength={0} // minimum length of text to search
  //           keyboardShouldPersistTaps={'handled'}
  //         // onSubmitEditing={this.unvisibleUnsignedUser.bind(this)}
  //           // returnKeyType={'done'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
  //           listViewDisplayed={'auto'}   // true/false/undefined
  //           // predefinedPlacesAlwaysVisible={true}  
  //           textInputProps={{
  //             value: nameRest,
  //             onChangeText: (text) => { refine(text); searchState = Object.assign({ nameRest: text, nameRestDesc: '', noResults: false })},
  //             autoFocus: true
  //           }}
  //           renderDescription={(row) => row.description} // custom description render
  //           onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
  //             // this.setState({ yourLocation: data.description });
  //             Keyboard.dismiss();
  //           // console.log(data.structured_formatting)
  //             //   nameRest = data.structured_formatting.main_text,
  //             //   nameRestDesc = data.structured_formatting.secondary_text  
  //             searchState = Object.assign({ nameRest: data.structured_formatting.main_text, nameRestDesc: data.structured_formatting.secondary_text, noResults: true }); 
  //             navigation.navigate('RestSearchComp', { noResults: true });           
  //             // this.unvisibleUnsignedUser();
  //           }}
  //           GooglePlacesSearchQuery={{
  //             // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
  //             rankby: 'distance',
  //             type: 'food'
  //           }}
  //           getDefaultValue={() => {
  //             if (nameRest !== undefined) {
  //               return nameRest;
  //               // console.log(nameRest)
  //             } else {
  //               return ''; // text input default value
  //             }
  //           }}
  //           query={{
  //             key: 'AIzaSyBZGm2V3DjsFEO_7qRFBk8UaPqjghLhnQo',
  //             language: 'en', // language of the results
  //             types: 'establishment' // default: 'geocode'
  //           }}
  //           styles={{
  //             description: {
  //               fontFamily: 'SourceSansPro-Bold',
  //               width: width * 0.90,
  //               textAlign: 'left',
  //               alignItems: 'center',
  //               justifyContent: 'center',
  //               marginRight: 20
  //               // height: 40
  //             },
  //             predefinedPlacesDescription: {
  //               color: '#1faadb'
  //             },
  //             textInputContainer: {
  //               backgroundColor: 'rgba(0,0,0,0)',
  //               borderTopWidth: 0,
  //               width: width * 0.90,
  //               marginLeft: 15,
  //               alignItems: 'center',
  //               justifyContent: 'center',
  //               height: 65,
  //               borderBottomWidth: 0
  //             },
  //             textInput: {
  //               marginLeft: 0,
  //               marginRight: 0,
  //               width: width * 0.90,
  //               height: 40,
  //               color: '#5d5d5d',
  //               fontSize: 16
  //             },
  //             poweredContainer: {
  //               flex: 1,
  //               width,
  //               alignItems: 'flex-start',
  //               justifyContent: 'flex-start',
  //               borderRadius: 0,
  //              //   height: 0,
  //               marginLeft: 0
  //              //   backgroundColor: 'white'
  //             }
  //           }}
  //           // currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
  //           // currentLocationLabel="Current location"
  //           debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
  //         />
  //       </View>
  //     );
  // } 
  // else {
    
  const emptryComponent = () => {
    if (hits.length === 0 && !preLoad) {
      return (
        <View style={{ flex: 1, marginLeft: 5, width }}>
          <GooglePlacesAutocomplete
            scrollEnabled={false}
            // listEmptyComponent={()=>{
            //   return (
            //     <View style={{ flex: 1, marginLeft: 5, width }}>
            //       <Text>{searchWord}</Text>
            //     </View>
            //   )
            // }}
            // ref={r => {ref = r}}
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
              Keyboard.dismiss();
              let restName = data.description;
              let strs = '';
              if( restName.indexOf(',') != -1 ) {
                  strs = restName.split(',');
                  // console.log(strs[0], '-', strs[2])
                  restName = `${strs[0]} -${strs[2]}`;
                  navigation?.navigate('PostPictureScreen', { restaurantUid: 'restName', restaurantName: restName, place_id: data.place_id });
              } else {
                navigation?.navigate('PostPictureScreen', { restaurantUid: 'restName', restaurantName: restName, place_id: data.place_id });
              }
              
                    // navigation.navigate('HomeDrawer', 
                    //   {
                    //     screen: 'Home',
                    //     params: {
                    //       screen: 'RequestNewRestHome',
                    //       params: {
                    //         place_id: data.place_id, 
                    //         cameFrom: 'Home'
                    //       },
                    //   },
                    // });
              // requestNewRes(data.place_id);
              // console.log(data.place_id)
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
              key: 'AIzaSyBv-uuNSNVNETBl0ol-jyI8zUs2yHr0QL4',
              language: 'en', // language of the results
              types: 'establishment' // default: 'geocode'
            }}
            styles={{
              description: {
                fontFamily: 'MontserratSemiBold',
                width: width * 0.90,
                textAlign: 'left',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 20,
                marginBottom: 20,
                height: 60
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
                height: 55,
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
            keyboardShouldPersistTaps={'handled'}
            ListEmptyComponent={emptryComponent()}
            initialNumToRender={11}
            onEndReachedThreshold={3}
            keyExtractor={(item, index) => item.objectID}
            renderItem={({ item, index }) => {
              // console.log(item)
              return (
                <View style={{ marginBottom: (hits.length === index + 1 ) ? 200 : 0 }}>
                  {/* <View style={{ backgroundColor: 'black', height: index === 0 ? 1 : 0 }} /> */}
                  <TouchableHighlight
                    onPress={() => { 
                    // searchState = Object.assign({ restaurantUid: item.restaurantUid, searchingWord: item.restName, loadingStateVisible: true, nameRest: ' ' });
                    // navigation.navigate('Restaurant', { restaurantUid: item.restaurantUid, restaurantName: item.restName });
                    if (isEarnRewards) {
                      navigation?.navigate('EarnRewardsScreen', { 
                        restaurantUid: item.restaurantUid, 
                        restaurantName: item.restName, place_id: '',
                        restAddress: item.restAddress
                      });
                    } else {
                      navigation?.navigate('PostPictureScreen', { 
                        restaurantUid: item.restaurantUid, 
                        restaurantName: item.restName, place_id: '',
                        restAddress: item.restAddress
                      });
                    }
                    // navigation.dispatch({
                    //   ...CommonActions.setParams({ restaurantName: item.restName })
                    // });
                  }}
                  > 
                    <View style={{ backgroundColor: 'white', width }}>
                      <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 15, marginBottom: 15 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5, marginLeft: -5, position: 'absolute', height: 60, width: 60, borderRadius: 30, backgroundColor: '#e6e6e6', zIndex: 0 }} />
                            <View style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50, marginTop: 10 }}>
                              <Avatar.Image
                                size={50}
                                theme={avatorTheme}
                                source={{ uri: item.image }}
                              />
                            </View>
                          <View style={{ marginTop: 5, flexDirection: 'row', flex: 1, alignItems: 'flex-start', width: width * 0.60, justifyContent: 'flex-start' }}>  
                            <View style={{ flex: 1, alignItems: 'flex-start', width: width * 0.50, justifyContent: 'flex-start', marginLeft: 10, marginRight: 5 }}>
                              <Text style={{ fontFamily: 'MontserratBold', fontSize: 14, color: colors.text, marginRight: 30, marginLeft: 5 }}>
                                <Highlight attribute="restName" hit={item} />
                              </Text>
                              <Paragraph style={{ fontFamily: 'Montserrat', fontSize: 12, color: colors.text, marginRight: 40, marginLeft: 5 }}>
                                <Highlight attribute="restAddress" hit={item} />
                              </Paragraph>
                            </View>
                          </View>
                      </View>
                    </View>
                  </TouchableHighlight>
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
const ItemSeperator = () => <View style={styles.seperator} />;
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

const SearchBox = connectSearchBox(({ onFocus, onBlur, refine, currentRefinement }) => {
  // if (Searched_Word !== '' && Searched_Word !== searchingWord) {
    // refine(searchState.nameRest)
  // }
  return (
    <View style={{ marginBottom: 10 }}>
      <Searchbar
        placeholder="Find a restaurant "
        // onIconPress={() => { handleSearch(searchQuery); }}
        onChangeText={
          (text) => { 
            // refine(event.currentTarget.value)
            refine(text); 
            preLoad = false;
            searchWord = text;
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
        style={{ marginLeft: -10, alignItems: 'center', justifyContent: 'center', borderRadius: 15, height: 50, marginTop: Platform.OS === ' ios' ? -10 : 0, width: width - 20 }}
        inputStyle={{ fontFamily: 'Montserrat', fontSize: 14 }}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'flex-start', 
    backgroundColor: 'white',
    justifyContent: 'center'
  },
});

export default FindRestaurantScreen;