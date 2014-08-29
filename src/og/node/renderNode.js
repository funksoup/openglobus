goog.provide('og.node.RenderNode');


goog.require('og.inheritance');
goog.require('og.node.Node');
goog.require('og.webgl');
goog.require('og.math.Matrix4');
goog.require('og.math.Vector3');

og.node.RenderNode = function (name) {
    og.inheritance.base(this, name);
    this.renderer = null;
    this.drawMode;
    this.show = true;
    this._isActive = true;
    this._zIndex = 1000;

    this.scaleMatrix = new og.math.Matrix4().setIdentity();
    this.rotationMatrix = new og.math.Matrix4().setIdentity();
    this.translationMatrix = new og.math.Matrix4().setIdentity();
    this.transformationMatrix = new og.math.Matrix4().setIdentity();
    this.itransformationMatrix = new og.math.Matrix4().setIdentity();

    //this.lightEnabled = true;
    this._pointLights = [];
    this._pointLightsTransformedPositions = [];
    this._pointLightsParamsv = [];
    this._pointLightsParamsf = [];
    this._pointLightsNames = [];
};

og.inheritance.extend(og.node.RenderNode, og.node.Node);

og.node.RenderNode.prototype.addLight = function (light) {
    light.addTo(this);
    return light;
};

og.node.RenderNode.prototype.getLightByName = function(name){
    var li = this._pointLightsNames.indexOf(name);
    return this._pointLights[li];
};

og.node.RenderNode.prototype.removeLight = function (light) {
    light.remove();
};

og.node.RenderNode.prototype.setScale = function (xyz) {
    this.scaleMatrix.scale(xyz);
    return this;
};

og.node.RenderNode.prototype.setOrigin = function (origin) {
    this.translationMatrix.translate(origin);
    return this;
};

og.node.RenderNode.prototype.setAngles = function (ax, ay, az) {
    this.rotationMatrix.eulerToMatrix(ax, ay, az);
    return this;
};

og.node.RenderNode.prototype.updateMatrices = function () {
    this.transformationMatrix = this.translationMatrix.mul(this.rotationMatrix).mul(this.scaleMatrix);
    this.itransformationMatrix = this.transformationMatrix.inverse();
};

og.node.RenderNode.prototype.drawNode = function () {
    if (this._isActive) {
        this.drawNodes();
    }
};

og.node.RenderNode.prototype.setZIndex = function (zindex) {
    this._zIndex = zindex;
};

og.node.RenderNode.prototype.getZIndex = function () {
    return this._zIndex;
};

og.node.RenderNode.prototype.isActive = function () {
    return this._isActive;
};

og.node.RenderNode.prototype.setActive = function (isActive) {
    this._isActive = isActive;
    for (var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].setActive(isActive);
    }
};

og.node.RenderNode.prototype.setDrawMode = function (mode) {
    this.drawMode = mode;
    for (var i = 0; i < this.childNodes.length; i++) {
        this.childNodes[i].setDrawMode(mode);
    }
};

og.node.RenderNode.prototype.drawNodes = function () {
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i]._isActive)
            this.childNodes[i].drawNodes();
    }

    if (this.show)
        if (this.frame) {

            //calculate transformed lights
            var r = this.renderer;
            for (var i = 0; i < this._pointLights.length; i++) {
                var ii = i * 3;
                var tp = r.activeCamera.mvMatrix.mulVec3(this._pointLights[i]._position);
                this._pointLightsTransformedPositions[ii] = tp.x;
                this._pointLightsTransformedPositions[ii + 1] = tp.y;
                this._pointLightsTransformedPositions[ii + 2] = tp.z;
            }

            this.frame();
        }
};

og.node.RenderNode.prototype.assignRenderer = function (renderer) {
    this.renderer = renderer;
};