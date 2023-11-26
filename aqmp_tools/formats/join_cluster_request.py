import json

"""
Message Format: join_cluster_request
TYPE: JSON
keys: type [string], headIP [string]
"""


class join_cluster_request:
    type = "join_cluster_request"

    def __init__(self, infoDict):
        self.fields = infoDict

    @staticmethod
    def loadFromJson(infoDict):
        return join_cluster_request(infoDict)

    @staticmethod
    def createNewRequest(headIP):
        return join_cluster_request(
            json.dumps({"type": join_cluster_request.type, "headIP": headIP})
        )

    @staticmethod
    def getTypeStr():
        return join_cluster_request.type

    def dumps(self):
        return json.dumps(self.fields)

    def getHeadIP(self):
        return self.fields["headIP"]
