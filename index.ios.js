/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

const React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

const QUOTES = require("./react/quotes");
const SortableList = require("./react/views/SortableList");

var textBoxStyle = {
  borderWidth: 1,
  borderColor: "#B9BBFF",
}

let localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000445"
  },

  shuffleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  shuffle: {
    ...textBoxStyle,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    margin: 10,
    backgroundColor: '#33366A',
  },

  shuffleText: {
    color: "#B9BBFF",
    textAlign: 'center',
    fontWeight: "800",
  },

  quoteText: {
    ...textBoxStyle,
    color: "#B9BBFF",
    fontSize: 18,
    margin: 20,
    marginTop: 0,
    padding: 10,
  },
});

var App = React.createClass({

  getInitialState() {
    let items = {};

    QUOTES.slice(0,10).forEach((quote,i) => {
      // Javascript hash preserves insertion order except for "numeric" keys.
      // Add a random prefix to avoid that.
      items[`@${i}`] = quote;
    });

    return {
      items: items,
    }
  },

  render() {
    return (
		<View style={localStyles.container}>
			<SortableList items={this.state.items} ref="guessList">
				{item => <Text style={localStyles.quoteText}>{item}</Text>}
			</SortableList>
		</View>
    );
  },

});


AppRegistry.registerComponent('SortableList', () => App);
