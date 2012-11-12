
/** This class manages listeners for given events, for a variable number of arguments.
 *  It holds a map from event names to listeners. The event names can be managed 
 *  through add/removeListenerTypes() and isListenerType(). 
 *  
 *  To register an event, addListener() should be called with the associated event 
 *  name and a callback method. 
 *  
 *  All listeners of an event type can be called with notifyListeners(), which expects the 
 *  corresponding event name. 
 */
XMOT.util.Observable = new XMOT.Class({

    /** 
     *  @this {XMOT.util.Observable}
     *   
     *  @param listenerTypes a single name or an array of names for 
     *        listener types
     */
    initialize: function(listenerTypes)
    {
        /** @private */
        this._listeners = {};
        /** @private */ 
        this._listenerTypes = {};
        
        this.addListenerTypes(listenerTypes);
    },

    /** Remembers the given (array of) event name as valid event names.
     * 
     *  @this {XMOT.util.Observable}
     */
    addListenerTypes: function(listenerTypes)
    {
        if(!listenerTypes)
            return; 
        
        if(listenerTypes.constructor == Array)
        {
            for(var i = 0; i < listenerTypes.length; i++)
            {
                var type = listenerTypes[i]; 
                if(this._listenerTypes[type] === true) 
                    throw "XMOT.util.Observable: type already registered: '" + type + "'!"; 
                
                this._listenerTypes[type] = true;                
            }
        }
        else if(this._listenerTypes[listenerTypes] === true)
        {
            throw "XMOT.util.Observable: type already registered: '" + listenerTypes + "'!";            
        }
        else 
            this._listenerTypes[listenerTypes] = true;
    },

    /** Remove the given listener types from the array. The listeners will not be 
     *  removed!
     * 
     *  @this {XMOT.util.Observable} 
     */
    removeListenerTypes: function(listenerTypes)
    {
        if(!listenerTypes)
            return; 
        
        if(listenerTypes.constructor == Array)
        {
            for(var i = 0; i < listenerTypes.length; i++)
                this._listenerTypes[listenerTypes[i]] = false;
        }
        else
            this._listenerTypes[listenerTypes] = false;
    },


    /** Add a listener for the given event type 
     *  
     *  @this {XMOT.util.Observable}
     *  
     *  @param {string} evtname
     *  @param {function()} listener
     */
    addListener: function(evtname, listener)
    {
        if(this.isListenerType(evtname))
        {
            if(!this._listeners[evtname])
                this._listeners[evtname] = [];

            this._listeners[evtname].push(listener);
        }
    },

    /** Remove first occurence of given element. 
     * 
     *  @this {XMOT.util.Observable}
     *  @param {string} evtname
     *  @param {function()} listener 
     */
    removeListener: function(evtname, listener)
    {
        if(this.isListenerType(evtname))
        {
            if(!this._listeners[evtname])
                return;

            for(var i = 0; i < this._listeners[evtname].length; i++)
            {
                if(this._listeners[evtname][i] === listener)
                {
                    this._listeners[evtname].slice(i, 1);
                    return;
                }
            }
        }
    },

    /** Notifies all listeners. Arguments can be given to this function that get
     *     forwarded to each listener.
     * 
     *  @this {XMOT.util.Observable}
     *  @param {string} evtname
     */
    notifyListeners: function(evtname)
    {
        if(this.isListenerType(evtname)
        && this._listeners[evtname])
        {
            var args = Array.prototype.slice.call(arguments);
            for(var i = 0; i < this._listeners[evtname].length; i++)
                this._listeners[evtname][i].apply(this, args.slice(1));
        }
    },

    /** Returns whether this listener manager manages the given event name.
     * 
     *  @this {XMOT.util.Observable}
     *  @param {string} evtname
     *  @return {boolean} true if evtname is registered as a listener type. 
     */
    isListenerType: function(evtname)
    {
        return (this._listenerTypes[evtname] === true);
    }
});
