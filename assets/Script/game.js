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
        rollSprite: {
            default: null,
            type: cc.Sprite
        },
        rollSpriteTexture: [],
        rollTimer: 0,
        rollDuration: 0,
        
        INIT_POINT: 6, //允许出场点数
        rollPoint: 0,
        curPlayerIdx: 0, 
        gameStatus: cfg.gameState.Begining, //0-can roll, 1-rolling, 2-playing
        planeNum: 0,
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
        
        planePrefabSprite: [],
        
    },

    // use this for initialization
    onLoad: function () {
        //this.label.string = this.text;
        this.INIT_POINT = 6;
        this.rollPoint = 0;
        this.gameStatus = cfg.gameState.Begining;
        this.curPlayerIdx = 0;
        this.planeNum = 1;
        
        // 初始化计时器
        this.rollTimer = 0;
        this.rollDuration = 0;
        
        //this.playerSeq = new array();
        this.playerSeq[0] = cfg.role.Red;
        this.playerSeq[1] = cfg.role.Yellow;
        this.playerSeq[2] = cfg.role.Blue;
        //this.playerSeq[3] = cfg.role.Green;
        
        //this.player_planeStartPos = new array();
        this.player_planeStartPos[0] = [cc.p(-280,-115), cc.p(-208,-115), cc.p(-280,-201), cc.p(-208,-201)]; //PlayRoler.Red
        this.player_planeStartPos[1] = [cc.p(-280,438), cc.p(-208,438), cc.p(-208,352), cc.p(-280,352)]; //PlayRoler.Yellow
        this.player_planeStartPos[2] = [cc.p(208,438), cc.p(280,438), cc.p(280,352), cc.p(208,352)]; //PlayRoler.Blue
        this.player_planeStartPos[3] = [cc.p(208,-115), cc.p(280,-115), cc.p(280,-201), cc.p(208,-201)]; //PlayRoler.Green
        
        this.planePrefabSprite[0] = this.redSpriteFrame;
        this.planePrefabSprite[1] = this.yellowSpriteFrame;
        this.planePrefabSprite[2] = this.blueSpriteFrame;
        this.planePrefabSprite[3] = this.greenSpriteFrame;
        
        //加载骰子按钮素材
        this.rollSpriteTexture = [];
        for (var i = 0; i <= 6; i++) {
            var realUrl = cc.url.raw('resources/dices/dices_0' + i.toString() + ".png");
            this.rollSpriteTexture[i] = cc.textureCache.addImage(realUrl);
            cc.log(this.rollSpriteTexture[i]);
        }
        this.rollSprite.node.on(cc.Node.EventType.TOUCH_END, this.startRollDices, this);
        
        //初始化所有路径
        cfg.map.load();
        
        this.initPlane();
    },


    // called every frame
    update: function (dt) {
        //test red
        //if(this.rollPoint < cfg.map.player_planePath[3].length) {
        //    
        //
        //    var newPlane = cc.instantiate(this.planePrefab);
        //    this.node.addChild(newPlane);
        //    var nodePath = cfg.map.player_planePath[3][this.rollPoint];
        //    newPlane.setPosition(cc.p(nodePath.x, nodePath.y));
        //    this.rollPoint++;
        //}

        if (this.gameStatus == cfg.gameState.Rolling) {
            if (this.rollTimer > this.rollDuration) {
                this.endRollDices();
                return;
            }
        
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.rollSprite.getComponent(cc.Sprite).spriteFrame.setTexture(this.rollSpriteTexture[this.rollPoint]);
        }
        
        this.rollTimer += dt;
    },
    
    beginGame: function() {
        this.gameStatus = cfg.gameState.Begining;
        this.rollSprite.getComponent(cc.Sprite).spriteFrame.setTexture(this.rollSpriteTexture[0]); //显示为roll
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
        this.playerSeq.remove(this.curPlayerIdx);
        if (this.curPlayerIdx >= this.playerSeq.length) {
            this.curPlayerIdx = 0;
        }
        this.beginGame();
    },

    initPlane: function() {
        //planeNum <= 4 
        for (var i = 0; i < this.playerSeq.length; ++i) {
            for (var num = 0; num < this.planeNum; num++) {
                var newPlane = cc.instantiate(this.planePrefab);
                var playerId = this.playerSeq[i];                    //从playerseq中得到player的id
                var startPosArray = this.player_planeStartPos[playerId];              //根据player的id得到起始放置点
                newPlane.planeId = num;
                newPlane.playerId = playerId;
                newPlane.state = cfg.planeState.INIT;
                newPlane.startPos =  startPosArray[num];
                newPlane.curPathIndex = 0;
                this.node.addChild(newPlane);
                
                newPlane.getComponent(cc.Sprite).spriteFrame = this.planePrefabSprite[playerId];
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

    
    //骰子
    startRollDices: function (event) {
        if (this.gameStatus == cfg.gameState.Begining) {
            this.rollTimer = 0;
            this.rollDuration = 0.3; //3秒
            this.gameStatus = cfg.gameState.Rolling;
            //播放动画，结束后可以开始点击棋子飞行
            //todo
        }
    },
    endRollDices: function (event) {
        if (this.gameStatus == cfg.gameState.Rolling) {
           this.rollPoint = parseInt(cc.random0To1() * 6) + 1;
           this.debuglog.string = 'Player:' + this.curPlayerIdx + ' Point:' + this.rollPoint.toString();
           
           //显示为当前点数
           this.rollSprite.getComponent(cc.Sprite).spriteFrame.setTexture(this.rollSpriteTexture[this.rollPoint]);
           
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
        var pathList = cfg.map.player_planePath[plane.playerId];
        
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
        cc.log('cur planeidx:' + plane.curPathIndex+ ' maplen:' + pathList.length);
        cc.log('click plane, moveto:' + pathNode.x.toString() + "," + pathNode.y.toString() );
        //plane.setPosition(cc.p(pathNode.x, pathNode.y)); //得到在地图中的位置

        var tmpPath = [];
        tmpPath.push(cc.p(pathNode.x, pathNode.y)); //第1次移动
        
        //检查是否可以多飞一次，有飞越点可以飞2次
        if (pathNode.flag == 1) {
            plane.curPathIndex += 4;
            pathNode = pathList[plane.curPathIndex];
            tmpPath.push(cc.p(pathNode.x, pathNode.y));
            //再判断是否有飞越点
            if (pathNode.flag == 2) {
                plane.curPathIndex += 12;
                pathNode = pathList[plane.curPathIndex];
                tmpPath.push(cc.p(pathNode.x, pathNode.y));
            }
        }
        else if (pathNode.flag == 2) { //有飞越点
            plane.curPathIndex += 12;
            pathNode = pathList[plane.curPathIndex];
            tmpPath.push(cc.p(pathNode.x, pathNode.y));
            //再判断是否再飞
            if (pathNode.flag == 1) {
                plane.curPathIndex += 4;
                pathNode = pathList[plane.curPathIndex];
                tmpPath.push(cc.p(pathNode.x, pathNode.y));
            }
        }


        //移动动画，根据上述得到移动动作序列
        var flyAction = cc.moveTo(2, cc.p(pathNode.x, pathNode.y));
        var callback = cc.callFunc(this.endMovePlane, this, plane);
        var seq = cc.sequence(cc.moveBy(0.5, tmpPath[0].x, tmpPath[0].y), cc.moveBy(0.5, -200, 0));
        plane.runAction(flyAction, callback);
        
        return;
        //this.node.runAction(this.setFlyAction());
    },
    
    endMovePlane: function(plane) {
        //判断是否完成
        if (plane.curPathIndex == pathList.length-1) {
            plane.state = cfg.planeState.END;
            plane.setPosition(plane.startPos);
            plane.getComponent(cc.Sprite).spriteFrame = this.backSpriteFrame;
            
            if (this.checkPlayerWin()) {
                //todo,播放胜利动画
                //列表中移除当前玩家
                this.removePlayer();
                return;
            }
        }


        //检查碰撞
        this.checkConfict(plane);
        
        //还有一次机会
        if (this.rollPoint == this.INIT_POINT) {
            this.beginGame();
        } else {
            this.nextPlayer();//完成后开始下一轮
        }
    }
    
    checkConfict: function() {
        
    },
    
    //setFlyAction: function (plane) {
    //    // 跳跃上升
    //    var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
    //    // 下落
    //    var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
    //    // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
    //    //var callback = cc.callFunc(this.playJumpSound, this);
    //    // 不断重复，而且每次完成落地动作后调用回调来播放声音
    //    return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    //},
    
});
