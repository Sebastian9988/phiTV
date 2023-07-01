# phiTV

This is a task carried out for the ORT university, in which I implemented tactics and architecture patterns that allowed my system to have good performance and modifiability as main quality attributes.

## Description

This project is a web application that offers various functionalities related to streaming services. The application has been developed using NodeJs with javascript

For detailed information on how to use and configure the application, I recommend referring to the official documentation.

You can find the documentation at [here](https://github.com/Sebastian9988/phiTV/blob/main/Documentacion/Documentacion%20phiTV.pdf).

If you have any questions or need further assistance, feel free to reach out to me.

I hope you enjoy using this application!

## Installation

Follow these steps:

1. In the Payment Gateway, Regulatory Unit, and phiTV components, run the `npm install` command to download project dependencies.
2. Make sure you have `Docker Desktop` installed.
3. Install MongoDB version 4.18.0 in Docker, running on port 27027.
4. Use the `node index` command for the Payment Gateway and Regulatory Unit APIs.
5. Use the `node app` command for phiTV.

## Environment Variables

The project utilizes environment variables for configuration. In the `.env` file, you will find two important variables related to email configuration:

```dotenv
MAIL_SERVER = "example@gmail.com"
MAIL_APP_PASSWORD_SERVER = "password"
```

These variables are used to specify the email address and password of the mail server that will be used as the source for sending email messages.

Make sure to update these variables with your own email address and password to enable email functionality in the project.

**Note 1:** Ensure that you keep the `.env` file secure and do not share it publicly, as it contains sensitive information.

**Note 2:** The password is not your actual Gmail password, but rather your Google application password, so please pay attention to this.

If you have any further questions, feel free to ask!


## Customizing Configuration

You can customize the project configuration by editing the `config.js` file. Here, you will find various configuration variables that you can adjust according to your needs.

### Customizing mails destination

The `config.js` file contains variables that you can modify. One of the available variables is `destinationMails`, which determines the destination email addresses for sending notifications.

```javascript
// File: config.js

{
  // Other configurations...
  destinationMails: "example@gmail.com, anotherexample@gmail.com",
  // Other configurations...
}
```
### Customizing Automatic Event Scheduling

The project utilizes `node-cron` for automatic event authorization and notifications. You can customize the scheduling of these automatic tasks by modifying the following variables in the `config.js` file:

```javascript
// File: config.js

{
  // Other configurations...
  automaticTimeUnauthorizePendingEvents: "0 */12 * * *",
  automaticTimeAuthorizePendingEvents: "0 */12 * * *",
  automaticTimeForEventsPending: "0 */12 * * *",
  // Other configurations...
};
