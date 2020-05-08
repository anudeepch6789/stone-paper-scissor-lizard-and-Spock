const Spsls = artifacts.require("./Spsls.sol");


contract('Spsls', function(accounts){
    let instance;
    let player1 = accounts[3];
    let player2 = accounts[2];
    let owner = accounts[0];
    before(async() =>{
        instance = await Spsls.deployed();
    });

    it("Create a new game of type 1 i.e a 2-player game",async() => {
    	const game_type = 1;
        let ret = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
            assert.equal(ret, 1,"Failed to create new game")
    }
    )

    it("Create a new game with less than min ether --> error",async() => {
        const game_type = 1;
        try{
            let ret = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("0.5")})
        } catch(error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    }
    )

    it("Player2 joins the game successfully",async() => {
        const game_type = 1;
        const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
        let ret = await instance.join_game.call(game_no,{from:player2,value:web3.utils.toWei("1")})
        assert.equal(1, ret, "Player2 could not be added")
    }
    )

    it("Player tries to join a game that not created yet --> error",async() => {
        let amount = 10;
        const game_no = 1;
        try{
            let ret = await instance.join_game.call(game_no,{from:player2,value:web3.utils.toWei("1")})
        } catch(error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    }
    )

    it("Player1 makes two consecutive moves --> error ",async() => {
        const game_type = 1;
        inst = await Spsls.deployed()
        const value = 2;
        const key = 57;
        try{
            const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})
            await instance.move(game_no,value,key,{from:player1})
            await instance.move(game_no,value,key,{from:player1})

        } 
            catch(error) {
                err = error;
        }
        assert.ok(err instanceof Error);

    }
    )

    it("Player1 tries to make a move without revealing the key --> error ",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        
        try{
            const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})
            await instance.move(game_no,value,key,{from:player1})
            await instance.move(game_no,value,key,{from:player2})
            await instance.reveal(game_no,value,key,{from:player1})
            await instance.reveal(game_no,value,key,{from:player2})

            //Reveal phase finished for first game, tries to play without reveal below

            await instance.move(game_no,value,key,{from:player1})
            await instance.move(game_no,value,key,{from:player2})
            await instance.move(game_no,value,key,{from:player1})

        } 
            catch(error) {
                err = error;
        }
        assert.ok(err instanceof Error);

    }
    )

    it("Player tries to reveal with wrong key --> error ",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        
        try{
            const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
            await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})
            await instance.move(game_no,1,256,{from:player1})
            await instance.move(game_no,2,54,{from:player2})
            await instance.reveal(game_no,1,256,{from:player1})
            await instance.reveal(game_no,2,59,{from:player2})

        } 
            catch(error) {
                err = error;
        }
        assert.ok(err instanceof Error);
    }
    )
   
    it("Match1: Player2 wins and check money transfer",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        player2_initial_balance =await web3.eth.getBalance(player2);        
        const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})

