/**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.5.0): tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */

/**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

var NAME$6 = 'tooltip';
var VERSION$6 = '4.5.0';
var DATA_KEY$6 = 'bs.tooltip';
var EVENT_KEY$6 = "." + DATA_KEY$6;
var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
var CLASS_PREFIX = 'bs-tooltip';
var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
var DefaultType$4 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    whiteList: 'object',
    popperConfig: '(null|object)'
};
var AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
};
var Default$4 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent',
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist,
    popperConfig: null
};
var HOVER_STATE_SHOW = 'show';
var HOVER_STATE_OUT = 'out';
var Event = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
};
var CLASS_NAME_FADE$2 = 'fade';
var CLASS_NAME_SHOW$4 = 'show';
var SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
var SELECTOR_ARROW = '.arrow';
var TRIGGER_HOVER = 'hover';
var TRIGGER_FOCUS = 'focus';
var TRIGGER_CLICK = 'click';
var TRIGGER_MANUAL = 'manual';
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

var Tooltip = /*#__PURE__*/function () {
    function Tooltip(element, config) {
        if (typeof Popper === 'undefined') {
            throw new TypeError('Bootstrap\'s tooltips require Popper.js (https://popper.js.org/)');
        } // private


        this._isEnabled = true;
        this._timeout = 0;
        this._hoverState = '';
        this._activeTrigger = {};
        this._popper = null; // Protected

        this.element = element;
        this.config = this._getConfig(config);
        this.tip = null;

        this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
        this._isEnabled = true;
    };

    _proto.disable = function disable() {
        this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
        this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
        if (!this._isEnabled) {
            return;
        }

        if (event) {
            var dataKey = this.constructor.DATA_KEY;
            var context = $(event.currentTarget).data(dataKey);

            if (!context) {
                context = new this.constructor(event.currentTarget, this._getDelegateConfig());
                $(event.currentTarget).data(dataKey, context);
            }

            context._activeTrigger.click = !context._activeTrigger.click;

            if (context._isWithActiveTrigger()) {
                context._enter(null, context);
            } else {
                context._leave(null, context);
            }
        } else {
            if ($(this.getTipElement()).hasClass(CLASS_NAME_SHOW$4)) {
                this._leave(null, this);

                return;
            }

            this._enter(null, this);
        }
    };

    _proto.dispose = function dispose() {
        clearTimeout(this._timeout);
        $.removeData(this.element, this.constructor.DATA_KEY);
        $(this.element).off(this.constructor.EVENT_KEY);
        $(this.element).closest('.modal').off('hide.bs.modal', this._hideModalHandler);

        if (this.tip) {
            $(this.tip).remove();
        }

        this._isEnabled = null;
        this._timeout = null;
        this._hoverState = null;
        this._activeTrigger = null;

        if (this._popper) {
            this._popper.destroy();
        }

        this._popper = null;
        this.element = null;
        this.config = null;
        this.tip = null;
    };

    _proto.show = function show() {
        var _this = this;

        if ($(this.element).css('display') === 'none') {
            throw new Error('Please use show on visible elements');
        }

        var showEvent = $.Event(this.constructor.Event.SHOW);

        if (this.isWithContent() && this._isEnabled) {
            $(this.element).trigger(showEvent);
            var shadowRoot = Util.findShadowRoot(this.element);
            var isInTheDom = $.contains(shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element);

            if (showEvent.isDefaultPrevented() || !isInTheDom) {
                return;
            }

            var tip = this.getTipElement();
            var tipId = Util.getUID(this.constructor.NAME);
            tip.setAttribute('id', tipId);
            this.element.setAttribute('aria-describedby', tipId);
            this.setContent();

            if (this.config.animation) {
                $(tip).addClass(CLASS_NAME_FADE$2);
            }

            var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

            var attachment = this._getAttachment(placement);

            this.addAttachmentClass(attachment);

            var container = this._getContainer();

            $(tip).data(this.constructor.DATA_KEY, this);

            if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
                $(tip).appendTo(container);
            }

            $(this.element).trigger(this.constructor.Event.INSERTED);
            this._popper = new Popper(this.element, tip, this._getPopperConfig(attachment));
            $(tip).addClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we add extra
            // empty mouseover listeners to the body's immediate children;
            // only needed because of broken event delegation on iOS
            // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

            if ('ontouchstart' in document.documentElement) {
                $(document.body).children().on('mouseover', null, $.noop);
            }

            var complete = function complete() {
                if (_this.config.animation) {
                    _this._fixTransition();
                }

                var prevHoverState = _this._hoverState;
                _this._hoverState = null;
                $(_this.element).trigger(_this.constructor.Event.SHOWN);

                if (prevHoverState === HOVER_STATE_OUT) {
                    _this._leave(null, _this);
                }
            };

            if ($(this.tip).hasClass(CLASS_NAME_FADE$2)) {
                var transitionDuration = Util.getTransitionDurationFromElement(this.tip);
                $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            } else {
                complete();
            }
        }
    };

    _proto.hide = function hide(callback) {
        var _this2 = this;

        var tip = this.getTipElement();
        var hideEvent = $.Event(this.constructor.Event.HIDE);

        var complete = function complete() {
            if (_this2._hoverState !== HOVER_STATE_SHOW && tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }

            _this2._cleanTipClass();

            _this2.element.removeAttribute('aria-describedby');

            $(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

            if (_this2._popper !== null) {
                _this2._popper.destroy();
            }

            if (callback) {
                callback();
            }
        };

        $(this.element).trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
            return;
        }

        $(tip).removeClass(CLASS_NAME_SHOW$4); // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support

        if ('ontouchstart' in document.documentElement) {
            $(document.body).children().off('mouseover', null, $.noop);
        }

        this._activeTrigger[TRIGGER_CLICK] = false;
        this._activeTrigger[TRIGGER_FOCUS] = false;
        this._activeTrigger[TRIGGER_HOVER] = false;

        if ($(this.tip).hasClass(CLASS_NAME_FADE$2)) {
            var transitionDuration = Util.getTransitionDurationFromElement(tip);
            $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
        } else {
            complete();
        }

        this._hoverState = '';
    };

    _proto.update = function update() {
        if (this._popper !== null) {
            this._popper.scheduleUpdate();
        }
    } // Protected
        ;

    _proto.isWithContent = function isWithContent() {
        return Boolean(this.getTitle());
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
        $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
        this.tip = this.tip || $(this.config.template)[0];
        return this.tip;
    };

    _proto.setContent = function setContent() {
        var tip = this.getTipElement();
        this.setElementContent($(tip.querySelectorAll(SELECTOR_TOOLTIP_INNER)), this.getTitle());
        $(tip).removeClass(CLASS_NAME_FADE$2 + " " + CLASS_NAME_SHOW$4);
    };

    _proto.setElementContent = function setElementContent($element, content) {
        if (typeof content === 'object' && (content.nodeType || content.jquery)) {
            // Content is a DOM node or a jQuery
            if (this.config.html) {
                if (!$(content).parent().is($element)) {
                    $element.empty().append(content);
                }
            } else {
                $element.text($(content).text());
            }

            return;
        }

        if (this.config.html) {
            if (this.config.sanitize) {
                content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
            }

            $element.html(content);
        } else {
            $element.text(content);
        }
    };

    _proto.getTitle = function getTitle() {
        var title = this.element.getAttribute('data-original-title');

        if (!title) {
            title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
        }

        return title;
    } // Private
        ;

    _proto._getPopperConfig = function _getPopperConfig(attachment) {
        var _this3 = this;

        var defaultBsConfig = {
            placement: attachment,
            modifiers: {
                offset: this._getOffset(),
                flip: {
                    behavior: this.config.fallbackPlacement
                },
                arrow: {
                    element: SELECTOR_ARROW
                },
                preventOverflow: {
                    boundariesElement: this.config.boundary
                }
            },
            onCreate: function onCreate(data) {
                if (data.originalPlacement !== data.placement) {
                    _this3._handlePopperPlacementChange(data);
                }
            },
            onUpdate: function onUpdate(data) {
                return _this3._handlePopperPlacementChange(data);
            }
        };
        return _objectSpread2(_objectSpread2({}, defaultBsConfig), this.config.popperConfig);
    };

    _proto._getOffset = function _getOffset() {
        var _this4 = this;

        var offset = {};

        if (typeof this.config.offset === 'function') {
            offset.fn = function (data) {
                data.offsets = _objectSpread2(_objectSpread2({}, data.offsets), _this4.config.offset(data.offsets, _this4.element) || {});
                return data;
            };
        } else {
            offset.offset = this.config.offset;
        }

        return offset;
    };

    _proto._getContainer = function _getContainer() {
        if (this.config.container === false) {
            return document.body;
        }

        if (Util.isElement(this.config.container)) {
            return $(this.config.container);
        }

        return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
        return AttachmentMap[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
        var _this5 = this;

        var triggers = this.config.trigger.split(' ');
        triggers.forEach(function (trigger) {
            if (trigger === 'click') {
                $(_this5.element).on(_this5.constructor.Event.CLICK, _this5.config.selector, function (event) {
                    return _this5.toggle(event);
                });
            } else if (trigger !== TRIGGER_MANUAL) {
                var eventIn = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSEENTER : _this5.constructor.Event.FOCUSIN;
                var eventOut = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSELEAVE : _this5.constructor.Event.FOCUSOUT;
                $(_this5.element).on(eventIn, _this5.config.selector, function (event) {
                    return _this5._enter(event);
                }).on(eventOut, _this5.config.selector, function (event) {
                    return _this5._leave(event);
                });
            }
        });

        this._hideModalHandler = function () {
            if (_this5.element) {
                _this5.hide();
            }
        };

        $(this.element).closest('.modal').on('hide.bs.modal', this._hideModalHandler);

        if (this.config.selector) {
            this.config = _objectSpread2(_objectSpread2({}, this.config), {}, {
                trigger: 'manual',
                selector: ''
            });
        } else {
            this._fixTitle();
        }
    };

    _proto._fixTitle = function _fixTitle() {
        var titleType = typeof this.element.getAttribute('data-original-title');

        if (this.element.getAttribute('title') || titleType !== 'string') {
            this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
            this.element.setAttribute('title', '');
        }
    };

    _proto._enter = function _enter(event, context) {
        var dataKey = this.constructor.DATA_KEY;
        context = context || $(event.currentTarget).data(dataKey);

        if (!context) {
            context = new this.constructor(event.currentTarget, this._getDelegateConfig());
            $(event.currentTarget).data(dataKey, context);
        }

        if (event) {
            context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
        }

        if ($(context.getTipElement()).hasClass(CLASS_NAME_SHOW$4) || context._hoverState === HOVER_STATE_SHOW) {
            context._hoverState = HOVER_STATE_SHOW;
            return;
        }

        clearTimeout(context._timeout);
        context._hoverState = HOVER_STATE_SHOW;

        if (!context.config.delay || !context.config.delay.show) {
            context.show();
            return;
        }

        context._timeout = setTimeout(function () {
            if (context._hoverState === HOVER_STATE_SHOW) {
                context.show();
            }
        }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
        var dataKey = this.constructor.DATA_KEY;
        context = context || $(event.currentTarget).data(dataKey);

        if (!context) {
            context = new this.constructor(event.currentTarget, this._getDelegateConfig());
            $(event.currentTarget).data(dataKey, context);
        }

        if (event) {
            context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = false;
        }

        if (context._isWithActiveTrigger()) {
            return;
        }

        clearTimeout(context._timeout);
        context._hoverState = HOVER_STATE_OUT;

        if (!context.config.delay || !context.config.delay.hide) {
            context.hide();
            return;
        }

        context._timeout = setTimeout(function () {
            if (context._hoverState === HOVER_STATE_OUT) {
                context.hide();
            }
        }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
        for (var trigger in this._activeTrigger) {
            if (this._activeTrigger[trigger]) {
                return true;
            }
        }

        return false;
    };

    _proto._getConfig = function _getConfig(config) {
        var dataAttributes = $(this.element).data();
        Object.keys(dataAttributes).forEach(function (dataAttr) {
            if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
                delete dataAttributes[dataAttr];
            }
        });
        config = _objectSpread2(_objectSpread2(_objectSpread2({}, this.constructor.Default), dataAttributes), typeof config === 'object' && config ? config : {});

        if (typeof config.delay === 'number') {
            config.delay = {
                show: config.delay,
                hide: config.delay
            };
        }

        if (typeof config.title === 'number') {
            config.title = config.title.toString();
        }

        if (typeof config.content === 'number') {
            config.content = config.content.toString();
        }

        Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);

        if (config.sanitize) {
            config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
        }

        return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
        var config = {};

        if (this.config) {
            for (var key in this.config) {
                if (this.constructor.Default[key] !== this.config[key]) {
                    config[key] = this.config[key];
                }
            }
        }

        return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
        var $tip = $(this.getTipElement());
        var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

        if (tabClass !== null && tabClass.length) {
            $tip.removeClass(tabClass.join(''));
        }
    };

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
        this.tip = popperData.instance.popper;

        this._cleanTipClass();

        this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
        var tip = this.getTipElement();
        var initConfigAnimation = this.config.animation;

        if (tip.getAttribute('x-placement') !== null) {
            return;
        }

        $(tip).removeClass(CLASS_NAME_FADE$2);
        this.config.animation = false;
        this.hide();
        this.show();
        this.config.animation = initConfigAnimation;
    } // Static
        ;

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
            var data = $(this).data(DATA_KEY$6);

            var _config = typeof config === 'object' && config;

            if (!data && /dispose|hide/.test(config)) {
                return;
            }

            if (!data) {
                data = new Tooltip(this, _config);
                $(this).data(DATA_KEY$6, data);
            }

            if (typeof config === 'string') {
                if (typeof data[config] === 'undefined') {
                    throw new TypeError("No method named \"" + config + "\"");
                }

                data[config]();
            }
        });
    };

    _createClass(Tooltip, null, [{
        key: "VERSION",
        get: function get() {
            return VERSION$6;
        }
    }, {
        key: "Default",
        get: function get() {
            return Default$4;
        }
    }, {
        key: "NAME",
        get: function get() {
            return NAME$6;
        }
    }, {
        key: "DATA_KEY",
        get: function get() {
            return DATA_KEY$6;
        }
    }, {
        key: "Event",
        get: function get() {
            return Event;
        }
    }, {
        key: "EVENT_KEY",
        get: function get() {
            return EVENT_KEY$6;
        }
    }, {
        key: "DefaultType",
        get: function get() {
            return DefaultType$4;
        }
    }]);

    return Tooltip;
}();
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */


$.fn[NAME$6] = Tooltip._jQueryInterface;
$.fn[NAME$6].Constructor = Tooltip;

$.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Tooltip._jQueryInterface;
};