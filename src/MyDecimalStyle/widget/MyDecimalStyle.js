define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/text!MyDecimalStyle/widget/template/MyDecimalStyle.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("MyDecimalStyle.widget.MyDecimalStyle", [_WidgetBase, _TemplatedMixin], {
        templateString: widgetTemplate,
        widgetBase: null,

        // Template Attach Points.
        beforeNode: null,
        afterNode: null,
        decimalNode: null,

        // Modeler variables.
        field: null,
        beforeClassname: null,
        afterClassname: null,
        onClickMicroflow: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            console.log("field --> " + this.field);
            console.log("beforeClassname --> " + this.beforeClassname);
            console.log("afterClassname --> " + this.afterClassname);
            console.log("onClickMicroflow --> " + this.onClickMicroflow);

            // 4. Set the Classnames
            dojoClass.add(this.beforeNode, this.beforeClassname);
            dojoClass.add(this.afterNode, this.afterClassname);
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;

            this._setupEvents();
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        /**
         * Setup Events
         * --
         * 1. add the onclick listener to the widgetbase (this.domNode)
         */
        _setupEvents: function() {
            this.connect(this.domNode, "click", lang.hitch(this, function() {
                this._runMicroflow(this.onClickMicroflow);
            }));
        },

        /**
         * Run Microflow
         * --
         * 1. Execute a microflow
         * @param {String} mfName - the name of the microflow
         */
        _runMicroflow: function(mfName) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: mfName,
                    guids: [this._contextObj.getGuid()]
                },
                origin: this.mxform,
                callback: lang.hitch(this, function(obj) {
                    var newDecimal = obj[0].get(this.field);
                    this._contextObj.set(this.field, newDecimal); // this change is seen by our attr subscription
                }),
                error: function(error) {
                    console.error(error.message);
                }
            });
        },

        _updateRendering: function(callback) {
            // 1. get the value from the context object
            var decimalValue = this._contextObj.get(this.field);

            // 2. split that value into left and right parts
            var parts = ("" + decimalValue).split("."); // parts = [17, 76]

            // 3. Set the HTML of the before and after nodes
            this.beforeNode.innerHTML = parts[0];
            this.afterNode.innerHTML = parts[1] || "0";

            this._executeCallback(callback);
        },

        _resetSubscriptions: function() {
            this.unsubscribeAll();
            this.subscribe({
                guid: this._contextObj.getGuid(),
                attr: this.field,
                callback: lang.hitch(this, function() {
                    this._updateRendering();
                })
            });
            this.subscribe({
                guid: this._contextObj.getGuid(),
                callback: lang.hitch(this, function() {
                    this._updateRendering();
                })
            });

        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["MyDecimalStyle/widget/MyDecimalStyle"]);
