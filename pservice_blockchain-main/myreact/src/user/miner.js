import React,{Component} from 'react';
import {transaction , block , blockchain} from '../blockchain_network.js';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
import '../style/miner.css';

const ENDPOINT = 'http://localhost:8000';
import openSocket from 'socket.io-client';

const socket = openSocket(ENDPOINT);

const bchain = new blockchain();
bchain.chain[0].current_hash = "00f84842730abaada1ab51c811a856e4984aabaaae67c85296729afaa3d2d1a5";

class MINER extends Component {

 state={
   miner_key:"",
   block:"",
   money:0,
   room:'mine',
   duration:''
 }

 componentDidMount(){

  
   let url = window.location.href;
   let d = url.split("?")[1];
   d = d.split("&");

   let a = d[0].split("=")[1];
  
   this.setState({
    miner_key:d[0].split("=")[1]
   })

    socket.emit('miner_joined' , ({publicKey:a,room:this.state.room}));

    socket.on('your_detail' , ({money})=>{
      window.alert(money);
      this.setState({
         money:money
      })
    })

    socket.on('success1' , ({msg})=>{
      window.alert(msg);
    })
    
    socket.on('now_you_can_start' , ({msg})=>{
      window.alert(msg);
    })

    socket.on('your_money' , ({money})=>{
      this.setState({
        money:money
      });
      window.alert(money);
    })


    socket.on('your_transactions' , ({pending,phash})=>{

      let p = [];
      for( let i=0 ; i<pending.length ; i++ ){
        let tx = pending[i];
        const t = new transaction(tx.patient_address , tx.doctor_address , tx.query , tx.amount , tx.mobile);
        if( tx.doctor_address != "" ){
         t.signature = tx.signature;
        }else{
          t.signature = "";
          t.mobile = "";
        }
        t.time_stamp = tx.time_stamp;
        t.hash = tx.hash;
        p.push(t);
      }

      let Block = bchain.miner_pow_pending_transaction( phash ,  p , this.state.duration);

      if( Block == "Fill the pending transaction upto the Limit" ){
        window.alert("Mine the transaction after sometime");
       }else{
        socket.emit('pow', ({Block,key:this.state.miner_key,duration:this.state.duration}));
      }
    })
       
 }

    componentDidUpdate(){
    }

    build_block = (e) =>{

   e.preventDefault();

    if( parseInt(this.state.duration,10) === 0 || this.state.duration === "" || this.state.duration === null ){
     window.alert("difficulty level cannot be zero");  
    }else{
     window.alert("mining begin");
     socket.emit('get_pending_transactions');
   }

  };

   handlechange = (event) =>{
    this.setState({
      [`${event.target.name}`]:event.target.value
    })
   };

   balance = (event) =>{
     event.preventDefault();
     socket.emit('mymoney' , ({key:this.state.miner_key}) );
   }


   render(){

     return (
       <div className="miner_body">

        <p className="miner_key" value={this.state.miner_key}>{this.state.miner_key}
        </p>

        <div className="image">
        <img src="./miner.jpg" className="img"></img>
        </div>

       <div className="miner_money">
        
        <form className="min">

         <lable className="choose"> Choose Your Difficulty Level </lable>
         <input className="diff"  type="number" onChange={this.handlechange} name="duration" />
         <br/>
         <br/>
         <br/>
         <input  type="submit" onClick={this.build_block} className="sub" value="SUBMIT" />
        </form>
        
        <form className="money_query">
        <label className="balance">Check Your Balance</label> 
         <input  type="submit" onClick={this.balance} className="sub" value="My Money" />
        </form>

        </div>

      </div>
     );
   }

}

export default MINER;
