firebase.auth().onAuthStateChanged(user => {
    if (user) {
        setupMotherProfile(user);
        setupChildProfiles(user);
    } else {
        alert("You must be logged in to view this page.");
        window.location.href = '../login/login.html';
    }
});

function setupMotherProfile(user) {
    const userRef = firebase.firestore().collection('users').doc(user.uid);
    const motherNameInput = document.getElementById('motherName');
    const motherDobInput = document.getElementById('motherDob');
    const motherPhoneInput = document.getElementById('motherPhone');
    const motherAddressInput = document.getElementById('motherAddress');
    const motherEmailInput = document.getElementById('motherEmail');
    const motherAvatar = document.getElementById('motherAvatar');

    // Fetch and populate
    userRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            motherNameInput.value = data.fullName || '';
            motherDobInput.value = data.dob || '';
            motherPhoneInput.value = data.phone || '';
            motherAddressInput.value = data.address || '';
            motherEmailInput.value = user.email || '';
            motherAvatar.textContent = data.fullName?.charAt(0).toUpperCase() || 'M';
        }
    });

    // Save form
    const motherProfileForm = document.getElementById('motherProfileForm');
    motherProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userRef.update({
            fullName: motherNameInput.value,
            dob: motherDobInput.value,
            phone: motherPhoneInput.value,
            address: motherAddressInput.value
        }).then(() => {
            alert("Mother profile updated.");
            motherAvatar.textContent = motherNameInput.value.charAt(0).toUpperCase();
        }).catch(err => alert("Error updating profile: " + err.message));
    });
}

function setupChildProfiles(user) {
    const childrenRef = firebase.firestore().collection('users').doc(user.uid).collection('children');
    const childList = document.getElementById('childList');

    // Load all children
    childrenRef.get().then(snapshot => {
        childList.innerHTML = ''; // Clear previous
        if (snapshot.empty) {
            childList.innerHTML = '<p>No child profiles found.</p>';
        } else {
            snapshot.forEach(doc => {
                const child = doc.data();
                const childCard = document.createElement('div');
                childCard.className = 'content-card';
                childCard.innerHTML = `
                    <strong>${child.name}</strong> (DOB: ${child.dob})<br>
                    Gender: ${child.gender}, Blood Group: ${child.bloodGroup}<br>
                    Weight: ${child.weight} kg<br>
                    Allergies: ${child.allergies || 'None'}<br>
                    Conditions: ${child.chronicConditions || 'None'}
                `;
                childList.appendChild(childCard);
            });
        }
    });

    // Handle add child form
    const form = document.getElementById('childProfileForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const child = {
            name: document.getElementById('childName').value,
            dob: document.getElementById('childDob').value,
            gender: document.getElementById('childGender').value,
            bloodGroup: document.getElementById('childBloodGroup').value,
            weight: document.getElementById('childWeight').value,
            allergies: document.getElementById('childAllergies').value,
            chronicConditions: document.getElementById('childChronicConditions').value
        };

        childrenRef.add(child).then(() => {
            alert("Child profile saved.");
            form.reset();
            setupChildProfiles(user); // reload list
        }).catch(err => alert("Failed to save child: " + err.message));
    });
}
