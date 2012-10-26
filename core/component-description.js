/* <copyright>
 Copyright (c) 2012, Motorola Mobility LLC.
 All Rights Reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * Neither the name of Motorola Mobility LLC nor the names of its
 contributors may be used to endorse or promote products derived from this
 software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 </copyright> */
/**
 @module montage/data/component-description
 @requires montage/core/core
 @requires montage/core/logger
 */
var Montage = require("montage").Montage;
var Enum = require("montage/core/enum").Enum;
var Selector = require("montage/core/selector").Selector;
var Semantics = require("montage/core/selector/semantics").Semantics;
var logger = require("montage/core/logger").logger("component-description");
/**
 @class module:montage/data/component-description.ComponentDescription
 @extends module:montage/core/core.Montage
 */
var ComponentDescription = exports.ComponentDescription = Montage.create(Montage, /** @lends module:montage/data/component-description.ComponentDescription# */ {

    /*
     * @private
     */
    _component:{
        serializable:true,
        enumerable:false,
        value:null
    },

    /*
     * Component being described by this object.
     */
    component:{
        get:function () {
            return this._component;
        }
    },

    /**
     Initialize a newly allocated component description.
     @function
     @param {Component} component to describe
     @returns itself
     */
    initWithComponent:{
        value:function (component) {
            this._component = component;
            return this;
        }
    },

    /*
     * @private
     */
    _componentBindingDescriptions:{
        serializable:true,
        enumerable:false,
        distinct:true,
        value:{}
    },

    /*
     * List of component bindings description
     */
    componentBindingDescriptions:{
        get:function () {
            var bindingDescriptions = [];
            for (var name in this._componentBindingDescriptions) {
                bindingDescriptions.push(this._componentBindingDescriptions[name]);
            }
            return bindingDescriptions;
        }
    },

    /*
     * Returns the component bindings description for that property name
     * @param {String} name of the property
     * @returns {ComponentBindingDescription} binding description
     */
    componentBindingDescriptionForName:{
        value:function (propertyName) {
            return this._componentBindingDescriptions[propertyName];
        }
    },

    /*
     * Add a new binding description for the property.
     * @function
     * @param {String} name of the property to describe
     * @returns {ComponentBindingDescription} new binding description
     */
    addComponentBindingDescription:{
        value:function (propertyName) {
            var bindingDescription = this._componentBindingDescriptions[propertyName];
            if (bindingDescription == null) {
                bindingDescription = ComponentBindingDescription.create().initWithPropertyAndComponentDescription(propertyName, this);
                this._componentBindingDescriptions[propertyName] = bindingDescription;
            }
            return bindingDescription;
        }
    },

    /*
     * Remove the binding description for the property.
     * @function
     * @param {String} name of the property to remove
     * @returns {ComponentBindingDescription} removed binding description
     */
    removeComponentBindingDescription:{
        value:function (propertyName) {
            var bindingDescription = this._componentBindingDescriptions[propertyName];
            if (bindingDescription != null) {
                delete this._componentBindingDescriptions[propertyName];
            }
            return bindingDescription;
        }
    },

    /*
     * @private
     */
    _componentBindingDescriptionGroups:{
        serializable:true,
        enumerable:false,
        distinct:true,
        value:{}
    },

    /*
     * List of component bindings description groups names
     */
    componentBindingDescriptionGroups:{
        get:function () {
            var groups = [];
            for (var name in this._componentBindingDescriptionGroups) {
                groups.push(name);
            }
            return groups;
        }
    },

    /*
     * Returns the group associated with that name
     * @param {String} name of the group
     * @returns {array} binding description group
     */
    componentBindingDescriptionGroupForName:{
        value:function (groupName) {
            var group = this._componentBindingDescriptionGroups[groupName];
            return (group != null ? group : []);
        }
    },

    /*
     * Add a new binding description group.
     * @function
     * @param {String} name of the group
     * @returns {array} new binding description group
     */
    addComponentBindingDescriptionGroup:{
        value:function (groupName) {
            var group = this._componentBindingDescriptionGroups[groupName];
            if (group == null) {
                group = [];
                this._componentBindingDescriptionGroups[groupName] = group;
            }
            return group;
        }
    },

    /*
     * Remove the binding description group.
     * @function
     * @param {String} name of the group to remove
     * @returns {array} removed binding description group
     */
    removeComponentBindingDescriptionGroup:{
        value:function (groupName) {
            var group = this._componentBindingDescriptionGroups[groupName];
            if (group != null) {
                delete this._componentBindingDescriptionGroups[groupName];
            }
            return group;
        }
    },

    /*
     * Adds a binding description to the group name.<br/>
     * if the binding description does not exist creates it, if the group does not exist creates it.
     * @function
     * @param {String} name of the property
     * @param {String} name of the group
     * @returns {array} binding description group
     */
    addComponentBindingDescriptionToGroup:{
        value:function (propertyName, groupName) {
            var group = this._componentBindingDescriptionGroups[groupName];
            if (group == null) {
                group = this.addComponentBindingDescriptionGroup(groupName);
            }
            var bindingDescription = this._componentBindingDescriptions[propertyName];
            if (bindingDescription == null) {
                bindingDescription = this.addComponentBindingDescription(propertyName);
            }
            var index = group.indexOf(bindingDescription);
            if (index < 0) {
                group.push(bindingDescription);
            }
            return group;
        }
    },

    /*
     * Removes a binding description from the group name.<br/>
     * @function
     * @param {String} name of the property
     * @param {String} name of the group
     * @returns {array} binding description group
     */
    removeComponentBindingDescriptionFromGroup:{
        value:function (propertyName, groupName) {
            var group = this._componentBindingDescriptionGroups[groupName];
            var bindingDescription = this._componentBindingDescriptions[propertyName];
            if ((group != null) && (bindingDescription != null)) {
                var index = group.indexOf(bindingDescription);
                if (index >= 0) {
                    group.splice(index, 1);
                }
            }
            return (group != null ? group : []);
        }
    },

    _componentBindingValidationRules:{
        serializable:true,
        enumerable:false,
        distinct:true,
        value:{}
    },

    /*
     * List of component bindings validation rules
     */
    componentBindingValidationRules:{
        get:function () {
            var bindingValidationRules = [];
            for (var name in this._componentBindingValidationRules) {
                bindingValidationRules.push(this._componentBindingValidationRules[name]);
            }
            return bindingValidationRules;
        }
    },

    /*
     * Returns the component bindings validation rule for that name
     * @param {String} name of the rule
     * @returns {ComponentBindingDescription} binding description
     */
    componentBindingValidationRuleForName:{
        value:function (name) {
            return this._componentBindingValidationRules[name];
        }
    },

    /*
     * Add a new component bindings validation rule .
     * @function
     * @param {String} name of the rule
     * @returns {ComponentBindingDescription} new component bindings validation rule
     */
    addComponentBindingValidationRule:{
        value:function (name) {
            var bindingValidationRule = this._componentBindingValidationRules[name];
            if (bindingValidationRule == null) {
                bindingValidationRule = ComponentBindingValidationRule.create().initWithNameAndComponentDescription(name, this);
                this._componentBindingValidationRules[name] = bindingValidationRule;
            }
            return bindingValidationRule;
        }
    },

    /*
     * Remove the component bindings validation rule  for the name.
     * @function
     * @param {String} name of the rule
     * @returns {ComponentBindingDescription} removed component bindings validation rule
     */
    removeComponentBindingValidationRule:{
        value:function (name) {
            var bindingValidationRule = this._componentBindingValidationRules[name];
            if (bindingValidationRule != null) {
                delete this._componentBindingValidationRules[name];
            }
            return bindingValidationRule;
        }
    },

    /*
     * Evaluates the rules based on the component and the bindings.<br/>
     * @return {Array} list of message key for rule that fired. Empty array otherwise.
     */
    evaluateRules:{
        value:function () {
            var messages = [];
            for (var name in this._componentBindingValidationRules) {
                var rule = this._componentBindingValidationRules[name];
                 if (rule.evaluateRule()) {
                     messages.push(rule.messageKey);
                 }
             }
            return messages;
        }
    }

});

