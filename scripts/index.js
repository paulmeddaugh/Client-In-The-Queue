import { db, set, onValue, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail,
    ref, push, update } from "./firebase.js";

let currentTab;
let currentuid = null;
let currentJobId = null;

let users = [], userFromEmail = new Map(), jobs, techs;

let prevUserStatus = '';

const messages = {
    'typingNewAccount': 'Creating a new client account.',
    'loadUpdate': 'Select the user of the job to update.',
    'accountSelected': 'Client selected.<input type="checkbox" id="selected" checked/>',
    'accountCreate': 'No client account found. Create account?',
    'accountCreated': 'Account successfully created!',
    'accountUpdate': 'Update client account?',
    'accountInvalidUpdate': 'Update to client account is invalid.',
    'accountUpdated': 'Account updated!',
    'accountFound': 'Account found! Select account?',
}

const switchToTab = { // Handles the business logic of switching tabs
    'create': () => {
        showTab('create');
        clearJob();
    },
    'update': () => {
        showTab('update');
        clearJob();
        if (currentuid) selectUser(currentuid);
    },
    'view': () => {
        showTab('view');

        // Create job table
        const table = _('viewTable');
        table.innerHTML = 
            `<tr>
                <th class="tableHeader">Active</th>
                <th class="tableHeader">Type</th>
                <th class="tableHeader">Description</th>
                <th class="tableHeader">Client</th>
                <th class="tableHeader">Plumber</th>
            </tr>`;
        for (let jobId in jobs) {
            const tr = document.createElement('tr');
            let job = jobs[jobId];
            job = {
                ...job,
                uid: users[job['uid']].name,
                techID: techs[job['techID']].name,
            }
            for (let dataOrdered of ['active', 'type', 'description', 'uid', 'techID']) {
                createTd(job[dataOrdered]);
            }
            function createTd (data) {
                const td = document.createElement('td');
                td.innerHTML = data;
                td.classList.add('tableData');
                tr.appendChild(td);
            }
            table.append(tr);
        }
        table.style.display = 'block';
    },
}

