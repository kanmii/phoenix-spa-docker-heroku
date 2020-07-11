FROM hexpm/elixir:1.9.4-erlang-22.3.4.2-debian-buster-20200511 AS dev

ARG DOCKER_HOST_USER_NAME

ENV APP_DEPS="openssl inotify-tools curl" \
  HOME_VAR=/home/${DOCKER_HOST_USER_NAME}

RUN apt-get update \
  && apt-get install -y ${APP_DEPS} --no-install-recommends \
  && groupadd ${DOCKER_HOST_USER_NAME} \
  && useradd -m -g ${DOCKER_HOST_USER_NAME} ${DOCKER_HOST_USER_NAME} \
  && mkdir -p ${HOME_VAR}/src/assets

COPY ./entrypoint.sh /usr/local/bin

ADD https://raw.githubusercontent.com/humpangle/wait-until/v0.1.1/wait-until /usr/local/bin/

WORKDIR ${HOME_VAR}/src

COPY ./config ./mix.exs ./mix.lock ./
COPY . .

RUN chown -R \
  ${DOCKER_HOST_USER_NAME}:${DOCKER_HOST_USER_NAME} \
  ${HOME_VAR} \
  && chmod 755 /usr/local/bin/entrypoint.sh \
  && chmod 755 /usr/local/bin/wait-until

# run app as non root user to avoid volume mount problems
USER ${DOCKER_HOST_USER_NAME}

# hex has to be installed as the user that will compile and run our app
RUN mix local.hex --force \
  && mix local.rebar --force \
  && mix do deps.get, deps.compile

CMD ["/bin/bash"]

############################### build image ###############################

FROM dev AS build

ENV BUILD_DEPS="curl gnupg ca-certificates" \
  APP_DEPS="" \
  MIX_ENV=prod \
  NODE_ENV=production

USER root

RUN apt-get install -y ${BUILD_DEPS} ${APP_DEPS} --no-install-recommends \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | \
  tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y yarn \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && apt-get purge -y --auto-remove ${BUILD_DEPS} \
  && apt-get clean \
  && cd assets \
  && rm -rf build \
  && yarn config set strict-ssl false \
  && yarn install --production \
  && yarn build \
  && cd .. \
  && mix local.hex --force \
  && mix local.rebar --force \
  && mix do deps.get --only prod, compile \
  && mix release \
  && mv assets/build ./frontend \
  && rm -rf assets \
  && rm -rf docker \
  && rm -rf deps

############################ prepare release image ###########################

FROM debian:buster AS release

ARG DOCKER_HOST_USER_NAME

ENV APP_DEPS="openssl" \
  LANG=C.UTF-8

RUN apt-get update \
  && apt-get install -y ${APP_DEPS} --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && apt-get clean \
  && groupadd me \
  && useradd -g me me \
  && mkdir -p /me-app/assets/build \
  && chown -R me:me /me-app

COPY ./entrypoint.sh /usr/local/bin

ADD https://raw.githubusercontent.com/humpangle/wait-until/v0.1.1/wait-until /usr/local/bin/

RUN chmod 755 /usr/local/bin/entrypoint.sh \
    && chmod 755 /usr/local/bin/wait-until

WORKDIR /me-app

COPY --from=build --chown=me:me /home/${DOCKER_HOST_USER_NAME}/src/_build/prod/rel/me ./

COPY --from=build --chown=me:me /home/${DOCKER_HOST_USER_NAME}/src/frontend ./assets/build

USER me

ENV HOME=/me-app

CMD ["/bin/bash"]
