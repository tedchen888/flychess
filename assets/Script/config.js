function PathNode(x, y, flag) {
    this.x = x;
    this.y = y;
    this.flag = flag;
}

var cfg = {    
    player_planePath:[],
    
    load: function() {
        cc.log('config load');
        var self = this;
        cc.loader.loadRes('map/map_data', function(err, txt){  
        //cc.loader.load(cc.url.raw('resources/map.dat'), function(err, txt){  
            if (err) {  
                cc.log(err);  
            }
            else {  
                //let list=res;  
                //cc.log("loadMap:"  + txt);  
                var map_json = JSON.parse(txt);
                self.player_planePath[0] = [];
                
                self.player_planePath[0] = [];
                self.parsePath(map_json.red, self.player_planePath[0]);                
                
                self.player_planePath[1] = [];
                self.parsePath(map_json.yellow, self.player_planePath[1]); 
                
                self.player_planePath[2] = [];
                self.parsePath(map_json.blue, self.player_planePath[2]); 
                
                self.player_planePath[3] = [];
                self.parsePath(map_json.green, self.player_planePath[3]); 
                
            }  
        });
    },
    
    parsePath: function(cfg, nodePathList) {
        cc.log(cfg);
        for (var node in cfg) {
            cc.log(node);
            for (var param in node) {
                //var x = param[0];
                //var y = param[1];
                //var flag = param[2];
                //nodePathList.push(new PathNode(x, y, flag));
                //cc.log("loadnode x:" + param[0].toString() + " y:" + param[1].toString() + "f:" + param[2].toString());
            }
        }
    }
};

var GameState = cc.Enum({
    Begining: 0,
    Rolling: 1,
    Playing: 2,
});

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

//config.load();

module.exports.cfg = cfg;
module.exports.gameState = GameState;
module.exports.role = Role;
module.exports.planeState = PlaneState;
