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
		if(parameter) {
			var scale = parameter.scale;
			var recursionDepth = parameter.recursionDepth;
			var color = parameter.color;
			var textureURL = parameter.textureURL;
		}
		// Set default values if parameter is undefined.
		if(scale == undefined) {
			scale = 250;
		}
		if(recursionDepth == undefined) {
			recursionDepth = 3;
		}
		if(color == undefined) {
			color = 9;
		}
		if(textureURL == undefined) {
			textureURL = "";
		}

		// Instance of the model to be returned.
		var instance = {};

		// BEGIN exercise Sphere

		// Starting with octahedron vertices
		instance.vertices = [ 
			// x	y	 z
		    [ 1.0, 0.0, 0.0], // 0
		    [-1.0, 0.0, 0.0], // 1
		    [ 0.0, 1.0, 0.0], // 2
		    [ 0.0,-1.0, 0.0], // 3
		    [ 0.0, 0.0, 1.0], // 4
		    [ 0.0, 0.0,-1.0]  // 5 
		    ];

		// octahedron triangles
		    instance.polygonVertices = [ 
		    [ 0, 4, 2 ],
		    [ 2, 4, 1 ],
		    [ 1, 4, 3 ],
		    [ 3, 4, 0 ],
		    [ 0, 2, 5 ],
		    [ 2, 1, 5 ],
		    [ 1, 3, 5 ],
		    [ 3, 0, 5 ]];
		    
		divide_all(instance, recursionDepth);

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
	
	/**
	 * Recursively divides the first triangle of instance.polygonVertices; mirrors the result to the 7 other sides.
	 */
	function divide_all(instance, recursionDepth) {
		var arr = [];
		for (var i=0; i < instance.polygonVertices.length; i++) {
            arr = arr.concat(getDividedAndProjectedTriangles(instance, instance.polygonVertices[i], recursionDepth));
		};
		console.log(arr);
		instance.polygonVertices = arr;
		
        console.log(instance.vertices);
	}

	/**
	 * Recursively divides the given triangle in the given depth and projects them on the sphere.
	 */
	function getDividedAndProjectedTriangles(instance, triangle, recursionDepth) {
		recursionDepth--;
		var m1 = getMiddleBetween(instance.vertices[triangle[0]], instance.vertices[triangle[1]]);
		var m2 = getMiddleBetween(instance.vertices[triangle[1]], instance.vertices[triangle[2]]);
		var m3 = getMiddleBetween(instance.vertices[triangle[2]], instance.vertices[triangle[0]]);
		var p1 = instance.vertices[triangle[0]];
		var p3 = instance.vertices[triangle[1]];
		var p2 = instance.vertices[triangle[2]];
		
		var newNr = instance.vertices.length;
		instance.vertices.push(m1, m2, m3);
		
		var poly1 = [triangle[0], newNr, newNr + 2];
		var poly2 = [triangle[1], newNr + 1, newNr];
		var poly3 = [triangle[2], newNr + 2, newNr + 1];
		var poly4 = [newNr, newNr + 1, newNr + 2];
		
		if(recursionDepth <= 0)
			return [poly1, poly2, poly3, poly4];
			
		return getDividedAndProjectedTriangles(instance, poly1, recursionDepth)
		  .concat(getDividedAndProjectedTriangles(instance, poly2, recursionDepth))
		  .concat(getDividedAndProjectedTriangles(instance, poly3, recursionDepth))
          .concat(getDividedAndProjectedTriangles(instance, poly4, recursionDepth));
	}
	
	/**
	 * Returns the point (x, y, z) in the middle of the given two points.
	 */
	function getMiddleBetween(pointA, pointB) {
		var x = (pointA[0] + pointB[0]) / 2;
		var y = (pointA[1] + pointB[1]) / 2;
		var z = (pointA[2] + pointB[2]) / 2;
		
        var factor = Math.sqrt(1 / (x * x + y * y + z * z));
		return [x * factor, y * factor, z * factor];
	}
	// END exercise Sphere
});
