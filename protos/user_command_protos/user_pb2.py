# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: user.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\nuser.proto\x12\x03job\"E\n\nJobMetrics\x12\x10\n\x08\x63lientIP\x18\x01 \x01(\t\x12\x10\n\x08\x63puCount\x18\x03 \x01(\x05\x12\x13\n\x0bmemoryCount\x18\x04 \x01(\x05\"\x1a\n\x08HeadNode\x12\x0e\n\x06headIP\x18\x01 \x01(\t\"\x07\n\x05\x45mpty22\n\x03Job\x12+\n\x07SendJob\x12\x0f.job.JobMetrics\x1a\r.job.HeadNode\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'user_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  DESCRIPTOR._options = None
  _globals['_JOBMETRICS']._serialized_start=19
  _globals['_JOBMETRICS']._serialized_end=88
  _globals['_HEADNODE']._serialized_start=90
  _globals['_HEADNODE']._serialized_end=116
  _globals['_EMPTY']._serialized_start=118
  _globals['_EMPTY']._serialized_end=125
  _globals['_JOB']._serialized_start=127
  _globals['_JOB']._serialized_end=177
# @@protoc_insertion_point(module_scope)