var ValueType = Montage.create().initWithMembers("string", "number", "boolean", "date", "set", "list", "map");
/**
 @class module:montage/data/component-description.ComponentBindingDescription
 @extends module:montage/core/core.Montage
 */
var ComponentBindingDescription = exports.ComponentBindingDescription = Montage.create(Montage, /** @lends module:montage/data/component-description.ComponentBindingDescription# */ {

    /*
     * @private
     */
    _componentDescription:{
        serializable:true,
        enumerable:false,
        value:null
    },

    /*
     * Component description attached to this binding description.
     */
    componentDescription:{
        get:function () {
            return this._componentDescription;
        }
    },

    /*
     * @private
     */
    _name:{
        serializable:true,
        enumerable:false,
        value:""
    },

    /*
     * Name of the property being described
     */
    name:{
        get:function () {
            return this._name;
        }
    },

    /**
     Initialize a newly allocated component description.
     @function
     @param {String} property to describe
     @param {ComponentDescription} component description
     @returns itself
     */
    initWithPropertyAndComponentDescription:{
        value:function (property, componentDescription) {
            this._name = property;
            this._componentDescription = componentDescription;
            return this;
        }
    },

    /*
     * Returns the status of the writable attribute of the property
     */
    writable:{
        get:function () {
            return Montage.getPropertyAttribute(this.componentDescription.component, this.name, "writable");
        }
    },

    /*
     * Returns the status of the serializable attribute of the property
     */
    serializable:{
        get:function () {
            return Montage.getPropertyAttribute(this.componentDescription.component, this.name, "serializable");
        }
    },

    /*
     * Returns the status of the distinct attribute of the property
     */
    distinct:{
        get:function () {
            return Montage.getPropertyAttribute(this.componentDescription.component, this.name, "distinct");
        }
    },

    /*
     * @private
     */
    _valueType:{
        serializable:true,
        enumerable:false,
        value:null
    },

    /*
     * Returns the Value Type for this property.<br/>
     * the Value type is an indication of the value to bind to this property.<br/>
     * This is used by authoring tools to implement the correct UI interface.
     */
    valueType:{
        get:function () {
            if (this._valueType === "") {
                return "string";
            }
            return this._valueType;
        },
        set:function (value) {
            // TODO [PJYF July 12 2012] we need to check that the value is within the enum
            this._valueType = value;
        }
    }
});

