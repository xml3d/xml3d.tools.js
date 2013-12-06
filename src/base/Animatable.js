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
            this.availableAnimations = {};
            /**
             * Map of active KeyframeAnimations
             * Note: This works since the IDs are only numbers.
             * Those numbers are turned into strings  and those are used as keys.
             * type: Map.key: number, Map.data: {animation: Animation, clockGenerator: TWEEN.Tween, opt: Object}
             * @private
             * @type {Object}
             */
            this.activeAnimations = {};
            /**
             * Counter of IDs for active animations
             * Attention: this might turn to infinity
             * @private
             * @type {number}
             */
            this.idCounter = 0;
        },

        /** @inheritDoc */
        addAnimation: function(animation, opt){
            //do not change options of the animation, store options of the animation of this animatable
            //same animation might have different options on another animatable
            this.availableAnimations[animation.name] = {};
            var tmp = this.availableAnimations[animation.name];
            tmp.opt = XML3D.tools.mergeOptions(opt, animation.getOptions());
            tmp.animation = animation;
            return this;
        },

        /** @inheritDoc */
        startAnimation: function(name, opt){
            var id = this.idCounter;
            this.idCounter++;
            var animation = this.availableAnimations[name];
            if(!animation) throw "Add animation before starting animation: "+name;
            this.activeAnimations[id] = {animation:animation.animation, opt:XML3D.tools.mergeOptions(opt, animation.opt)};
            this.startClockGenerator(id);
            //finally return the id after setting up everything
            return id;
        },

        /**
         * Starts a ClockGenerator which calls the Animation "from time to time", which then applies the current status of the animation to the animatable.
         * @private
         */
        startClockGenerator: function(id){
            //use a tween as a clock generator
            var a = this.activeAnimations[id];
            var opt = a.opt;
            var time = opt.duration;
            var cg = new TWEEN.Tween({t:0}).to({t:time}, time).delay(opt.delay);

            //setup update and complete callbacks
            var that = this;
            cg.onUpdate(function(value){
                //this is the interpolated object!
                a.animation.applyAnimation(that, this.t, 0, time, opt.easing);
            });

            cg.onComplete( function(value){
                //this is the interpolated object!
                //animation ended -> callback or loop
                var numberOfLoops = opt.loop;
                if(isFinite(numberOfLoops)){
                    if( numberOfLoops > 1 ){ //we must loop again
                        opt.loop = numberOfLoops - 1;
                        that.startClockGenerator(id);
                    }else {
                        //no more loops, we are finished and now the callback
                        if(typeof(opt.callback) === "function") opt.callback();
                        a = undefined; //clean up
                    }
                }
                else{
                    //infinite loops
                    that.startClockGenerator(id);
                }
            });

            //and finally the start
            a.clockGenerator = cg;
            cg.start();
            if(!XML3D.tools.animating) {
                XML3D.tools.animating = true;
                XML3D.tools.animate();
            }
        },

        /** @inheritDoc */
        stopAnimation: function(id){
            var toStop = this.activeAnimations[id];
            if(toStop) {
                toStop.clockGenerator.stop();
                this.activeAnimations[id] = undefined;
            }
            return this;
        }
    });
}());
