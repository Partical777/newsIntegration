import React,{ Component } from 'react';
import Navbar from './Navbar';
import Pagination from './Pagination';
import './Navbar.css';
import './Project.css';

const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");


var firebaseConfig = {
    apiKey: "AIzaSyA3a7JPso-jCL06Eepb3D4sTWpM2nMqfRQ",
    authDomain: "newsintegration.firebaseapp.com",
    databaseURL: "https://newsintegration.firebaseio.com",
    projectId: "newsintegration",
    storageBucket: "newsintegration.appspot.com",
    messagingSenderId: "1025719057822",
    appId: "1:1025719057822:web:36037bcb29a8e67e5b6a8f",
    measurementId: "G-NJ0250XDSR"
 };
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
 //firebase.analytics();

/*firebase.initializeApp({
  apiKey: 'AIzaSyA3a7JPso-jCL06Eepb3D4sTWpM2nMqfRQ',
  authDomain: 'newsintegration.firebaseapp.com',
  projectId: 'newsintegration'
});*/

var db = firebase.firestore();




class Project extends Component{
	constructor(props){
		super(props);
		this.state = {like: false}
		this.like = this.like.bind(this);	//為了讓this`能在like中被使用
	}

	componentDidMount(){
		db.collection("like").where("title", "==", this.props.title).get()
		.then((querySnapshot) =>{
			if(querySnapshot.size === 0){
				this.setState({like: false});
			}
			else{
				this.setState({like: true});
			}
		});
		
	}

	like(){
		
		if(!this.state.like){
			db.collection("like").doc(this.props.cardId).set({
				'href': this.props.href,
				'image': this.props.image,
				'title': this.props.title,
				'date': this.props.date,
				'data_src': this.props.data_src
			})
			.then(()=>{
				this.setState({like: !this.state.like});
			    alert("已收藏");
			})
	    }
	    else{
	    	db.collection("like").doc(this.props.cardId).delete().then(()=>{
	    		this.setState({like: !this.state.like});
    			alert("已取消收藏");
			})
	    }

	}

	render(){
		let likeButton;
		if(!this.state.like){
			likeButton = <button onClick={this.like}><img src="https://img.icons8.com/material-outlined/24/000000/filled-like.png"/></button>;
		}
		else{
			likeButton = <button onClick={this.like}><img src="https://img.icons8.com/cute-clipart/64/000000/like.png"/></button>;
		}
		return(
			<div className = 'Project'>
				<div>{this.props.data_src}</div>
					<img src = {this.props.image} />
					<div>{this.props.title}</div>
					<div>
						{likeButton}
						<button><a href={this.props.href}><img src="https://img.icons8.com/ios-glyphs/30/000000/read.png"/></a></button>
					</div>
			</div>
		);
	}
}


//////////////////////////////////////////////////////////////////////////
//solution: https://stackoverflow.com/questions/27192621/reactjs-async-rendering-of-components
//////////////////////////////////////////////////////////////////////////
class Projects extends Component{//prop 給collection名稱
	constructor(){
		super();
		this.state = {testArr: [],data: "all_news",page: 1, totalPage: 1};
		this.whichData = this.whichData.bind(this);
	}

	componentDidMount(){
		console.log("in componentDidMount")
		//var next;
		db.collection(this.state.data).orderBy("date", "desc").get().then((querySnapshot) => {
			/*let lastNews = querySnapshot.docs[querySnapshot.docs.length-1];
			console.log(lastNews.data().title);
			next = db.collection(this.state.data).orderBy("date", "desc").startAfter(lastNews).limit(12)*/
			this.setState({ totalPage: Math.ceil(querySnapshot.docs.length/12) });	//calculate total Page nember
			
			for(let i=0;i<12;i++){
				let doc = querySnapshot.docs[i];
				this.setState(state => {
    				//不能用push https://www.robinwieruch.de/react-state-array-add-update-remove
    				const testArr = this.state.testArr.concat({'id':doc.id ,'href':doc.data().href,'image':doc.data().image,'title':doc.data().title, 'date':doc.data().date, 'data_src': doc.data().data_src});
    				return {testArr};
    			})
			}
			/*querySnapshot.forEach((doc) => {
    			this.setState(state => {
    				//不能用push https://www.robinwieruch.de/react-state-array-add-update-remove
    				const testArr = this.state.testArr.concat({'id':doc.id ,'href':doc.data().href,'image':doc.data().image,'title':doc.data().title, 'date':doc.data().date});
    				return {testArr};
    			})
			})*/
    	})
    }

