
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * A TransformBox uses the TranslaterBox, Scaler and SingleAxisRotator to set up a 
 * composed widget, that can be translated, rotated and scaled. 
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TransformBox = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {
 
    /** Setup axis-flip options and initialize the base class. 
     * 
     * @param {string} _id
     * @param {XMOT.Transformable} _target
     * @param {{x: boolean, y: boolean, z: boolean}=} rotationFlipOpts whether to flip the rotation around the given local axis.
     * 												  rotationFlipOpts attributes and and the parameter itself is optional. 
     */
	initialize: function(_id, _target, rotationFlipOpts)
	{
		this._flipRotAxes = {x: false, y: false, z: false}; 
		
		if(rotationFlipOpts)
		{
			this._flipRotAxes.x = rotationFlipOpts.x;
			this._flipRotAxes.y = rotationFlipOpts.y; 
			this._flipRotAxes.z = rotationFlipOpts.z;			
		} 
		
		this.callSuper(_id, _target); 
	}, 

    /** 
     *  @this {XMOT.interaction.widgets.TransformBox}
     *  @override
     *  @protected 
     */
    onCreateBehavior: function()
    {        
        // translation 
        this.behavior["translbox"] = new XMOT.interaction.widgets.TranslateBox(
            this.ID + "_translbox", this.target);
        
        // scaling
        this.behavior["scaler"] = new XMOT.interaction.widgets.UniformScaler(
            this.ID + "_scaler", this.target); 
        
        // rotation
        // options objects for the SingleAxisRotator
        var axes = [ 
        	{axis: "x", color: "0.7 0 0", highlightColor: "0.9 0 0"},
        	{axis: "y", color: "0 0.7 0", highlightColor: "0 0.9 0"},
        	{axis: "z", color: "0 0 0.7", highlightColor: "0 0 0.9"}
        ]; 
        	
        for(var i = 0; i < axes.length; i++)
        {
            var ax = axes[i].axis;
            var id = ax + "rot"; 
            
            this.behavior[id] = new XMOT.interaction.widgets.SingleAxisRotator(
                this.ID + "_" + id, this.target, axes[i]
            );   
            
            this.behavior[id].flipRotation(this._flipRotAxes[ax]);            	 
        }
    }
});
