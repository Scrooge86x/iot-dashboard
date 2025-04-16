export const config = {
    port: process.env.PORT || 3100,
    socketPort: process.env.PORT || 3000,
    databaseUrl: process.env.MONGODB_URI || 'mongodb+srv://iot:<db_password>@iot.0jdar84.mongodb.net/IoT?retryWrites=true&w=majority&appName=IoT',
};