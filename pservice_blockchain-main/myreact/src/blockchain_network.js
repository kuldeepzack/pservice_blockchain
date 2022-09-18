const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//import sha256 from 'crypto-js/sha256';
//import hmacSHA256 from 'crypto-js/hmac-sha256';
//import hex from 'crypto-js/enc-hex';
// var sha256 = require('js-sha256');
// var hash = sha256.create();
// const crypto = require('crypto');

import {sha256} from 'js-sha256';

  export class transaction{

  // here patient_address and doctor_address are public key
     constructor(patient_address , doctor_address , query , amount , mobile){
      this.patient_address = patient_address;
      this.doctor_address = doctor_address;
      this.time_stamp = Date.now();
      this.query = query;
      this.amount = amount;
      this.mobile = mobile;
     }
  
     calculate_hash(){
      var hash = sha256.create();
      hash.update(this.patient_address+this.doctor_address+this.query+this.amount.toString()+this.mobile.toString() );
      return hash.hex();
     }
  
  // signing key = private key
     sign_transaction(signing_key){
      
      if ( signing_key.getPublic('hex') !== this.patient_address) {
        throw new Error('You cannot sign transactions from other patients_wallets!');
      }
  // Calculate the hash of this transaction, sign it with the key
  // and store it inside the transaction object
      const hashTx = this.calculate_hash();


      const sig = signing_key.sign(hashTx , 'base64');
      this.hash = hashTx;
      this.signature = sig.toDER('hex');
    }
  
  // verfication key = public key
     verify_signature(){     
       if( this.patient_address === null || this.patient_address === "" ){
         return true;
       }
  
       if( this.signature.length === 0 || this.signature === null ){
         throw new Error(" transaction is not signed ");
       }
       
       //now we have to check with the hashTx , public key and signature that correct patient is signed the transaction
       const publicKey = ec.keyFromPublic(this.patient_address, 'hex');
       return publicKey.verify(this.hash , this.signature);
     }
  
  
  }
  
  export class block{

    constructor( transactions , previous_hash , time_stamp ){
     this.transactions = transactions;
     this.previous_hash = previous_hash;
     this.time_stamp = time_stamp;
     this.current_hash = this.calculate_hash();
     this.nounce = 0;
    }

    calculate_hash(){
      var hash = sha256.create();
      hash.update(JSON.stringify(this.transactions)+this.previous_hash+this.nounce);
      return hash.hex();
    }

    // from all transaction till now , we compute the hash composed of all transactions
    mining_of_block(difficulty){
      while( this.current_hash.substring(0, parseInt(difficulty,10)) !== Array(parseInt(difficulty,10) + 1).join('0')  ){
       this.nounce = this.nounce+1;
       this.current_hash = this.calculate_hash();
      }
    }
  
  
    validity_of_transaction(){
      for( const trx of this.transactions ){
        if( !trx.verify_signature() ){
          return false;
        }
      }
      return true;
    }
  
  }
  
  export class blockchain{

    constructor(){
      this.pending_transactions = [[]];
      this.chain = [this.give_genesis_block()];
      this.mining_reward = 100;
      this.limit = 2;
    }
  
    give_genesis_block(){
       return new block([] , "0" , Date.now() );
    }
  
    hash_of_last_block(){
      return this.chain[this.chain.length-1].current_hash;
    }
  
    calculate_balance_of_address(address){
  
    let balance = 0;

  // from previous blocks
       for( const block of this.chain ){
         for( const tx of block.transactions ){
  
           if( tx.patient_address === address ){
             balance -=tx.amount;
           }
  
           if( tx.doctor_address === address ){
             balance +=tx.amount;
           }
  
         }
       }
  
  // pending transactions till now
       for( let i=0 ; i<this.pending_transactions.length ; i++ ){
        for( let j=0 ; j<this.pending_transactions[i].length ; j++ ){
          if( this.pending_transactions[i][j].patient_address === address ){
            balance -=this.pending_transactions[i][j].amount;
          }
   
          if( this.pending_transactions[i][j].doctor_address === address ){
            balance +=this.pending_transactions[i][j].amount;
          }
        }
       }
  
   
       return balance;
  
    }
  
    add_transaction(tx){
      
      if( (tx.patient_address ==="" ||   tx.patient_address === null) && (tx.doctor_address != null && tx.doctor_address !== "") ){
        this.pending_transactions[this.pending_transactions.length-1].push(tx);  
      }else{

       if( (tx.patient_address ==="" ||   tx.patient_address === null)  || (tx.doctor_address === null || tx.doctor_address === "") ){ 
        throw new Error("Please fill sender and receiver address carefully");
       }
  
       
       if( tx.amount <= 0 ){
         throw new Error("Transaction amount should be greater then zero");
       }
  
       if( this.calculate_balance_of_address(tx.patient_address) < tx.amount ){
         throw new Error("Doesn't have sufficient balance");
       }

       const publicKey = ec.keyFromPublic(tx.patient_address, 'hex');
      
       if(  !publicKey.verify(tx.hash , tx.signature) ){
         throw new Error("Please send the amount from you wallet only ");
       }

       this.pending_transactions[this.pending_transactions.length-1].push(tx);
      }
    }
  
  // miner who do the hashing of all pending transaction first will get mining_reward and then only block is addes to blockchain
    miner_pow_pending_transaction(phash , pending , duration){
      if( pending.length != this.limit ){
        return "Fill the pending transaction upto the Limit";
      }

      let b = new block(pending , phash , Date.now()  );
      b.mining_of_block(parseInt(duration,10));
      return b;
    }
  
    chain_validation(){
  
      for( let i=1 ; i<this.chain.length ; i++ ){
       
        if( this.chain[i].previous_hash !==  this.chain[i-1].current_hash ){
          return false;
        } 

        if( this.chain[i].current_hash !== this.chain[i].calculate_hash() ){
          return false;
        } 
  
       }
  
    return true;
  
    }
  
  
    patient_request(key){
      
      let query = [];
      for( let i=1 ; i<this.chain.length ; i++ ){
        let block = this.chain[i];
        
        for( let j = 0 ; j<this.chain[i].transactions.length ; j++ ){
          let tx = this.chain[i].transactions[j];
          
          if( tx.patient_address != "" && tx.patient_address != null && tx.doctor_address != "" && tx.doctor_address != null ){
              if( key === tx.doctor_address ){
                query.push(tx);
              }
          }
        }
      }
  
      return query;
      /* eslint-disable */
    }
  
  }
  
