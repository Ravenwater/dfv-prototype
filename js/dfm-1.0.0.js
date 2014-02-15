/**
 * initialize the Domain Flow Model
 * The model consists of
 * 1- a set of constraints defining the domains of computation,
 * 2- a spacetime mapping consisting of a schedule function and a space projection,
 * 3- a set of affine dependencies describing data dependencies between computational events
 **/
function initDFM(doCs, adg, wavefronts)
{
    /* or through individual constraints, as they become available
     * during parsing of the domain flow program
     */
    var test = 3;
    switch (test) {        // for testing purposes
        case 1: {
            doCs.setConstraintSet([ [-1], [1] ], [-1,10]);
            break;
        }
        case 2: {
            doCs.setConstraintSet( [ [-1, 0],
                [ 0,-1],
                [ 1, 0],
                [ 0, 1]],
                [-1, -1, 10, 10]);
            break;
        }
        case 3: {
            /* set the domain of computation through a complete Ax = b description
             doCs.setConstraintSet(
             [ [-1,  0,  0],
             [ 0, -1,  0],
             [ 0,  0, -1],
             [ 1,  0,  0],
             [ 0,  1,  0],
             [ 0,  0,  1]],
             [-1, -1, -1, 10, 10, 10]);
             */

            doCs.setConstraint(0, [-1, 0, 0], -1);
            doCs.setConstraint(1, [ 0,-1, 0], -1);
            doCs.setConstraint(2, [ 0, 0,-1], -1);
            doCs.setConstraint(3, [ 1, 0, 0], 10);
            doCs.setConstraint(4, [ 0, 1, 0], 10);
            doCs.setConstraint(5, [ 0, 0, 1], 10);
            break;
        }
    }
    /*
     * transform the constraints to a set of polylines that can be visualized.
     *
     * Right now, this only works for closed convex hulls. When you have a
     * half-plane with vertices at infinity then the 'rays' of the half-plane
     * are not rendered. This could be fixed with a set of 'capture' planes
     * that lie outside of the view frustum.
     */
    doCs.generatePolylines();

    // setup the Affine Dependency Graph of the algorithm
    adg.setVertex(0, new KPU.DgVertex('a_recurrence'));
    adg.setVertex(1, new KPU.DgVertex('b_recurrence'));
    adg.setVertex(2, new KPU.DgVertex('c_recurrence'));


}