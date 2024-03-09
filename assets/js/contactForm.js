emailjs.init('CMPb9A0ULvr8U9i65');

document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
        .then(function (response) {
            console.log('Email sent successfully!', response);
            // Display a success message
        }, function (error) {
            console.error('Error sending email:', error);
            // Display error message if there is one
        });
});