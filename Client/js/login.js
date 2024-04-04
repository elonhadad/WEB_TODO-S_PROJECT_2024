document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Sending the login details to the server using Fetch API
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.redirect) {
                // Save user details in sessionStorage
                sessionStorage.setItem('userId', data.userId);
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('email', data.email);
                // Redirect to the todos page if login is successful
                window.location.href = data.redirect;
            }
            else {
                alert(data.message);
            }
        })

        .catch((error) => {
            console.error('Error:', error);
        });
});