//1 --> paper
//2 --> Lizard
//3 --> Rock
//4 --> scissors
//5 --> spock

        //Game 1: Player2 wins. Rock vs Paper -- Paper wins(2)
        await instance.move(game_no,3,245,{from:player1})
        await instance.move(game_no,1,456,{from:player2})
        await instance.reveal(game_no,3,245,{from:player1})
        await instance.reveal(game_no,1,456,{from:player2})

        //Game 2: Player1 wins. Lizard vs Spock -- Lizard wins(1)
        await instance.move(game_no,2,2435,{from:player1})
        await instance.move(game_no,5,4256,{from:player2})
        await instance.reveal(game_no,2,2435,{from:player1})
        await instance.reveal(game_no,5,4256,{from:player2})

        //Game 3: Player2 wins. Scissors vs Spock -- Scissors wins(2)
        await instance.move(game_no,4,34,{from:player1})
        await instance.move(game_no,5,41,{from:player2})
        await instance.reveal(game_no,4,34,{from:player1})
        await instance.reveal(game_no,5,41,{from:player2})

        //Game 4: Player2 wins. Paper vs Lizard -- Lizard wins(2)
        await instance.move(game_no,1,56,{from:player1})
        await instance.move(game_no,2,4566,{from:player2})
        await instance.reveal(game_no,1,56,{from:player1})
        await instance.reveal(game_no,2,4566,{from:player2})

        //Game 5: Player2 wins. Rock vs Rock -- Tie
        await instance.move(game_no,3,5,{from:player1})
        await instance.move(game_no,3,6,{from:player2})
        await instance.reveal(game_no,3,5,{from:player1})
        await instance.reveal(game_no,3,6,{from:player2})

        //Game 6: Player2 wins. Scissors vs Paper -- Scissors wins(1)
        await instance.move(game_no,4,31,{from:player1})
        await instance.move(game_no,1,78,{from:player2})
        await instance.reveal(game_no,4,31,{from:player1})
        await instance.reveal(game_no,1,78,{from:player2})

        //Game 7: Player2 wins. Spock vs Paper -- Paper wins (2)
        await instance.move(game_no,5,34,{from:player1})
        await instance.move(game_no,1,21,{from:player2})
        await instance.reveal(game_no,5,34,{from:player1})
        await instance.reveal(game_no,1,21,{from:player2})


        //Game 8: Player2 wins. Lizard vs Lizard -- Tie
        await instance.move(game_no,2,245,{from:player1})
        await instance.move(game_no,2,456,{from:player2})
        await instance.reveal(game_no,2,245,{from:player1})
        await instance.reveal(game_no,2,456,{from:player2})

        //Game 9: Player2 wins. Rock vs Lizard -- Rock wins (1)
        await instance.move(game_no,3,45,{from:player1})
        await instance.move(game_no,2,56,{from:player2})
        await instance.reveal(game_no,3,45,{from:player1})
        await instance.reveal(game_no,2,56,{from:player2})

        //Game 10: Player2 wins. Spock vs Spock -- Tie
        await instance.move(game_no,5,25,{from:player1})
        await instance.move(game_no,5,46,{from:player2})
        await instance.reveal(game_no,5,25,{from:player1})
        await instance.reveal(game_no,5,46,{from:player2})

        //Player 2 wins the match
        let result = await instance.get_winner.call(game_no);
        let player2_final_balance = await web3.eth.getBalance(player2);
        player2_gain = String(player2_initial_balance - player2_final_balance).charAt(0)
        assert.equal(result,2,"Player2 doesn't win")
        assert.equal("1",player2_gain,"Player2 doesn't have the right ether")

    } 
    )

    it("Reveal result before match ends --> error ",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        
        const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})

        //Game 1: Player2 wins. Rock vs Paper -- Paper wins(2)
        await instance.move(game_no,3,245,{from:player1})
        await instance.move(game_no,1,456,{from:player2})
        await instance.reveal(game_no,3,245,{from:player1})
        await instance.reveal(game_no,1,456,{from:player2})

        //Game 2: Player1 wins. Lizard vs Spock -- Lizard wins(1)
        await instance.move(game_no,2,2435,{from:player1})
        await instance.move(game_no,5,4256,{from:player2})
        await instance.reveal(game_no,2,2435,{from:player1})
        await instance.reveal(game_no,5,4256,{from:player2})

        try{

            let result = await instance.get_winner.call(game_no);
        }
            catch(error) {
                err = error;
        }
        assert.ok(err instanceof Error);

    } 
    )



    it("Match2: Ends in draw and check ether transfer to owner",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        
        const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})

