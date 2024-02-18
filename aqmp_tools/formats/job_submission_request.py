import json

"""
Message Format: job_submission_request
TYPE: JSON
keys: job_name [string]
      head_node_url [string]
"""

class job_submission_request:
    def __init__(self, job_name, head_node_url):
        self.job_name = job_name
        self.head_node_url = head_node_url
    
    @staticmethod
    def initFromDict(infoDict):
        job_name = infoDict["job_name"]
        head_node_url = infoDict["head_node_url"]
        return job_submission_request(job_name, head_node_url)

    def dumps(self):
        return json.dumps({"job_name" : self.job_name,
                            "head_node_url" : self.head_node_url})

    def get_head_node_url(self):
        return self.head_node_url
    
    def get_job_name(self):
        return self.job_name