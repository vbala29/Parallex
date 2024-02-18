// https://www.freecodecamp.org/news/how-to-use-rabbitmq-with-nodejs/

const amqp = require("amqplib");
const _SERVER_IP = '127.0.0.1'
const _DEFAULT_USER = 'test'
const _DEFAULT_PASS = 'test'

const queue = "ray_job_startup";

var make_job_submission_request = async (job_name, head_node_url) => {
  const msg = {
    job_name : job_name,
    head_node_url : head_node_url
  };

  let connection;
  try {
    connection = await amqp.connect(`amqp://${_DEFAULT_USER}:${_DEFAULT_PASS}@${_SERVER_IP}/`);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    console.log(" [x] Sent '%s' over AQMP", msg);
    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports.make_job_submission_request = make_job_submission_request