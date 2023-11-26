import aio_pika

from aqmp_tools.AQMPConnection import AQMPConnection

class AQMPProducerConnection(AQMPConnection):
    async def sendClusterJoinRequest(self, queueName, jsonMessage):
        message = aio_pika.Message(body=jsonMessage.encode())
        await self.channel.default_exchange.publish(message, routing_key=queueName)

    async def sendHeadNodeClusterJoinRequest(self, queueName):
        message = aio_pika.Message(body="Head Node Cluster Join".encode())
        await self.channel.default_exchange.publish(message, routing_key=queueName)