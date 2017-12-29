import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
  WebView
} from 'react-native';
import { WebBrowser } from 'expo';
import { AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import { MonoText } from '../components/StyledText';

const launchscreenBg = require('../assets/images/launchscreen-bg.png');
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      priceData: null,
      data: []
    };

    // fetch historical price (moving avg. for x days.)
    var data = []; // populate this with data from historical prices.
    fetch('https://data.ripple.com/v2/exchanges/USD+rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B/XRP?interval=1day&format=json&start=2016-12-20T00:00:00Z')
    .then(response => {
      return response.json();
    }).then(responseJson => {
      console.log('start: ' + JSON.stringify(responseJson.exchanges[0]));
      for (var i = 0; i < responseJson.exchanges.length; i++) {
        data[i] = parseFloat(responseJson.exchanges[i].close);
      }
      data = data.reverse();
    }).then(() => {
      this.setState({data: data});
      console.log('this state: ' + this.state.data);
    }).catch(error => {
      console.log('error fetching historical prices: ' + error);
    })
    // fetch price
    fetch('https://b5bca68a.ngrok.io/api/ripple/getPrice', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstParam: 'yourValue',
        secondParam: 'yourOtherValue',
      }),
    })
    .then(response => {
      return response.json();
    }).then(responseJson => {
      console.log(responseJson);
      this.setState({priceData: responseJson})
      /*
        priceData object struct:
          "base": "XRP",
          "change": Number (- or +),
          "price": Number (+),
          "target": "USD",
          "Volume": Number (+) 
      */
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Image style={{ height: height, width: width, position: 'absolute', top:0, left:0 }} source={launchscreenBg} />
        </View>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Image style={styles.welcomeImage} source={{url: 'https://ripple.com/wp-content/themes/ripple-beta/assets/img/styleguide/logo1@2x.png'}}/>

            <View style={styles.getStartedContainer}>

              <Text style={styles.getStartedText}>XRP Price (in USD):  ${this.showPriceIfReady()}</Text>

              {this.showUpOrDown()}

              {this.showGraphWhenAvail()}

              <Text style={styles.getStartedText}>
                Price over time for the last 12 months.
              </Text>

                <Text style={styles.getStartedText}>
                  Current balance: 56.5 XRP ($76.84). Up $5.50 from 2 days ago. TODO: Use API for this.
              </Text>
            </View>

            <View style={styles.helpContainer}>
              <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Recent transactions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.tabBarInfoContainer}>
            <Text style={styles.tabBarInfoText}>Use this page to see your current position.</Text>

            <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
              <MonoText style={styles.codeHighlightText}>Go to the Account page for more details.</MonoText>
            </View>
          </View>
      </View>
    );
  }

  showGraphWhenAvail() {
    if (this.state.data !== null) {
      return (<AreaChart
          style={ { height: height / 4, width: width - 40 } }
          dataPoints={ this.state.data }
          contentInset={ { top: 30, bottom: 30 } }
          curve={shape.curveNatural}
          svg={{
            fill: 'rgba(134, 65, 244, 0.2)',
            stroke: 'rgb(134, 65, 244)',
          }}
        />)
    } else {
      return (<Text style={styles.getStartedText}> Loading Graph.</Text>)
    }
  }

  showUpOrDown() {
    if (this.state.priceData !== null) {
      if (this.state.priceData.change < 0) {
        // negative change.
        return (<View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
          <MonoText style={styles.codeHighlightText}>Down {this.state.priceData.change}</MonoText>
        </View>);
      } else {
        return (<View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
          <MonoText style={styles.codeHighlightText}>Up {this.state.priceData.change}</MonoText>
        </View>);
      }
    } else {
        return (<View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
          <MonoText style={styles.codeHighlightText}>Loading change...</MonoText>
        </View>);
    }
  }

  showPriceIfReady() {
    if (this.state.priceData !== null) {
      return <Text style={styles.getStartedText}>{this.state.priceData.price}</Text>;
    } else {
      return <Text style={styles.getStartedText}>Loading price of XRP.</Text>
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    height: '100%',
  },
  header: {
    height: '40%',
    backgroundColor: 'rgb(173,216,230)',
    marginBottom: 20
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  logoTextHeader: {
    marginBottom: 20,
    color: 'black',
    fontSize: 44,
    width: '100%',
    marginLeft: 20
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 0,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
