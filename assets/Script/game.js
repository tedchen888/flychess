var GameStateType = cc.Enum({
    Begining: 0,
    Rolling: 1,
    Playing: 2,
});

var PlayRoler = cc.Enum({
    Red: 0,
    Yellow: 1,
    Blue: 2,
    Green: 3,
});

cc.Class({
    extends: cc.Component,
    
    properties: {
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!',
        planePrefab: {
            default: null,
            type: cc.Prefab
        },
        debuglog: {
            default: null,
            type: cc.Label
        },
        btn_dices: {
            default: null,
            type: cc.Button
        },
        
        rollPoint: 0,
        curPlayerIdx: 0,  //0-red, 1-yellow, 2-blue, 3-green
        gameStatus: 0, //0-can roll, 1-rolling, 2-playing
        planeNum: 0,
        //顺序
        playerSeq: [],
        //机场
        player_planeStartPos: [],
        //路径
        player_planePath: [],
    },

    // use this for initialization
    onLoad: function () {
        //this.label.string = this.text;
        this.btn_dices.node.on('click', this.rollDices, this);
        this.rollPoint = 0;
        this.gameStatus = GameStateType.Begining;
        this.curPlayerIdx = 0;
        this.planeNum = 4;
        
        //this.playerSeq = new array();
        this.playerSeq[0] = PlayRoler.Red;
        this.playerSeq[1] = PlayRoler.Yellow;
        this.playerSeq[2] = PlayRoler.Blue;
        this.playerSeq[3] = PlayRoler.Green;
        
        //this.player_planeStartPos = new array();
        this.player_planeStartPos[0] = [cc.p(-280,-115), cc.p(-208,-115), cc.p(-280,-201), cc.p(-208,-201)]; //PlayRoler.Red
        this.player_planeStartPos[1] = [cc.p(-280,438), cc.p(-208,438), cc.p(-208,352), cc.p(-280,352)]; //PlayRoler.Yellow
        this.player_planeStartPos[2] = [cc.p(208,438), cc.p(280,438), cc.p(280,352), cc.p(208,352)]; //PlayRoler.Blue
        this.player_planeStartPos[3] = [cc.p(208,-115), cc.p(280,-115), cc.p(280,-201), cc.p(208,-201)]; //PlayRoler.Green
        
        this.player_planePath[0] = [];
        this.player_planePath[1] = [];
        this.player_planePath[2] = [];
        this.player_planePath[3] = [];
        
        this.initPlane();
    },

    // called every frame
    update: function (dt) {

    },
    
    rollDices: function (event) {
        if (this.gameStatus == GameStateType.Begining) {
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.debuglog.string = 'Point:' + this.rollPoint.toString();
           this.gameStatus = GameStateType.Rolling;
        }
       //这里的 event 是一个 EventCustom 对象，你可以通过 event.detail 获取 Button 组件
       var button = event.detail;
       //do whatever you want with button
       //另外，注意这种方式注册的事件，也无法传递 customEventData
       
    },
    
    nextPlayer: function() {
        this.curPlayerIdx++;
        if (this.curPlayerIdx >= playSeq.length) {
            this.curPlayerIdx = 0;
        }
    },
    
    initPlane: function() {
        //planeNum <= 4 
        for (var i = 0; i < this.playerSeq.length; ++i) {
            for (var num = 0; num < this.planeNum; num++) {
                var newPlane = cc.instantiate(this.planePrefab);
                var playerId = this.playerSeq[i];                    //从playerseq中得到player的id
                var startPosArray = this.player_planeStartPos[playerId];              //根据player的id得到起始放置点
                newPlane.playerId = playerId;
                newPlane.startPos =  startPosArray[num];
                this.node.addChild(newPlane);
                
                cc.log('resources/plane/plane_' + playerId.toString() + '.png');
                var realUrl = cc.url.raw('resources/plane/plane_' + playerId.toString() + '.png');
                var texture = cc.textureCache.addImage(realUrl);
                //newPlane.getComponent(cc.Sprite).spriteFrame.setTexture(texture);   //根据player更换素材
                newPlane.getChildByName('plane_pic').getComponent(cc.Sprite).spriteFrame.setTexture(texture); 
                newPlane.setPosition(newPlane.startPos);
            }
        }
    }
});
