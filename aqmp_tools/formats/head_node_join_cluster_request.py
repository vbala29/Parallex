import json
from typing import Union

"""
Message Format: head_node_join_cluster_request
TYPE: JSON
keys: type [string]
"""


class head_node_join_cluster_request:
    type = "head_node_join_cluster_request"

    def __init__(self, infoDict: dict[str, Union[str, dict[str, str]]]):
        if "provider_map" not in infoDict:
            raise ValueError(
                f"Tried to create head_node_join_cluster_request without provider_map: {infoDict}"
            )
        if "job_id" not in infoDict:
            raise ValueError(
                f"Tried to create head_node_join_cluster_request without job_id: {infoDict}"
            )
        if "job_userid" not in infoDict:
            raise ValueError(
                f"Tried to create head_node_join_cluster_request without job_userid: {infoDict}"
            )
        if (
            "type" not in infoDict
            or infoDict["type"] != head_node_join_cluster_request.type
        ):
            raise ValueError(
                f"Tried to create head_node_join_cluster_request without type: {infoDict}"
            )
        self.fields = infoDict

    @staticmethod
    def loadFromJson(infoDict: dict[str, Union[str, dict[str, str]]]):
        return head_node_join_cluster_request(infoDict)

    @staticmethod
    def createNewRequest(job_id: str, job_userid: str, provider_map: dict[str, str]):
        return head_node_join_cluster_request(
            {
                "type": head_node_join_cluster_request.type,
                "job_id": job_id,
                "job_userid": job_userid,
                "provider_map": provider_map,
            }
        )

    @staticmethod
    def getTypeStr():
        return head_node_join_cluster_request.type

    def dumps(self):
        return json.dumps(self.fields)

    def provider_map(self) -> dict[str, str]:
        return self.fields["provider_map"]

    def job_id(self) -> str:
        return self.fields["job_id"]

    def job_userid(self) -> str:
        return self.fields["job_userid"]
