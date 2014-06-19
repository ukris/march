define(function (require, exports, module) {
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Scrollview = require('famous/Kviews/KScrollview');
    var StateModifier = require('famous/modifiers/StateModifier');
    Timeline = function (options) {
        // View.apply(this, arguments);//Init
        this.mode = options.mode;
        this.curIndex = 0;
        this.lastDirectionIsNext = true;
        // Note: Scroll up and down to progress through
        // each of three experiences creatable directly
        // from different parameters to Scrollview.
        this.outputTypeEnum = {
            Z_SCROLLER: 0,
            CAROUSEL: 1,
            HELIX: 2,
            X_SCROLLER: 3,
            X_SCROLLER_EX: 4
        }
        // note: change the type of experience you want here
        // by setting to one of the above values
        this.outputType = this.mode == "3D" ? this.outputTypeEnum.Z_SCROLLER : this.outputTypeEnum.X_SCROLLER;
        /*Create View*/
        var option = Scrollview.DEFAULT_OPTIONS;
        option.fog = this.mode == "3D" ? options.fog : 0;
        option.margin = options.margin
        this.scrollview = new Scrollview(option);
        this.surfaces = [];
        this.scrollview.sequenceFrom(this.surfaces);
        Engine.pipe(this.scrollview);
        //Engine.on('touchmove',scrollview.goToNextPage.bind(scrollview));
        this.data = options.data;
        this.OnSelected = options.OnSelected;
        //Create surface with set data;
        this.surfaceW = 200;
        this.surfaceH = 200;
        this._createSurfaces();

        var self = this;
        var fishEye = 0;
        this.scrollview.outputFrom(function (offset) {

            switch (self.outputType) {
            case (self.outputTypeEnum.Z_SCROLLER):
                //console.log(offset);
                return Transform.translate(0, -offset / 1.5, -offset);
            case (self.outputTypeEnum.X_SCROLLER):
                //console.log(offset);
                return Transform.translate(offset, 0, 0);
            case (self.outputTypeEnum.X_SCROLLER_EX):
                //console.log(offset);
                return Transform.translate(offset/3, 0, 0);
            case (self.outputTypeEnum.CAROUSEL):
                return Transform.moveThen([0, 0, 500], Transform.rotateY(0.003 * offset));
            case (self.outputTypeEnum.HELIX):
            default:
                return Transform.moveThen([0, offset / 4, 600], Transform.rotateY(0.0025 * offset));
            }
        });
        //Test
        Engine.on("mousemove",function(e){
        	fishEye = e.clientX
        })

    }
    Timeline.prototype.setMode = function (mode) {
        this.mode = mode;
        this.outputType = this.mode == "3D" ? this.outputTypeEnum.Z_SCROLLER : this.outputTypeEnum.X_SCROLLER;
        var option = Scrollview.DEFAULT_OPTIONS;
        option.fog = this.mode == "3D" ? 0.3 : 0;
        this.scrollview.setOptions(option);
    }
    Timeline.prototype._createSurfaces = function () {
        var self = this;
        //dummy 3 last surface

        function click(timeline) {
                    // var next = this.appId != timeline.curIndex ? this.appId : timeline.curIndex - 1;
                    //var next = this.appId != timeline.curIndex ? this.appId : 0;
            if (timeline.OnSelected) {
                var next = this.appId;
                if (next == timeline.curIndex)
                    next = timeline.curIndex - 1;
                if (next < 0) next = 0;
                timeline.OnSelected(next);
                timeline.curIndex = next;
            }
        }
        for (var i = 0; i < this.data.length + 3; i++) {
            var surface = new Surface({
                size: [this.surfaceW, this.surfaceH],
                properties: {
                    backgroundColor: i > this.data.length - 1 ? "rgba(0,0,0,0)" : "hsl(" + (i * 360 / 50) + ", 100%, 50%)",
                    webkitBackfaceVisibility: 'visible',
                    boxShadow: i > this.data.length - 1 ? '0 0 0px rgba(0,0,0,0.5)' : '0 0 20px rgba(0,0,0,0.5)'
                }
            });
            //dummy 2 element
            if (i >= 0 && i < this.data.length) {
                //setdata
                surface.appId = i;
                surface.setContent(this.data[i]);

                surface.on("click", click.bind(surface, self));
            }


            this.surfaces.push(surface);
        }
    }

    Timeline.prototype.goToPage = function (index) {
        //if(this.scrollview.goToPage(index==this.curIndex?0:index))
        this.scrollview.goToPage(index);
        return;

    }
    Timeline.prototype.goToPreviousPage = function () {
        //if(this.scrollview.goToPage(index==this.curIndex?0:index))
        this.scrollview.goToPreviousPage();
        return;

    }
    //Timeline.prototype = Object.create(View.prototype);
    //Timeline.prototype.constructor = Timeline;

    module.exports = Timeline;
})