// based on bunny-walkthrough
// generating geometry instead of using bunny

var Geometry = require('gl-geometry');
var fit = require('canvas-fit');
var mat4 = require('gl-mat4');
var normals = require('normals');
var glslify = require('glslify');


var canvas = document.body.appendChild(document.createElement('canvas'));
var camera = require('canvas-orbit-camera')(canvas);

var gl = require('gl-context')(canvas, render);

window.addEventListener('resize', fit(canvas), false);

var geometry = Geometry(gl);

var stuff = {
    "positions": [
        [0.0, 0.0, 0.0],
        [1.5, 0.0, 0.0],
        [1.5, 1.5, 0.0],
        [0.0, 1.5, 0.0]
    ],
    "cells": [
        [0, 1, 2],
        [1, 1, 1],
        [1, 1, 2],
        [1, 1, 3], 
    ]
};


geometry.attr('aPosition', stuff.positions);
geometry.attr('aNormal', normals.vertexNormals(stuff.cells, stuff.positions));

geometry.faces(stuff.cells);

// Create the base matrices to be used
// when rendering the boxes. Alternatively, can
// be created using `new Float32Array(16)`
var projection = mat4.create();
var model = mat4.create();
var view = mat4.create();
var height;
var width;

var shader = glslify({
    vert: './shaders/boxes.vert',
    frag: './shaders/boxes.frag'
})(gl);

// The logic/update loop, which updates all of the variables
// before they're used in our render function. It's optional
// for you to keep `update` and `render` as separate steps.

function update() {
    // Updates the width/height we use to render the
    // final image.
    width = gl.drawingBufferWidth;
    height = gl.drawingBufferHeight;

    // Updates our camera view matrix.
    camera.view(view);

    // Optionally, flush the state of the camera. Required
    // for user input to work correctly.
    camera.tick();

    // Update our projection matrix. This is the bit that's
    // responsible for taking 3D coordinates and projecting
    // them into 2D screen space.
    var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    var fieldOfView = Math.PI / 4;
    var near = 0.01;
    var far = 100;

    mat4.perspective(projection, fieldOfView, aspectRatio, near, far);
}

function render() {
    update();

    // Sets the viewport, i.e. tells WebGL to draw the
    // scene across the full canvas.
    gl.viewport(0, 0, width, height);

    // Enables depth testing, which prevents triangles
    // from overlapping.
    gl.enable(gl.DEPTH_TEST);

    // Enables face culling, which prevents triangles
    // being visible from behind.
    // gl.enable(gl.CULL_FACE)

    // Binds the geometry and sets up the shader's attribute
    // locations accordingly.
    geometry.bind(shader);

    // Updates our model/view/projection matrices, sending them
    // to the GPU as uniform variables that we can use in
    // `shaders/bunny.vert` and `shaders/bunny.frag`.
    shader.uniforms.uProjection = projection;
    shader.uniforms.uView = view;
    shader.uniforms.uModel = model;

    // Finally: draws the bunny to the screen! The rest is
    // handled in our shaders.
    geometry.draw(gl.TRIANGLES);
}
