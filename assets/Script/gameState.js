var GameState = cc.Enum({
    Begining: 0,
    Rolling: 1,
    Playing: 2,
    Over: 3,
});


var gameState = {    
    state: GameState.Begining,
    
    init: function() {
        this.state = GameState.Begining;
    },
    
    isBegin: function() {
        if (this.state == GameState.Begining) {
            return true;
        }    
        return false;
    },
    isRolling: function() {
        if (this.state == GameState.Rolling) {
            return true;
        }    
        return false;
    },
    rolling: function() {
        this.state = GameState.Rolling;
    },
    isPlaying: function() {
        if (this.state == GameState.Playing) {
            return true;
        }    
        return false;
    },
    playing: function() {
        this.state = GameState.Playing;
    },
    isOver: function() {
        if (this.state == GameState.Over) {
            return true;
        }    
        return false;
    },
    over: function() {
        this.state = GameState.Over;
    }
};


module.exports = gameState;

