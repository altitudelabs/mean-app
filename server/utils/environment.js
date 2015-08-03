exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/admin';//'mongodb://localhost/lynk-dev'
exports.aws = {
  queueUrl:     process.env.AWS_SYNC2LYNK_QUEUEURL
};

exports.relateIQ = {
  apiKey:       process.env.relateIQ_APIKEY,
  apiSecret:    process.env.relateIQ_APISECRET
};
