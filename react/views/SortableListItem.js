const React = require('react-native');

var {
  StyleSheet,
  View,
} = React;

let SortableListItem = React.createClass({
  componentDidMount() {
  },

  onTouchStart() {
    console.log("item touch start");
  },

  onTouchEnd() {
    console.log("item touch end");
  },

  render() {
    const {
      children,
      style,
      onMouseDown,
      onLayout,
      onTouchStart
    } = this.props;

    var css = SortableListItem.css;

    return (
      <View style={[css.container,style]}
        onLayout={onLayout}
        onTouchStart={onTouchStart}

        >{children}
      </View>
    );
  },
});

SortableListItem.css = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
});

module.exports = SortableListItem;
