import { db, set, onValue, auth, createUserWithEmailAndPassword, ref } from "./firebase.js";

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