/**
 * KPU computational wavefront representations
 * This is a partial order on the lattice points that adhere
 * to a piece-wise linear schedule.
 */

// # Code

/** @namespace */
var KPU		    = KPU 		    || {};
KPU.Wavefront	= KPU.Wavefront	|| function() {
    /**
     * version identifier
     * @type {string} release.major.minor
     */
    this.version = "1.0.0";

}

KPU.Wavefront.property = {
    /**
     * return the number of wavefronts
     *
     * @returns {Integer} number of wavefronts
    */
    count: function()
    {
        return 1;
    }
}

