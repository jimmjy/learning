FROM ubuntu:latest

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl \
  && rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "curl" ]

# this is good to keep something to show to the user
CMD [ "--help" ]
