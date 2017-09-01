const assign = require('lodash/assign');
const isNil = require('lodash/isNil');
const isObject = require('lodash/isObject');
const uniqueId = require('lodash/uniqueId');
const EventEmitter = require('wolfy87-eventemitter');
const DataView = require('./data-view');

class DataSet extends EventEmitter {
  constructor(initialProps = { state: {} }) {
    super();
    const me = this;
    assign(me, {
      _onChangeTimer: null,
      DataSet,
      isDataSet: true,
      views: {}
    }, initialProps);
  }

  _getUniqueViewName() {
    const me = this;
    let name = uniqueId('view_');
    while (me.views[name]) {
      name = uniqueId('view_');
    }
    return name;
  }

  createView(name, options = {}) {
    const me = this;
    if (isNil(name)) {
      name = me._getUniqueViewName();
    }
    if (isObject(name)) {
      options = name;
      name = me._getUniqueViewName();
    }
    if (me.views[name]) {
      throw new Error(`data view exists: ${name}`);
    }
    const view = new DataView(me, options);
    me.views[name] = view;
    return view;
  }

  getView(name) {
    return this.views[name];
  }

  setView(name, view) {
    this.views[name] = view;
  }

  setState(name, value) {
    const me = this;
    me.state[name] = value;
    if (me._onChangeTimer) {
      clearTimeout(me._onChangeTimer);
      me._onChangeTimer = null;
    }
    me._onChangeTimer = setTimeout(() => {
      me.emit('statechange', name, value);
    }, 16); // execute after one frame
  }
}

assign(DataSet, {
  DataSet,
  DataView,
  connectors: {},
  transforms: {},

  registerConnector(name, connector) {
    DataSet.connectors[name] = connector;
  },

  getConnector(name) {
    return DataSet.connectors[name] || DataSet.connectors.default;
  },

  registerTransform(name, transform) {
    DataSet.transforms[name] = transform;
  },

  getTransform(name) {
    return DataSet.transforms[name] || DataSet.transforms.default;
  }
});

assign(DataSet.prototype, {
  view(name, options) {
    this.createView(name, options);
  }
});

module.exports = DataSet;
