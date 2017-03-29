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
        curPlayerIdx: 0, 
        gameStatus: 0, //0-can roll, 1-rolling, 2-playing
        planeNum: 0,
        //顺序
        playerSeq: [],
        //机场
        player_planeStartPos: [],
        //路径
        player_planePath: [],
        
        redSpriteFrame: {
            default:null,
            type:cc.SpriteFrame
        },
        yellowSpriteFrame: {
            default:null,
            type:cc.SpriteFrame
        },
        blueSpriteFrame: {
            default:null,
            type:cc.SpriteFrame
        },
        greenSpriteFrame: {
            default:null,
            type:cc.SpriteFrame
        },
        
        planeList: {
            default: [],
            type: [cc.Node]
        },
        
        planePrefabSprite: []
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
        
        this.planePrefabSprite[0] = this.redSpriteFrame;
        this.planePrefabSprite[1] = this.yellowSpriteFrame;
        this.planePrefabSprite[2] = this.blueSpriteFrame;
        this.planePrefabSprite[3] = this.greenSpriteFrame;
        
        this.player_planePath[0] = [cc.p(-148,-215)];
        this.player_planePath[1] = [];
        this.player_planePath[2] = [];
        this.player_planePath[3] = [];
        
        this.initPlane();
    },

    // called every frame
    update: function (dt) {

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
                
                //cc.log('resources/plane/plane_' + playerId.toString() + '.png');
                //var realUrl = cc.url.raw('resources/plane/plane_' + playerId.toString() + '.png');
                //var texture = cc.textureCache.addImage(realUrl);
                newPlane.getComponent(cc.Sprite).spriteFrame = this.planePrefabSprite[playerId];
                //newPlane.getChildByName('plane_pic').getComponent(cc.Sprite).spriteFrame.setTexture(texture); 
                newPlane.setPosition(newPlane.startPos);
                
                //设置点击事件
                newPlane.on(cc.Node.EventType.TOUCH_END, this.onPlaneClick, this);
            }
        }
    },
    
    //骰子
    rollDices: function (event) {
        if (this.gameStatus == GameStateType.Begining) {
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.debuglog.string = 'Point:' + this.rollPoint.toString();
           this.gameStatus = GameStateType.Rolling;
           //播放动画，结束后可以开始飞行
           //todo
           
           this.gameStatus = GameStateType.Playing;
        }
    },
    //点击飞机
    onPlaneClick: function(event) {
        var plane = event.target;
        cc.log('click plane, owner:' + plane.playerId);
        
        if (this.gameStatus == GameStateType.Playing &&
            plane.playerId == this.playerSeq[this.curPlayerIdx]) {
            
            cc.log('click plane, owner:' + plane.playerId + ' you can fly.' );
            
            //fly
            this.movePlane(plane);
            
            //完整后开始下一轮
            this.nextPlayer();
            this.gameStatus = GameStateType.Begining;
        }
    },
    //移动飞机
    movePlane: function(plane) {
        //根据点数(步数)和当前位置得到下一个位置
        var path = this.player_planePath[plane.playerId];
       
        if (plane.curPathIndex + this.rollPoint < path.length) {
             plane.curPathIndex += this.rollPoint;  //当前步数加上点数
        } else { //回退N步
            plane.curPathIndex += (plane.curPathIndex + this.rollPoint - path.length);
        }
        
        plane.setPosition(path[plane.curPathIndex]); //得到在地图中的位置
    }
});
