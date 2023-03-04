import { db, set, onValue, auth, createUserWithEmailAndPassword, ref } from "./firebase.js";

window.addEventListener("load", () => {

    // Loads technician options
    const techsSelect = document.getElementById('techs');
    let techs;

    const techsRef = ref(db, 'technicians');
    onValue(techsRef, snapShot => {
        
        // Creates an option for each tech
        techs = snapShot.val();
        for (let optionIn = 0; optionIn < techs.length; optionIn++) {
            const techOp = document.createElement('option');
            techOp.value = techOp.innerHTML = techs[techOp.id = optionIn].name;
            techsSelect.appendChild(techOp);
        }
    })

    // Validates email and password
    document.getElementById('add').addEventListener("click", () => {
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

        // Creates user and inserts data in firebase realtime db
        createUserWithEmailAndPassword(auth, email.value, password.value).then(userCreds => {

            const techID = techsSelect.options[techsSelect.selectedIndex].id;

            // Inserts user in techs clientInQueue
            const techRef = ref(db, 'technicians/' + techID + '/clientsInQueue/' + techs.length);
            set(techRef, userCreds.user.uid);

            // Adds user in user list
            const userRef = ref(db, 'users/' + userCreds.user.uid);
            set(userRef, Number(techID));
        });
    });
});