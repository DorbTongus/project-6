import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.js';
import firebase from './firebase.js';


/*creates data fileds in firebase for games and scores*/
const dbRefGames = firebase.database().ref('/games')

/*form for game inputs, constantly rendered at top of page*/
class GameForm extends React.Component {
	render () {
		return(
			<section className='add-game'>
			    <form onSubmit={this.props.handleSubmitOne}>
			      <input 
			      	type="text"
			      	autoComplete = "off" 
			      	autocomplete = "off" 
			      	name="gameName" 
			      	placeholder="Add A Game"
			      	onChange={this.props.handleChange} 
			      	value={this.props.gameName} 
		      	   />
			      <button>Add Game</button>
			    </form>
			</section>
		)
	}
}

// component for game images that allows them to be expanded and collpased on click and renders them at bottom of page
class GameImage extends React.Component {
	constructor() {
		super();
		this.state = {
			isExpanded: false,
		}
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(event) {
		event.preventDefault();
		this.setState({ isExpanded: !this.state.isExpanded });
	}
	render() {
		return (
			<img className = {`${this.state.isExpanded ? 'expandImage' : ''} proofImage`} id="proofImage" onClick = {this.handleClick} src={this.props.src} alt=""/>
		 );
	}
}

// component for score input form
class ScoreForm extends React.Component {
	constructor() {
		super();
		this.state = {
			scores: [],
			proofImage:[],
			loading: false,
			score: '',
			hasImage:false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.addScore = this.addScore.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
	}
	handleChange(event) {
		console.log('handleChange');
		this.setState({
			[event.target.name]: event.target.value,
		});
	}
	handleUpload(event) {
		this.setState({
			hasImage:true,
		})
		event.preventDefault();
		const image = this.proofImage.files[0];
		const storageRef = firebase.storage().ref("/");
		const thisImage = storageRef.child(this.proofImage.value);
		this.setState({
			loading: true,
		});
		thisImage.put(image).then((snapshot) => {
			thisImage.getDownloadURL().then((url) => {
				this.setState({
					proofImage:url,
					loading: false,
				})
			})
		})
	}
	addScore(event) {
			event.preventDefault();

			console.log(this.refs);

		if (this.state.score > 0 && this.state.score != NaN && this.state.hasImage ){
			const gameId = this.props.game.id;
			const gameRef = firebase.database().ref(`/games/${gameId}/scores`);
			const newScore = {
				scoreUpload: this.state.score,
				proofImage: this.state.proofImage,
			} 
			// console.log(this.props);
			gameRef.push(newScore);

			this.setState({proofImage:""})

			this.setState({
				hasImage:false,
				score:'',
			})
		}

	}
	render () {
		return(
			<section className='add-score'>
			    <form onSubmit={this.addScore}>
			      <input 
			        type="file" 
			        name = "proofImage" 
			        accept = "image/*"
			        ref = {(ref) => {this.proofImage = ref}}
			        onChange = {this.handleUpload}
			      />
			      <input 
			      	type="text" 
			      	name="score" 
			      	autoComplete = "off"
			      	placeholder="Add A Score" 
			      	onChange={this.handleChange} 
			      	value={this.state.score}
			      />

			      <button>Add Score</button>
			    </form>
			</section>
		)
	}
}

// component for app
class App extends React.Component {
	constructor() {
		super();
		this.state = {
			gameName: '',
			games: [],
			expandImage: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmitOne = this.handleSubmitOne.bind(this);
		this.handleItemClick = this.handleItemClick.bind(this);
	}
	handleSubmitOne(event) {
		
		event.preventDefault();
		this.setState({
			gameName:'',
		})
		const newGame = {
			gameUpload: this.state.gameName,
		};
		dbRefGames.push(newGame);

	}
	handleChange(event) {
		console.log('handlechange')
		this.setState({
			[event.target.name]: event.target.value,
		});
	}
	handleItemClick(event) {
		this.setState({
			expandImage: !this.state.expandImage,
		})
	}
	componentDidMount(){
		dbRefGames.on('value', (snapshot) => {
			const newGamesArray = [];
			const firebaseItems = snapshot.val();
			for (let key in firebaseItems) {
				const firebaseItem = firebaseItems[key];
				firebaseItem.id = key;
				newGamesArray.push(firebaseItem);
			}
			this.setState({
				games: newGamesArray,
			});
		});
	}
	render() {
	    return (
	      <div className='app'>
	      	<Header />
	      	<div className = "instructions">
	      		<p>Got a high score you want the world to see? Share it here on our growing highscore database! Make sure to share a screenshot of your score to prove your worth and feel free to add a new game if you've set a score in one that isn't listed! </p>
	      	</div>
	        <div className='container'>
	       	  <GameForm 
	       		handleChange = {this.handleChange}
	       		handleSubmitOne = {this.handleSubmitOne}
	       		gameName = {this.state.gameName}
	       		/>
	          <section className='display-game'>
	            <div className='wrapper'>
	              <ul>
	              	{/* create and map through scoresArray and render*/}
	              	{this.state.games.map((game, i) => {
	              		const scores = game.scores;
	              		const scoresArray = [];
	              		const proofArray = [];
	              		for(let score in scores){
	              			scoresArray.push(scores[score]);
	              		};
	              		console.log(scoresArray);
	              		return (
	              			<li key = {game.id}>
	              				<h2>{game.gameUpload}</h2>

	              			{scoresArray.map((scoreObj, i) => {

	              				return(
	              						<div className = "scoreDisplay">
	              							<p className = "scores">{scoreObj.scoreUpload}:</p>
	              							<GameImage src={scoreObj.proofImage}/>
	              						</div>

	              				);
	              			})} 
	              			<ScoreForm className = "addScore"  game={game} />
	              			</li>
	              		);
	              	})}
	              </ul>
	            </div>
	          </section>
	        </div>
	      </div>
	    );
	  }
}

ReactDOM.render(<App />, document.getElementById('app'));