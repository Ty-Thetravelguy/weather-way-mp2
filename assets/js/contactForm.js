emailjs.init('CMPb9A0ULvr8U9i65');

document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    emailjs.send('service_7apagiv', 'template_2e0qu9m', formData)
        .then(function (response) {
            alert('Message sent')
            console.log('Email sent successfully!', response);
            document.getElementById('contact-form').reset();
            // Display a success message
        }, function (error) {
            alert('Error, your message was not sent. Please try again!')
            console.error('Error sending email:', error);
            // Display error message if there is one
        });
});