/**
 @class module:montage/data/component-description.ComponentBindingValidationRule
 @extends module:montage/core/core.Montage
 */
var ComponentBindingValidationRule = exports.ComponentBindingValidationRule = Montage.create(Montage, /** @lends module:montage/data/component-description.ComponentBindingValidationRule# */ {



    /*
     * @private
     */
    _componentDescription:{
        serializable:true,
        enumerable:false,
        value:null
    },

    /*
     * Component description attached to this validation rule.
     */
    componentDescription:{
        get:function () {
            return this._componentDescription;
        }
    },

    /*
     * @private
     */
    _name:{
        serializable:true,
        enumerable:false,
        value:""
    },

    /*
     * Name of the property being described
     */
    name:{
        get:function () {
            return this._name;
        }
    },

    /**
     Initialize a newly allocated component validation rule.
     @function
     @param {String} rule name
     @param {ComponentDescription} component description
     @returns itself
     */
    initWithNameAndComponentDescription:{
        value:function (name, componentDescription) {
            this._name = name;
            this._componentDescription = componentDescription;
            return this;
        }
    },

    /*
     * @private
     */
    _selector:{
        serializable:true,
        enumerable:false,
        distinct:true,
        value:null
    },

    /*
     *
     */
    selector:{
        get:function () {
            if (!this._selector) {
                this._selector = Selector.constants.false;
            }
            return this._selector;
        },
        set:function (value) {
            this._selector = value;
        }
    },

    /*
     * Message key to display when the rule fires.
     */
    messageKey:{
        serializable:true,
        value:""
    },

    /*
     * Evaluates the rules based on the component and the bindings.<br/>
     * @return true if the rules fires, false otherwise.
     */
    evaluateRule:{
        value:function () {
            var bindingValidationSemantics = BindingValidationSemantics.create().initWithComponentDescription(this.componentDescription);
            return bindingValidationSemantics.evaluate(this.selector.syntax, this.componentDescription.component);
        }
    }

});

/**
 @class module:montage/data/component-description.BindingValidationSemantics
 @extends module:montage/core/core.Montage
 */
var BindingValidationSemantics = exports.BindingValidationSemantics = Semantics.create(Semantics, /** @lends module:montage/data/component-description.BindingValidationSemantics# */ {

    /*
     * @private
     */
    _componentDescription:{
        serializable:true,
        enumerable:false,
        value:null
    },

    /*
     * Component description attached to this validation rule.
     */
    componentDescription:{
        get:function () {
            return this._componentDescription;
        }
    },

    /**
     Create a new semantic evaluator with the component dexcription.
     @function
     @param {ComponentDescription} component description
     @returns itself
     */
    initWithComponentDescription:{
        value:function (componentDescription) {
            this._componentDescription = componentDescription;
            return this;
        }
    }


});


