// === File: js/profile-management.js (The Functional Version) ===

auth.onAuthStateChanged(user => {
    if (user) {
        // If a user is logged in, run the function to set up the page
        initializeProfileManagement(user);
    } else {
        // If no user is logged in, redirect them to the login page
        alert("You must be logged in to view this page.");
        window.location.href = '../login/login.html';
    }
});

function initializeProfileManagement(user) {
    // --- Get all the necessary HTML elements ---
    // Mother's form elements
    const motherNameInput = document.getElementById('motherName');
    const motherDobInput = document.getElementById('motherDob');
    const motherEmailInput = document.getElementById('motherEmail');
    const motherProfileForm = document.getElementById('motherProfileForm');
    const motherAvatar = document.getElementById('motherAvatar');

    // --- Fetch and Display Mother's Data ---
    const userDocRef = db.collection('users').doc(user.uid);
    userDocRef.get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            motherNameInput.value = userData.fullName || '';
            motherEmailInput.value = userData.email || '';
            motherDobInput.value = userData.dob || ''; // Assumes you store 'dob' in the user document
            
            // Set the avatar initials
            if (userData.fullName) {
                motherAvatar.textContent = userData.fullName.charAt(0).toUpperCase();
            }
        }
    });

    // --- Handle "Save My Profile" Button ---
    motherProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Update the user's document in Firestore
        userDocRef.update({
            fullName: motherNameInput.value,
            dob: motherDobInput.value
        }).then(() => {
            alert("Your profile has been updated successfully!");
        }).catch(error => {
            console.error("Error updating profile: ", error);
            alert("An error occurred while updating your profile.");
        });
    });

    // We will add the "Add Child" functionality in a future step
    // For now, this makes the page load data and save the mother's profile.
}