// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, set } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBmIarwUuVON-u-2UY8wkvby4LM_PCCKIE",
    authDomain: "waiting-list-7aede.firebaseapp.com",
    projectId: "waiting-list-7aede",
    storageBucket: "waiting-list-7aede.appspot.com",
    messagingSenderId: "214078511178",
    appId: "1:214078511178:web:b81ed1805d43b88a506eb3",
    measurementId: "G-F046QQZRGR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getDatabase();
// ref() - gets a reference to the database data, 
// onValue() - returns a snapshot of the data when updated at all in real-time, 
    // accessed as (snapshot) => snapshot.val()
// set() - writes to the database

window.addEventListener("load", () => {
    const techsSelect = document.getElementById('techs');
    const techsRef = ref(db, 'technicians');
    let techs;
    onValue(techsRef, snapShot => {
        techs = snapShot.val(); // Array

        for (let i = 0; i < techs.length; i++) {
            const techOp = document.createElement('option');
            techOp.value = techOp.innerHTML = techs[i].name;
            techOp.id = i;
            techsSelect.appendChild(techOp);
        }
    })

    const add = document.getElementById('add');
    add.addEventListener("click", () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        let error = '', errorObj = null;

        if (!/^[\w.]+@\w+\.\w+$/.test(email.value)) {
            error = 'Please enter a valid email,';
            errorObj = email;
        }
        if (password.value.length < 8 || password.value.length > 50) {
            error += (error ? ' and ' : 'Please enter a ') + 'password between 8-50 characters';
            if (!errorObj) errorObj = password;
        }

        if (error) {
            alert(error + '.');
            errorObj.focus();
        }

        createUserWithEmailAndPassword(auth, email.value, password.value).then(userCreds => {

            const techID = techsSelect.options[techsSelect.selectedIndex].value;

            // Inserts user in techs clientInQueue
            const techRef = ref(db, 'technicians/' + techID + '/clientsInQueue');
            set(techRef, { [techs.length]: userCreds.user.uid });

            // Adds user in user list
            const userRef = ref(db, 'users');
            set(userRef, { [userCreds.user.uid]: techID })
        });
    });
});