window.addEventListener("load", () => {

    // Loads user data
    onValue(ref(db, 'users'), (snapShot) => {
        users = snapShot.val();

        const emails = _('emails');
        emails.innerHTML = '';

        for (let uid in users) {
            userFromEmail.set(users[uid]?.email, uid); // Allows users to be identified by email

            /* Loads user email options, appending an invisible char to each value to determine 
             * when selection has been from datalist */
            const userOp = document.createElement('option');
            userOp.innerHTML = userOp.value = `${users[userOp.id = uid]?.email}\u2063`;
            emails.append(userOp);
        }
    });

    // Loads technician options in tech select
    const techsSelect = document.getElementById('techs');
    onValue(ref(db, 'technicians'), snapShot => {

        techs = snapShot.val();
        const techLen = Object.keys(techs).length;
        for (let optionIn = 0; optionIn < techLen; optionIn++) {
            const techOp = document.createElement('option');
            techOp.value = techOp.innerHTML = techs[techOp.id = optionIn].name;
            techsSelect.appendChild(techOp);
        }
    });


    // Tabs event listeners
    currentTab = _('create');
    const tabs = document.getElementById('tabs');
    for (let tab of tabs.children) {
        tab.addEventListener("click", switchToTab[tab.id]);
    }

    const email = _('email'), password = _('password'), name = _('name'), userStatus = _('user-status');

    // Email event listener to determine when option from datalist is selected
    email.addEventListener('input', function() {
        if (this.value.slice(-1) === '\u2063') {
            currentuid = document.querySelector(`option[value="${this.value}"]`)?.getAttribute('id');
            this.value = this.value.slice(0, -1);

            selectUser(currentuid);
        }
    });

    email.addEventListener("keyup", checkAccount);
    name.addEventListener("keyup", checkAccount);
    password.addEventListener("keyup", checkAccount);

    // Renders appropriate client account status on 'keyup' event
    function checkAccount () {
        if (currentuid) {
            if (email.value !== users[currentuid].email || name.value !== users[currentuid].name) {
                updateUserStatus(isValidUser(false) ? 'accountUpdate' : 'accountInvalidUpdate');
            } else {
                updateUserStatus('accountSelected');
            }
        } else {
            const uid = userFromEmail.get(email.value);
            if (uid) {
                updateUserStatus('accountFound');
            } else {
                updateUserStatus(isValidUser(true) ? 'accountCreate' : 'typingNewAccount');
            }
        }
    }
    
    function isValidUser (isNewUser, showAlert) {
        let error = '', errorObj = null;

        if (!/^[\w.]+@\w+\.\w+$/.test(email.value)) {
            error = 'Please enter a valid email.';
            errorObj = email;
        }
        if (isNewUser && (password.value.length < 8 || password.value.length > 50)) {
            error += `${error ? '\n' : ''}Please enter a password between 8-50 characters.`;
            if (!errorObj) errorObj = password;
        }
        if (name === '') {
            error += `${error ? '\n' : ''}Please enter a name.`;
            if (!errorObj) errorObj = name;
        }

        if (error && showAlert) {
            alert(error);
            errorObj.focus();
        }
        if (error) return false;

        return true;
    }

    // Creates or updates account depending on the userStatus
    userStatus.addEventListener("click", () => {

        if (prevUserStatus === 'accountFound') {
            selectUser(userFromEmail.get(email.value));
            return;
        }

        if (prevUserStatus === 'accountUpdate') {

            if (!isValidUser(true, true)) return;

            if (users[currentuid].email !== email.value) {
                signInWithEmailAndPassword(auth, users[currentuid].email, password.value)
                    .then(function(userCredential) {
                        updateEmail(userCredential.user, email.value); // Updates firebase
                        set(ref(db, `users/${currentuid}/email`), email.value); // Updates realtime db

                        // On frontend
                        userFromEmail.set(email.value, userFromEmail.get(users[currentuid].email));
                        userFromEmail.delete(users[currentuid].email);
                    });
            }
            if (users[currentuid].name !== name.value) {
                set(ref(db, `users/${currentuid}/name`), name.value);
            }

            updateUserStatus('accountUpdated');
            return;
        }

        if (!isValidUser(true)) return;

        createUserWithEmailAndPassword(auth, email.value, password.value).then(userCreds => {
            // Adds user in user list
            const userRef = ref(db, `users/${userCreds.user.uid}`);
            let newUser = {
                email: email.value,
                name: name.value,
                activeJobs: [],
                inactiveJobs: [],
            };
            set(userRef, newUser);
            users[currentuid = userCreds.user.uid] = newUser;

            userExistsDisplay(true, true);
            updateUserStatus('accountCreated');
        });
    });

    const jobsSelect = _('jobs'), serviceType = _('serviceType'), serviceDescrip = _('serviceDescrip');

    jobsSelect.addEventListener("change", () => {
        currentJobId = jobsSelect.options[jobsSelect.selectedIndex].id;
        const currentJob = jobs[currentJobId];

        serviceDescrip.value = currentJob.description;
        techsSelect.value = techs[currentJob.techID].name;
        serviceType.value = currentJob.type;
        _('active').checked = currentJob.active;
    });

    _('submit').addEventListener("click", () => {

        // Creates a new job
        if (currentTab.id === 'create') {

            const newJob = getEditorJobObj();

            push(ref(db, 'jobs'), newJob).then((response) => {
                // Stores newly created job in jobs object
                const jobID = response._path.pieces_[1];
                jobs[jobID] = newJob;

                // Stores jobID in user object
                const len = newJob.active ? 
                      users[currentuid]?.activeJobs?.length ?? 0 
                    : users[currentuid]?.inactiveJobs?.length ?? 0;
                set(ref(db, `users/${currentuid}/${newJob.active ? 'activeJobs' : 'inactiveJobs'}/${len}`), jobID);

                // Stores jobID in tech queue
                const queueLen = techs[newJob.techID].jobsInQueue?.length ?? 0;
                set(ref(db, `technicians/${newJob.techID}/jobsInQueue/${queueLen}`), jobID);
                alert('Job created!');
            });

        // Updates a job
        } else if (currentTab.id === 'update') {
            if (!currentuid) {
                alert('A client account must be selected.');
                return;
            }

            if (!currentJobId) {
                alert('A job must be selected.');
                return;
            }

            let updatedJob = getEditorJobObj();
            if (JSON.stringify(updatedJob) === JSON.stringify(jobs[currentJobId])) {
                alert('The job appears to not have been edited.');
                return;
            }

            set(ref(db, `jobs/${currentJobId}`), updatedJob);

            if (updatedJob.active !== jobs[currentJobId]) { // Switches user array
                // set(ref(db, `users/${updatedJob.uid}/${jobs[currentJobId] ? 'activeJobs' : 'inactiveJobs'}`
                //     + `/${updatedJob}`))
            }

            alert('Job updated!');
        }
    });

    // Pre-loading jobs for 'View All Jobs' tab
    onValue(ref(db, 'jobs'), (snapShot) => {
        jobs = snapShot.val();
    });
});

const getTech = () => {
    const techsSelect = _('techs');
    let lowestTime = Number.MAX_VALUE, lowestID = 0;

    if (techsSelect.value === 'Auto') { // Finds tech with lowest est days of time to complete work
        for (let id in techs) {
            const time = (techs[id].aveTimePerClient * (techs[id].jobsInQueue?.length ?? 0));
            if (time < lowestTime) {
                lowestID = id;
                lowestTime = time;
            }
        }

        return lowestID;
    } else {
        return techsSelect.options[techsSelect.selectedIndex].id;
    }
}

