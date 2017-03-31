function PathNode(x, y, flag) {
    this.x = x;
    this.y = y;
    this.flag = flag;
}

var map = {    
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
                //cc.log(map_json.red);
                
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
        //cc.log(cfg);
        for (var i = 0; i < cfg.length; ++i) {
            var x = cfg[i][0];
            var y = cfg[i][1];
            var flag = cfg[i][2];
            nodePathList.push(new PathNode(x, y, flag));
            //cc.log("loadnode x:" + x.toString() + " y:" + y.toString() + "f:" + flag.toString());
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

module.exports.map = map;
module.exports.gameState = GameState;
module.exports.role = Role;
module.exports.planeState = PlaneState;
