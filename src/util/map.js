/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    /** XML3D.tools.util.Map provides a simple map from objects to arbitrary values.
     * 	In Javascript only strings are supported as keys, but sometimes we want to map
     *	raw objects instead. One object may contain multiple values.
     *
     *  The implementation is very simple, though. We will keep an array of
     *  (key,values)-containers. To find a given key we iterate through the array.
     *  I don't see easy ways to optimize that behavior w/o any further knowledge
     *  of the given object. Converting it to a string won't help, multiple objects
     *  map to the same strings (e.g. nameless native functions all map to
     *  "function() { [native code] }". I don't know of other ways to serialize
     *  arbitrary objects.
     */
    XML3D.tools.util.Map = new XML3D.tools.Class({

        /**
         *  @this {XML3D.tools.util.Map}
         */
        initialize: function() {

            this._containers = [];
        },

        /**
         *  @this {XML3D.tools.util.Map}
         *  @return {number} the number of keys in the map
         */
        size: function() {
            return this._containers.length;
        },

        /** Adds a (key,values) pair to the map. The given key may not exist yet.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@param {Object|Array.<Object>} values
         */
        add: function(key, values) {

            if(!XML3D.tools.util.isDefined(values))
                return;
            if(!(values instanceof Array))
                values = [values];
            if(values.length < 1)
                return;

            var containerIdx = this._indexOfContainer(key);
            if(containerIdx < 0) {
                var container = {
                    key: key,
                    values: values
                };

                this._containers.push(container);
            }
            else {
                var c = this._containers[containerIdx];

                for(var i = 0; i < values.length; i++) {
                    if(0 > c.values.indexOf(values[i])) {
                        c.values.push(values[i]);
                    }
                }
            }
        },

        /** Removes the given key from the map. If an optional value is
         *  given, only the value corresponding to the given key will be
         *  erased. In case the given value is the only value of the associated
         *  key the key will be erased, too.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@param {Object=} value
         */
        remove: function(key, value) {
            if(XML3D.tools.util.isDefined(value)) {
                this._removeValue(key, value);
            }
            else {
                this._removeKey(key);
            }
        },

        /** Removes all keys and values from the map.
         *  @this {XML3D.tools.util.Map}
         */
        clear: function() {
            this._containers = [];
        },

        /** Similar to add(), but removes the key before adding the values to the key.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@param {Object|Array.<Object>} values
         */
        set: function(key, values) {

            this._removeKey(key);
            this.add(key, values);
        },

        /** Returns true if the map contains the given key.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@return {boolean} true if the given key is contained in the map
         */
        has: function(key) {

            return (this._indexOfContainer(key) > -1);
        },

        /** Retrieve all values for a given key. If the key is not contained in the
         *  map an exception is thrown.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@return {Array.<Object>} the values of the given key
         */
        get: function(key) {

            this._assertHas(key);

            var containerIdx = this._indexOfContainer(key);
            return this._containers[containerIdx].values;
        },

        /** Retrieve the values that correspond to the key next to the
         *  given one on the right side. Since the underlying container object
         *  is an array, this is the index of the given key plus one.
         *
         *  @this {XML3D.tools.util.Map}
         *  @param {Object} key
         *  @return {Array.<Object>} values
         */
        getNext: function(key) {

            this._assertHas(key);

            var containerIdx = this._indexOfContainer(key);
            containerIdx = (containerIdx+1) % this.size();

            return this._containers[containerIdx].values;
        },

        /** Retrieve the values that correspond to the key next to the
         *  given one on the left side. Since the underlying container object
         *  is an array, this is the index of the given key minus one.
         *
         *  @this {XML3D.tools.util.Map}
         *  @param {Object} key
         *  @return {Array.<Object>} values
         */
        getPrevious: function(key) {

            this._assertHas(key);

            var containerIdx = this._indexOfContainer(key);
            containerIdx = (containerIdx-1) % this.size();

            return this._containers[containerIdx].values;
        },

        /** Map the given function to all values of the given key.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@param {function(Object)} fn the argument is the value of the given object
         */
        mapValues: function(key, fn) {

            var containerIdx = this._indexOfContainer(key);
            if(containerIdx < 0) return;

            var c = this._containers[containerIdx];

            for(var i = 0; i < c.values.length; i++) {
                fn(c.values[i]);
            }
        },

        /** Checks if the given key has an entry and throws an exception if that's not
         *  the case.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         *  @private
         */
        _assertHas: function(key) {

            if(!this.has(key)) {
                throw new Error("XML3D.tools.util.Map: no entry present for given key");
            }
        },

        /**
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@return {number} the index of the given key in the container array
         *  @private
         */
        _indexOfContainer: function(key) {

            for(var i = 0; i < this._containers.length; i++) {
                if(this._containers[i].key === key) {
                    return i;
                }
            }

            return -1;
        },

        /** Removes a single value from the given key. If the key contains
         *  no values afterwards it is removed from the map.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@param {Object} value
         * 	@private
         */
        _removeValue: function(key, value) {

            var containerIdx = this._indexOfContainer(key);
            if(containerIdx < 0) return;

            var c = this._containers[containerIdx];

            var idx = c.values.indexOf(value);
            if(idx < 0) return;

            c.values.splice(idx, 1);

            if(c.values.length < 1)
                this._removeKey(key);
        },

        /** Removes the key and all of it's values from the map.
         *
         *  @this {XML3D.tools.util.Map}
         * 	@param {Object} key
         * 	@private
         */
        _removeKey: function(key) {

            var containerIdx = this._indexOfContainer(key);
            if(containerIdx < 0) return;

            this._containers.splice(containerIdx, 1);
        }
    });
}());
