// https://www.freecodecamp.org/news/how-to-use-rabbitmq-with-nodejs/

const amqp = require("amqplib");
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(__dirname + '/../../../config/config.json', 'utf8'));
const _BROKER_IP = config.ip_addresses.rabbitmq_broker
const _DEFAULT_USER = config.rabbitmq.username
const _DEFAULT_PASS = config.rabbitmq.password
const QUEUE_NAME = config.rabbitmq.job_submission_queue_name

var make_job_submission_request = async (job_name, head_node_url) => {
  const msg = {
    job_name : job_name,
    head_node_url : head_node_url
  };

  let connection;
  try {
    connection = await amqp.connect(`amqp://${_DEFAULT_USER}:${_DEFAULT_PASS}@${_BROKER_IP}/`);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s' over AQMP", msg);
    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports.make_job_submission_request = make_job_submission_request