const getEditorJobObj = () => {
    return {
        active: currentTab.id === 'create' ? true : _('active').checked,
        description: _('serviceDescrip').value,
        techID: getTech(),
        type: _('serviceType').value,
        uid: currentuid,
    }
}

/**
 * Handles the visual information of switching tabs.
 * 
 * @param {string} tab The 'id' of the tab to visually switch to.
 */
const showTab = (tab) => {

    if (!switchToTab[tab]) throw new Error(`No tab with id exists: '${tab}`);

    if (currentTab) currentTab.classList.remove('active');
    (currentTab = _(tab)).classList.add('active');

    const editor = _('editor'), jobsContainer = _('jobsContainer'), userStatus = _('user-status');
    const submit = _('submit'), activeContainer = _('activeContainer');

    ({
        'create': () => {
            editor.style.display = 'block';
            jobsContainer.style.display = 'none';
            updateUserStatus(currentuid ? 'accountSelected' : 'typingNewAccount');
            userExistsDisplay(currentuid ? true : false);
            submit.innerHTML = "Create";
            activeContainer.style.display = 'none';
            _('viewTable').style.display = 'none';
        }, 
        'update': () => {
            editor.style.display = 'block';
            jobsContainer.style.display = 'flex';
            updateUserStatus(currentuid ? 'accountSelected' : 'loadUpdate');
            userExistsDisplay(true);
            submit.innerHTML = 'Update Job';
            activeContainer.style.display = 'block';
            _('viewTable').style.display = 'none';
        },
        'view': () => {
            editor.style.display = 'none';
            _('viewTable').style.display = 'block';
        }
    })[tab]();
}

function selectUser(uid) {
    _('name').value = users[currentuid = uid]?.name;
    updateUserStatus('accountSelected');
    
    // Loads all jobs of a client if on Update tab when selecting
    if (currentTab.id === 'update') { 

        const allJobs = (users[currentuid].activeJobs?.length) ? users[currentuid].activeJobs : [];
        console.log(users[currentuid]);
        if (users[currentuid].inactiveJobs?.length) allJobs.concat(users[currentuid].inactiveJobs);

        const jobsSelect = _('jobs');
        jobsSelect.innerHTML = '<option value="default">Select a client to select a job</option>';

        for (let jobId of allJobs) {
            onValue(ref(db, `jobs/${jobId}`), snapShot => {
                const job = snapShot.val();
                const jobOp = document.createElement('option');
                jobOp.value = jobOp.innerHTML = `${job.active ? 'Active' : 'Inactive'} - `
                    + `${job.type} - ${job.description} - ${techs[job.techID ?? 0].name}`;
                jobOp.id = jobId;
                jobsSelect.appendChild(jobOp);
            });
        }
    }
}

function unselectUser () {
    _('email').value = '';
    _('name').value = '';
    _('password').value = '';
    userExistsDisplay(currentTab.id === 'create' ? false : true);
    currentuid = null;
    updateUserStatus(currentTab.id === 'create' ? 'typingNewAccount' : 'loadUpdate');
}

const clearJob = () => {
    _('jobs').innerHTML = '<option value="default">Select a client to select a job</option>';
    _('serviceType').value = _('serviceType').options[0].value;
    _('serviceDescrip').value = '';
    _('techs').value = _('techs').options[0].value;
    _('active').checked = false;
}

const userExistsDisplay = (found, withGif) => {

    const userStatus = _('user-status'), passwordContainer = _('passwordContainer');

    if (found) {
        passwordContainer.style.display = 'none';
        if (withGif) {
            userStatus.classList.replace('\*-icon', 'green-check-icon');
        }
    } else {
        passwordContainer.style.display = 'flex';
        if (withGif) {
            userStatus.classList.replace('\*-icon', 'x-icon');
            setTimeout(() => userStatus.classList.replace('x-icon', 'new-account-icon'), 200);
        }
    }
}

/**
 * Updates the visuals for a certain status of selecting a client account. 
 * 
 * @param {string} status The status to visually update to.
 */
const updateUserStatus = (status) => {

    if (prevUserStatus === status) return;

    const clickableStati = ['accountCreate', 'accountUpdate', 'accountFound'];
    const userStatus = _('user-status');

    if (clickableStati.includes(prevUserStatus)) {
        if (userStatus.classList.contains('button-clickable')) {
            userStatus.classList.replace('button-clickable', 'button-unclickable');
        }
    }

    if (clickableStati.includes(status)) {
        if (userStatus.classList.contains('button-unclickable')) {
            userStatus.classList.replace('button-unclickable', 'button-clickable');
        }
    }

    userStatus.innerHTML = messages[prevUserStatus = status];

    if (status === 'accountSelected') {
        userExistsDisplay(true);
        _('selected').addEventListener("click", unselectUser);
    }

    if (status === 'accountUpdate') {
        userExistsDisplay(false);
    }
}

const _ = (el) => {
    return document.getElementById(el);
}