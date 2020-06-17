FROM elixir:1.9.4-slim AS build

ENV BUILD_DEPS="curl gnupg ca-certificates" \
    APP_DEPS="" \
    MIX_ENV=prod \
    NODE_ENV=production

RUN apt-get update \
  && apt-get install -y ${BUILD_DEPS} ${APP_DEPS} --no-install-recommends \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | \
    tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y yarn \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/share/doc && rm -rf /usr/share/man \
  && apt-get purge -y --auto-remove ${BUILD_DEPS} \
  && apt-get clean \
  && mix local.hex --force \
  && mix local.rebar --force \
  && mkdir -p /src

WORKDIR /src

COPY . .

RUN cd assets \
  && rm -rf build \
  && yarn config set strict-ssl false \
  && yarn install --production \
  && yarn build \
  && cd .. \
  && mix do deps.get --only prod, compile \
  && mix release \
  && mv assets/build ./frontend \
  && rm -rf assets \
  && rm -rf docker \
  && rm -rf deps

CMD ["/bin/bash"]

############################ prepare release image ###########################

FROM debian:buster AS release

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

COPY ./docker/entrypoint.sh /usr/local/bin

RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /me-app

COPY --from=build --chown=me:me /src/_build/prod/rel/me ./
COPY --from=build --chown=me:me /src/frontend ./assets/build

USER me

ENV HOME=/me-app

CMD ["/bin/bash"]
