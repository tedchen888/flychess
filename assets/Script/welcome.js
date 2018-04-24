var cfg = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
        planeNum: 0,
        
        startBtn: {
            default: null,
            type: cc.Button
        },
        
        p0_toggle: cc.Toggle,
        p1_toggle: cc.Toggle,
        p2_toggle: cc.Toggle,
        p3_toggle: cc.Toggle,
        
        slider: cc.Slider
    },

    // use this for initialization
    onLoad: function () {
        this.planeNum = 4;
        
        this.startBtn.node.on(cc.Node.EventType.TOUCH_END, this.startNewGame, this);

        this.p0_toggle.node.on('toggle', this.callbackP0, this);
        
        this.slider.node.on('slide', this.sliderCallback, this);
    },
    
    callbackP0: function (event) {
       //这里的 event 是一个 EventCustom 对象，你可以通过 event.detail 获取 Toggle 组件
       var toggle = event.detail;
       //do whatever you want with toggle
       if (this.p0_toggle.isChecked) {
           this.p0 = true;
       } else {
           this.p0 = false;
       }
    },
    sliderCallback: function (event) {
       //这里的 event 是一个 EventCustom 对象，你可以通过 event.detail 获取 Slider 组件
       var slider = event.detail;
       //do whatever you want with the slider
       //cc.log(slider.progress + ' ' + this.planeNum);
       if (slider.progress >= 0 && slider.progress < 0.25) {
           this.planeNum = 1;
           slider.progress = 0.25;
       } else if (slider.progress >= 0.25 && slider.progress < 0.5) {
           this.planeNum = 2;
           slider.progress = 0.5;
       } else if (slider.progress >= 0.5 && slider.progress < 0.75) {
           this.planeNum = 3;
           slider.progress = 0.75;
       } else {
           this.planeNum = 4;
           slider.progress = 1.0;
       }
       
    },
    
    startNewGame: function() {
        cfg.config.planeNum = this.planeNum;
        cfg.config.selectP0 = this.p0_toggle.isChecked;
        cfg.config.selectP1 = this.p1_toggle.isChecked;
        cfg.config.selectP2 = this.p2_toggle.isChecked;
        cfg.config.selectP3 = this.p3_toggle.isChecked;
        
        cc.director.loadScene('game');
        
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
