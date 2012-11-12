
XMOT.namespace("XMOT.interaction.behaviors"); 

/** Rotater maps the translation on a plane into a trackball rotation and sets
 *  the given group's rotation attribute.
 *  
 *  @extends XMOT.interaction.behaviors.PlaneSensor
 */
XMOT.interaction.behaviors.Rotater = new XMOT.util.Class(
    XMOT.interaction.behaviors.PlaneSensor,
{
    /** Constructor of Rotater
     * 
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  
     *  @param {string} id the id of this sensor
     *  @param {Array.<Object>} pickGrps the group this sensor will listen for events
     *  @param {XMOT.Transformable} targetTransformable the group this sensor will modify.
     *                 If not given, it is equal to the first element in pickGrp.
     *  @param {number} [rotSpeed] rotation speed, default is 1
     *  @param {XML3DVec3|Object} [planeOrient] modifies the orientation of the underlying
     *                  XML3D.interaction.behaviors.PlaneSensor. 
     *                  See XML3D.interaction.behaviors.PlaneSensor for further information.
     *
     *  @throws "target no transform" if the target group doesn't have a transform
     *           attribute
     */
    initialize: function(id, pickGrps, targetTransformable, rotSpeed, planeOrient)
    {
        // parent class
        this.callSuper(id, pickGrps, planeOrient, null);

        // --- setup pdsensor --- 
        
        this.useTransOffset = false; // always start again at zero translation
        
        /* The trackball assumes values in the range [0,trackMax],
         * but the translation values we get are starting on the object, so rotation
         * should be possible on both sides of the axes of the target object (and not just
         * on the positive sides) so we translate the translation values by half of the maximum
         * tracking values.
         * Here we're not talking in pixels but world-space units. We simply take to be the 
         * space to lie in the [0,Number.MAX_VALUE] range.  
         */
        var trackMax = 250;
        var transMax = trackMax/2;
        var constrBox = new window.XML3DBox(
            new window.XML3DVec3(-transMax, -transMax, -transMax), 
            new window.XML3DVec3(transMax, transMax, transMax)
        );
        this.constraint = new XMOT.BoxedTranslationConstraint(constrBox); 
        
        // --- setup trackball --- 
        
        this.trackBall = new XMOT.interaction.behaviors.TrackBall(trackMax, trackMax);
        if(rotSpeed)
            this.trackBall.rotationSpeed = rotSpeed;
        else
            this.trackBall.rotationSpeed = 4; 

        // --- setup this sensor ---          
        this.targetTransformable = targetTransformable; 

        // listeners
        this.addListener("dragstart", this.callback("_onTrackBallDragStart"));
        this.addListener("dragend", this.callback("_onTrackBallDragEnd"));
        this.addListener("translchanged", this.callback("_onTrackBallTranslChanged"));
    },

    /** reset the rotation that gets remembered between drags 
     *
     *  @this {XMOT.interaction.behaviors.Rotater}
     */
    resetRotation: function()
    {
        this.trackBall.resetRotationOffset();
        
        this.targetTransformable.setOrientation((new window.XML3DRotation()).getQuaternion());
    },

    /** restrict the rotation to x or y axis
     * 
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  
     *  @param {string} [axis] the axis to restrict to. Can be "x", "y" or "z". Default: 
     *          release the restriction
     *  
     *  @return {string} the current axis restriction, or null, if no restriction is applied
     */
    axisRestriction: function(axis)
    {        
        return this.trackBall.axisRestriction(axis);
    },

    /** Set or retrieve the rotation speed
     * 
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  
     *  @param {number} [speed] default: do not set the speed. 
     *  @return {number} the current speed
     */
    rotationSpeed: function(speed)
    {
        if(speed)
            this.trackBall.rotationSpeed = speed;

        return this.trackBall.rotationSpeed;
    },
    
    /** Set or retrieve the status of rotation flipping. Flipped rotation means
     *  the rotation's angle will be negated before it's set in the target transform element.
     *  
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  
     *  @param {boolean} [flip] the new flip value. Default: don't set it
     *  @return {boolean} the current flip value
     */
    flipRotation: function(flip)
    {
        if(flip)
            this._flipRotation = flip; 
        
        return this._flipRotation; 
    },

    // ========================================================================
    // --- Private --- 
    // ========================================================================

    /** 
     *  @private
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  
     *  @param {XMOT.interaction.behaviors.Rotater} sensor
     */
    _onTrackBallDragStart: function(sensor)
    {
        // update the offset with perhaps changed rotation
        this._rotationOffset = new window.XML3DRotation(this.targetTransformable.transform.rotation);
        // reset the trackball's offset: we do that for ourselves 
        this.trackBall.rotationOffset = new XML3DRotation();

        // always start the rotation in the middle of the translation space
        this.trackBall.dragStart(this.trackBall.maxX/2, this.trackBall.maxY/2);
    },

    /** 
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  @private 
     *  
     *  @param {XMOT.interaction.behaviors.Rotater} sensor
     */
    _onTrackBallDragEnd: function(sensor)
    {
        this.trackBall.dragEnd();
    },

    /** 
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  @private
     *  
     *  @param {XMOT.interaction.behaviors.Rotater} sensor 
     */
    _onTrackBallTranslChanged: function(sensor)
    {
        var canTrans = sensor.getCanonicalTranslation(); 

        var canRot = this.trackBall.drag(this.trackBall.maxX/2 + canTrans.x,
                                      this.trackBall.maxY/2 - canTrans.y);
           
        if(this._flipRotation)
            canRot.angle = -canRot.angle;       
                
        var finalRot = this._rotationOffset.multiply(canRot);
        
        this.targetTransformable.setOrientation(finalRot.getQuaternion());
    }
});
