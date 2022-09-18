import React,{Component} from 'react';
import {Navbar, Nav, Form, Button } from 'react-bootstrap';
import {Key} from '../keys.js';
const key  =  new Key();
import '../style/sign.css'
class UP extends Component {
    
  
    download = () =>{
        const element = document.createElement("a");
        const file = new Blob(["private_key :"+key.privateKey,"    public_key :" + key.publicKey],    
                    {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = "myFile.txt";
        document.body.appendChild(element);
        element.click();
    }

    render(){
     return (
       <div className="sign_body">
         <h1 >Generate Your Keys</h1>
         <Button className="b" variant="primary" onClick={this.download}>Keys</Button>
        <Nav.Item>
            <Nav.Link className="signin" href="/signIn" eventKey="link-1">SignIn</Nav.Link>
        </Nav.Item>
      </div>
     );
   }

}

export default UP;
