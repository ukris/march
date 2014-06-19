define(function (require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Entity = require('famous/core/Entity');
    var Group = require('famous/core/Group');
    var OptionsManager = require('famous/core/OptionsManager');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');
    var ViewSequence = require('famous/core/ViewSequence');
    var EventHandler = require('famous/core/EventHandler');
    var StateModifier = require ('famous/modifiers/StateModifier');
    var MouseSync     = require("famous/inputs/MouseSync");
    var TouchSync     = require("famous/inputs/TouchSync");
    var ScrollSync    = require("famous/inputs/ScrollSync");
    var GenericSync   = require("famous/inputs/GenericSync");
    // register any necessary Syncs globally by {SYNC_ID : SYNC_CLASS}
    GenericSync.register({
        mouse  : MouseSync,
        touch  : TouchSync,
        scroll : ScrollSync
    });
   

  
    
    Slider = function(options){
    	 this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
         this._optionsManager = new OptionsManager(this.options);
         if (options) this._optionsManager.setOptions(options);
         

         this._entityId = Entity.register(this);
         this.group = new Group();
         this.group.add({render: _innerRender.bind(this)});

        
         //slide
         if(this.options.direction==Utility.Direction.Y&& !options.slideSize)
        	 {
        	 this.options.slideSize=[20,undefined];
        	 }
         if(this.options.direction==Utility.Direction.Y&& !options.thumbSize)
    	 {
        	 this.options.thumbSize=[20,40]
    	 }
         this._slide = new Surface({
        	 size: this.options.slideSize,
        	 origin:this.options.origin,
        	 properties: {
        		 opacity:this.options.opacity,
        	 backgroundColor: this.options.slideColor
        	 },
         content:this.options.sign
         });
         this._thumb = new Surface({
        	 size: this.options.thumbSize,
        	 origin:this.options.thumbOrigin,
        	 properties: {
        		 opacity:this.options.opacity,
        	 backgroundColor: this.options.thumbColor,
        	 }
         });
         //Range
         this._min = this.options.min;
         this._max = this.options.max;
         //State
         this._position = 0+this.options.top;
         
         //bind event
        
         var sync = new GenericSync({
        	 "scroll" : {},
        	    "mouse"  : {},
        	   "touch"  : {}
        	});
         this._thumb.pipe(sync);
         this._slide.pipe(sync);
         sync.on('update',_handleMove.bind(this));
         sync.on('end',_handleEnd.bind(this));
         //sync.on('click',_handleClick.bind(this));
    };
    Slider.DEFAULT_OPTIONS = {
    		positionCallback:null,
    		direction: Utility.Direction.X,
    		opacity:0.6,
           min:0,
           max:100,
           position:[0,0],
           origin:[0,1],
           slideColor:"black",
        	   slideSize:[undefined,20],
           thumbColor:"red",
        	   thumbSize:[40,20],
        	   thumbOrigin:[0,0],
        	   sign:'',
        	   top:0,
        	   length:window.innerWidth
           
           
        };
    
    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {Object} Render spec for this component
     */
      Slider.prototype.render = function render() {
    	 //if (this._positionGetter) this._position = this._positionGetter.call(this);
        return this._entityId;
    };
    _innerRender = function() {

        var result = [];
        var transform = (this.options.direction==Utility.Direction.X?
        		Transform.translate(this._position-this.options.thumbSize[0]/2,0,0)
        		:Transform.translate(0,this._position-this.options.thumbSize[1]/2,0))
        result[0] ={transform:transform,target:this._thumb.render()};
        result[1] =  {target:this._slide.render()};
        return result;
    };

    /**
     * Patches the GridLayout instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for the GridLayout instance.
     */
    Slider.prototype.setOptions = function setOptions(options) {
        return this.optionsManager.setOptions(options);
    };
    /**
     * Apply changes from this component to the corresponding document element.
     * This includes changes to classes, styles, size, content, opacity, origin,
     * and matrix transforms.
     *
     * @private
     * @method commit
     * @param {Context} context commit context
     */
    Slider.prototype.commit = function commit(context) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var align = context.align;
        var size = context.size;

        return {
        	origin: origin,
        	align:align,
            transform: transform,
            opacity: opacity,
            size: size,
            target:  this.group.render()
        };
    };
    Slider.prototype.setPosition= function(position){//[0,1]
    	
    	this._position = position*this.options.length;//relative to parent
    	if(this.options.positionCallback) this.options.positionCallback(position);
    }
    //not callback
    Slider.prototype.updatePosition= function(position){//[0,1]
    	
    	this._position = position*this.options.length;//relative to parent
    }
    Slider.prototype.getPosition= function(){
    	return this._position;
    }
    function _handleStart(event) {
    }

    function _handleMove(event) {
        var delta = (this.options.direction==Utility.Direction.X?event.clientX:event.clientY);
        this.setPosition((delta-this.options.top)/this.options.length);
    }
    
    function _handleEnd(event) {
    	 var delta = (this.options.direction==Utility.Direction.X?event.clientX:event.clientY);
         this.setPosition((delta-this.options.top)/this.options.length);
         console.log("handleEnd");
    }
    
    module.exports = Slider;
});