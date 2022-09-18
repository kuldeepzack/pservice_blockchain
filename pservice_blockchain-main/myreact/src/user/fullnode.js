import React,{Component} from 'react';
import {transaction , block , blockchain} from '../blockchain_network.js';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const bchain = new blockchain();
bchain.chain[0].current_hash = "00f84842730abaada1ab51c811a856e4984aabaaae67c85296729afaa3d2d1a5";

const ENDPOINT = 'http://localhost:8000';
import openSocket from 'socket.io-client';
const socket = openSocket(ENDPOINT);

import '../style/full.css';

class FULLNODE extends Component {

 state={
   node_key:"",
   bch:"",
   room:'full'
 }



 componentDidMount(){

    let url = window.location.href;
    let d = url.split("?")[1];
    d = d.split("&");
  
     let a = d[0].split("=")[1];
     this.setState({
     node_key:d[0].split("=")[1]
    })


  function update(){

  for( let i=0 ; i<bchain.chain.length ; i++ ){
    let b = bchain.chain[i];
    
    let div = document.createElement('div');
    div.className = "block";

    //transactions
    let d1 = document.createElement('div');
    d1.className = "transaction";
    d1.innerHTML += "<h3>Transactions</h3><p>---<p>";

    //current hash
    let d2 = document.createElement('div');
    d2.className = "current";
    d2.innerHTML += `<h3>Current_Hash</h3><p style={color:"green"} >${b.current_hash}</p>`;

    //previous hash
    let d3 = document.createElement('div');
    d3.className = "previous";
    d3.innerHTML += `<h3>Previous_Hash</h3><p >${b.previous_hash}</p>`;

    //nounce
    let d4 = document.createElement('div');
    d4.className = "nounce";
    d4.innerHTML += `<h3>Nounce</h3><p>${b.nounce}</p>`;

    //time stamp
    let d5 = document.createElement('div');
    d5.className = "time_stamp";
    d5.innerHTML += `<h3>Time_Stamp</h3><p>${b.time_stamp}</p>`;


    div.append(d1);
    div.append(d2);
    div.append(d3);
    div.append(d4);
    div.append(d5);

    document.querySelector(".storage").append(div);

  }

 }

    update();


    socket.emit('fullnode_joined' , ({publicKey:a,room:this.state.room}));
    
    socket.on('message_of_addition_of_transaction', ({msg})=>{
      window.alert(msg);
    })

    socket.on('get_transactions' , ({id:id})=>{
      let pending =  bchain.pending_transactions[0];
      let phash  = bchain.hash_of_last_block();
      socket.emit('your_transactions' ,({pending:pending,id:id,phash:phash}))
    })

    socket.on('request_query' , ({key,id})=>{
     let query = bchain.patient_request(key);
     socket.emit('pass_the_request' , ({query:query,id:id}) );
    })

    socket.on('add_transaction' , ({tx:tx , msg:msg , socketid:socketid})=>{
     if( msg == "money"){

      const t = new transaction(tx.patient_address , tx.doctor_address , tx.query , tx.amount , tx.mobile);
      t.signature = "";
      t.hash = tx.hash;
      t.mobile = ""; 
      t.time_stamp = tx.time_stamp;

      try{
        bchain.add_transaction(t);    
        window.alert("one_more_transaction_added");
        socket.emit('status' , ({msg:"successfull_added",id:socketid}));
        if( bchain.pending_transactions[bchain.pending_transactions.length-1].length == bchain.limit ){
          bchain.pending_transactions.push([]);
          socket.emit('start', ({msg:"start_mining"}));
        }
       }
       catch(err){
        console.log(err);
        socket.emit('status' , ({msg:"error_in_transaction",id:socketid}));
       }


     }else{

      const t = new transaction(tx.patient_address , tx.doctor_address , tx.query , tx.amount , tx.mobile);
      t.signature = tx.signature;
      t.hash = tx.hash;
      t.time_stamp = tx.time_stamp;

      try{
       bchain.add_transaction(t);

       if( bchain.pending_transactions[bchain.pending_transactions.length-1].length == bchain.limit ){
        bchain.pending_transactions.push([]);
        socket.emit('start', ({msg:"start_mining"}));      
       }

       window.alert("one_more_transaction_added");
       socket.emit('status' , ({msg:"Successfull Submitted the Transaction",id:socketid}));
      }
      catch(err){
       socket.emit('status' , ({msg:"Unable to add the transaction",id:socketid}));
      }


     }

    })

    socket.on('add_block' , ({Block})=>{
      let b = new block( Block.transactions , Block.previous_hash , Block.time_stamp);
      b.current_hash = Block.current_hash;
      b.nounce = Block.nounce;
      let t = [];

      for( let i=0 ; i<b.transactions.length ; i++ ){
        let tx = new transaction( Block.transactions[i].patient_address , Block.transactions[i].doctor_address , Block.transactions[i].query , Block.transactions[i].amount , Block.transactions[i].mobile);
        tx.time_stamp = Block.transactions[i].time_stamp;
        tx.signature = Block.transactions[i].signature;
        tx.hash = Block.transactions[i].hash;
        t.push(tx);
      }

      b.transactions = t;
      b.previous_hash = bchain.hash_of_last_block();
      bchain.chain.push(b);
      bchain.pending_transactions.shift();
      document.querySelector('.storage').innerHTML = "";
      update();
    })

    socket.on('verify' , ({Block,key,duration,time})=>{
      
      
      let b = new block(Block.transactions , Block.previous_hash , Block.time_stamp);
      b.current_hash = Block.current_hash;
      b.nounce = Block.nounce;
      
      let t = [];
     
      for( let i=0 ; i<Block.transactions.length ; i++ ){
         let tx = new transaction( Block.transactions[i].patient_address , Block.transactions[i].doctor_address , Block.transactions[i].query , Block.transactions[i].amount , Block.transactions[i].mobile);
         tx.time_stamp = Block.transactions[i].time_stamp;
         tx.signature = Block.transactions[i].signature;
         tx.hash = Block.transactions[i].hash;
         t.push(tx);
      }

      b.transactions = t;

      let a = 0;

      if( !b.validity_of_transaction()  ){
        window.alert("there is some error in the transactions");
        socket.emit('consensus', ({msg:false,Block:b,key:key,duration:duration,time:time}));
      }else{
        window.alert("all transactions are valid");
        a++;
      }

      console.log(bchain.chain);

      if( !bchain.chain_validation() ){
        window.alert("there is some error in the chain");
        socket.emit('consensus', ({msg:false,Block:b,key:key,duration:duration,time:time}));
      }else{
        window.alert("chain is valid");
        a++;
      }

      if( a == 2 ){
        socket.emit('consensus', ({msg:true,Block:b,key:key,duration:duration,time:time}));
      }

    })





 }

 componentDidUpdate(){
 }

   build_block = (e) =>{
    e.preventDefault();
    socket.emit('blockchain_network');
   }


   handlechange = (event) =>{
    this.setState({
      [`${event.target.name}`]:event.target.value
    })
   };


   render(){

     return (
       <div className="full_body">

         <p className="node_key" value={this.state.node_key} >{this.state.node_key}
         </p>
         
         <div className="storage"> 
         </div>

      </div>
     );
   }

}

export default FULLNODE;
