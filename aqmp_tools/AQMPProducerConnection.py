import aio_pika

from aqmp_tools.AQMPConnection import AQMPConnection
from aqmp_tools.formats.head_node_join_cluster_request import (
    head_node_join_cluster_request,
)


class AQMPProducerConnection(AQMPConnection):
    async def sendClusterJoinRequest(self, queueName, jsonMessage):
        message = aio_pika.Message(body=jsonMessage.encode())
        await self.channel.default_exchange.publish(message, routing_key=queueName)

    async def sendHeadNodeClusterJoinRequest(
        self, provider_map: dict[str, str], job_id: str, job_userid: str, queueName: str
    ):
        message = aio_pika.Message(
            body=head_node_join_cluster_request.createNewRequest(
                job_id, job_userid, provider_map
            )
            .dumps()
            .encode()
        )
        await self.channel.default_exchange.publish(message, routing_key=queueName)
