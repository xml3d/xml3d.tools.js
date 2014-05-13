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

    /**
     * XML3D.tools.Class provides a framework for constructing classes.
     *
     * The basic handling is borrowed from JS.class (http://jsclass.jcoglan.com/).
     * The callSuper() idea is taken from Base (http://dean.edwards.name/weblog/2006/03/base/).
     *
     * @param {Object} [base] the base class to inherit from
     * @param {!Object} body the body of the class
     *
     * This class has following features:
     * o initialize(): define this function and it will be called during object construction
     * o callSuper(): invoke in child class to call the overriden super-class method
     * o callback(<methodname>): wraps the given function to be registered as a callback.
     *
     * Notes about callback():
     *     The method returned from callback() preserves the "this" variable inside the
     *     class method.
     *     Beware with overriden functions in subclasses. Only the first call to
     *     callback(myName) creates the callback for the method myName. All further calls
     *     to callback(myName) return the initally created object!
     *
     *  In english: if a base class uses a method onClick() as a callback, you
     *  in the inherited class should not use another method onClick() as a callback
     *  for yourself, since callback("onClick") will always return the callback of the
     *  base class. (Assuming the base class registers itself first).
     */
    XML3D.tools.Class = function(base, body)
    {
        if(!body)
        {
            body = base;
            base = null;
        }

        // constructor idea taken from JS.class (http://jsclass.jcoglan.com/)
        var constructor = function() {

            if(this.initialize)
                return this.initialize.apply(this, arguments) || this;

            return this;
        };

        if(base) // inheritance
        {
            constructor.prototype = makeBridge(base);

            // remember parent methods
            var methods = extractMethods(base.prototype);
            XML3D.tools.extend(constructor.prototype.__parentMethods, methods);
        }
        else // base class initialization
        {
            constructor.prototype.callSuper = function() {};
            constructor.prototype.__parentMethods = {};

            // method wrapper for callbacks
            constructor.prototype.callback = function(methodName){

                if(!this.__callbacks)
                    this.__callbacks = {};

                if(!this.__callbacks[methodName])
                {
                    var method = this[methodName]; // get the method
                    var self = this;

                    this.__callbacks[methodName] = function() {
                        return method.apply(self, arguments);
                    };
                }

                return this.__callbacks[methodName];
            };
        }

        // extend the class' prototype with the given body
        XML3D.tools.extend(constructor.prototype, body);

        // wrap functions
        for(var name in constructor.prototype)
        {
            // retrieve and validate target function
            var origFn = constructor.prototype[name];
            if(!origFn
            || origFn.constructor !== Function
            || !isClientMethod(name))
                continue;

            // skip methods that don't contain callSuper() calls
            var fnstr = "" + origFn;
            if(0 > fnstr.indexOf("this.callSuper"))
                continue;

            // wrap original call into function that sets the
            // callSuper property to the method of the base class
            (function(){
                var fn = origFn;
                var baseMethod = constructor.prototype.__parentMethods[name];
                if(!baseMethod)
                    baseMethod = function() {};

                constructor.prototype[name] = function() {
                    // This idea is taken from Base (http://dean.edwards.name/weblog/2006/03/base/)
                    var prev = this.callSuper;
                    this.callSuper = baseMethod;

                    var ret = fn.apply(this, arguments);

                    this.callSuper = prev;
                    return ret;
                };
            })();
        }

        return constructor;
    };

    /** XML3D.tools.Singleton is a small utility to create singleton classes.
     *  The idea is also taken from JS.class (http://jsclass.jcoglan.com/).
     *  Thus, see http://jsclass.jcoglan.com/singletons.html for more information.
     *
     *  The advantage is that we can still use all the features from the
     *  XML3D.tools.Class utility.
     */
    XML3D.tools.Singleton = function(base, body)
    {
        var cls = new XML3D.tools.Class(base, body);

        var inst = new cls();
        inst.klass = cls;

        return inst;
    };

    /**
     * This function is a copy from JS.class.
     *
     * @param {!Object} base the base class from which to construct the bridge
     */
    function makeBridge(base)
    {
        /** @constructor */
        var bridge = function() {};
        bridge.prototype = base.prototype;
        return new bridge();
    };

    /**
     * Checks if the given method name is a function that is not created
     * by XML3D.tools.Class, but by the class user.
     *
     * @param {string} name the name to check
     */
    function isClientMethod(name)
    {
        if(name === "callSuper"
        || name.indexOf("__") === 0
        || name === "callback")
            return false;

        return true;
    };

    /**
     * Extract all methods from the given object that are client methods.
     *
     * @param {!Object} obj the object to copy the methods from
     *
     * @return {Object} a new object containing only the methods from obj
     *
     * \sa XML3D.tools.Class.isClientMethod()
     */
    function extractMethods(obj)
    {
        var methodObj = {};

        for(var name in obj)
        {
            var member = obj[name];

            if(!member) // members initialized to null
                continue;

            if(member.constructor === Function
            && isClientMethod(name))
            {
                methodObj[name] = member;
            }
        }

        return methodObj;
    };
}());
