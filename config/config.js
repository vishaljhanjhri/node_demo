module.exports = {
    //'database': 'mongodb://dev529:*******@ds137110.mlab.com:37110/mongo_dev',
    'port' : process.env.PORT || 8000,
    'secret': process.env.NODE_ENV === 'production' ? 'mongo_dev' : 'mongo_dev'
}