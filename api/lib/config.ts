export const config = {
    port: process.env.PORT || 3100,
    supportedDevicesNum: 17,
    // Yes, this is in fact a database uri with credentials pushed to a public repo
    // It's already publicly available in multiple other repos so no harm in that i guess
    databaseUrl:
        process.env.MONGODB_URI ||
        'mongodb+srv://twwai:KTp5wYwutrLHPLT@cluster0.ooees.mongodb.net/IoT?retryWrites=true&w=majority',
    JwtSecret: 'secret',
};
