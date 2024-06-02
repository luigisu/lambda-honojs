const {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminInitiateAuthCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const userPoolId = process.env.USER_POOL_ID;
const clientId = process.env.CLIENT_ID;

const client = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
    const username = 'defaultUser';
    const password = 'DefaultPassword123!';
    const email = 'defaultuser@example.com';

    let userAlreadyExists = false;

    // Create user
    try {
        const createUserCommand = new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' }
            ],
            MessageAction: 'SUPPRESS' // Don't send welcome email
        });
        await client.send(createUserCommand);

        // Set user password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: username,
            Password: password,
            Permanent: true // Set the password as permanent
        });
        await client.send(setPasswordCommand);

    } catch (error) {
        if (error.name === 'UsernameExistsException') {
            console.log("User already exists. Proceeding with authentication...");
            userAlreadyExists = true;
        } else {
            console.error("Error creating user: ", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error creating user', error: error.message })
            };
        }
    }

    // Authenticate user
    if (userAlreadyExists || !userAlreadyExists) {
        try {
            const initiateAuthCommand = new AdminInitiateAuthCommand({
                UserPoolId: userPoolId,
                ClientId: clientId,
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password
                }
            });
            const authResponse = await client.send(initiateAuthCommand);

            return {
                statusCode: 200,
                body: JSON.stringify(authResponse.AuthenticationResult)
            };
        } catch (error) {
            console.error("Error authenticating user: ", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error authenticating user', error: error.message })
            };
        }
    }
};
