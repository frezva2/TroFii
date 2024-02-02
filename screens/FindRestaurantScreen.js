import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Keyboard,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Avatar, Paragraph, Searchbar, DefaultTheme } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import algoliasearch from "algoliasearch";
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectHighlight,
} from "react-instantsearch-native";

const firebase = require("firebase/app").default;
require("firebase/auth");

const attrToRetr = [
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
  "isUndecided",
];

let searchState = {
  noResults: false,
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
    connect: 1,
    read: 2, // The value of the former `timeout` parameter
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
let preLoad = true;
let searchWord = "";

const FindRestaurantScreen = (props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

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
    nameRest: "",
    nameRestDesc: "",
    stateNavigation: { 0: "abc" },
    restsImageList: [],
  });

  const mounted = async () => {
    const { currentUser } = firebase.auth();
    if (currentUser !== null) {
    }
  };
  useEffect(() => {
    return () => {
      // console.log('unmounting...');
    };
  }, []);

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
      setData({ ...data, nameRest: searchState.nameRest });
      setData({ ...data, nameRestDesc: searchState.nameRestDesc });
      setData({
        ...data,
        noResults: searchState.noResults,
        initialState: true,
      });
    }
  };
  const renderEmpty = () => {
    return <View style={{ flex: 1 }} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, marginTop: -25 }}>
      <View style={styles.container}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
        <View style={{ flex: 1 }}>
          <InstantSearch
            searchClient={client}
            indexName="restsList"
            refresh
            stalledSearchDelay={0}
            onSearchStateChange={(results) => onSearchStateChange(results)}>
            <Configure
              facetFilters={
                props.isEarnRewards
                  ? ["isRestActive:true", "isUndecided:false"]
                  : ["isRestActive:true"]
              }
              attributesToRetrieve={attrToRetr}
              hitsPerPage={300}
              typoTolerance={"strict"}
            />

            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
                marginBottom: 50,
                width,
              }}>
              <SearchBox searchingWord={searchQuery} />
            </View>
            <View style={{ backgroundColor: "#f2f2f2", height: 1 }} />
            {data.noResults ? (
              <View
                style={{
                  marginLeft: 10,
                  width: width * 0.95,
                  backgroundColor: "white",
                  borderRadius: 5,
                }}>
                <View
                  style={{
                    marginTop: 5,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    marginBottom: 5,
                    backgroundColor: "white",
                  }}>
                  <View style={{ marginTop: 10, marginLeft: 15 }}>
                    <Text style={styles.searchTitleStyle}>
                      {searchState.nameRest}
                    </Text>
                  </View>
                  <View style={{ marginTop: 10, marginLeft: 15 }}>
                    <Text style={styles.searchTextStyle}>
                      {searchState.nameRestDesc}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 10,
                  }}>
                  <SocialIcon
                    title="Request This Restaurant"
                    button
                    style={{
                      backgroundColor: "#0c1355",
                      width: width * 0.85,
                      height: 45,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                </View>
              </View>
            ) : (
              <View>
                <View style={{ flex: 1, height: height, marginBottom: 5 }}>
                  <Hits
                    colors={colors}
                    navigation={props.props.navigation}
                    isEarnRewards={props.isEarnRewards}
                  />
                </View>
              </View>
            )}
          </InstantSearch>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Hits = connectInfiniteHits(
  ({ hits, hasMore, refine, colors, navigation, isEarnRewards }) => {
    let nameRest = searchState.nameRest;
    let _flatList = useRef(null);
    const onEndReached = function () {
      if (hasMore) {
        refine();
      }
    };
    const emptryComponent = () => {
      if (hits.length === 0 && !preLoad) {
        return (
          <View style={{ flex: 1, marginLeft: 5, width }}>
            <GooglePlacesAutocomplete
              scrollEnabled={false}
              ref={(flatList) => {
                _flatList = flatList;
              }}
              placeholder={searchWord}
              minLength={0} // minimum length of text to search
              keyboardShouldPersistTaps={"handled"}
              listViewDisplayed={"auto"} // true/false/undefined
              textInputProps={{
                value: searchWord,
                onChangeText: (text) => {
                  refine(text);
                  searchWord = text;
                },
                autoFocus: true,
              }}
              renderDescription={(row) => row.description} // custom description render
              onPress={(data, details = null) => {
                // 'details' is provided when fetchDetails = true
                Keyboard.dismiss();
                let restName = data.description;
                let strs = "";
                if (restName.indexOf(",") != -1) {
                  strs = restName.split(",");
                  restName = `${strs[0]} -${strs[2]}`;
                  navigation?.navigate("PostPictureScreen", {
                    restaurantUid: "restName",
                    restaurantName: restName,
                    place_id: data.place_id,
                  });
                } else {
                  navigation?.navigate("PostPictureScreen", {
                    restaurantUid: "restName",
                    restaurantName: restName,
                    place_id: data.place_id,
                  });
                }
              }}
              GooglePlacesSearchQuery={{
                rankby: "distance",
                type: ["food", "restaurant"],
              }}
              getDefaultValue={() => {
                if (searchWord !== "") {
                  return searchWord;
                } else {
                  return ""; // text input default value
                }
              }}
              query={{
                key: "AIzaSyBv-uuNSNVNETBl0ol-jyI8zUs2yHr0QL4",
                language: "en", // language of the results
                types: "establishment", // default: 'geocode'
              }}
              styles={{
                description: {
                  fontFamily: "MontserratSemiBold",
                  width: width * 0.9,
                  textAlign: "left",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 20,
                  marginBottom: 20,
                  height: 60,
                },
                predefinedPlacesDescription: {
                  color: "#1faadb",
                },
                textInputContainer: {
                  backgroundColor: "rgba(0,0,0,0)",
                  borderTopWidth: 0,
                  width: width * 0.9,
                  marginLeft: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  height: 55,
                  borderBottomWidth: 0,
                },
                textInput: {
                  marginLeft: 0,
                  marginRight: 0,
                  width: width * 0.9,
                  height: 40,
                  color: "#5d5d5d",
                  fontSize: 16,
                },
                poweredContainer: {
                  flex: 1,
                  width,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  borderRadius: 0,
                  marginLeft: 0,
                },
              }}
              debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
            />
          </View>
        );
      }
    };
    return (
      <View style={{ flex: 1, height: 65 }}>
        <FlatList
          data={hits}
          extraData={hits}
          onEndReached={onEndReached}
          ItemSeparatorComponent={ItemSeperator}
          keyboardShouldPersistTaps={"handled"}
          ListEmptyComponent={emptryComponent()}
          initialNumToRender={11}
          onEndReachedThreshold={3}
          keyExtractor={(item, index) => item.objectID}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{ marginBottom: hits.length === index + 1 ? 200 : 0 }}>
                <TouchableHighlight
                  onPress={() => {
                    if (isEarnRewards) {
                      navigation?.navigate("EarnRewardsScreen", {
                        restaurantUid: item.restaurantUid,
                        restaurantName: item.restName,
                        place_id: "",
                        restAddress: item.restAddress,
                      });
                    } else {
                      navigation?.navigate("PostPictureScreen", {
                        restaurantUid: item.restaurantUid,
                        restaurantName: item.restName,
                        place_id: "",
                        restAddress: item.restAddress,
                      });
                    }
                  }}>
                  <View style={{ backgroundColor: "white", width }}>
                    <View
                      style={{
                        marginTop: 5,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        marginLeft: 15,
                        marginBottom: 15,
                      }}>
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 5,
                          marginLeft: -5,
                          position: "absolute",
                          height: 60,
                          width: 60,
                          borderRadius: 30,
                          backgroundColor: "#e6e6e6",
                          zIndex: 0,
                        }}
                      />
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          height: 50,
                          width: 50,
                          marginTop: 10,
                        }}>
                        <Avatar.Image
                          size={50}
                          theme={avatorTheme}
                          source={{ uri: item.image }}
                        />
                      </View>
                      <View
                        style={{
                          marginTop: 5,
                          flexDirection: "row",
                          flex: 1,
                          alignItems: "flex-start",
                          width: width * 0.6,
                          justifyContent: "flex-start",
                        }}>
                        <View
                          style={{
                            flex: 1,
                            alignItems: "flex-start",
                            width: width * 0.5,
                            justifyContent: "flex-start",
                            marginLeft: 10,
                            marginRight: 5,
                          }}>
                          <Text
                            style={{
                              fontFamily: "MontserratBold",
                              fontSize: 14,
                              color: colors.text,
                              marginRight: 30,
                              marginLeft: 5,
                            }}>
                            <Highlight attribute="restName" hit={item} />
                          </Text>
                          <Paragraph
                            style={{
                              fontFamily: "Montserrat",
                              fontSize: 12,
                              color: colors.text,
                              marginRight: 40,
                              marginLeft: 5,
                            }}>
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
  }
);
const ItemSeperator = () => <View style={styles.seperator} />;
const Highlight = connectHighlight(
  ({ highlight, attribute, hit, highlightProperty }) => {
    const parsedHit = highlight({
      attribute,
      hit,
      highlightProperty: "_highlightResult",
    });
    const highlightedHit = parsedHit.map((part, idx) => {
      if (part.isHighlighted)
        return (
          <Text key={idx} style={{ backgroundColor: "#e6e6e6" }}>
            {part.value}
          </Text>
        );
      return part.value;
    });
    return <Text>{highlightedHit}</Text>;
  }
);

const SearchBox = connectSearchBox(
  ({ onFocus, onBlur, refine, currentRefinement }) => {
    return (
      <View style={{ marginBottom: 10 }}>
        <Searchbar
          placeholder="Find a restaurant "
          onChangeText={(text) => {
            refine(text);
            preLoad = false;
            searchWord = text;
            searchState = Object.assign({ nameRest: text });
          }}
          value={currentRefinement}
          maxLength={100}
          returnKeyType={"done"}
          keyboardType={"default"}
          selectionColor="#EE5B64"
          style={{
            marginLeft: -10,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 15,
            height: 50,
            marginTop: Platform.OS === " ios" ? -10 : 0,
            width: width - 20,
          }}
          inputStyle={{ fontFamily: "Montserrat", fontSize: 14 }}
        />
      </View>
    );
  }
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: "white",
    justifyContent: "center",
  },
});

export default FindRestaurantScreen;
