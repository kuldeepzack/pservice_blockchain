let full_nodes = [];
let miner_nodes = [];
let transaction_holded = [];
let usernodes = [];


let miner_nodes_history = [];
let user_nodes_history = [];

//join full_node to chat

function fullnodes_join(id , publicKey , room){
    var full_node = {id,publicKey,room};
    full_nodes.push(full_node);
}

function get_noOf_full_nodes(){
    return full_nodes.length;
}

function get_fullnode_id(){
    return full_nodes[0].id;
}



function userjoin(id,publicKey,room){
    var  user = {id,publicKey,room};
    usernodes.push(user);
}


function checkminer(publicKey){
  
  for( let i=0 ; i<miner_nodes_history.length ; i++ ){
    if( miner_nodes_history[i].publicKey == publicKey ){
        return miner_nodes_history[i].money;
    }
  }

  return "not_present";

}

function miner_join(id,publicKey,room){
    var miner = {id:id,publicKey:publicKey,room:room};
    miner_nodes.push(miner);
}

function miner(publicKey,money){
    miner_nodes_history.push({publicKey,money});
}

function update_miner(publicKey , money){
    for( let i=0 ; i<miner_nodes_history.length ; i++ ){
        if( miner_nodes_history[i].publicKey == publicKey ){
            miner_nodes_history[i].money = parseInt(miner_nodes_history[i].money,10)+parseInt(money , 10);
            break;
        }
    }   
}

function getid(key){
    for( let i=0 ; i<miner_nodes.length ; i++ ){
        if( miner_nodes[i].publicKey == key ){
            return miner_nodes[i].id;
            break;
        }
    }
}

function userleave(id){
    let a = false;
    for( let i=miner_nodes.length-1 ; i>=0 ; i-- ){
       if( miner_nodes[i].id === id ){
           miner_nodes.splice(i , 1);
           a = true;
           break;
       }
    }

    if( !a ){
        for( let i=full_nodes.length-1 ; i>=0 ; i-- ){
            if( full_nodes[i].id === id ){
                full_nodes.splice(i , 1);
                a = true;
                break;
            }
         }       
    }

    if( !a ){
        for( let i=usernodes.length-1 ; i>=0 ; i-- ){
            if( usernodes[i].id === id ){
                usernodes.splice(i , 1);
                a = true;
                break;
            }
         }       
    }
}


module.exports = {
    fullnodes_join,
    get_noOf_full_nodes,
    userjoin,
    checkminer,
    miner_join,
    miner,
    update_miner,
    userleave,
    getid,
    get_fullnode_id
};
