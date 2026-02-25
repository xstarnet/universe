# syntax=docker/dockerfile:1
FROM alpine

COPY ./output/bin/xstarnet.universe /xstarnet.universe
COPY ./schema /schema
ENV SCHEMA_DIR=/schema

EXPOSE 12000

CMD ["/xstarnet.universe"]
