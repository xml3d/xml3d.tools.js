(function(){

    "use strict";

    /**
     * MotionFactory implementation
     * @constructor
     * @implements{MotionFactory}
     */
    XML3D.tools.MotionFactory = new XML3D.tools.Singleton({

        /** @this XML3D.tools.MotionFactory */
        initialize: function()
        {
            /** Counter to create unique IDs for the elements added to DOM.
             *  Is in closure: same for every instance so no ID clashes will
             *  occur across multiple instances of the factory.
             *
             *  @private
             */
            this.id = 0;
        },

        /** @inheritDoc
         *  @this XML3D.tools.MotionFactory
         */
        createTransformable: function(element, constraint)
        {
            if(!element)
                throw "No valid element, cannot create Transformable.";

            if(element instanceof window.Element)
            {
                // bare element
                return new XML3D.tools.Transformable(element, this.getTransform(element), constraint);
            }
            else if(element.object && element.transform && element.constraint)
            {
                // transformable
                var constraints = [constraint, element.constraint];
                var constraintCollection = new XML3D.tools.ConstraintCollection(constraints);

                return new XML3D.tools.Transformable(element.object, element.transform, constraintCollection);
            }
            else
                throw "No valid element, cannot create Transformable.";

        },

        /** @inheritDoc
         *  @this XML3D.tools.MotionFactory
         */
        createAnimatable: function(element, constraint)
        {
            if(!element) throw "No valid element, cannot create Animatable.";
            return new XML3D.tools.Animatable(element, this.getTransform(element), constraint);
        },

        /** @inheritDoc
         *  @this XML3D.tools.MotionFactory
         */
        createKeyframeAnimation: function(name, element, opt)
        {
            if(!element) throw "No valid element, cannot create Animatable.";
            var child = element.firstElementChild;
            var keys = undefined;
            var position = undefined;
            var orientation = undefined;
            var scale = undefined;
            while(child){
                //TODO: does child.name work for native?
                switch(child.name){
                    case "key" :         keys = this.getValueFromChild(child, undefined); break;
                    case "position" :    position = this.getValueFromChild(child, keys.length*3); break;
                    case "orientation" : orientation = this.getValueFromChild(child, keys.length*4); break;
                    case "scale" :       scale = this.getValueFromChild(child, keys.length*3); break;
                    default: break;
                }
                child = child.nextElementSibling;
            }
            if(!keys || (!position && !orientation && !scale)){
                throw "Element is not a valid keyframe animation";
            }
            else{
                return new XML3D.tools.KeyframeAnimation(name, keys, position, orientation, scale, opt);
            }
        },

        /**
         * get Values from child
         * @this XML3D.tools.MotionFactory
         *
         * @param {*} child
         * @param {number}
         * @return {Array.<number>}
         */
        getValueFromChild: function(child, number)
        {
            if(!XML3D._native)
            {
                var val = child.value;
                if(!val || (number && val.length != number )) return undefined;
                else return val;
            }
            else
            {
                throw "Animations are currently not supported in native Version.";
                //TODO: code for native version
            }
        },

        /**
         * creates a unique id
         * @this XML3D.tools.MotionFactory
         *
         * @return {string} unique id
         */
        createUniqueId: function()
        {
            return "createdByClientMotionFactory" + this.id++;
        },

        /**
         * Gets the transform of an element and creates a transform if necessary
         * @this XML3D.tools.MotionFactory
         *
         * @param {Object} obj element
         * @return {Object} transform
         */
        getTransform: function(obj)
        {
            return XML3D.tools.util.getOrCreateTransform(obj, this.createUniqueId());
        }
    });
}());
