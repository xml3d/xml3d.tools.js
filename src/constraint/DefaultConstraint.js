(function(){

    /**
     *  Constraint that allows everything. Useful for Constraints that just want
     *  to constraint a specific operation, e.g. rotation or translation.
     *
     *  @constructor
     *  @implements {Constraint}
     */
    XMOT.DefaultConstraint = new XMOT.Class({

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts){
            return true;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts){
            return true;
        },

        constrainScaling: function(newScale, opts){
            return true;
        }
    });
}());
