/**
 * Creates a unit sphere by subdividing a unit octahedron.
 * Starts with a unit octahedron and subdivides the faces,
 * projecting the resulting points onto the surface of a unit sphere.
 *
 * For the algorithm see:
 * https://sites.google.com/site/dlampetest/python/triangulating-a-sphere-recursively
 * http://sol.gfxile.net/sphere/index.html
 * http://nipy.sourceforge.net/dipy/reference/dipy.core.triangle_subdivide.html
 * http://skyview.gsfc.nasa.gov/blog/index.php/2008/12/31/skyview-to-include-healpix-and-wmap/
 *
 *        1
 *       /\
 *      /  \
 *    b/____\ c
 *    /\    /\
 *   /  \  /  \
 *  /____\/____\
 * 0      a     2
 *
 * Parameter:
 * 	recursionDepth
 * 	color or -1 = many colors
 *
 * For texture see:
 * http://earthobservatory.nasa.gov/Features/BlueMarble/
 *
 * @namespace cog1.data
 * @module sphere
 */

define(["exports", "data", "glMatrix"], function(exports, data) {
    "use strict";

    /**
     * Procedural calculation.
     *
     * @parameter object with fields:
     * @parameter scale
     * @parameter recursionDepth
     * @parameter color [-1 for many colors]
     */
    exports.create = function(parameter) {
        if (parameter) {
            var scale = parameter.scale;
            var recursionDepth = parameter.recursionDepth;
            var color = parameter.color;
            var textureURL = parameter.textureURL;
        }
        // Set default values if parameter is undefined.
        if (scale == undefined) {
            scale = 250;
        }
        if (recursionDepth == undefined) {
            recursionDepth = 3;
        }
        if (color == undefined) {
            color = 9;
        }
        if (textureURL == undefined) {
            textureURL = "";
        }

        // Instance of the model to be returned.
        var instance = {};

        // BEGIN exercise Sphere

        // Starting with octahedron vertices
        var vertex_array = [
            // x	y	 z
            [ 1.0,  0.0,  0.0], // 0
            [-1.0,  0.0,  0.0], // 1
            [ 0.0,  1.0,  0.0], // 2
            [ 0.0, -1.0,  0.0], // 3
            [ 0.0,  0.0,  1.0], // 4
            [ 0.0,  0.0, -1.0]  // 5
        ];

        // octahedron triangles
        var index_array = [
            [0, 4, 2],
            [2, 4, 1],
            [1, 4, 3],
            [3, 4, 0],
            [0, 2, 5],
            [2, 1, 5],
            [1, 3, 5],
            [3, 0, 5]
        ];

        var result_array;
        for (var i = 0; i < recursionDepth; i++) {
            result_array = devide_all(vertex_array, index_array);
            vertex_array = result_array[0];
            index_array = result_array[1];
            
            console.log("vertices: ");
            console.log(vertex_array);
            console.log("triangles: ");
            console.log(index_array);
        };

        instance.vertices = vertex_array;
        instance.polygonVertices = index_array;

        // END exercise Sphere

        generateTextureCoordinates.call(instance);

        data.applyScale.call(instance, scale);
        data.setColorForAllPolygons.call(instance, color);

        instance.textureURL = textureURL;

        return instance;
    };
    /**
     * Called with this pointer set to instance.
     * Generate texture coordinates one per each corner of a polygon,
     * thus a vertex can have more than one uv, depending on the polygon it is part of.
     * The coordinates u.v represent the angles theta and phi
     * of point vector to x and y axis.
     * See:
     * http://tpreclik.dyndns.org/codeblog/?p=9
     *
     * Assume that vertices are not yet scaled, thus have length 1.
     *
     */
    function generateTextureCoordinates() {

        // BEGIN exercise Sphere-Earth-Texture

        // As there is not exactly one texture coordinate per vertex,
        // we have to install a different mapping as used for polygonVertices to vertices.
        // For texture coordinate system use openGL standard, where origin is bottom-left.
        this.textureCoord = [];
        this.polygonTextureCoord = [];

        // Loop over vertices/edges in polygon.

        // Shorthands for the current vertex.

        // Calculate longitude (east-west position) phi (u-coordinate).
        // arctangent (of here z/x), representing the angle theta between the positive X axis, and the point.
        // Scale phi to uv range [0,1].

        // Calculate latitude (north-south position) theta (v-coordinate) from y component of vertex.
        // Scale theta to uv range [0,1].

        // Store new uv coordinate in new uv-vector.
        //console.log("phi:" + (~~(phi * 100)) + "  theta:" + (~~(theta * 100)) + " x:" + (~~(x * 100)) + " z:" + (~~(z * 100)));

        // Problem with phi/u: phi=360 and phi=0 are the same point in 3D and also on a tiled texture.
        // But for faces it is a difference if uv-range is 350¡-360¡ [.9-1]or 350¡-0¡ [.9-0].
        // Thus, insert a check/hack (assuming faces cover only a small part of the texture):

        // Check if u-range should be low or high (left or right in texture),
        // by summing up u values (ignoring u=0 values).

        // Check and correct u values if 0;

        // END exercise Sphere-Earth-Texture
    }

    // BEGIN exercise Sphere
    
    function devide_all(vertices, triangles) {
        var v0, v1, v2, a, b, c, indexA, indexB, indexC;
        var new_triangle_array = [];

        for (var i = 0, j = triangles.length; i < j; i++) {
            var triangle = triangles[i];

            /*                   Make new points
                                 a = (0+2)/2
                                 b = (0+1)/2
                                 c = (1+2)/2
                   2
                   /\            Normalize a, b, c
                  /  \
                c/____\ b        Construct new triangles
                /\    /\         t1 [0,b,a]
               /  \  /  \        t2 [b,1,c]
              /____\/____\       t3 [a,b,c]
             0      a     1      t4 [a,c,2]    */

            v0 = vertices[ triangle[0] ];
            v1 = vertices[ triangle[1] ];
            v2 = vertices[ triangle[2] ];
            a = getNormalizedMiddleBetween(v0, v1);
            b = getNormalizedMiddleBetween(v1, v2);
            c = getNormalizedMiddleBetween(v0, v2);

            indexA = getFirstOrNewIndexOf(vertices, a);                
            indexB = getFirstOrNewIndexOf(vertices, b);
            indexC = getFirstOrNewIndexOf(vertices, c);
            
            new_triangle_array.push([triangle[0],indexA, indexC]);
            new_triangle_array.push([indexA,triangle[1],indexB]);
            new_triangle_array.push([indexA,indexB,indexC]);
            new_triangle_array.push([indexC,indexB,triangle[2]]);
        };
        
        return [vertices, new_triangle_array];
    }
    
    function getFirstOrNewIndexOf(vertices, vertex){
        var index = -1;
        
        for (var i=0; i < vertices.length; i++) {
          if(vertices[i][0] == vertex[0] && vertices[i][1] == vertex[1] && vertices[i][2] == vertex[2]){
                index = i;
                break;
            }
        };
        
        if(index == -1){
            index = vertices.push(vertex) - 1; // Gibt die neue Länge des arrays zurück, daher -1
        }
        
        return index;
    }
    
    function normalize(point) {
        var factor = Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2) + Math.pow(point[2], 2));
        point[0] /= factor;
        point[1] /= factor;
        point[2] /= factor;
    }
    
    function getNormalizedMiddleBetween(pointA, pointB) {
        var point = [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2, (pointA[2] + pointB[2]) / 2];
        normalize(point);
        return point;
    }

    // END exercise Sphere
});
