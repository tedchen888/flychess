cc.Class({
    extends: cc.Component,

    properties: {
        playerId: 0, //归属
        curPathIndex: 0, //当前步数，对应到自己路径数组的下标
        state: 0,//0-begining, 1-flying, 2-finished
        
        startPos: cc.p,
        plane_pic: cc.Sprite
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
