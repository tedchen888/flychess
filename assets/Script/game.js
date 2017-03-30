var cfg = require("config");

function PathNode(x, y, flag) {
    this.x = x;
    this.y = y;
    this.flag = flag;
}
/*
var PathNode = cc.Class(
    {
        name:'PathNode',
        properties: {
            x: 0,
            y: 0,
            flag: 0, //普通路径节点，1-可飞行节点， 2-双飞节点
        }
}); //路径节点类
*/
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
        
        INIT_POINT: 6, //允许出场点数
        rollPoint: 0,
        curPlayerIdx: 0, 
        gameStatus: cfg.gameState.Rolling, //0-can roll, 1-rolling, 2-playing
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
        
        planePrefabSprite: [],
        
    },

    // use this for initialization
    onLoad: function () {
        //this.label.string = this.text;
        this.btn_dices.node.on('click', this.rollDices, this);
        this.INIT_POINT = 6;
        this.rollPoint = 0;
        this.gameStatus = cfg.gameState.Begining;
        this.curPlayerIdx = 0;
        this.planeNum = 4;
        
        //this.playerSeq = new array();
        this.playerSeq[0] = cfg.role.Red;
        this.playerSeq[1] = cfg.role.Yellow;
        this.playerSeq[2] = cfg.role.Blue;
        this.playerSeq[3] = cfg.role.Green;
        
        //this.player_planeStartPos = new array();
        this.player_planeStartPos[0] = [cc.p(-280,-115), cc.p(-208,-115), cc.p(-280,-201), cc.p(-208,-201)]; //PlayRoler.Red
        this.player_planeStartPos[1] = [cc.p(-280,438), cc.p(-208,438), cc.p(-208,352), cc.p(-280,352)]; //PlayRoler.Yellow
        this.player_planeStartPos[2] = [cc.p(208,438), cc.p(280,438), cc.p(280,352), cc.p(208,352)]; //PlayRoler.Blue
        this.player_planeStartPos[3] = [cc.p(208,-115), cc.p(280,-115), cc.p(280,-201), cc.p(208,-201)]; //PlayRoler.Green
        
        this.planePrefabSprite[0] = this.redSpriteFrame;
        this.planePrefabSprite[1] = this.yellowSpriteFrame;
        this.planePrefabSprite[2] = this.blueSpriteFrame;
        this.planePrefabSprite[3] = this.greenSpriteFrame;
        
        //初始化所有路径
        this.genPathNode();
        
        this.initPlane();
    },

    //初始化路径
    genPathNode: function() {

        
        this.player_planePath[0] = [];
        this.player_planePath[0].push(new PathNode(-148,-220, 0));
        this.player_planePath[0].push(new PathNode(-113,-179, 0));
        this.player_planePath[0].push(new PathNode(-132,-136, 1));
        this.player_planePath[0].push(new PathNode(-132,-94, 0));
        this.player_planePath[0].push(new PathNode(-116,-52, 0));
        
        this.player_planePath[1] = [];
        
        this.player_planePath[2] = [];
        
        this.player_planePath[3] = [];
        
        cfg.cfg.load();
    },


    // called every frame
    update: function (dt) {
        //test red
        if(this.rollPoint < this.player_planePath[0].length) {
            
        
            var newPlane = cc.instantiate(this.planePrefab);
            this.node.addChild(newPlane);
            var nodePath = this.player_planePath[0][this.rollPoint];
            newPlane.setPosition(cc.p(nodePath.x, nodePath.y));
            this.rollPoint++;
        }
    },
    
    nextPlayer: function() {
        this.curPlayerIdx++;
        if (this.curPlayerIdx >= this.playerSeq.length) {
            this.curPlayerIdx = 0;
        }
        this.gameStatus = cfg.gameState.Begining;
    },
    
    initPlane: function() {
        //planeNum <= 4 
        for (var i = 0; i < this.playerSeq.length; ++i) {
            for (var num = 0; num < this.planeNum; num++) {
                var newPlane = cc.instantiate(this.planePrefab);
                var playerId = this.playerSeq[i];                    //从playerseq中得到player的id
                var startPosArray = this.player_planeStartPos[playerId];              //根据player的id得到起始放置点
                newPlane.playerId = playerId;
                newPlane.state = cfg.planeState.INIT;
                newPlane.startPos =  startPosArray[num];
                this.node.addChild(newPlane);
                
                //cc.log('resources/plane/plane_' + playerId.toString() + '.png');
                //var realUrl = cc.url.raw('resources/plane/plane_' + playerId.toString() + '.png');
                //var texture = cc.textureCache.addImage(realUrl);
                newPlane.getComponent(cc.Sprite).spriteFrame = this.planePrefabSprite[playerId];
                //newPlane.getChildByName('plane_pic').getComponent(cc.Sprite).spriteFrame.setTexture(texture); 
                newPlane.setPosition(newPlane.startPos);
                this.planeList.push(newPlane);
                
                //设置点击事件
                newPlane.on(cc.Node.EventType.TOUCH_END, this.onPlaneClick, this);
            }
        }
    },
    
    //检查是否有flying的飞机
    checkPlaneState: function() {
        for (var i = 0; i < this.planeList.length; ++i) {
            if (this.planeList[i].playerId == this.playerSeq[this.curPlayerIdx]
                && this.planeList[i].state == cfg.planeState.FLYING) {
                return true;
            }
        }
        return false;
    },
    
    //骰子
    rollDices: function (event) {
        if (this.gameStatus == cfg.gameState.Begining) {
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.debuglog.string = 'Player:' + this.curPlayerIdx + ' Point:' + this.rollPoint.toString();
           this.gameStatus = cfg.gameState.Rolling;
           //播放动画，结束后可以开始点击棋子飞行
           //todo
           
           //判断是否有已出场的，没有则直接下一个玩家
           if (this.rollPoint != this.INIT_POINT && !this.checkPlaneState()) {
               this.nextPlayer();
               return;
           }
           else {
               this.gameStatus = cfg.gameState.Playing;
           }
        }
    },
    //点击飞机
    onPlaneClick: function(event) {
        var plane = event.target;
        cc.log('click plane, owner:' + plane.playerId);
        
        if (this.gameStatus != cfg.gameState.Playing) {
            cc.log('click plane, game not running!');
            return;
        }
        if (plane.playerId != this.playerSeq[this.curPlayerIdx]) {
            cc.log('click plane, your are not cur player! id:' + plane.playerId.toString() +' cur:' + this.playerSeq[this.curPlayerIdx].toString());
            return;
        }
        
        switch (plane.state) {
            case cfg.planeState.INIT:
                if (this.rollPoint == this.INIT_POINT) {
                    //放到起飞点
                    cc.log('click plane, owner:' + plane.playerId + ' you can start.' );
                    this.movePlane(plane, true);
                }
                break;
            case cfg.planeState.FLYING:
                //飞行中的点击
                cc.log('click plane, owner:' + plane.playerId + ' you can fly.' );
                this.movePlane(plane, false);
                break;
            case cfg.planeState.COMPLETE:
                //已完成的飞机不作处理
                break;
        }
    },
    
    //移动飞机
    movePlane: function(plane, isStart) {
        //根据点数(步数)和当前位置得到下一个位置
        var pathList = this.player_planePath[plane.playerId];
        
        if (isStart) { //放到起飞点
            plane.curPathIndex = 0;
            plane.state = 1;
        }
        else {
            if (plane.curPathIndex + this.rollPoint < pathList.length) {
                 plane.curPathIndex += this.rollPoint;  //当前步数加上点数
            } else { //回退N步
                plane.curPathIndex += (plane.curPathIndex + this.rollPoint - pathList.length);
            }
        }
        
        var pathNode = pathList[plane.curPathIndex];
        cc.log('cur planeidx:' + plane.curPathIndex);
        cc.log('click plane, moveto:' + pathNode.x.toString() + "," + pathNode.y.toString() );
        plane.setPosition(cc.p(pathNode.x, pathNode.y)); //得到在地图中的位置

        //检查碰撞
        this.checkConfict(plane);
        
        if (this.rollPoint == this.INIT_POINT) {
            //还有一次机会
            this.gameStatus = cfg.gameState.Begining;
        } else {
            this.nextPlayer();//完成后开始下一轮
        }
    },
    
    checkConfict: function() {
        
    }
});
