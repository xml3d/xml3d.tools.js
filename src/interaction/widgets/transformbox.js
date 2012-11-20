
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * A TransformBox uses the TranslaterBox, Scaler and SingleAxisRotator to set up a 
 * composed widget, that can be translated, rotated and scaled. 
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TransformBox = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {


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
        var axes = ["x", "y", "z"]; 
        for(var i = 0; i < axes.length; i++)
        {
            var ax = axes[i];
            var id = ax + "rot"; 
            
            this.behavior[id] = new XMOT.interaction.widgets.SingleAxisRotator(
                this.ID + "_" + id, this.target, ax
            );            
        }
    }
});
