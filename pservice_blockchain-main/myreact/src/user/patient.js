import React,{Component} from 'react';
import {transaction , block , blockchain} from '../blockchain_network.js';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
import '../style/patient.css'

const ENDPOINT = 'http://localhost:8000';
import openSocket from 'socket.io-client';
const socket = openSocket(ENDPOINT);
import doctor from '../doctor.js';

class PATIENT extends Component {

 state={
   patient_key:"",
   doctor:"gourav",
   query:"",
   fees:0,
   money:0,
   room:"node",
   private_key:"",
   mobile:0,
 }

 componentDidMount(){
   
    let url = window.location.href;
    let d = url.split("?")[1];
    d = d.split("&");
    
    let a = d[0].split("=")[1]; 
    this.setState({
     patient_key:d[0].split("=")[1]
    })

    this.setState({
     private_key:d[1].split("=")[1]
    })

    socket.emit('joinnetwork' , ({publicKey:a , room:this.state.room}));

    socket.on('message_of_addition_of_transaction' , ({msg})=>{
       window.alert(msg);
     })

     socket.on('status' , ({msg})=>{
       window.alert(msg);
     })

     socket.on('success' , ({msg})=>{
       window.alert(msg);
    })

 }

 
 componentDidUpdate(){
 }

 makeTransaction = (e) =>{
 
   e.preventDefault();

   const doctor_name = this.state.doctor;
   let doctor_key = "";
   for( let i=0 ; i<doctor.length ; i++ ){
     if( doctor[i].name == doctor_name ){
       doctor_key = doctor[i].publicKey;
       break;
     }
   }
   
   
   
   const tx = new transaction(this.state.patient_key , doctor_key , this.state.query , parseInt(this.state.fees,10) , parseInt(this.state.mobile,10) );
   let patient_key = this.state.patient_key;
    
   try{
    tx.sign_transaction(ec.keyFromPrivate(this.state.private_key , 'hex'));
    socket.emit('broadcast_transaction_to_nodes', ({publicKey:patient_key , tx:tx, room:this.state.room}));
   }
   catch(err){
    console.log(err);
   }

 }

 addMoney = (e) =>{
   e.preventDefault();
   const tx = new transaction('', this.state.patient_key , "money added" , parseInt(this.state.money,10)  , "" );
   tx.signature = "";
   tx.hash = "";
   tx.mobile = "";
   socket.emit("add" , ({tx:tx}));
 }

 handlechange = (event) =>{ 
    this.setState({
      [`${event.target.name}`]:event.target.value
    })
 };

  render(){

     return (
       <div className="patient_body">
       <p className="patient_key" value={this.state.patient_key} >{this.state.patient_key}</p>

       <form className="form">
         <h1 className="h"> Submit Your Query To Your Desired Doctor</h1>
         <br/>
         <br/>


         <lable  className="sd"> Choose Your Doctor</lable>
         <select className="doctor" name="doctor" onChange={this.handlechange}>
          <option value="gourav" >gourav
          </option>
          <option value="karina" >karina
          </option>
          <option value="kunal" >kunal
          </option>
          <option value="aryan" >aryan
          </option>
         </select>

         
         <br/>
         <br/>
         <br/>
         
         <label className="f" >Fees</label>
         <input  type="number" className="fees" name="fees" onChange={this.handlechange} />
         
         
         <br/>
         <br/>
         <br/>

         <label className="m" >Mobile</label>
         <input  type="number" className="mobile" name="mobile" onChange={this.handlechange} />
         
         
         <br/>
         <br/>
         <br/>

         <label className="q" >Query</label>
         <textarea className="query" name="query" onChange={this.handlechange}></textarea>
         
         <br/>
         <br/>
         <br/>
         <br/>
        
         <input  type="submit" onClick={this.makeTransaction} className="sub" value="SUBMIT QUERY" />
       </form>


        
        <form className="exchange" >
          <h1 className="h">Exhange Money</h1>
          <lable className="amount" >Amount</lable>
          <input  type="number" className="money" name="money" onChange={this.handlechange} />
          <br/>
          <br/>
          <br/>
          <input  type="submit" onClick={this.addMoney} className="sub" value="SUBMIT" />
        </form>



      </div>
     );
   }

}

export default PATIENT;

