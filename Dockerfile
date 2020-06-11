FROM elixir:1.9.4-slim AS dev

ARG APP_DEPS="openssl"
ARG HOME_VAR=/home/me
ARG APP_PATH=${HOME_VAR}/app

RUN apt-get update \
  && apt-get install -y ${APP_DEPS} --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && apt-get clean

RUN groupadd me && \
  useradd -m -g me \
  me

USER me

RUN mix local.hex --force \
  && mix local.rebar --force

USER root
COPY ./docker/entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR ${APP_PATH}

COPY mix.exs mix.lock ./
COPY config config
COPY . .
RUN rm -rf docker

RUN chown -R me:me \
  ${HOME_VAR}

USER me

RUN mix do deps.get --only prod, deps.compile
ENV MIX_ENV=prod

CMD ["/bin/bash"]