//1 --> paper
//2 --> Lizard
//3 --> Rock
//4 --> scissors
//5 --> spock
        

        //Game 1: Player2 wins. Rock vs Paper -- Paper wins(2)
        await instance.move(game_no,3,245,{from:player1})
        await instance.move(game_no,1,456,{from:player2})
        await instance.reveal(game_no,3,245,{from:player1})
        await instance.reveal(game_no,1,456,{from:player2})

        //Game 2: Player1 wins. Lizard vs Spock -- Lizard wins(1)
        await instance.move(game_no,2,2435,{from:player1})
        await instance.move(game_no,5,4256,{from:player2})
        await instance.reveal(game_no,2,2435,{from:player1})
        await instance.reveal(game_no,5,4256,{from:player2})

        //Game 3: Player2 wins. Scissors vs Scissors -- Tie
        await instance.move(game_no,4,34,{from:player1})
        await instance.move(game_no,4,41,{from:player2})
        await instance.reveal(game_no,4,34,{from:player1})
        await instance.reveal(game_no,4,41,{from:player2})

        //Game 4: Player2 wins. Paper vs Lizard -- Lizard wins(2)
        await instance.move(game_no,1,56,{from:player1})
        await instance.move(game_no,2,4566,{from:player2})
        await instance.reveal(game_no,1,56,{from:player1})
        await instance.reveal(game_no,2,4566,{from:player2})

        //Game 5: Player2 wins. Rock vs Rock -- Tie
        await instance.move(game_no,3,5,{from:player1})
        await instance.move(game_no,3,6,{from:player2})
        await instance.reveal(game_no,3,5,{from:player1})
        await instance.reveal(game_no,3,6,{from:player2})

        //Game 6: Player2 wins. Scissors vs Paper -- Scissors wins(1)
        await instance.move(game_no,4,31,{from:player1})
        await instance.move(game_no,1,78,{from:player2})
        await instance.reveal(game_no,4,31,{from:player1})
        await instance.reveal(game_no,1,78,{from:player2})

        //Game 7: Player2 wins. Spock vs Paper -- Paper wins (2)
        await instance.move(game_no,5,34,{from:player1})
        await instance.move(game_no,1,21,{from:player2})
        await instance.reveal(game_no,5,34,{from:player1})
        await instance.reveal(game_no,1,21,{from:player2})


        //Game 8: Player2 wins. Lizard vs Lizard -- Tie
        await instance.move(game_no,2,245,{from:player1})
        await instance.move(game_no,2,456,{from:player2})
        await instance.reveal(game_no,2,245,{from:player1})
        await instance.reveal(game_no,2,456,{from:player2})

        //Game 9: Player2 wins. Rock vs Lizard -- Rock wins (1)
        await instance.move(game_no,3,45,{from:player1})
        await instance.move(game_no,2,56,{from:player2})
        await instance.reveal(game_no,3,45,{from:player1})
        await instance.reveal(game_no,2,56,{from:player2})

        //Game 10: Player2 wins. Spock vs Spock -- Tie
        await instance.move(game_no,5,25,{from:player1})
        await instance.move(game_no,5,46,{from:player2})
        await instance.reveal(game_no,5,25,{from:player1})
        await instance.reveal(game_no,5,46,{from:player2})

        //Player 2 wins the match
        let result = await instance.get_winner.call(game_no);
        assert.equal(result,3,"Match ain't tie")

    } 
    )
   
    it("Match3: Player1 wins and check ether transfer ",async() => {
        const game_type = 1;
        const value = 2;
        const key = 57;
        var player1_initial_balance = await web3.eth.getBalance(player1)

        const game_no = await instance.new_game.call(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.new_game(game_type,{from:player1,value:web3.utils.toWei("1")})
        await instance.join_game(game_no,{from:player2,value:web3.utils.toWei("1")})

//1 --> paper
//2 --> Lizard
//3 --> Rock
//4 --> scissors
//5 --> spock

        //Game 1: Player2 wins. Rock vs Paper -- Paper wins(2)
        await instance.move(game_no,3,245,{from:player1})
        await instance.move(game_no,1,456,{from:player2})
        await instance.reveal(game_no,3,245,{from:player1})
        await instance.reveal(game_no,1,456,{from:player2})

        //Game 2: Player1 wins. Lizard vs Spock -- Lizard wins(1)
        await instance.move(game_no,2,2435,{from:player1})
        await instance.move(game_no,5,4256,{from:player2})
        await instance.reveal(game_no,2,2435,{from:player1})
        await instance.reveal(game_no,5,4256,{from:player2})

        //Game 3: Player2 wins. Scissors vs Scissors -- Tie
        await instance.move(game_no,4,34,{from:player1})
        await instance.move(game_no,4,41,{from:player2})
        await instance.reveal(game_no,4,34,{from:player1})
        await instance.reveal(game_no,4,41,{from:player2})

        //Game 4: Player2 wins. Paper vs Lizard -- Lizard wins(2)
        await instance.move(game_no,1,56,{from:player1})
        await instance.move(game_no,2,4566,{from:player2})
        await instance.reveal(game_no,1,56,{from:player1})
        await instance.reveal(game_no,2,4566,{from:player2})

        //Game 5: Player2 wins. Rock vs Rock -- Tie
        await instance.move(game_no,3,5,{from:player1})
        await instance.move(game_no,3,6,{from:player2})
        await instance.reveal(game_no,3,5,{from:player1})
        await instance.reveal(game_no,3,6,{from:player2})

        //Game 6: Player2 wins. Scissors vs Paper -- Scissors wins(1)
        await instance.move(game_no,4,31,{from:player1})
        await instance.move(game_no,1,78,{from:player2})
        await instance.reveal(game_no,4,31,{from:player1})
        await instance.reveal(game_no,1,78,{from:player2})

        //Game 7: Player2 wins. Spock vs Paper -- Paper wins (2)
        await instance.move(game_no,5,34,{from:player1})
        await instance.move(game_no,1,21,{from:player2})
        await instance.reveal(game_no,5,34,{from:player1})
        await instance.reveal(game_no,1,21,{from:player2})


        //Game 8: Player2 wins. Lizard vs Lizard -- Tie
        await instance.move(game_no,2,245,{from:player1})
        await instance.move(game_no,2,456,{from:player2})
        await instance.reveal(game_no,2,245,{from:player1})
        await instance.reveal(game_no,2,456,{from:player2})

        //Game 9: Player2 wins. Rock vs Lizard -- Rock wins (1)
        await instance.move(game_no,3,45,{from:player1})
        await instance.move(game_no,2,56,{from:player2})
        await instance.reveal(game_no,3,45,{from:player1})
        await instance.reveal(game_no,2,56,{from:player2})

        //Game 10: Player2 wins. Spock vs Rock -- Tie
        await instance.move(game_no,5,25,{from:player1})
        await instance.move(game_no,3,46,{from:player2})
        await instance.reveal(game_no,5,25,{from:player1})
        await instance.reveal(game_no,3,46,{from:player2})

        //Player 2 wins the match
        let result = await instance.get_winner.call(game_no);
        var player1_final_balance = await web3.eth.getBalance(player1)

        player1_gain = String(player2_initial_balance - player1_final_balance).charAt(0)
        assert.equal(result,1,"Player1 doesn't win")
        assert.equal("1",player1_gain,"Player1 doesn't have the right ether")
    } 
    )

});