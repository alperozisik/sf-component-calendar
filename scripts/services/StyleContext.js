(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./Context", "@smartface/styler/lib/utils/merge"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./Context"), require("@smartface/styler/lib/utils/merge"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Context, global.merge);
    global.StyleContext = mod.exports;
  }
})(this, function (exports, _Context, _merge) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.fromSFComponent = fromSFComponent;
  exports.fromObject = fromObject;
  exports.fromArray = fromArray;
  exports.makeStylable = makeStylable;
  exports.createStyleContext = createStyleContext;

  var _Context2 = _interopRequireDefault(_Context);

  var _merge2 = _interopRequireDefault(_merge);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /**
   * Create styleContext from a SF Component
   * 
   * @params {*} component - a SF Component
   * @params {String} name - component name
   * @params {Function} mapper
   */
  function fromSFComponent(component, name, mapper) {
    var flatted = {};

    function collect(component, name, mapper) {
      var newComp = makeStylable(component, mapper(name), name);
      flat(name, newComp);

      component.children && Object.keys(component.children).forEach(function (child) {
        collect(component.children[child], name + "_" + child, mapper);
      });
    }

    function flat(name, comp) {
      flatted[name] = comp;
    }
    collect(component, name, mapper);
    return createStyleContext(flatted);
  }

  /**
   * Creates context from a hash list
   *
   */
  function fromObject(children, maker, mapper) {
    return Object.keys(children).reduce(function (acc, child) {
      acc[child] = maker(children[child], child, mapper);
      return acc;
    }, {});
  }

  /**
   * Creates context from an array
   *
   */
  function fromArray(children, maker, mapper) {
    return children.map(function (child) {
      return maker(child, mapper);
    });
  }

  function makeStylable(component, className, name) {
    return new (function () {
      function Stylable() {
        _classCallCheck(this, Stylable);

        this.name = name;
        this.className = className;
        this.component = component;
        this.styles;
      }

      Stylable.prototype.setStyles = function setStyles(styles) {
        this.styles = styles;
        Object.keys(styles).length && Object.assign(this.component, (0, _merge2.default)({}, this.styles));
      };

      Stylable.prototype.setContext = function setContext(context) {
        this.context = context;
        component.setContextDispatcher && component.setContextDispatcher(function (action) {
          this.context.dispatch(action, this.name);
        }.bind(this));
      };

      Stylable.prototype.getStyles = function getStyles() {
        return Object.assign({}, this.styles);
      };

      Stylable.prototype.getClassName = function getClassName() {
        return this.className;
      };

      Stylable.prototype.setClassName = function setClassName(className) {
        return this.className = className;
      };

      Stylable.prototype.dispose = function dispose() {
        this.component = null;
        this.context = null;
        this.styles = null;
        this.component.setContextDispatcher && this.component.setContextDispatcher(null);
      };

      return Stylable;
    }())();
  }

  function createStyleContext(actors) {
    return function changeStyles(styler, reducer) {
      var context = (0, _Context2.default)(actors, function contextUpdate(state, action, target) {
        var newState = state;

        if (target) {
          newState = reducer(state, action, target);

          if (newState === state) {
            return state;
          }
        }

        newState = Object.assign({}, state);
        Object.keys(newState.actors).forEach(function setInitialStyles(name) {
          var className = newState.actors[name].getClassName();
          var styles = styler(className);
          newState.actors[name].setStyles(styles());
        });

        return newState;
      });

      Object.keys(actors).forEach(function assignContext(name) {
        actors[name].setContext(context);
      });

      return context;
    };
  }
});