	componentDidUpdate(prevProps, prevState){
		
		if(this.state.data !== prevState.data){
			
			db.collection(this.state.data).orderBy("date", "desc").limit(12).get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
    				this.setState(state => {
    					//不能用push https://www.robinwieruch.de/react-state-array-add-update-remove
    					const testArr = this.state.testArr.concat({'id':doc.id ,'href':doc.data().href,'image':doc.data().image,'title':doc.data().title, 'date':doc.data().date, 'data_src': doc.data().data_src});
    					return {testArr};
    				})
				})
    		})
		}
		else if(this.state.page !== prevState.page){
			console.log('in change page');
			let lastNews, nextPage;
			if(this.state.page !== 1){
				db.collection(this.state.data).orderBy("date", "desc").limit(12 * (this.state.page-1)).get().then((querySnapshot) => {
					lastNews = querySnapshot.docs[querySnapshot.docs.length-1];
					nextPage = db.collection(this.state.data).orderBy("date", "desc").startAfter(lastNews).limit(12);
				})
				.then(() =>{
    				nextPage.get().then((querySnapshot) => {
    					querySnapshot.forEach((doc) => {
    						this.setState(state => {
    							//不能用push https://www.robinwieruch.de/react-state-array-add-update-remove
   								const testArr = this.state.testArr.concat({'id':doc.id ,'href':doc.data().href,'image':doc.data().image,'title':doc.data().title, 'date':doc.data().date, 'data_src': doc.data().data_src});
   								return {testArr};
   							})				
    					})
    				})
    			})
			}
			else{	//this.state.page = 1
				db.collection(this.state.data).orderBy("date", "desc").limit(12).get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
    					this.setState(state => {
    						//不能用push https://www.robinwieruch.de/react-state-array-add-update-remove
   							const testArr = this.state.testArr.concat({'id':doc.id ,'href':doc.data().href,'image':doc.data().image,'title':doc.data().title, 'date':doc.data().date, 'data_src': doc.data().data_src});
   							return {testArr};
   						})				
    				})
    			})
			}
		}
	}


	whichData(evt){
		console.log("click",evt.target.textContent);
		
		if((isNaN(evt.target.textContent)) && (this.state.data !== evt.target.textContent)){		//change page between like | history | home
			this.setState({testArr: [], data: evt.target.textContent, page: 1, totalPage: 1});
		}
		else if(this.state.page != evt.target.textContent){	//change page number
			console.log('in setState page');
			this.setState({testArr: [], page: parseInt(evt.target.textContent)});
		}
	}

	render(){
		
    	if(this.state.testArr.length > 0){
			return(
				<div className='container'>
					<Navbar whichData={this.whichData}/>
					<div className='Projects'>
						{	
							this.state.testArr.map((doc) => {				
    							return(
									<Project key={doc.id} cardId={doc.id} image={doc.image} title={doc.title} href={doc.href} date={doc.date} data_src={doc.data_src}/>
    							)
    						})	
						}
						
					</div>
					<Pagination pageNum={this.state.totalPage} whichData={this.whichData}/>
				</div>
			)
		}
		else{
			return( 
				<div>
					<Navbar whichData={this.whichData}/>
					<div>Loading</div>
				</div>
			)
		}
	}//end of render()
}

export default Projects;