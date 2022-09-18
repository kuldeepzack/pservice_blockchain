import React,{Component, useDebugValue} from 'react';
import {transaction , block , blockchain} from '../blockchain_network.js';
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const ENDPOINT = 'http://localhost:8000';
import openSocket from 'socket.io-client';
const socket = openSocket(ENDPOINT);

import doctor from '../doctor.js';
import '../style/doctor.css';

class DOCTOR extends Component {

 state={
   doctor_key:"",
   secret_key:""
 }


 componentDidMount(){

    let url = window.location.href;
    let d = url.split("?")[1];
    d = d.split("&");

    let pk = d[0].split("=")[1];
    let sk = d[1].split("=")[1];
    
    this.setState({
     doctor_key:pk
    })

    this.setState({
     secret_key:sk
    })

    let find = false;
    
    for( let i=0 ; i<doctor.length ; i++ ){
        if( doctor[i].publicKey === pk && doctor[i].secretKey === sk ){
          find = true;
          break;
        }
    }

  
    if( find === false){
        window.location.href = "http://localhost:3000/signIn";
    }


  socket.on('request' , ({query:query})=>{

    document.querySelector(".fetch").innerHTML = "";

    for( let i=query.length-1 ; i>=0  ; i-- ){

     let p1 = document.createElement("div");
     p1.className = "patient_address";
     p1.innerHTML = `<h3>Patient :</h3><p>${query[i].patient_address}</p>`;

     let p2 = document.createElement("div");
     p2.className = "query";
     p2.innerHTML = `<h3>Query : </h3><p>${query[i].query}</p>`;
     
     let p3 = document.createElement("div");
     p3.className = "mobile_number";
     p3.innerHTML = `<h3>Mobile No :</h3><p>${query[i].mobile}</p>`;

     let div = document.createElement('div');
     div.className = "block";


     div.append(p1);
     div.append(p2);
     div.append(p3);
     document.querySelector(".fetch").append(div);
    }
    
  })

 }

 componentDidUpdate(){
 }

 cure = ()=>{
  
 }




 fetch = (event) =>{
    event.preventDefault();
    socket.emit('fetch' , ({key:this.state.doctor_key})); 
 };




   render(){

     return (
       <div className="fetch_tx">

        <br/>
        <br/>
        <br/>

       <form>
         <input  type="submit" onClick={this.fetch} className="sub" value="Fetch the Requests" />
      </form>
       <div className="fetch">
         
       </div>  
      
      </div>
     );
   }

}

export default DOCTOR;
