import firebase from 'firebase';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyC67a60vSO1yfDYA_nLej1DiNhPxASe7Es",
  authDomain: "high-score-junction.firebaseapp.com",
  databaseURL: "https://high-score-junction.firebaseio.com",
  projectId: "high-score-junction",
  storageBucket: "high-score-junction.appspot.com",
  messagingSenderId: "711089773183"
};
firebase.initializeApp(config);

export default firebase;