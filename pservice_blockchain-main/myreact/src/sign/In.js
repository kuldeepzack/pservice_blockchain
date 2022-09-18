import React,{Component} from 'react';
import {Navbar, Nav, Form, Button } from 'react-bootstrap';
import {Key} from '../keys.js';
const key  =  new Key();
import '../style/in.css'
class IN extends Component {
     
    state={
      pk:"",
      prk:"",
      sk:"",
    }

    handleChange = (event) =>{ 
        this.setState({
          [`${event.target.name}`]:event.target.value
        })
    };

    render(){
     return (
       <div className="inbody">
        <Form className="form1">

        <h1> ROOMS </h1>
        <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label  className="label1" >Public Key</Form.Label>
            <Form.Control className="input" name="pk" onChangeCapture={this.handleChange} type="text" placeholder="Enter Your Public Key" />
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label  className="label2" >Private Key</Form.Label>
            <Form.Control className="input" name="prk" onChangeCapture={this.handleChange} type="password" placeholder="Enter Your Private Key" />
        </Form.Group>

        <br/>
        <br/>
        <br/>


        <Nav.Item className="link">
            <Nav.Link className="miner"  href={"/miner?pk="+this.state.pk+"&prk="+this.state.prk} eventKey="link-1">Miner</Nav.Link>
        </Nav.Item>
        <Nav.Item className="link">
            <Nav.Link className="full"  href={"/full_node?pk="+this.state.pk+"&prk="+this.state.prk} eventKey="link-2">Full Node</Nav.Link>
        </Nav.Item>
        <Nav.Item className="link">
            <Nav.Link className="patient"  href={"/patient?pk="+this.state.pk+"&prk="+this.state.prk} eventKey="link-3">Patient</Nav.Link>
        </Nav.Item>


        </Form>
        

        <Form className="form2">

    
        <h1>DOCTOR ROOM</h1>

        <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label  className="label1" >Public Key</Form.Label>
            <Form.Control className="input" name="pk" onChangeCapture={this.handleChange} type="text" placeholder="Enter Your Public Key" />
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Label  className="label3" >Secret Key</Form.Label>
            <Form.Control className="input" name="sk" onChangeCapture={this.handleChange} type="password" placeholder="Enter Your Secret Key" />
        </Form.Group>

        <br/>
        <br/>
        <br/>

        <Nav.Item className="link">
            <Nav.Link className="doctor_"  href={"/doctor?pk="+this.state.pk+"&sk="+this.state.sk} eventKey="link-1">ENTER</Nav.Link>
        </Nav.Item>

        </Form>

      </div>
     );
   }

}

export default IN;
