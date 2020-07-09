/// SETUP ///

const SteamAPI = require('steamapi');
const steam = new SteamAPI("DD5D126C29EED3972000CE74F8BFBAA4");
var me = "76561198037408655";


/// INTERMEDIATE FUNCTIONS ///

var friendsUsernames = ['Gavin8a2can','MisterE', 'thialfi'];
var gameses = [];

/// Fill an array friendsUsernames with their IDs
async function fillFriendsIDList(refSteamID , friendsUsernames) {
    let foundFriends = [];
    //get List of Friend Objects
    let friends = await steam.getUserFriends(refSteamID);
    for (unknownFriend of friends) {
        let summary = await steam.getUserSummary(unknownFriend["steamID"]);
        for(knownFriendName of friendsUsernames) {
            if(summary["nickname"] == knownFriendName) {
                console.log("Found 1...");
                foundFriends.push(summary["steamID"]);
            }
        }
    }
    return foundFriends;
}
exports.fillFriendsIDList = fillFriendsIDList;

/// Fill an array with multiple lists of Game Objects --> [gList1, gList2, gList3] where each gList = [Game1, Game2, Game3]


async function getGameList(refID, idList) {
    //Add my game id to everyone else's
    idList.push(refID);
    let gameList = [];
    //iterate through the list and retrive a game list
    for (id of idList) {
        let gList = await steam.getUserOwnedGames(id);
        gameList.push(gList);
        console.log(id + ": " + gList.length + " games found!")
    }
    return gameList
}
exports.getGameList = getGameList;

// Iterate through list of games lists and find shortest one, place that in shortestList
async function getShortest(fullGameList) {
    let min;
    let minI;
    for(gList in fullGameList) {
        let x = fullGameList[gList].length;
        if(min==null){
            min = x;
            minI = gList;
        } else if( x < min ) {
            min = x;
            minI = gList;
        }
    }
    //console.log(min + ": " + minI);
    let shortGameList = fullGameList[minI];
    //console.log(shortGameList);
    fullGameList.splice(minI, 1);
    return shortGameList;
    
}

exports.getShortest = getShortest;

async function getMatching(gameListOne, gameListTwo) {
    let matchingGames = [];
    gameListOne.forEach(game => {
        for(game2 of gameListTwo) {
             if (game["name"] == game2["name"] ){
                matchingGames.push(game);
             }
        }
    });
    return matchingGames;
}
exports.getMatching = getMatching;

async function chooseGame(gameList) {
    let randomGame = Math.round(Math.random()*gameList.length);
    return gameList[randomGame]["name"];
}


/// MAIN USE FUNCTION ///
/// getRandomGame((strGame, arrayofGameObjects) => {
///     msg.reply(strGame);
///     for(i in arrayofGameObjects) {
///         msg.reply(lists[i]["name"]);
///         //prints out all games
///        }
/// })

async function getRandomGame(callback) {
    // fillFriendsIDList(refSteamID , friendsUsernames)
    // getGameList(refID, idList, callback)

    //Get friendsIDs
    console.log("Getting friends IDs...");
    var friendsIDs = await fillFriendsIDList(me , friendsUsernames);
    console.log(friendsIDs);
    var gameLists = await getGameList(me, friendsIDs, (val) => {return val});
    let shortest = await getShortest(gameLists); //note shortest has now been removed from gameLists
    let next_shortest = await getShortest(gameLists);
    console.log(gameLists.length);
    let shortestUnion = await getMatching(shortest, next_shortest);
    console.log(shortestUnion);
    //for remaining list members, see if they have any of the shortestUnion games
    //union doeson't need to exist, but nice to separate shortestUnion and genericUnions
    let union = shortestUnion;
    for(remainder of gameLists) {
        //getMatching takes two lists of Game objects
        union = await getMatching(union, remainder);
    }
    for(game of union) {
        console.log("We all of have: " + game["name"]);
        // steam.getGameDetails(game["appID"]).then(val => { console.log(val["categories"])});
    }
    if (typeof callback == "function" ) {
        callback(await chooseGame(union), union);
    }
}

exports.getRandomGame = getRandomGame;