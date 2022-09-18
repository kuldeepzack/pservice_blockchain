import React,{Component} from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { block } from '../blockchain_network';
import '../style/node.css';

class NODE extends Component{

   state = {
    visible:'block'
   }


   change = () =>{
       this.setState({
           visible:'none',
       })
   }
   
   componentDidMount(){
   }
   componentDidUpdate(){
       this.change();
   }


   render(){

    let myInlineStyle={
        display:this.state.visible
    }

    return (
      <div className="cross_sign">
        
        <Nav className="node_body"  fill variant="tabs" defaultActiveKey="/home">
        <Nav.Item className="si">
            <Nav.Link className="signin" style={myInlineStyle} onClick={this.change} href="/signIn">Yes</Nav.Link>
        </Nav.Item>
        <h1 className="heading">Already A Part Of This Blockchain?</h1>
        <Nav.Item className="su">
            <Nav.Link className="signup" style={myInlineStyle} onClick={this.change} href="/signUp" eventKey="link-1">No</Nav.Link>
        </Nav.Item>
        </Nav>

        
      </div>
    )
   }
}

export default NODE;