(function(){

    "use strict";

	/**
	 * An implementation of Animatable
	 * @implements Animatable
	 * @extends Transformable
	 */
    XML3D.tools.Animatable = new XML3D.tools.Class(XML3D.tools.Transformable, {

        initialize: function(obj, transform, constraint){

            this.callSuper(obj, transform, constraint);

            /**
             * Map of KeyframeAnimations
             * The key of the map is  a string, which is the name of the animation
             * type:  Map.key: string, Map.data: {animation: Animation, opt: Object}
             * @private
             * @type {Object}
             */
            this._availableAnimations = {};
            /**
             * Map of active KeyframeAnimations
             * Note: This works since the IDs are only numbers.
             * Those numbers are turned into strings  and those are used as keys.
             * type: Map.key: number, Map.data: {animation: Animation, clockGenerator: TWEEN.Tween, opt: Object}
             * @private
             * @type {Object}
             */
            this._activeAnimations = {};
            /**
             * Counter of IDs for active animations
             * Attention: this might turn to infinity
             * @private
             * @type {number}
             */
            this._idCounter = 0;
        },

        /**
         * @param animation
         * @param opt
         * @returns {XML3D.tools.Animatable}
         *
         * options:
         *  o duration (seconds)
         *  o delay: start animation after this delay (seconds)
         *  o startTime: do not start the animation from the beginning, but from this time (absolute, seconds)
         *  o easing: function(normalizedTime): time, a function to be applied to the normalized time during an animation
         *  o callback: function to be invoked when the animation completed
         */
        addAnimation: function(animation, opt)
        {
            //do not change options of the animation, store options of the animation of this animatable
            //same animation might have different options on another animatable
            this._availableAnimations[animation.name] = {};
            var tmp = this._availableAnimations[animation.name];
            tmp.opt = XML3D.tools.mergeOptions(opt, animation.getOptions());
            tmp.animation = animation;
            return this;
        },

        /**
         * @param name
         * @param opt see XML3D.tools.Animatable.addAnimation() for a list of supported options
         * @returns {number}
         */
        startAnimation: function(name, opt)
        {
            var id = this._idCounter;
            this._idCounter++;

            var animation = this._availableAnimations[name];
            if(!animation)
                throw new Error("Add animation before starting animation: " + name);

            this._activeAnimations[id] = {
                animation: animation.animation,
                opt: XML3D.tools.mergeOptions(opt, animation.opt)
            };

            this._startClockGenerator(id);
            return id;
        },

        /** @inheritDoc */
        stopAnimation: function(id){
            var toStop = this._activeAnimations[id];
            if(toStop)
            {
                toStop.clockGenerator.stop();
                this._activeAnimations[id] = undefined;
            }
            return this;
        },

        /**
         * Starts a ClockGenerator which calls the Animation "from time to time", which then applies the current status of the animation to the animatable.
         * @private
         */
        _startClockGenerator: function(id)
        {
            var animation = this._activeAnimations[id];
            animation.clockGenerator = this._createClockGenerator(animation);
            animation.clockGenerator.start();
            this._startGlobalAnimation();
        },

        _createClockGenerator: function(animation)
        {
            //use a tween as a clock generator
            var opt = animation.opt;
            var time = opt.duration;
            var startTime = (opt.startTime !== undefined) ? opt.startTime : 0;

            var clockGenerator = new TWEEN.Tween({t:startTime}).to({t:time}, time).delay(opt.delay);

            //setup update and complete callbacks
            var that = this;
            clockGenerator.onUpdate(function(){
                //this is the interpolated object!
                animation.animation.applyAnimation(that, this.t, 0, time, opt.easing);
            });

            clockGenerator.onComplete( function(value){
                //this is the interpolated object!
                //animation ended -> callback or loop
                var numberOfLoops = opt.loop;
                if(isFinite(numberOfLoops))
                {
                    if( numberOfLoops > 1 )
                    {
                        //we must loop again
                        opt.loop = numberOfLoops - 1;
                        that._startClockGenerator(id);
                    }
                    else
                    {
                        //no more loops, we are finished and now the callback
                        if(typeof(opt.callback) === "function") opt.callback();
                        animation = undefined; //clean up
                    }
                }
                else{
                    //infinite loops
                    that._startClockGenerator(id);
                }
            });

            return clockGenerator;
        },

        _startGlobalAnimation: function()
        {
            if(!XML3D.tools.animating)
            {
                XML3D.tools.animating = true;
                XML3D.tools.animate();
            }
        }
    });
}());
