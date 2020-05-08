pragma solidity ^0.5.0;


// creating contract
//1 --> paper
//2 --> Lizard
//3 --> Rock
//4 --> scissors
//5 --> spock


contract Spsls{
    
    
    address payable public owner;
    address payable this;
    uint256 private number_game;
    constructor() public{
        owner = msg.sender;
        number_game = 0;
    }
    
    // add_player1 stores address of player 1
    // add_player2 stores address of player 2
    // turn_player Fnestores the turn of the player    
    // game_result array stores the result of every round of the game
    // '0'  represents that game is not completed 1 is for player 1 won the game , 2 for player 2 won the game , 3 for the game result draw
    struct Game{
        address payable player1;
        address payable player2;
        uint256 no_game;
        uint256 [11] game_result;
        uint256 val1;
        uint256 valid1;
        uint256 valid2;
        uint256 val2;
        uint256 status;
        uint256 oneWon;
        uint256 twoWon;
        uint256 player1_time;
        uint256 player2_time;
        uint256 draw;
        uint256 hash1;
        uint256 hash2;
        uint256 typeGame;
        uint256 random;
        uint256 randomPlayerChoice;
        uint256 round_status;
    }
    
    
    // games stores all the games
    
    
    mapping(uint256 => Game) private games;

    // odd value in turn_player represents that 1st player turn , even values shows its turn of 2nd player
    function new_game(uint256 choice) public payable returns(uint id){
        
        require(msg.value== 1 ether );
        require(msg.sender != owner);
        Game memory game;
        
        // making turn as 1

        // incrementing the game number
        number_game++;
        
        // making the game between the player is 1
        game.no_game = 1;
        game.player1 = msg.sender;
        // making all the 10 results as 0 
        for(uint i=0;i<10;i++)
            game.game_result[i] = 0;
        
        //setting values as 0 
        game.val1 = 10;
        game.val2 = 10;
        game.oneWon = 0;
        game.twoWon = 0;
        game.draw = 0;
        
        game.valid1 = 0;
        game.valid2 = 0;
        game.hash1 = 10;
        game.hash2 = 10;
        // status says whether the 10 rounds are completed or not
        game.status = 0;
        game.round_status = 0;
        game.typeGame = choice;
        game.random = 1;
        //emit game_Created(number_game, msg.sender);
        games[number_game] = game;
        return number_game;
        
    }
    
    // functio to store the address of players and checks whether the id of the game is valid or not
    
    function join_game(uint _id) public payable returns(uint status_game){
        
        require(msg.sender != owner);
        require(number_game >= _id);
        require(games[_id].typeGame == 1);        
                
        if(games[_id].player2 == address(0)){
            require(msg.value==  1 ether);
            games[_id].player2 = msg.sender;
            return 1;
        }        
        return 0;
    }


    function get_winner(uint _id) public returns (uint256 result){
        require(games[_id].no_game >= 10);

        games[_id].status = 1;
        for(uint256  i=0;i<10;i++){
            if(games[_id].game_result[i]==1)
                games[_id].oneWon++;
            else if(games[_id].game_result[i]==2)
                games[_id].twoWon++;
            else
                games[_id].draw++;
        }
        
        if(games[_id].typeGame == 1){
            if( games[_id].oneWon > games[_id].twoWon){
                address(games[_id].player1).transfer(2 ether);
                return 1;
                }
            else if( games[_id].oneWon < games[_id].twoWon){
                address(games[_id].player2).transfer(2 ether);
                return 2;            
            }
            else
                address(owner).transfer(2 ether);
            return 3;
        }
        else if(games[_id].typeGame == 2){
            if( games[_id].oneWon > games[_id].twoWon){
                address(games[_id].player1).transfer(2 ether);
                return 1;
                }
            else
                address(owner).transfer(2 ether);
            return 3;
        }
    }
   
    function move(uint256 _id,uint value, uint key) public {
        uint256 winner_calc;
        require(_id <= number_game);
        require(games[_id].no_game <= 10); 
        require(games[_id].round_status != 2);
        
        if(games[_id].typeGame == 2 && msg.sender == games[_id].player1){
            games[_id].player2_time = games[_id].player1_time;
            games[_id].val2 = uint256(keccak256(abi.encodePacked(block.timestamp)))%5 + 1;
            games[_id].round_status = 2;
            winner_calc = winner(games[_id].val1,games[_id].randomPlayerChoice);
            games[_id].game_result[games[_id].no_game]=winner_calc;
            games[_id].round_status = 0;
            games[_id].hash1 = 10;

        }

        else if(msg.sender == games[_id].player1)
        {
            require(games[_id].hash1 == 10);
            games[_id].hash1 = uint256(keccak256(abi.encodePacked(key+value)));
            games[_id].player1_time = now;
            games[_id].round_status += 1;
        }
        
        else if(msg.sender == games[_id].player2)
        {
            require(games[_id].hash2 == 10);
            games[_id].hash2 = uint256(keccak256(abi.encodePacked(key+value)));
            games[_id].player2_time = now;
            games[_id].round_status += 1;
            
        }
    }


    function reveal(uint _id,uint value,uint key) public {
        uint res;
        uint256 time_out = 10;
        require(games[_id].round_status == 2);
        if(msg.sender == games[_id].player1){
            if(games[_id].hash1 == uint256(keccak256(abi.encodePacked(value+key)))){
                games[_id].valid1 = 1;
                games[_id].val1 = value;
            }
            else
                require(games[_id].val1 == uint256(keccak256(abi.encodePacked(value+key))));
        }
        else if(msg.sender == games[_id].player2){
            if(games[_id].hash2 == uint256(keccak256(abi.encodePacked(value+key)))){
                games[_id].valid2 = 1;
                games[_id].val2 = value;
            }
            else
                require(games[_id].val2 == uint256(keccak256(abi.encodePacked(value+key))));
        }
        if(games[_id].valid1 == 1 && games[_id].valid2 == 1){
            if(games[_id].player1_time - games[_id].player2_time > time_out || games[_id].player2_time - games[_id].player1_time > time_out ){
                res = 3; 
            }
            res = winner(games[_id].val1,games[_id].val2);
            games[_id].game_result[games[_id].no_game-1] = res;
            games[_id].no_game++;
            games[_id].valid1 =0;
            games[_id].valid2 = 0;
            games[_id].round_status = 0;
            games[_id].hash1 = 10;
            games[_id].hash2 = 10;
        }
    }



        
    function winner(uint256 choice1,uint256 choice2) private pure returns(uint256 result){
        
             if(choice1 == 1)
            {
                if(choice2==3 || choice2==5)
                   return 1;
                else if(choice2 == 2 || choice2 == 4)
                   return 2;
                else
                    return 3;
            }
            else if(choice1 == 2)
            {
                if(choice2 == 5 || choice2 == 1)
                   return 1;
                else if(choice2 == 3 || choice2 == 4)
                   return 2;
                else
                    return 3;
            }
            else if(choice1 == 3)
            {
                if(choice2 == 4 || choice2 == 2)
                   return 1;
                else if(choice2==1 || choice2==5)
                   return 2;
                else
                    return 3;
            }
            else if(choice1 == 4)
            {
                if(choice2 == 1 || choice2 == 2)
                   return 1;
                else if(choice2==3 || choice2==5)
                   return 2;
                else
                    return 3;
            }
            else
            {
                if(choice2 == 4 || choice2 == 3)
                   return 1;
                else if(choice2==1 || choice2 == 2)
                   return 2;
                else
                    return 3;
            }
    }
}
