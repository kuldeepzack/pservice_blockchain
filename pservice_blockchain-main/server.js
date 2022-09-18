const express= require('express');
const http= require('http');
const app = express();
const path = require('path');
const socketio = require('socket.io');
const fs = require('fs');
const bodyparser = require('body-parser');
const cors = require('cors');
const https = require('https');

const {
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
} = require('./utils/nodes.js');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

let mining_reward = 100;

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

let consensus51 = [];
let block_added = false;


// run when client connects
io.on('connection', socket=>{

    //patient joined to network
    socket.on('joinnetwork',({publicKey , room})=>{
      userjoin( socket.id , publicKey , room );
      socket.join(room);
      console.log("patient successfully joined to the blockchain network");
    })

    //transaction for money is added
    socket.on('add' , ({tx})=>{
      console.log("patient query for money (transaction) is added to the blockchain pending transactions");
      socket.broadcast.to('full').emit('add_transaction' , ({tx:tx,msg:"money",socketid:socket.id}));  
    })

   //transaction for query is added
   socket.on('broadcast_transaction_to_nodes' , ({publicKey,tx,room})=>{
    if( get_noOf_full_nodes() ){
      console.log("patient problem query (transaction) is added to blockchain pending transaction")
      socket.broadcast.to('full').emit('add_transaction' , ({tx:tx,msg:"query",socketid:socket.id}));  
    }else{
     io.to(socket.id).emit('success' , ({msg:"Network is On Hold"})); 
    }
   })
 
   //start mining , message is passed to miner when pending transaction get fulled
    socket.on('start' , ({msg})=>{
      socket.broadcast.to('mine').emit('now_you_can_start' , ({msg:msg}));       
    })

    //emit status to the patient regarding to there transaction  
    socket.on('status', ({msg:msg,id:id})=>{
      io.to(id).emit('status' , ({msg})) ;
    })

    //fullnode give its pending transactions to the miner 
    socket.on('get_pending_transactions' , ()=>{
      let id = get_fullnode_id();
      io.to(id).emit('get_transactions' , ({id:socket.id}) );
    })

    socket.on('your_transactions' ,({pending:pending,id:id,phash:phash})=>{
      io.to(id).emit('your_transactions' , ({pending,phash}));
    })

    //full node joined to network
    socket.on('fullnode_joined' , ({publicKey , room})=>{
      fullnodes_join(socket.id , publicKey , room)
      socket.join(room);
      console.log("fullnode successfully joined to the blockchain network");
    })

    //miner joined to network
    socket.on('miner_joined' , ({publicKey,room})=>{
      let what = checkminer(publicKey);

      if( what == "not_present"){
        miner_join(socket.id, publicKey , room);
        miner(publicKey,0);
        socket.join(room);
        console.log("miner successfully added with zero money");
        io.to(socket.id).emit('your_detail' , ({money:0}));
      }else{
        socket.join(room);
        console.log("miner successfully added with "+what+" money");
        io.to(socket.id).emit('your_detail' , ({money:what}));
      }

    })
   
   //request by miner for its money status 
    socket.on('mymoney' , ({key})=>{
      let what = checkminer(key);
      io.to(socket.id).emit('your_money' , ({money:what}));
    })

    //pow of work is send by miner to all full nodes
    socket.on('pow' , ({Block,key,duration})=>{
      console.log("block is broadcasted to all full nodes so that they can check the validity of block");
      socket.broadcast.to('full').emit('verify' , ({Block,key,duration,time:Date.now()}));
    })

   //this is consensus algo where all full nodes passed the status of block which is added by the miner
    socket.on('consensus' , ({msg,Block,key,duration,time})=>{

      if( msg == true && !block_added ){

        let find = false;
        for( let i=0 ; i<consensus51.length ; i++ ){
          if( consensus51[i].key == key && consensus51[i].time == time ){
             find = true;
             consensus51[i].score = parseInt(consensus51[i].score,10)+1;
             break;
          }
        }

        if( !find ){
          consensus51.push({key:key,score:1,duration:duration,time:time})
        }
        

        let luckyminer = [];
        for( let i=0 ; i<consensus51.length ; i++ ){
          let score = consensus51[i].score;
          let x = get_noOf_full_nodes();
          console.log(x);
          x/=2;
          if( score > x ){
           luckyminer.push(consensus51[i]);
          }
        }
        
        let max_duration = 0;
        let rewarded_miner = '';

        for( let i=0 ; i<luckyminer.length ; i++ ){
         if( max_duration < luckyminer[i].duration ){
           max_duration = luckyminer[i].duration;
           rewarded_miner = luckyminer[i];
         }  
        }

        if( rewarded_miner!= '' ){
          socket.emit('add_block' , ({Block:Block}));
          consensus51 = [];
          block_added = true;
          update_miner(key , mining_reward);
          const socketid = getid(key);
          io.to(socketid).emit('success1' , ({msg:"Congratulations , you pow is selected"}));
          var x = 0;
          var counter = setInterval(function(){
             x++;
             if( x == 5 ){
               block_added = false;
               clearInterval(counter);
             }
          } , 1000);
           
        }

      }else{
        const socketid = getid(key);
        io.to(socketid).emit('success1' , ({msg:"Blockchain is On hold"}));
      }

    })

    
  // doctor fetch the request by patient 
    socket.on('fetch' , ({key})=>{
      let id = get_fullnode_id();
      io.to(id).emit('request_query' , ({key:key,id:socket.id}) );
    })

    socket.on('pass_the_request' , ({query, id })=>{
      io.to(id).emit('request' , ({query:query}) );
    })


    // // runs when any one disconnect
    // socket.on('disconnect',()=>{
    //   console.log("this id :" , socket.id , "remove from blockchain" );
    //   userleave(socket.id);
    // })

})





const port = process.env.PORT || 8000;

server.listen(port , ()=>{
    console.log("listener port: 8000");
})
