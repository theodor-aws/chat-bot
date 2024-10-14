#import orjson
import base64
import zlib
import json
import uuid
import decimal
import datetime


def custom_serializer(obj):
    if isinstance(obj, bytes):
        return { "__bytes__": base64.b64encode(obj).decode("utf-8") }
    if isinstance(obj, decimal.Decimal):
        if obj % 1 > 0:
            return float(obj)
        else:
            return int(obj)
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if isinstance(obj, datetime.datetime):
        return { "__datetime__": obj.isoformat() }
    if isinstance(obj, datetime.date):
        return { "__date__": obj.isoformat() }
    return obj

def custom_deserializer(obj):
    if isinstance(obj, dict):
        if "__bytes__" in obj:
            return base64.b64decode(obj["__bytes__"])
        for key, value in obj.items():
            obj[key] = custom_deserializer(value)
    return obj

def serialize(data: dict, compressed=True):
    json_bytes = json.dumps(dict, default=custom_serializer )
    if compressed:
        json_bytes = zlib.compress(json_bytes)
    return json_bytes

def deserialize(serialized_data, compressed=True):
    if compressed:
        serialized_data = zlib.decompress(serialized_data)
    return json.loads(serialized_data, object_hook=custom_deserializer)