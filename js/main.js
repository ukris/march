define(function (require, exports, module) {
    var Engine = require('famous/core/Engine');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var HeaderFooterLayout = require("famous/Kviews/HeaderFooterLayout");
    var Utility = require('famous/utilities/Utility');

    var Timeline = require('Timeline');
    var Slider = require('Slider');
    var mainContext = Engine.createContext();
    mainContext.setPerspective(600);
    //Main layout:
    var HEADER_H = 20;
    var FOOTER_H = 20;
    var BODY_H = window.innerHeight - HEADER_H - FOOTER_H;
    var SLIDER_W = 20;
    //Timeline
    var mode = "3D";
    var DATA_LENGTH = 24;
    var data = prepareData();
    var fogDensity = 0.3;
    var timelines = [];
    var modifiers = [];
    var X_SIZE = 5;
    var Y_SIZE = 1;
    var X_STEP = 0.25;
    var Y_STEP = 0.5;
    for (var i = 0; i < X_SIZE; i++)
    	for (var j = 0; j < Y_SIZE; j++){
        var t = new Timeline({
            mode: mode,
            data: data,
            OnSelected: OnSelected,
            fog: fogDensity,
            margin:1000
        });
        timelines.push(t);
        modifier = new StateModifier({
            //origin: [0.5 + (i + 0.5 - X_SIZE / 2) * X_STEP, 1-j*Y_STEP]
        });
        modifiers.push(modifier);
    }

    function _goToPage(index) {
        if (index >= 0) {
            for (var i = 0; i < timelines.length; i++)
                timelines[i].goToPage(index);
        }
        console.log("GoTo index:" + index);

    }

    function _moveX(translate) {
        for (var i = 0; i < modifiers.length; i++)
            modifiers[i].setTransform(Transform.translate(translate, 0, 0), null, null);
    }

    function _moveY(translate) {
        for (var i = 0; i < modifiers.length; i++)
            modifiers[i].setTransform(Transform.translate(0, translate, 0), null, null);
    }

    function OnSelected(index) {
        _goToPage(index);
        //Update sliderZ
        var position = index / (DATA_LENGTH - 1);
        sliderZ.updatePosition(position);

    }

    //Slider X
    var sliderXModifier = new StateModifier({
        origin: [0, 0],
    });
    var sliderX = new Slider({
        positionCallback: manualPositionX.bind(this),
        slideColor: '#00ABA9',
        sign:'X',
        length:window.innerWidth
    });
    sliderX.setPosition(0.5);

    function manualPositionX(position) {
            var translate = position*window.innerWidth - window.innerWidth / 2;
            _moveX(-translate);

        }
        //Slider Y
    var sliderYModifier = new StateModifier({
        origin: [0, 0]
    });
    var sliderY = new Slider({
        positionCallback: manualPositionY.bind(this),
        direction: Utility.Direction.Y,
        slideColor: '#8CBF26',
        sign:'Y',
        top: HEADER_H,
        length:BODY_H
    });

    function manualPositionY(position) {
            var translate = position*BODY_H;
            _moveY(-translate);

        }
    
    //Slider Z
    var sliderZModifier = new StateModifier({
        origin: [0, 0],
        transform:Transform.translate(window.innerWidth-SLIDER_W,0,0)
    });
    var sliderZ = new Slider({
        positionCallback: manualPositionZ.bind(this),
        direction: Utility.Direction.Y,
        slideColor: '#A05000',
        sign:'Z',
         top: HEADER_H,
         length:BODY_H
    });
    //sliderY.setPosition(window.innerHeight/2);
    function manualPositionZ(position) {
        var index = position * (DATA_LENGTH - 1);
        index = Math.round(index);
        if (index >= 0) _goToPage(index);

    }

    function prepareData() {
        var DATA = "images/";
        var IMAGE = "img";
        var data = [];
        for (var i = 0; i < DATA_LENGTH; i++) {
            var imageSrc = DATA + IMAGE + " (" + i + ").jpg";

            var img = '<img class="image" src="' + imageSrc + '"></img>';
            var summary = '<div class="summary"> ' + '' + i + '</div>';
            //var details = '<div class="details-hide">' + '<b>Type</b>:' + surface.type + '</br> The details of element </div>';

            var info = summary; //+ details;
            var contentDiv = '<div class="cell">' + img + info + '</div>';
            data.push(contentDiv);
        }
        return data;
    }

    //Mouse event
    //Engine.on("mousemove",lookAt);
    // Engine.on("mouseleave",lookAtOrigin);
    function lookAt(e) {
        if (mode == "3D") {
            var X = e.x / window.innerWidth;
            leftModifier.setOrigin([0.75 - X, leftModifier.getOrigin()[1]]);
            centerModifier.setOrigin([1 - X, centerModifier.getOrigin()[1]]);
            rightModifier.setOrigin([1.25 - X, rightModifier.getOrigin()[1]]);
        }
    }

    function lookAtOrigin(e) {
        if (mode == "3D") {
            leftModifier.setOrigin([0.25, leftModifier.getOrigin()[1]]);
            centerModifier.setOrigin([0.5, centerModifier.getOrigin()[1]]);
            rightModifier.setOrigin([0.75, rightModifier.getOrigin()[1]]);
        }
    }

    //Mode 2D 3D
    function onModeChange() {
            mode = this.checked ? "2D" : "3D";
            changeMode(mode);
        }
    function changeMode(mode){
    	for (var i = 0; i < X_SIZE; i++) 
        	for (var j = 0; j < Y_SIZE;j++){
            var timeline = timelines[i*Y_SIZE+j];
            timeline.setMode(mode);
            modifiers[i*Y_SIZE+j].setOrigin(mode == "2D" ? [0,i * Y_STEP] : [0.5 + (i + 0.5 - X_SIZE / 2) * X_STEP, 1-j*Y_STEP], {
                duration: 500
            }, null);
        }
    }
        //Create checkbox
    var div = document.createElement('div');
    var checkbox = document.createElement('input');
    checkbox.name = "2D";
    checkbox.type = "checkbox";
    checkbox.onchange = onModeChange;
    var label = document.createElement('label')
    label.innerText = '2D';
    div.appendChild(label);
    div.appendChild(checkbox);
    div.style.zIndex=2;//not work
    document.body.appendChild(div);


    //Layout
    var layout = new HeaderFooterLayout({
        headerSize: HEADER_H,
        footerSize: FOOTER_H
    });

    //layout.header.add();

    for (var i = 0; i < timelines.length; i++) {
        layout.content.add(modifiers[i]).add(timelines[i].scrollview);
    }
    layout.footer.add(sliderXModifier).add(sliderX);
    layout.content.add(sliderYModifier).add(sliderY);
    layout.content.add(sliderZModifier).add(sliderZ);
    mainContext.add(layout);
    changeMode(mode);
});