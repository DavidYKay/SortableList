const ReactMotion = {Spring} = require("react-motion/native");
const {reorderKeys} = ReactMotion.utils;

const React = require('react-native');

const SortableListItem = require('./SortableListItem');

var {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} = React;


let SortableList = React.createClass({
  getInitialState() {
    const {items} = this.props;
    return {
      layouts: {},
      items,
      // The key of the current item we are moving.
      movingItemKey: null,
      movingY: null,
      scrollEnabled: true,
    };
  },

  componentWillReceiveProps(props) {
    const {items} = props;
    this.setState({items});
  },

  handleItemLayout(key,e) {
    var {layout} = e.nativeEvent;
    const {layouts} = this.state;
    this.setState(({layouts}) => {
      return {
        layouts: {
          ...layouts,
          [key]: layout,
        }
      };
    });
  },

  componentDidMount() {
  },

  reorderItemsOnMove(e) {
    const {movingItemKey, items} = this.state;

    if(movingItemKey == null) {
      return;
    }

    let rowKey = this.findKeyOfItem(e);

    // Check if cursor is outside the last item. Use the last item's key.
    if(rowKey == null) {
      let keys = Object.keys(items);
      rowKey = keys[keys.length-1];
    }

    // 2. swap items if necessary
    if(rowKey !== movingItemKey) {
      this.setState({
        items: reorderKeys(this.state.items,keys => {
          let a, b;
          keys.forEach((key,i) => {
            if(key == rowKey) {
              a = i
            }

            if(key == movingItemKey) {
              b = i
            }
          });

          const tmp = keys[a];
          keys[a] = keys[b];
          keys[b] = tmp;
          return keys;
        }),
      });

    }
  },

  findKeyOfItem(e) {
    const contentY = this.extractContentY(e);
    const {items,layouts} = this.state;

    let curHeight = 0;

    let rowKey = null;
    let keys = Object.keys(items);
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const layout = layouts[key];
      curHeight = curHeight + layout.height;
      if(contentY < curHeight) {
        rowKey = key;
        break;
      }
    }

    return rowKey;
  },

  // touch handlers
  onMoveShouldSetResponder() {
    return true;
  },

  extractContentY(e) {
    const {pageY} = e.nativeEvent;
    const {contentOffset} = this.state;
    const contentY = pageY + contentOffset.y;
    return contentY;
  },

  onResponderGrant(e) {
    // Start sorting given a long press.
    // Cancel the timer on release or termination.
    const rowKey = this.findKeyOfItem(e);
    const contentY = this.extractContentY(e);

    this.longpressSelectTimer = setTimeout(() => {


      console.log("selected",rowKey);
      this.setState({
        movingItemKey: rowKey,
        movingY: contentY,
        scrollEnabled: false,
      });
    },500);
  },

  onResponderMove(e) {
    const {pageY} = e.nativeEvent;
    console.log("move y",pageY);
    this.setState({
      movingY: this.extractContentY(e),
    });

    this.reorderItemsOnMove(e);

    if(pageY >= 60 && this._autoScrollingInterval != null) {
      clearInterval(this._autoScrollingInterval);
      this._autoScrollingInterval = null;
    }

    // start auto scrolling up
    if(pageY < 60 && this._autoScrollingInterval == null) {
      console.log("start auto scroll");
      let counter = 0;
      this._autoScrollingInterval = setInterval(() => {
        counter++;
        console.log(this.state.contentOffset);
        if(this.state.contentOffset.y > 0) {
          let dy;
          if(counter > 3) {
            dy = 60;
          } else {
            dy = 30;
          }
          this.scrollBy(-dy);
        }

      },100);
    }

    if(pageY > 500 && this._autoScrollingInterval == null) {
      console.log("start auto scroll");
      let counter = 0;
      this._autoScrollingInterval = setInterval(() => {
        counter++;
        // 675 is the screen height
        if(this.state.contentOffset.y < (this._contentHeight - 675)) {
          let dy;
          if(counter > 3) {
            dy = 60;
          } else {
            dy = 30;
          }
          this.scrollBy(dy);
        }
      },100);
    }
  },

  onResponderRelease(e) {
    this.resetMovingItem();
  },

  onResponderTerminationRequest(e) {
    console.log("responder term req",e.nativeEvent);
    if(this._autoScrollingInterval) {
      return false;
    }
    return true;
  },

  // responder status stolen by scrollview
  onResponderTerminate() {
    this.resetMovingItem();
  },

  resetMovingItem() {
    let tid = this.longpressSelectTimer
    if(tid) {
      clearTimeout(tid);
    }

    let interval = this._autoScrollingInterval;
    if(interval) {
      console.log("clear interval")
      this._autoScrollingInterval = null;
      clearInterval(interval);
    }

    this.setState({
      movingItemKey: null,
      movingY: null,
      scrollEnabled: true,
    });
  },

  scrollBy(offset) {
    this.setState(({contentOffset}) => {
      const y = contentOffset.y + offset;

      const newContentOffset = {
        x: contentOffset.x,
        y: y,
      }

      this.refs.scrollView.scrollTo(y,contentOffset.x);

      return newContentOffset;
    });
  },

  renderItems() {
    const dataRenderer = this.props.children;
    if(typeof dataRenderer != 'function') {
      throw "must be a function"
    }

    const {items,movingItemKey,movingY} = this.state;

    // calculate positions using layout dimensions.
    let curHeight = 0;
    const children = Object.keys(items).map((key) => {
        const item = items[key];

        let layout = this.state.layouts[key];

        let style;
        if(layout) {
          style = {
            position: 'absolute',
            top: {val: curHeight},
            width: layout.width,
            scale: {val: 1},
          }

          curHeight = curHeight + layout.height;
        } else {
          style = {
            top: {val: 0},
            scale: {val: 1},
          }
        }

        const hasLayout = layout != null;

        const {movingItemKey,movingY} = this.state;
        const isSelected = movingItemKey === key;

        if(isSelected) {
          style = {
            ...style,
            scale: {val: 1.1},
            backgroundColor: '#33366A',
            top: {
              val: movingY - layout.height/2 ,
              config: []
            },
          }
        }

        return (
          <Spring
            key={key}
            endValue={style}
            >
            {({position,top,width,scale,backgroundColor}) => {
              let ss = {
                position,
                width,
                transform: [{translateY: Math.ceil(top.val-0.5)},{scale: scale.val}],
              };

              return (
                <SortableListItem key={key}
                  onLayout={this.handleItemLayout.bind(this,key)}
                  style={ss}>
                  {dataRenderer(item)}
                </SortableListItem>
              );
            }}

          </Spring>

        );
    });

    return {
      contentHeight: curHeight,
      children,
    }
  },

  onScroll(e) {
    const {contentOffset} = e.nativeEvent;
    this._contentOffset = contentOffset;
    this.setState({contentOffset: contentOffset});
  },

  render() {
    const {scrollEnabled,contentOffset} = this.state;
    const {contentHeight,children} = this.renderItems();
    const scrollOffset = this._scrollOffset;

    this._contentHeight = contentHeight;

    let css = SortableList.css;

    return (
      <View style={css.container}>

        <ScrollView ref="scrollView" scrollEnabled={scrollEnabled}
          scrollEventThrottle={2}
          onScroll={this.onScroll}>
          <View style={[css.list,{height: contentHeight}]}


            ref="list"

            onStartShouldSetResponder={this.onMoveShouldSetResponder}
            onResponderGrant={this.onResponderGrant}
            onResponderMove={this.onResponderMove}
            onResponderRelease={this.onResponderRelease}


            onResponderTerminate={this.onResponderTerminate}
            onResponderTerminationRequest={this.onResponderTerminationRequest}
            >
            {children}
          </View>
        </ScrollView>
      </View>

    );
  }
});

SortableList.css = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buttonText: {
    marginTop: 20,
    padding: 10,
    color: '#fff',
  },

  container: {
    flex: 1,
  },

  list: {
    flex: 1,
  },
});

module.exports = SortableList;
