
var Role = cc.Enum({
    Red: 0,
    Yellow: 1,
    Blue: 2,
    Green: 3,
});

var PlaneState = cc.Enum({
    INIT: 0,
    FLYING: 1,
    END: 2,
});

var Config = {    
    planeNum: 4,
    selectP0: true,
    selectP1: true,
    selectP2: true,
    selectP3: true,
    enginePoint: 6, //可以启动的点数
    
    //setPlaneNum: function(num) {
    //    this.planeNum = num;
    //},
    
    
};

module.exports.role = Role;
module.exports.planeState = PlaneState;
module.exports.config = Config;
