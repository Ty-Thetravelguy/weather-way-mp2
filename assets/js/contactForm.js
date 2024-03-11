// Initialises EmailJS with my specific user ID.
emailjs.init('CMPb9A0ULvr8U9i65');

// Adds an event listener to the form with the ID 'contact-form' to intercept the submit event.
document.getElementById('contact-form').addEventListener('submit', function (event) {
    // Prevents the default form submission mechanism to handle the submission via JavaScript.
    event.preventDefault();

    // Collects the user input from the form fields and stores it in a formData object.
    // This object matches the expected format for sending data with EmailJS.
    const formData = {
        name: document.getElementById('name').value, // User's name
        email: document.getElementById('email').value, // User's email address
        subject: document.getElementById('subject').value, // Email subject
        message: document.getElementById('message').value // Email message content
    };

    // Uses the EmailJS SDK to send an email using the specified service and template IDs, populated with the user's form data.
    emailjs.send('service_7apagiv', 'template_2e0qu9m', formData)
        .then(function (response) {
            // This function is executed upon a successful email submission.
            alert('Message sent'); // Notifies the user that their message was sent.
            document.getElementById('contact-form').reset(); // Resets the form fields to empty, clearing the user input.
        }, function (error) {
            // This function is executed if the email submission fails.
            alert('Error, your message was not sent. Please try again!'); // Notifies the user of the failure to send the message.
        });
});

// Clears the contact us form. 
Document.getElementById('reset-contact-form').addEventListener('clicked', function () {
    document.getElementById('contact-form').reset();
});