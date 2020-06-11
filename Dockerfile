FROM elixir:1.9.4-slim AS build

RUN apt-get update \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && mix local.hex --force \
  && mix local.rebar --force \
  && mkdir -p /src

ENV MIX_ENV=prod \
  DATABASE_SSL=true

WORKDIR /src

COPY . .

RUN rm -rf docker && \
  mix do deps.get --only prod, compile \
  && mix release

CMD ["/bin/bash"]

############################ prepare release image ###########################

FROM debian:buster AS release

ARG APP_DEPS="openssl"

ENV LANG=C.UTF-8

RUN apt-get update \
  && apt-get install -y ${APP_DEPS} --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && apt-get clean

RUN groupadd me && \
  useradd -g me \
  me

COPY ./docker/entrypoint.sh /usr/local/bin

RUN chmod +x /usr/local/bin/entrypoint.sh \
  && mkdir /me-app \
  && chown -R me:me /me-app

WORKDIR /me-app

COPY --from=build --chown=me:me /src/_build/prod/rel/me ./

USER me

ENV HOME=/me-app

CMD [ "/bin/bash" ]
