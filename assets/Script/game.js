var cfg = require("config");
var map = require("fly_map");
var gameState = require("gameState");

function PathNode(x, y, flag) {
    this.x = x;
    this.y = y;
    this.flag = flag;
}
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
        rollSprite: {
            default: null,
            type: cc.Sprite
        },
        rollSpriteFrame: {
            default: [],
            type: [cc.SpriteFrame]
        },
        rollTimer: 0,
        rollDuration: 0,
        
        INIT_POINT: 6, //允许出场点数
        rollInitPointTime: 0, //连续6点的次数
        rollPoint: 0,
        curPlayerIdx: 0, 
        //gameStatus: cfg.gameState.Begining, //0-can roll, 1-rolling, 2-playing
        //顺序
        playerSeq: [],
        //机场
        player_planeStartPos: [],
        
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
        backSpriteFrame: {
            default:null,
            type:cc.SpriteFrame
        },
        
        planeList: {
            default: [],
            type: [cc.Node]
        },
        
        planePrefabSprite: {
            default: [],
            type: [cc.SpriteFrame]
        },
        
        //音效
        dicesAudio: {
            default: null,
            url: cc.AudioClip
        },
        moveAudio: {
            default: null,
            url: cc.AudioClip
        },
        flyAudio: {
            default: null,
            url: cc.AudioClip
        },
        crashAudio: {
            default: null,
            url: cc.AudioClip
        },
        winOneAudio: {
            default: null,
            url: cc.AudioClip
        },
        winAllAudio: {
            default: null,
            url: cc.AudioClip
        },
    },

    // use this for initialization
    onLoad: function () {
        gameState.init();
        
        //this.label.string = this.text;
        this.INIT_POINT = 6;
        this.rollPoint = 0;
        //this.gameStatus = cfg.gameState.Begining;
        this.curPlayerIdx = 0;
        
        // 初始化计时器
        this.rollTimer = 0;
        this.rollDuration = 0;
        
        if (cfg.config.selectP0) {
            this.playerSeq.push(cfg.role.Red);
        }
        if (cfg.config.selectP1) {
            this.playerSeq.push(cfg.role.Yellow);
        }
        if (cfg.config.selectP2) {
            this.playerSeq.push(cfg.role.Blue);
        }
        if (cfg.config.selectP3) {
            this.playerSeq.push(cfg.role.Green);
        }
        
        this.player_planeStartPos[0] = [cc.p(-280,-115), cc.p(-208,-115), cc.p(-280,-201), cc.p(-208,-201)]; //PlayRoler.Red
        this.player_planeStartPos[1] = [cc.p(-280,438), cc.p(-208,438), cc.p(-208,352), cc.p(-280,352)]; //PlayRoler.Yellow
        this.player_planeStartPos[2] = [cc.p(208,438), cc.p(280,438), cc.p(280,352), cc.p(208,352)]; //PlayRoler.Blue
        this.player_planeStartPos[3] = [cc.p(208,-115), cc.p(280,-115), cc.p(280,-201), cc.p(208,-201)]; //PlayRoler.Green
        
        //骰子事件
        this.rollSprite.node.on(cc.Node.EventType.TOUCH_END, this.startRollDices, this);
        
        //初始化所有路径
        map.load();
        
        this.initAllPlane();
        
        this.beginGame();
    },


    // called every frame
    update: function (dt) {
        //test red
        //if(this.rollPoint < map.player_planePath[3].length) {
        //    
        //
        //    var newPlane = cc.instantiate(this.planePrefab);
        //    this.node.addChild(newPlane);
        //    var nodePath = map.player_planePath[3][this.rollPoint];
        //    newPlane.setPosition(cc.p(nodePath.x, nodePath.y));
        //    this.rollPoint++;
        //}

        if (gameState.isRolling()) {
            if (this.rollTimer > this.rollDuration) {
                this.endRollDices();
                return;
            }
        
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.rollSprite.getComponent(cc.Sprite).spriteFrame = this.rollSpriteFrame[this.rollPoint];
        }
        
        this.rollTimer += dt;
    },
    
    beginGame: function() {
        gameState.init();
        this.rollSprite.getComponent(cc.Sprite).spriteFrame = this.rollSpriteFrame[0]; //显示为roll
        //this.debuglog.string = '    Turn to Player:' + this.playerSeq[this.curPlayerIdx];
    },
    
    //下一个玩家
    nextPlayer: function() {
        this.curPlayerIdx++;
        if (this.curPlayerIdx >= this.playerSeq.length) {
            this.curPlayerIdx = 0;
        }
        
        this.beginGame();
    },
    //移除玩家
    removePlayer: function() {
        this.playerSeq.splice(this.curPlayerIdx, 1);
        if (this.curPlayerIdx >= this.playerSeq.length) {
            this.curPlayerIdx = 0;
        }
        if (this.playerSeq.length === 0) {
            //game over
            gameState.over();
        } else {
            this.beginGame();
        }
    },

    newPlane: function(planeId, playerId) {
        var plane = cc.instantiate(this.planePrefab);
        plane.planeId = planeId;
        plane.playerId = playerId;
        plane.getComponent(cc.Sprite).spriteFrame = this.planePrefabSprite[playerId];
        this.node.addChild(plane);
        //设置点击事件
        plane.on(cc.Node.EventType.TOUCH_END, this.onPlaneClick, this);
        return plane;
    },
    initPlane1: function(plane) {
        var startPosArray = this.player_planeStartPos[plane.playerId];
        plane.startPos =  startPosArray[plane.planeId];
        plane.state = cfg.planeState.INIT;
        plane.setPosition(plane.startPos);
    },
    initAllPlane: function() {
        //planeNum <= 4 
        for (var i = 0; i < this.playerSeq.length; ++i) {
            for (var num = 0; num < cfg.config.planeNum; num++) {
                var playerId = this.playerSeq[i];  
                var plane = this.newPlane(num, playerId);
                this.initPlane1(plane);
                this.planeList.push(plane);
                //test
                //if (i === 0 && num ===0) {
                //    plane.state = cfg.planeState.FLYING;
                //    plane.curPathIndex = 16;
                //}
                //if (i === 1 && num ===0) {
                //    plane.state = cfg.planeState.FLYING;
                //    plane.curPathIndex = 1;
                //}
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
    //检查是否胜利
    checkPlayerWin: function() {
        for (var i = 0; i < this.planeList.length; ++i) {
            if (this.planeList[i].playerId == this.playerSeq[this.curPlayerIdx]
                && this.planeList[i].state != cfg.planeState.END) {
                return false;
            }
        }
        return true;
    },
    //rollback回退所有棋子
    rollbackPlayer: function() {
        for (var i = 0; i < this.planeList.length; ++i) {
            if (this.planeList[i].playerId == this.playerSeq[this.curPlayerIdx]
                && this.planeList[i].state != cfg.planeState.END) {
                this.planeList[i].curPathIndex = 0;
                this.planeList[i].state = cfg.planeState.INIT;
                this.planeList[i].setPosition(this.planeList[i].startPos);
            }
        }
        return true;
    },
    
    
    //骰子
    startRollDices: function (event) {
        if (gameState.isBegin()) {
            this.rollTimer = 0;
            this.rollDuration = 0.3; //3秒
            gameState.rolling();
            cc.audioEngine.playEffect(this.dicesAudio, false);
        }
    },
    endRollDices: function (event) {
        if (gameState.isRolling()) {
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.debuglog.string = 'Player:' + this.playerSeq[this.curPlayerIdx] + ' Point:' + this.rollPoint.toString();
           
           //连续3次6点全部回到原点
           if (this.rollPoint === this.INIT_POINT) {
               this.rollInitPointTime++;
               if (this.rollInitPointTime >= 3) {
                   this.rollbackPlayer();
                   this.nextPlayer();
                   this.rollInitPointTime = 0;
                   return;
               }
           } else {
               this.rollInitPointTime = 0;
           }
           
           //显示为当前点数
           this.rollSprite.getComponent(cc.Sprite).spriteFrame = this.rollSpriteFrame[this.rollPoint];
           
           //判断是否有已出场的，没有则直接下一个玩家
           if (this.rollPoint != this.INIT_POINT && !this.checkPlaneState()) {
               this.nextPlayer();
               return;
           }
           else {
               gameState.playing();
           }
        }
    },
    
    
    //点击飞机
    onPlaneClick: function(event) {
        var plane = event.target;
        //cc.log('click plane, owner:' + plane.playerId);
        
        if (!gameState.isPlaying()) {
            //cc.log('click plane, game not running!');
            return;
        }
        if (plane.playerId != this.playerSeq[this.curPlayerIdx]) {
            //cc.log('click plane, your are not cur player! id:' + plane.playerId.toString() +' cur:' + this.playerSeq[this.curPlayerIdx].toString());
            return;
        }
        
        switch (plane.state) {
            case cfg.planeState.INIT:
                if (this.rollPoint == this.INIT_POINT) {
                    //放到起飞点
                    //cc.log('click plane, owner:' + plane.playerId + ' you can start.' );
                    this.movePlane(plane, true);
                }
                break;
            case cfg.planeState.FLYING:
                //飞行中的点击
                //cc.log('click plane, owner:' + plane.playerId + ' you can fly.' );
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
        var pathList = map.player_planePath[plane.playerId];
        
        if (isStart) { //放到起飞点
            plane.curPathIndex = 0;
            plane.state = cfg.planeState.FLYING;
        }
        else {
            if (plane.curPathIndex + this.rollPoint < pathList.length) {
                 plane.curPathIndex += this.rollPoint;  //当前步数加上点数
            } else { //回退N步
                plane.curPathIndex = pathList.length - 1 - (this.rollPoint - (pathList.length - 1 - plane.curPathIndex));
            }
        }
        
        var pathNode = pathList[plane.curPathIndex];
        //cc.log('cur planeidx:' + plane.curPathIndex+ ' maplen:' + pathList.length);
        //cc.log('click plane, moveto:' + pathNode.x.toString() + "," + pathNode.y.toString() );
        //plane.setPosition(cc.p(pathNode.x, pathNode.y)); //得到在地图中的位置

        cc.audioEngine.playEffect(this.moveAudio, false);  //移动音效
        
        let mAction = cc.moveTo(0.5, pathNode.x, pathNode.y);
        let tmpPathAction = [mAction];
        
        var callbackFlyAudio = cc.callFunc(this.flyActionAudio, this);
        
        //检查是否可以多飞一次，有飞越点可以飞2次
        if (pathNode.flag == 1) {
            tmpPathAction.push(callbackFlyAudio); //先播放飞行音效再移动
            
            plane.curPathIndex += 4;
            pathNode = pathList[plane.curPathIndex];
            tmpPathAction.push(cc.moveTo(0.5, cc.p(pathNode.x, pathNode.y)));
            
            //再判断是否有飞越点
            if (pathNode.flag == 2) {
                tmpPathAction.push(callbackFlyAudio); //先播放飞行音效再移动
                
                plane.curPathIndex += 12;
                pathNode = pathList[plane.curPathIndex];
                tmpPathAction.push(cc.moveTo(0.5, cc.p(pathNode.x, pathNode.y)));
            }
        }
        else if (pathNode.flag == 2) { //有飞越点
            tmpPathAction.push(callbackFlyAudio); //先播放飞行音效再移动
        
            plane.curPathIndex += 12;
            pathNode = pathList[plane.curPathIndex];
            tmpPathAction.push(cc.moveTo(0.5, cc.p(pathNode.x, pathNode.y)));
            //再判断是否再飞
            if (pathNode.flag == 1) {
                tmpPathAction.push(callbackFlyAudio); //先播放飞行音效再移动
                
                plane.curPathIndex += 4;
                pathNode = pathList[plane.curPathIndex];
                tmpPathAction.push(cc.moveTo(0.5, cc.p(pathNode.x, pathNode.y)));
            }
        }


        //移动动画，根据上述得到移动动作序列
        var callback = cc.callFunc(this.endMovePlane, this, plane);
        tmpPathAction.push(callback);
        
        var flyAction = cc.sequence(tmpPathAction);
        plane.runAction(flyAction);
        
        return;
    },
    
    endMovePlane: function(plane) {
        //cc.log('end move plane.'+ plane);
        var pathList = map.player_planePath[plane.playerId];
        //判断是否完成
        if (plane.curPathIndex == pathList.length-1) {
            plane.state = cfg.planeState.END;
            plane.setPosition(plane.startPos);
            plane.getComponent(cc.Sprite).spriteFrame = this.backSpriteFrame;
            
            cc.audioEngine.playEffect(this.winOneAudio, false);
            if (this.checkPlayerWin()) {
                //todo,播放胜利动画
                //列表中移除当前玩家
                this.removePlayer();
                cc.audioEngine.playEffect(this.winAllAudio, false);
                return;
            }
        }

        //检查碰撞
        this.checkConfict(plane, pathList[plane.curPathIndex].x, pathList[plane.curPathIndex].y);
        
        //还有一次机会
        if (this.rollPoint == this.INIT_POINT) {
            this.beginGame();
        } else {
            this.nextPlayer();//完成后开始下一轮
        }
    },
    flyActionAudio: function() {
        cc.audioEngine.playEffect(this.flyAudio, false);
    },
    
    
    checkConfict: function(plane, x, y) {
        var curPlayerId = this.playerSeq[this.curPlayerIdx];
        
        for (var i = 0; i < this.planeList.length; ++i) 
        {
            var plane_i = this.planeList[i];
            if (plane_i.playerId != curPlayerId
                && plane_i.state == cfg.planeState.FLYING)
            {
                //获得该飞机当前所在的路径点
                //cc.log('check confict. playid:' + plane_i.playerId + ' curPathIndex:' + plane_i.curPathIndex);
                
                var thisPlanePosition = map.player_planePath[plane_i.playerId][plane_i.curPathIndex];
                
                //检查坐标是否相等
                if (thisPlanePosition.x == x && thisPlanePosition.y == y) 
                {
                    //播放撞击音效
                    cc.audioEngine.playEffect(this.crashAudio, false);
                    
                    //初始化被撞击飞机
                    this.initPlane1(plane_i);
                }
            }
        }
    },
    
});
